import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  MapPin, Layers, Ruler, Sprout, MapPinned, Camera, Navigation, ArrowRight, Clock, Home,
} from "lucide-react"
import { toast } from "sonner"
import { agronomistGisService, type GisDistrict } from "@/services/agronomistGis.service"
import { agronomistFarmVisitsService, type FarmVisit, type FarmVisitType } from "@/services/agronomistFarmVisits.service"

function ComingSoonCard({ icon: Icon, title, description }: { icon: typeof Camera; title: string; description: string }) {
  return (
    <Card className="border-0 shadow-md border-dashed">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3 h-full min-h-52">
        <Icon className="w-8 h-8 text-muted-foreground" />
        <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Coming Soon</span>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Not "unbuilt" — severity + coordinates already exist on the real FarmVisit
// model (wired in the Farm Visits page). There's no GIS-specific map view of
// that data yet, but the data itself is real, so this points there instead
// of claiming the feature doesn't exist.
function CrossLinkCard() {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3 h-full min-h-52">
        <MapPinned className="w-8 h-8 text-emerald-500" />
        <div>
          <p className="text-sm font-semibold text-foreground">Visit location data lives in Farm Visits</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">Severity and GPS coordinates for each field visit are already tracked there — a dedicated map view here hasn't been built yet.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" asChild>
          <Link to="/agronomist/farm-visits">
            View Farm Visits <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

const visitTypeLabel: Record<FarmVisitType, string> = {
  farm: "Farm Visit",
  office: "Office",
  meeting: "Meeting",
  break: "Break",
}

function todayIsoDate(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export default function GISPage() {
  const [districts, setDistricts] = useState<GisDistrict[]>([])
  const [loading, setLoading] = useState(true)
  const [todayVisits, setTodayVisits] = useState<FarmVisit[]>([])
  const [visitsLoading, setVisitsLoading] = useState(true)

  useEffect(() => {
    agronomistGisService.getDistricts()
      .then(setDistricts)
      .catch(() => toast.error("Failed to load field zones"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    agronomistFarmVisitsService.getFarmVisits({ date: todayIsoDate(), limit: 50 })
      .then(({ visits }) => {
        const sorted = [...visits].sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime())
        setTodayVisits(sorted)
      })
      .catch(() => toast.error("Failed to load today's visit itinerary"))
      .finally(() => setVisitsLoading(false))
  }, [])

  const totalFields = districts.reduce((sum, d) => sum + d.fieldCount, 0)
  const totalArea = districts.reduce((sum, d) => sum + d.totalAreaSqm, 0)
  const scoutedCount = districts.filter(d => d.lastScoutedAt).length

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="GIS & Field Scouting"
        subtitle="Field zone coverage across your assigned districts"
      />

      <div className="p-3 sm:p-6 space-y-6">
        {/* Stats strip — all real aggregates from the districts endpoint */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Districts Covered", val: loading ? "…" : districts.length, icon: MapPin, gradient: "sky" as const },
            { label: "Total Field Area", val: loading ? "…" : `${totalArea.toLocaleString()} m²`, icon: Ruler, gradient: "green" as const },
            { label: "Zones Scouted", val: loading ? "…" : `${scoutedCount}/${districts.length}`, icon: MapPinned, gradient: "gold" as const },
          ].map(s => (
            <Card key={s.label} className="border-0 shadow-md">
              <CardContent className="p-4 flex items-center gap-4">
                <Icon3D gradient={s.gradient} size="md">
                  <s.icon className="w-5 h-5" />
                </Icon3D>
                <div>
                  <p className="text-2xl font-black text-foreground">{s.val}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Field zones — real data */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-3 text-base">
              <Icon3D gradient="green" size="sm">
                <Layers className="w-4 h-4" />
              </Icon3D>
              Field Zones
              {!loading && <span className="text-sm font-normal text-muted-foreground">({districts.length})</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
              </div>
            ) : districts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MapPin className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="font-semibold text-foreground">No field zones yet</p>
                <p className="text-sm text-muted-foreground mt-1">Zones appear here once farms are scouted in your assigned districts.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {districts.map(d => (
                  <div key={d.id} className="p-4 rounded-xl border border-border bg-muted/40">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-sm font-semibold text-foreground">{d.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{d.sector} Sector</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Sprout className="w-3 h-3" /> {d.fieldCount} field{d.fieldCount === 1 ? "" : "s"}
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Ruler className="w-3 h-3" /> {d.totalAreaSqm.toLocaleString()} m²
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {d.lastScoutedAt ? `Last scouted ${new Date(d.lastScoutedAt).toLocaleDateString()}` : "Not yet scouted"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Geo-tagged data is real (see Farm Visits) — drone upload genuinely has no backend yet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CrossLinkCard />
          <ComingSoonCard
            icon={Camera}
            title="Drone Scan Upload isn't available yet"
            description="Uploading and processing GeoTIFF/KMZ/SHP drone scans requires backend file storage that hasn't been built yet."
          />
        </div>

        {/* Today's itinerary — real scheduled visits, sorted by time. Not a route-sequencing
            algorithm, just an ordered list of what's already on the calendar for today. */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-3 text-base">
              <Icon3D gradient="sky" size="sm">
                <Navigation className="w-4 h-4" />
              </Icon3D>
              Today's Visit Itinerary
              {!visitsLoading && <span className="text-sm font-normal text-muted-foreground">({todayVisits.length})</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {visitsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
              </div>
            ) : todayVisits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Navigation className="w-8 h-8 text-muted-foreground mb-2 opacity-40" />
                <p className="text-sm font-semibold text-foreground">No visits scheduled today</p>
                <p className="text-xs text-muted-foreground mt-1">Visits you schedule for today will appear here in time order.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayVisits.map((v, i) => (
                  <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/40">
                    <div className="w-7 h-7 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-sky-600 dark:text-sky-400">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{v.farmer.name}</span>
                        {v.farm && (
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Home className="w-3 h-3" /> {v.farm.farmName}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{visitTypeLabel[v.type]}</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                      <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {new Date(v.visitDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{v.duration ? `${v.duration} min` : "Duration not set"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
