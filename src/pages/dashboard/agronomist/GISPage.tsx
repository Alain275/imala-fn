import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  MapPin, Layers, Ruler, Sprout, MapPinned, Camera, Navigation, ArrowRight,
} from "lucide-react"
import { toast } from "sonner"
import { agronomistGisService, type GisDistrict } from "@/services/agronomistGis.service"

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

export default function GISPage() {
  const [districts, setDistricts] = useState<GisDistrict[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    agronomistGisService.getDistricts()
      .then(setDistricts)
      .catch(() => toast.error("Failed to load field zones"))
      .finally(() => setLoading(false))
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

        {/* Geo-tagged data is real (see Farm Visits) — the other two genuinely have no backend yet */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CrossLinkCard />
          <ComingSoonCard
            icon={Camera}
            title="Drone Scan Upload isn't available yet"
            description="Uploading and processing GeoTIFF/KMZ/SHP drone scans requires backend file storage that hasn't been built yet."
          />
          <ComingSoonCard
            icon={Navigation}
            title="Route Optimization isn't available yet"
            description="Daily visit itinerary and route sequencing will appear here once this feature is built on the backend."
          />
        </div>
      </div>
    </div>
  )
}
