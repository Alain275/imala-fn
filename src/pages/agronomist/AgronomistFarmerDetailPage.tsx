import { useParams, useNavigate } from "react-router-dom"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Icon3D } from "@/components/icon-3d"
import {
  ArrowLeft, CheckCircle2, AlertCircle, Sprout, MapPin, Calendar, AlertTriangle, Ruler,
} from "lucide-react"
import { useAgronomistFarmerDetail } from "@/hooks/useAgronomistFarmerDetail"
import type { FarmerCropStatus } from "@/services/agronomistFarmers.service"

const cropStatusBadge: Record<FarmerCropStatus, string> = {
  planned: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/40",
  planted: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
  growing: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
  harvested: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
  failed: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40",
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
}

function field(value: string | number | null | undefined, suffix = "") {
  if (value === null || value === undefined || value === "") return "Not recorded"
  return `${value}${suffix}`
}

export default function AgronomistFarmerDetailPage() {
  const { farmerId } = useParams<{ farmerId: string }>()
  const navigate = useNavigate()
  const { data: farmer, loading, error, refetch } = useAgronomistFarmerDetail(farmerId)

  return (
    <div className="min-h-screen bg-background">
      <Header title="Farmer Detail" subtitle="Farmer profile, farms, and crop records" />

      <div className="p-3 sm:p-6 space-y-6 max-w-5xl">
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={() => navigate("/agronomist/farmers")}>
          <ArrowLeft className="w-4 h-4" /> Back to Farmers
        </Button>

        {loading ? (
          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 flex items-center gap-6">
                <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-56" />
                </div>
              </CardContent>
            </Card>
            <Skeleton className="h-48 w-full" />
          </div>
        ) : error ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-10 flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
            </CardContent>
          </Card>
        ) : farmer && (
          <>
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 flex flex-wrap items-start gap-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {getInitials(farmer.name)}
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{farmer.name}</p>
                    <p className="text-sm text-muted-foreground">{farmer.email} · {farmer.phone}</p>
                    {farmer.location && <p className="text-xs text-muted-foreground mt-0.5">{farmer.location}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {farmer.isEmailVerified ? (
                      <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Email verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-700">
                        <AlertCircle className="w-3 h-3 mr-1" /> Email not verified
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={farmer.isActive ? "text-emerald-600 border-emerald-300 dark:border-emerald-700" : "text-muted-foreground"}
                    >
                      {farmer.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {farmer.farmSize != null && (
                      <Badge variant="secondary">{farmer.farmSize} ha total</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Member since {new Date(farmer.createdAt).toLocaleDateString()} · Last login {farmer.lastLogin ? new Date(farmer.lastLogin).toLocaleString() : "Never"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Farms */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Farms ({farmer.farms.length})</h2>
              {farmer.farms.length === 0 ? (
                <Card className="border-0 shadow-md">
                  <CardContent className="py-10 flex flex-col items-center text-center">
                    <Sprout className="w-8 h-8 text-muted-foreground mb-2 opacity-40" />
                    <p className="text-sm text-muted-foreground">No farms recorded for this farmer yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {farmer.farms.map(farm => (
                    <Card key={farm.id} className="border-0 shadow-md">
                      <CardHeader className="pb-3 border-b border-border">
                        <CardTitle className="flex items-center gap-3 text-sm">
                          <Icon3D gradient="green" size="sm">
                            <Sprout className="w-4 h-4" />
                          </Icon3D>
                          {farm.farmName}
                          <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                            farm.status === "active" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40" :
                            farm.status === "fallow" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40" :
                            "bg-muted text-muted-foreground border-border"
                          }`}>{farm.status}</span>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" /> {farm.location} · {farm.district}, {farm.sector}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 grid grid-cols-2 gap-3 text-xs">
                        <div><p className="text-muted-foreground">Size</p><p className="font-medium text-foreground">{field(farm.size, " ha")}</p></div>
                        <div><p className="text-muted-foreground">Current crop</p><p className="font-medium text-foreground">{field(farm.currentCrop)}</p></div>
                        <div><p className="text-muted-foreground">Soil type</p><p className="font-medium text-foreground">{field(farm.soilType)}</p></div>
                        <div><p className="text-muted-foreground">Irrigation</p><p className="font-medium text-foreground">{field(farm.irrigationType)}</p></div>
                        <div><p className="text-muted-foreground">Seed variety</p><p className="font-medium text-foreground">{field(farm.seedVariety)}</p></div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <p className="font-medium text-foreground">{field(farm.expectedHarvestDate && new Date(farm.expectedHarvestDate).toLocaleDateString())}</p>
                        </div>
                        {farm.notes && (
                          <div className="col-span-2">
                            <p className="text-muted-foreground">Notes</p>
                            <p className="font-medium text-foreground">{farm.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Crops */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Crop records ({farmer.farmerCrops.length})</h2>
              {farmer.farmerCrops.length === 0 ? (
                <Card className="border-0 shadow-md">
                  <CardContent className="py-10 flex flex-col items-center text-center">
                    <AlertTriangle className="w-8 h-8 text-muted-foreground mb-2 opacity-40" />
                    <p className="text-sm text-muted-foreground">No crop records for this farmer yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {farmer.farmerCrops.map(crop => (
                    <Card key={crop.id} className="border-0 shadow-md">
                      <CardHeader className="pb-3 border-b border-border">
                        <CardTitle className="flex items-center gap-3 text-sm">
                          <Icon3D gradient="green" size="sm">
                            <Sprout className="w-4 h-4" />
                          </Icon3D>
                          {crop.crop.name}
                          <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${cropStatusBadge[crop.status]}`}>
                            {crop.status}
                          </span>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" /> Planted {new Date(crop.plantingDate).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Ruler className="w-3 h-3 text-muted-foreground" />
                          <div><p className="text-muted-foreground">Area planted</p><p className="font-medium text-foreground">{field(crop.areaPlanted, " ha")}</p></div>
                        </div>
                        <div><p className="text-muted-foreground">Category</p><p className="font-medium text-foreground">{field(crop.crop.category)}</p></div>
                        <div><p className="text-muted-foreground">Expected harvest</p><p className="font-medium text-foreground">{field(crop.expectedHarvestDate && new Date(crop.expectedHarvestDate).toLocaleDateString())}</p></div>
                        <div><p className="text-muted-foreground">Actual harvest</p><p className="font-medium text-foreground">{field(crop.actualHarvestDate && new Date(crop.actualHarvestDate).toLocaleDateString())}</p></div>
                        <div><p className="text-muted-foreground">Yield</p><p className="font-medium text-foreground">{field(crop.yield)}</p></div>
                        <div><p className="text-muted-foreground">Water need</p><p className="font-medium text-foreground">{field(crop.crop.waterNeed)}</p></div>
                        {crop.notes && (
                          <div className="col-span-2">
                            <p className="text-muted-foreground">Notes</p>
                            <p className="font-medium text-foreground">{crop.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
