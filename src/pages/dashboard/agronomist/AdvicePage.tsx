import { useState, useMemo } from "react"
import { toast } from "sonner"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  Lightbulb,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Plus,
  User,
  FileText,
  Stethoscope,
  ClipboardCheck,
  Search,
} from "lucide-react"
import {
  useAdviceList,
  useAdvice,
  useCreateAdvice,
  useUpdateAdvice,
  useDeleteAdvice,
} from "@/hooks/useAdvice"
import type {
  Advice,
  AdviceStatus,
  CreateAdviceInput,
  UpdateAdviceInput,
} from "@/services/advice"

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-RW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function statusBadge(status: AdviceStatus) {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>
      )
    case "in_progress":
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          <Loader2 className="w-3 h-3 mr-1" /> In Progress
        </Badge>
      )
    case "resolved":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Resolved
        </Badge>
      )
    case "closed":
      return (
        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">
          <XCircle className="w-3 h-3 mr-1" /> Closed
        </Badge>
      )
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

// ── Form values ───────────────────────────────────────────────────────────────

type CreateFormValues = {
  farmerId: string
  farmId: string
  title: string
  problem: string
  recommendation: string
}

type UpdateFormValues = {
  title: string
  problem: string
  recommendation: string
  status: AdviceStatus
}

const defaultCreateForm: CreateFormValues = {
  farmerId: "",
  farmId: "",
  title: "",
  problem: "",
  recommendation: "",
}

// ── Create Form ───────────────────────────────────────────────────────────────

interface CreateFormProps {
  submitting: boolean
  onSubmit: (values: CreateFormValues) => void
  onCancel: () => void
}

