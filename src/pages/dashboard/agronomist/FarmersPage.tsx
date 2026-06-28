import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  MapPin,
  Phone,
  Sprout,
  Search,
  MoreHorizontal,
  Eye,
  MessageSquare,
  UserCheck,
  TrendingUp,
  ChevronRight,
  Calendar,
  Layers,
  User,
} from "lucide-react"
import { useAssignedFarmers, useFarmerDetail } from "@/hooks/useFarmers"
import type { Farmer } from "@/services/farmers"

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function avatarColor(name: string): string {
  const colors = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-amber-500",
    "bg-violet-500",
    "bg-rose-500",
    "bg-teal-500",
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-RW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function activityBadge(status: string | undefined) {
  switch (status) {
    case "active":
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
    case "inactive":
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Inactive</Badge>
    case "new":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">New</Badge>
    default:
      return null
  }
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  gradient: "green" | "sky" | "gold" | "earth" | "leaf"
  icon: React.ReactNode
  value: string | number
  label: string
  loading?: boolean
}

function StatCard({ gradient, icon, value, label, loading }: StatCardProps) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Icon3D gradient={gradient} size="md">
            {icon}
          </Icon3D>
          <div>
            {loading ? (
              <>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Farmer Avatar ─────────────────────────────────────────────────────────────

function FarmerAvatar({ name, photoUrl, size = "md" }: { name: string; photoUrl?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm"
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
      />
    )
  }
  return (
    <div
      className={`${sizeClass} ${avatarColor(name)} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
    >
      {getInitials(name)}
    </div>
  )
}

// ── Farmer Card (Grid view) ───────────────────────────────────────────────────

interface FarmerCardProps {
  farmer: Farmer
  onView: (id: string) => void
  onMessage: (id: string) => void
}

function FarmerCard({ farmer, onView, onMessage }: FarmerCardProps) {
  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        {/* Top row: avatar + name + status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <FarmerAvatar name={farmer.name} photoUrl={farmer.photoUrl} />
            <div>
              <p className="font-semibold text-foreground leading-tight">{farmer.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                ID · {farmer.nationalId ?? "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activityBadge(farmer.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={4}>
                <DropdownMenuItem onClick={() => onView(farmer.id)}>
                  <Eye className="w-4 h-4 mr-2" /> View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMessage(farmer.id)}>
                  <MessageSquare className="w-4 h-4 mr-2" /> Send Message
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
            <span className="truncate">
              {[farmer.sector, farmer.district].filter(Boolean).join(", ") || "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
            <span>{farmer.phone ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sprout className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
            <span className="truncate">
              {farmer.crops?.length ? farmer.crops.join(", ") : "—"}
            </span>
          </div>
          {farmer.farmSize != null && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
              <span>{farmer.farmSize} ha</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {farmer.lastActivity ? `Last seen ${formatDate(farmer.lastActivity)}` : "No recent activity"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary text-xs h-7 px-2"
            onClick={() => onView(farmer.id)}
          >
            View <ChevronRight className="w-3 h-3 ml-0.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Farmer Detail Dialog ──────────────────────────────────────────────────────

function FarmerDetailDialog({
  farmerId,
  onClose,
}: {
  farmerId: string | null
  onClose: () => void
}) {
  const { data: farmer, loading } = useFarmerDetail(farmerId ?? "")

  return (
    <Dialog open={!!farmerId} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Farmer Profile</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 rounded" />
            ))}
          </div>
        ) : farmer ? (
          <div className="py-2 space-y-5">
            {/* Avatar + name hero */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
              <FarmerAvatar name={farmer.name} photoUrl={farmer.photoUrl} size="lg" />
              <div>
                <p className="text-lg font-semibold text-foreground">{farmer.name}</p>
                <p className="text-sm text-muted-foreground">{farmer.district}, Rwanda</p>
                <div className="mt-1">{activityBadge(farmer.status)}</div>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </p>
                <p className="font-medium mt-0.5">{farmer.phone ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> National ID
                </p>
                <p className="font-medium mt-0.5">{farmer.nationalId ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Sector
                </p>
                <p className="font-medium mt-0.5">{farmer.sector ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> District
                </p>
                <p className="font-medium mt-0.5">{farmer.district ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Farm Size
                </p>
                <p className="font-medium mt-0.5">
                  {farmer.farmSize != null ? `${farmer.farmSize} ha` : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Joined
                </p>
                <p className="font-medium mt-0.5">
                  {farmer.joinedAt ? formatDate(farmer.joinedAt) : "—"}
                </p>
              </div>
            </div>

            {/* Crops */}
            {farmer.crops?.length ? (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Sprout className="w-3.5 h-3.5" /> Crops Grown
                </p>
                <div className="flex flex-wrap gap-2">
                  {farmer.crops.map(crop => (
                    <span
                      key={crop}
                      className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium"
                    >
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Notes */}
            {farmer.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{farmer.notes}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">Could not load farmer details.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FarmersPage() {
  const { t } = useTranslation()

  const [search, setSearch] = useState("")
  const [viewId, setViewId] = useState<string | null>(null)

  const { data: farmersData, loading } = useAssignedFarmers()

  const farmers: Farmer[] = farmersData?.farmers ?? []

  // Derived stats
  const totalFarmers = farmersData?.total ?? farmers.length
  const activeFarmers = farmers.filter(f => f.status === "active").length
  const districts = useMemo(
    () => new Set(farmers.map(f => f.district).filter(Boolean)).size,
    [farmers]
  )
  const totalHa = useMemo(
    () => farmers.reduce((sum, f) => sum + (f.farmSize ?? 0), 0).toFixed(1),
    [farmers]
  )

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return farmers
    return farmers.filter(
      f =>
        f.name.toLowerCase().includes(q) ||
        f.district?.toLowerCase().includes(q) ||
        f.sector?.toLowerCase().includes(q) ||
        f.crops?.some(c => c.toLowerCase().includes(q))
    )
  }, [farmers, search])

  return (
    <div className="min-h-screen">
      <Header
        title="Assigned Farmers"
        subtitle="Manage and monitor the farmers under your care"
      />

      <div className="p-6 space-y-6">

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            gradient="green"
            icon={<Users className="w-6 h-6" />}
            value={totalFarmers}
            label="Total Farmers"
            loading={loading}
          />
          <StatCard
            gradient="sky"
            icon={<UserCheck className="w-6 h-6" />}
            value={activeFarmers}
            label="Active This Month"
            loading={loading}
          />
          <StatCard
            gradient="gold"
            icon={<MapPin className="w-6 h-6" />}
            value={districts}
            label="Districts Covered"
            loading={loading}
          />
          <StatCard
            gradient="earth"
            icon={<TrendingUp className="w-6 h-6" />}
            value={`${totalHa} ha`}
            label="Total Farm Area"
            loading={loading}
          />
        </div>

        {/* ── Farmers Grid ────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Icon3D gradient="green" size="sm">
                  <Users className="w-4 h-4" />
                </Icon3D>
                <div>
                  <CardTitle>Farmer Directory</CardTitle>
                  <CardDescription>
                    {loading
                      ? "Loading farmers…"
                      : `${filtered.length} of ${totalFarmers} farmer${totalFarmers !== 1 ? "s" : ""} shown`}
                  </CardDescription>
                </div>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, district, crop…"
                  className="pl-9"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-52 rounded-xl" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(farmer => (
                  <FarmerCard
                    key={farmer.id}
                    farmer={farmer}
                    onView={id => setViewId(id)}
                    onMessage={id => {
                      // TODO: wire up messaging
                      console.log("message", id)
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">
                  {search ? "No farmers match your search" : "No farmers assigned yet"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {search
                    ? "Try a different name, district, or crop."
                    : "Farmers assigned to you will appear here."}
                </p>
                {search && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSearch("")}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Summary Table ────────────────────────────────────────────────── */}
        {!loading && farmers.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Icon3D gradient="sky" size="sm">
                  <Sprout className="w-4 h-4" />
                </Icon3D>
                <span>Summary Table</span>
              </CardTitle>
              <CardDescription>All assigned farmers at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Farmer</th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Location</th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Phone</th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Crops</th>
                      <th className="text-center py-3 pr-4 text-sm font-medium text-muted-foreground">Farm Size</th>
                      <th className="text-center py-3 pr-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(farmer => (
                      <tr
                        key={farmer.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <FarmerAvatar name={farmer.name} photoUrl={farmer.photoUrl} size="sm" />
                            <span className="text-sm font-medium text-foreground">{farmer.name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">
                          {[farmer.sector, farmer.district].filter(Boolean).join(", ") || "—"}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">
                          {farmer.phone ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground max-w-[180px] truncate">
                          {farmer.crops?.join(", ") || "—"}
                        </td>
                        <td className="py-3 pr-4 text-sm text-center text-muted-foreground">
                          {farmer.farmSize != null ? `${farmer.farmSize} ha` : "—"}
                        </td>
                        <td className="py-3 pr-4 text-center">
                          {activityBadge(farmer.status)}
                        </td>
                        <td className="py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={4}>
                              <DropdownMenuItem onClick={() => setViewId(farmer.id)}>
                                <Eye className="w-4 h-4 mr-2" /> View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="w-4 h-4 mr-2" /> Send Message
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {farmersData?.total != null && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Showing {filtered.length} of {farmersData.total} farmers
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Farmer Detail Dialog ─────────────────────────────────────────────── */}
      <FarmerDetailDialog farmerId={viewId} onClose={() => setViewId(null)} />
    </div>
  )
}
