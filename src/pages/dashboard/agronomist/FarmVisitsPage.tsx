import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CalendarCheck,
  MapPin,
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  MoreHorizontal,
  Eye,
  Pencil,
  Plus,
  Calendar,
  User,
  FileText,
  Lightbulb,
} from "lucide-react"
import { toast } from "sonner"
import {
  useFarmVisits,
  useFarmVisit,
  useCreateFarmVisit,
  useUpdateFarmVisit,
} from "@/hooks/useFarmVisits"
import type {
  FarmVisit,
  CreateFarmVisitInput,
  UpdateFarmVisitInput,
  VisitStatus,
} from "@/services/farmVisits"

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-RW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-RW", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function toInputDate(iso: string): string {
  return iso ? new Date(iso).toISOString().slice(0, 16) : ""
}

function statusBadge(status: VisitStatus) {
  switch (status) {
    case "scheduled":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Clock className="w-3 h-3 mr-1" />Scheduled</Badge>
    case "completed":
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>
    case "cancelled":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

type CreateFormValues = {
  farmerId: string
  farmId: string
  visitDate: string
  observations: string
  recommendations: string
  nextVisitDate: string
}

type UpdateFormValues = {
  visitDate: string
  observations: string
  recommendations: string
  nextVisitDate: string
  status: VisitStatus
}

const defaultCreateForm: CreateFormValues = {
  farmerId: "",
  farmId: "",
  visitDate: "",
  observations: "",
  recommendations: "",
  nextVisitDate: "",
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
          <Icon3D gradient={gradient} size="md">{icon}</Icon3D>
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

// ── Create Visit Form ─────────────────────────────────────────────────────────

interface CreateFormProps {
  submitting: boolean
  onSubmit: (values: CreateFormValues) => void
  onCancel: () => void
}

function CreateVisitForm({ submitting, onSubmit, onCancel }: CreateFormProps) {
  const [form, setForm] = useState<CreateFormValues>(defaultCreateForm)

  const setField =
    (key: keyof CreateFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = () => {
    if (!form.farmerId || !form.farmId || !form.visitDate) {
      toast.error("Farmer ID, Farm ID and Visit Date are required")
      return
    }
    onSubmit(form)
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="farmerId">Farmer ID</Label>
          <Input
            id="farmerId"
            placeholder="Enter farmer UUID"
            value={form.farmerId}
            onChange={setField("farmerId")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="farmId">Farm ID</Label>
          <Input
            id="farmId"
            placeholder="Enter farm UUID"
            value={form.farmId}
            onChange={setField("farmId")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="visitDate">Visit Date</Label>
          <Input
            id="visitDate"
            type="datetime-local"
            value={form.visitDate}
            onChange={setField("visitDate")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nextVisitDate">Next Visit Date</Label>
          <Input
            id="nextVisitDate"
            type="datetime-local"
            value={form.nextVisitDate}
            onChange={setField("nextVisitDate")}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="observations">Observations</Label>
          <Textarea
            id="observations"
            placeholder="What did you observe during this visit?"
            value={form.observations}
            onChange={setField("observations")}
            rows={3}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="recommendations">Recommendations</Label>
          <Textarea
            id="recommendations"
            placeholder="What do you recommend for this farm?"
            value={form.recommendations}
            onChange={setField("recommendations")}
            rows={3}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving…" : "Create Visit"}
        </Button>
      </div>
    </>
  )
}

// ── Edit Visit Form ───────────────────────────────────────────────────────────

interface EditFormProps {
  initial: UpdateFormValues
  submitting: boolean
  onSubmit: (values: UpdateFormValues) => void
  onCancel: () => void
}

function EditVisitForm({ initial, submitting, onSubmit, onCancel }: EditFormProps) {
  const [form, setForm] = useState<UpdateFormValues>(initial)

  const setField =
    (key: keyof UpdateFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <>
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="editVisitDate">Visit Date</Label>
          <Input
            id="editVisitDate"
            type="datetime-local"
            value={form.visitDate}
            onChange={setField("visitDate")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="editNextVisitDate">Next Visit Date</Label>
          <Input
            id="editNextVisitDate"
            type="datetime-local"
            value={form.nextVisitDate}
            onChange={setField("nextVisitDate")}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={val =>
              setForm(prev => ({ ...prev, status: val as VisitStatus }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="editObservations">Observations</Label>
          <Textarea
            id="editObservations"
            placeholder="What did you observe?"
            value={form.observations}
            onChange={setField("observations")}
            rows={3}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="editRecommendations">Recommendations</Label>
          <Textarea
            id="editRecommendations"
            placeholder="Your recommendations"
            value={form.recommendations}
            onChange={setField("recommendations")}
            rows={3}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(form)} disabled={submitting}>
          {submitting ? "Saving…" : "Update Visit"}
        </Button>
      </div>
    </>
  )
}

// ── View Visit Dialog ─────────────────────────────────────────────────────────

function ViewVisitDialog({
  visitId,
  onClose,
  onEdit,
}: {
  visitId: string | null
  onClose: () => void
  onEdit: (visit: FarmVisit) => void
}) {
  const { data: visit, loading } = useFarmVisit(visitId ?? "")

  return (
    <Dialog open={!!visitId} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Farm Visit Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 rounded" />
            ))}
          </div>
        ) : visit ? (
          <div className="py-2 space-y-5">
            {/* Status + dates hero */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Visit Date</p>
                <p className="font-semibold text-foreground">{formatDateTime(visit.visitDate)}</p>
              </div>
              {statusBadge(visit.status)}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Farmer
                </p>
                <p className="font-medium mt-0.5">{visit.farmer?.name ?? visit.farmerId}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Location
                </p>
                <p className="font-medium mt-0.5">
                  {[visit.farmer?.sector, visit.farmer?.district].filter(Boolean).join(", ") || "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Next Visit
                </p>
                <p className="font-medium mt-0.5">
                  {visit.nextVisitDate ? formatDate(visit.nextVisitDate) : "—"}
                </p>
              </div>
            </div>

            {/* Observations */}
            {visit.observations && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                  <FileText className="w-3.5 h-3.5" /> Observations
                </p>
                <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3 leading-relaxed">
                  {visit.observations}
                </p>
              </div>
            )}

            {/* Recommendations */}
            {visit.recommendations && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Lightbulb className="w-3.5 h-3.5" /> Recommendations
                </p>
                <p className="text-sm text-foreground bg-emerald-50 border border-emerald-100 rounded-lg p-3 leading-relaxed">
                  {visit.recommendations}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button onClick={() => { onClose(); onEdit(visit) }}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">Could not load visit details.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FarmVisitsPage() {
  useTranslation()

  // Filter state
  const [statusFilter, setStatusFilter] = useState<VisitStatus | "">("")
  const [farmerFilter, setFarmerFilter] = useState("")

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [viewId, setViewId] = useState<string | null>(null)
  const [editVisit, setEditVisit] = useState<FarmVisit | null>(null)

  // Data
  const { data: visitsData, loading, refetch } = useFarmVisits({
    status: statusFilter || undefined,
    farmerId: farmerFilter || undefined,
  })

  const visits: FarmVisit[] = visitsData?.visits ?? []

  // Mutations
  const { mutate: createVisit, loading: creating } = useCreateFarmVisit()
  const { mutate: updateVisit, loading: updating } = useUpdateFarmVisit()

  // Derived stats
  const total = visitsData?.total ?? visits.length
  const scheduled = visits.filter(v => v.status === "scheduled").length
  const completed = visits.filter(v => v.status === "completed").length
  const cancelled = visits.filter(v => v.status === "cancelled").length

  // Client-side farmer name filter
  const filtered = useMemo(() => {
    const q = farmerFilter.toLowerCase()
    if (!q) return visits
    return visits.filter(
      v =>
        v.farmer?.name?.toLowerCase().includes(q) ||
        v.farmerId.toLowerCase().includes(q)
    )
  }, [visits, farmerFilter])

  // Handlers
  const handleCreate = (values: CreateFormValues) => {
    const body: CreateFarmVisitInput = {
      farmerId: values.farmerId,
      farmId: values.farmId,
      visitDate: new Date(values.visitDate).toISOString(),
      observations: values.observations || undefined,
      recommendations: values.recommendations || undefined,
      nextVisitDate: values.nextVisitDate
        ? new Date(values.nextVisitDate).toISOString()
        : undefined,
    }
    createVisit(body, () => { setCreateOpen(false); refetch() })
  }

  const handleUpdate = (values: UpdateFormValues) => {
    if (!editVisit) return
    const body: UpdateFarmVisitInput = {
      visitDate: values.visitDate ? new Date(values.visitDate).toISOString() : undefined,
      observations: values.observations || undefined,
      recommendations: values.recommendations || undefined,
      nextVisitDate: values.nextVisitDate
        ? new Date(values.nextVisitDate).toISOString()
        : undefined,
      status: values.status,
    }
    updateVisit(editVisit.id, body, () => { setEditVisit(null); refetch() })
  }

  const editFormInitial = (visit: FarmVisit): UpdateFormValues => ({
    visitDate: toInputDate(visit.visitDate),
    observations: visit.observations ?? "",
    recommendations: visit.recommendations ?? "",
    nextVisitDate: visit.nextVisitDate ? toInputDate(visit.nextVisitDate) : "",
    status: visit.status,
  })

  return (
    <div className="min-h-screen">
      <Header
        title="Farm Visits"
        subtitle="Schedule, track and manage all farm visits"
      />

      <div className="p-6 space-y-6">

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            gradient="sky"
            icon={<CalendarCheck className="w-6 h-6" />}
            value={total}
            label="Total Visits"
            loading={loading}
          />
          <StatCard
            gradient="green"
            icon={<CheckCircle2 className="w-6 h-6" />}
            value={completed}
            label="Completed"
            loading={loading}
          />
          <StatCard
            gradient="gold"
            icon={<Clock className="w-6 h-6" />}
            value={scheduled}
            label="Scheduled"
            loading={loading}
          />
          <StatCard
            gradient="earth"
            icon={<XCircle className="w-6 h-6" />}
            value={cancelled}
            label="Cancelled"
            loading={loading}
          />
        </div>

        {/* ── Visits Table ─────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Icon3D gradient="sky" size="sm">
                  <ClipboardList className="w-4 h-4" />
                </Icon3D>
                <div>
                  <CardTitle>Visit Log</CardTitle>
                  <CardDescription>
                    {loading
                      ? "Loading visits…"
                      : `${filtered.length} visit${filtered.length !== 1 ? "s" : ""} found`}
                  </CardDescription>
                </div>
              </div>

              {/* Filters + CTA */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Status filter */}
                <Select
                  value={statusFilter || "all"}
                  onValueChange={val =>
                    setStatusFilter(val === "all" ? "" : val as VisitStatus)
                  }
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                {/* Farmer filter */}
                <Input
                  placeholder="Filter by farmer…"
                  className="w-44"
                  value={farmerFilter}
                  onChange={e => setFarmerFilter(e.target.value)}
                />

                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> New Visit
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Farmer</th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Location</th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Visit Date</th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Next Visit</th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Observations</th>
                      <th className="text-center py-3 pr-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(visit => (
                      <tr
                        key={visit.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 pr-4 text-sm font-medium text-foreground">
                          {visit.farmer?.name ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">
                          {[visit.farmer?.sector, visit.farmer?.district]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(visit.visitDate)}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground whitespace-nowrap">
                          {visit.nextVisitDate ? formatDate(visit.nextVisitDate) : "—"}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground max-w-[200px] truncate">
                          {visit.observations || "—"}
                        </td>
                        <td className="py-3 pr-4 text-center">
                          {statusBadge(visit.status)}
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
                              <DropdownMenuItem onClick={() => setViewId(visit.id)}>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditVisit(visit)}>
                                <Pencil className="w-4 h-4 mr-2" /> Edit Visit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {visitsData?.total != null && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Showing {filtered.length} of {visitsData.total} visits
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CalendarCheck className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">No visits found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {statusFilter
                    ? `No ${statusFilter} visits yet.`
                    : "Schedule your first farm visit to get started."}
                </p>
                <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Schedule Visit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Create Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={open => !open && setCreateOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule New Farm Visit</DialogTitle>
          </DialogHeader>
          <CreateVisitForm
            submitting={creating}
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={!!editVisit} onOpenChange={open => !open && setEditVisit(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Farm Visit</DialogTitle>
          </DialogHeader>
          {editVisit && (
            <EditVisitForm
              key={editVisit.id}
              initial={editFormInitial(editVisit)}
              submitting={updating}
              onSubmit={handleUpdate}
              onCancel={() => setEditVisit(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── View Dialog ──────────────────────────────────────────────────────── */}
      <ViewVisitDialog
        visitId={viewId}
        onClose={() => setViewId(null)}
        onEdit={visit => setEditVisit(visit)}
      />
    </div>
  )
}