function CreateAdviceForm({ submitting, onSubmit, onCancel }: CreateFormProps) {
  const [form, setForm] = useState<CreateFormValues>(defaultCreateForm)

  const setField =
    (key: keyof CreateFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = () => {
    if (!form.farmerId || !form.farmId || !form.title || !form.problem) {
      toast.error("Farmer ID, Farm ID, Title and Problem are required")
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
        <div className="col-span-2 space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="e.g. Pest Control Issue"
            value={form.title}
            onChange={setField("title")}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="problem">Problem</Label>
          <Textarea
            id="problem"
            placeholder="Describe the problem observed on the farm…"
            value={form.problem}
            onChange={setField("problem")}
            rows={3}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="recommendation">Recommendation</Label>
          <Textarea
            id="recommendation"
            placeholder="What do you recommend to solve this problem?"
            value={form.recommendation}
            onChange={setField("recommendation")}
            rows={3}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving…" : "Create Advice"}
        </Button>
      </div>
    </>
  )
}

// ── Edit Form ─────────────────────────────────────────────────────────────────

interface EditFormProps {
  initial: UpdateFormValues
  submitting: boolean
  onSubmit: (values: UpdateFormValues) => void
  onCancel: () => void
}

function EditAdviceForm({ initial, submitting, onSubmit, onCancel }: EditFormProps) {
  const [form, setForm] = useState<UpdateFormValues>(initial)

  const setField =
    (key: keyof Omit<UpdateFormValues, "status">) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <>
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="editTitle">Title</Label>
          <Input
            id="editTitle"
            value={form.title}
            onChange={setField("title")}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={val =>
              setForm(prev => ({ ...prev, status: val as AdviceStatus }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="editProblem">Problem</Label>
          <Textarea
            id="editProblem"
            value={form.problem}
            onChange={setField("problem")}
            rows={3}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="editRecommendation">Recommendation</Label>
          <Textarea
            id="editRecommendation"
            value={form.recommendation}
            onChange={setField("recommendation")}
            rows={3}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(form)} disabled={submitting}>
          {submitting ? "Saving…" : "Update Advice"}
        </Button>
      </div>
    </>
  )
}

// ── View Dialog ───────────────────────────────────────────────────────────────

function ViewAdviceDialog({
  adviceId,
  onClose,
  onEdit,
  onDelete,
}: {
  adviceId: string | null
  onClose: () => void
  onEdit: (advice: Advice) => void
  onDelete: (id: string) => void
}) {
  const { data: advice, loading } = useAdvice(adviceId ?? "")

  return (
    <Dialog open={!!adviceId} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Advice Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 rounded" />
            ))}
          </div>
        ) : advice ? (
          <div className="py-2 space-y-5">
            {/* Hero */}
            <div className="p-4 rounded-xl bg-muted/50 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-foreground text-base leading-tight">
                  {advice.title}
                </p>
                {statusBadge(advice.status)}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {advice.farmer?.name ?? advice.farmerId}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(advice.createdAt)}
                </span>
              </div>
            </div>

            {/* Problem */}
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                <Stethoscope className="w-3.5 h-3.5" /> Problem
              </p>
              <p className="text-sm text-foreground bg-red-50 border border-red-100 rounded-lg p-3 leading-relaxed">
                {advice.problem}
              </p>
            </div>

            {/* Recommendation */}
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                <Lightbulb className="w-3.5 h-3.5" /> Recommendation
              </p>
              <p className="text-sm text-foreground bg-emerald-50 border border-emerald-100 rounded-lg p-3 leading-relaxed">
                {advice.recommendation}
              </p>
            </div>

            {/* Location */}
            {(advice.farmer?.district || advice.farmer?.sector) && (
              <div className="text-sm text-muted-foreground">
                <FileText className="w-3.5 h-3.5 inline mr-1" />
                {[advice.farmer?.sector, advice.farmer?.district]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => { onClose(); onDelete(advice.id) }}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
              <Button
                size="sm"
                onClick={() => { onClose(); onEdit(advice) }}
              >
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            Could not load advice details.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdvicePage() {
  // Filter state
  const [statusFilter, setStatusFilter] = useState<AdviceStatus | "">("")
  const [search, setSearch] = useState("")

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [viewId, setViewId] = useState<string | null>(null)
  const [editAdvice, setEditAdvice] = useState<Advice | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Data
  const { data: adviceData, loading, refetch } = useAdviceList({
    status: statusFilter || undefined,
  })

  const adviceList: Advice[] = adviceData?.advice ?? []

  // Mutations
  const { mutate: createAdviceFn, loading: creating } = useCreateAdvice()
  const { mutate: updateAdviceFn, loading: updating } = useUpdateAdvice()
  const { mutate: deleteAdviceFn, loading: deleting } = useDeleteAdvice()

  // Derived stats
  const total = adviceData?.total ?? adviceList.length
  const pending = adviceList.filter(a => a.status === "pending").length
  const inProgress = adviceList.filter(a => a.status === "in_progress").length
  const resolved = adviceList.filter(a => a.status === "resolved").length

  // Client-side search filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return adviceList
    return adviceList.filter(
      a =>
        a.title.toLowerCase().includes(q) ||
        a.problem.toLowerCase().includes(q) ||
        a.farmer?.name?.toLowerCase().includes(q) ||
        a.farmer?.district?.toLowerCase().includes(q)
    )
  }, [adviceList, search])

  // Handlers
  const handleCreate = (values: CreateAdviceInput) => {
    createAdviceFn(values, () => { setCreateOpen(false); refetch() })
  }

  const handleUpdate = (values: UpdateFormValues) => {
    if (!editAdvice) return
    const body: UpdateAdviceInput = {
      title: values.title || undefined,
      problem: values.problem || undefined,
      recommendation: values.recommendation || undefined,
      status: values.status,
    }
    updateAdviceFn(editAdvice.id, body, () => { setEditAdvice(null); refetch() })
  }

  const handleDelete = () => {
    if (!deleteId) return
    deleteAdviceFn(deleteId, () => { setDeleteId(null); refetch() })
  }

  const editFormInitial = (advice: Advice): UpdateFormValues => ({
    title: advice.title,
    problem: advice.problem,
    recommendation: advice.recommendation,
    status: advice.status,
  })

  return (
    <div className="min-h-screen">
      <Header
        title="Advice Management"
        subtitle="Create and track agronomic advice for your assigned farmers"
      />

      <div className="p-6 space-y-6">

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            gradient="sky"
            icon={<Lightbulb className="w-6 h-6" />}
            value={total}
            label="Total Advice"
            loading={loading}
          />
          <StatCard
            gradient="gold"
            icon={<Clock className="w-6 h-6" />}
            value={pending}
            label="Pending"
            loading={loading}
          />
          <StatCard
            gradient="leaf"
            icon={<Loader2 className="w-6 h-6" />}
            value={inProgress}
            label="In Progress"
            loading={loading}
          />
          <StatCard
            gradient="green"
            icon={<CheckCircle2 className="w-6 h-6" />}
            value={resolved}
            label="Resolved"
            loading={loading}
          />
        </div>

        {/* ── Advice Table ─────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Icon3D gradient="sky" size="sm">
                  <ClipboardCheck className="w-4 h-4" />
                </Icon3D>
                <div>
                  <CardTitle>Advice Records</CardTitle>
                  <CardDescription>
                    {loading
                      ? "Loading advice…"
                      : `${filtered.length} record${filtered.length !== 1 ? "s" : ""} found`}
                  </CardDescription>
                </div>
              </div>

              {/* Filters + CTA */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative w-52">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search advice…"
                    className="pl-9"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                {/* Status filter */}
                <Select
                  value={statusFilter || "all"}
                  onValueChange={val =>
                    setStatusFilter(val === "all" ? "" : val as AdviceStatus)
                  }
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> New Advice
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
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Title</th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Farmer</th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Problem</th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Recommendation</th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-center py-3 pr-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(advice => (
                      <tr
                        key={advice.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 pr-4 text-sm font-medium text-foreground max-w-[160px] truncate">
                          {advice.title}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">
                          {advice.farmer?.name ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground max-w-[180px] truncate">
                          {advice.problem}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground max-w-[180px] truncate">
                          {advice.recommendation}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(advice.createdAt)}
                        </td>
                        <td className="py-3 pr-4 text-center">
                          {statusBadge(advice.status)}
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
                              <DropdownMenuItem onClick={() => setViewId(advice.id)}>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditAdvice(advice)}>
                                <Pencil className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteId(advice.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {adviceData?.total != null && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Showing {filtered.length} of {adviceData.total} records
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Lightbulb className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">No advice records found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {statusFilter
                    ? `No ${statusFilter.replace("_", " ")} advice yet.`
                    : "Create your first advice record to get started."}
                </p>
                <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> New Advice
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
            <DialogTitle>Create New Advice</DialogTitle>
          </DialogHeader>
          <CreateAdviceForm
            submitting={creating}
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={!!editAdvice} onOpenChange={open => !open && setEditAdvice(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Advice</DialogTitle>
          </DialogHeader>
          {editAdvice && (
            <EditAdviceForm
              key={editAdvice.id}
              initial={editFormInitial(editAdvice)}
              submitting={updating}
              onSubmit={handleUpdate}
              onCancel={() => setEditAdvice(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── View Dialog ──────────────────────────────────────────────────────── */}
      <ViewAdviceDialog
        adviceId={viewId}
        onClose={() => setViewId(null)}
        onEdit={advice => setEditAdvice(advice)}
        onDelete={id => setDeleteId(id)}
      />

      {/* ── Delete Alert ─────────────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Advice</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The advice record will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}