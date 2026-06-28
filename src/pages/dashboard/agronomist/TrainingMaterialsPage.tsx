import { useState, useMemo } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"  // ← ADDED THIS IMPORT
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
  BookOpen,
  Video,
  FileText,
  Globe,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Youtube,
  File,
  Languages,
  Tag,
  LinkIcon,
  GraduationCap,
} from "lucide-react"
import {
  useTrainingMaterialsList,
  useTrainingMaterial,
  useCreateTrainingMaterial,
  useUpdateTrainingMaterial,
  useDeleteTrainingMaterial,
} from "@/hooks/useTrainingMaterials"
import type {
  TrainingMaterial,
  CreateTrainingMaterialInput,
  UpdateTrainingMaterialInput,
} from "@/services/trainingMaterials"

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-RW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function statusBadge(isPublished: boolean) {
  return isPublished ? (
    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
      <CheckCircle2 className="w-3 h-3 mr-1" /> Published
    </Badge>
  ) : (
    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
      <Clock className="w-3 h-3 mr-1" /> Draft
    </Badge>
  )
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    "Crop Management": "bg-green-100 text-green-700",
    "Livestock": "bg-blue-100 text-blue-700",
    "Pest Control": "bg-red-100 text-red-700",
    "Soil Health": "bg-amber-100 text-amber-700",
    "Irrigation": "bg-cyan-100 text-cyan-700",
    "Agribusiness": "bg-purple-100 text-purple-700",
    "Climate Change": "bg-indigo-100 text-indigo-700",
    "Post-Harvest": "bg-orange-100 text-orange-700",
    "Nutrition": "bg-emerald-100 text-emerald-700",
    "Other": "bg-gray-100 text-gray-700",
  }
  return colors[category] || "bg-gray-100 text-gray-700"
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
  title: string
  description: string
  content: string
  videoUrl: string
  pdfUrl: string
  category: string
  language: string
  isPublished: boolean
}

type UpdateFormValues = {
  title: string
  description: string
  content: string
  videoUrl: string
  pdfUrl: string
  category: string
  language: string
  isPublished: boolean
}

const defaultCreateForm: CreateFormValues = {
  title: "",
  description: "",
  content: "",
  videoUrl: "",
  pdfUrl: "",
  category: "",
  language: "en",
  isPublished: false,
}

const languages = [
  { value: "en", label: "English" },
  { value: "rw", label: "Kinyarwanda" },
  { value: "fr", label: "French" },
  { value: "sw", label: "Swahili" },
]

const categories = [
  "Crop Management",
  "Livestock",
  "Pest Control",
  "Soil Health",
  "Irrigation",
  "Agribusiness",
  "Climate Change",
  "Post-Harvest",
  "Nutrition",
  "Other",
]

// ── Create Form ───────────────────────────────────────────────────────────────

interface CreateFormProps {
  submitting: boolean
  onSubmit: (values: CreateFormValues) => void
  onCancel: () => void
}

function CreateTrainingMaterialForm({ submitting, onSubmit, onCancel }: CreateFormProps) {
  const [form, setForm] = useState<CreateFormValues>(defaultCreateForm)

  const setField =
    (key: keyof CreateFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = () => {
    if (!form.title || !form.description || !form.content || !form.category) {
      toast.error("Title, Description, Content and Category are required")
      return
    }
    onSubmit(form)
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="e.g. Introduction to Organic Farming"
            value={form.title}
            onChange={setField("title")}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Brief description of the training material"
            value={form.description}
            onChange={setField("description")}
            rows={2}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            placeholder="Full content of the training material"
            value={form.content}
            onChange={setField("content")}
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="videoUrl">Video URL</Label>
          <Input
            id="videoUrl"
            placeholder="https://www.youtube.com/watch?v=..."
            value={form.videoUrl}
            onChange={setField("videoUrl")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pdfUrl">PDF URL</Label>
          <Input
            id="pdfUrl"
            placeholder="https://example.com/document.pdf"
            value={form.pdfUrl}
            onChange={setField("pdfUrl")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={form.category}
            onValueChange={val => setForm(prev => ({ ...prev, category: val }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language *</Label>
          <Select
            value={form.language}
            onValueChange={val => setForm(prev => ({ ...prev, language: val }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 flex items-center gap-3 pt-2">
          <Switch
            id="isPublished"
            checked={form.isPublished}
            onCheckedChange={checked => setForm(prev => ({ ...prev, isPublished: checked }))}
          />
          <Label htmlFor="isPublished" className="cursor-pointer">
            Publish immediately
          </Label>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Creating…" : "Create Material"}
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

function EditTrainingMaterialForm({ initial, submitting, onSubmit, onCancel }: EditFormProps) {
  const [form, setForm] = useState<UpdateFormValues>(initial)

  const setField =
    (key: keyof Omit<UpdateFormValues, "isPublished">) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <>
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="editTitle">Title *</Label>
          <Input
            id="editTitle"
            value={form.title}
            onChange={setField("title")}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="editDescription">Description *</Label>
          <Textarea
            id="editDescription"
            value={form.description}
            onChange={setField("description")}
            rows={2}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="editContent">Content *</Label>
          <Textarea
            id="editContent"
            value={form.content}
            onChange={setField("content")}
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="editVideoUrl">Video URL</Label>
          <Input
            id="editVideoUrl"
            value={form.videoUrl}
            onChange={setField("videoUrl")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="editPdfUrl">PDF URL</Label>
          <Input
            id="editPdfUrl"
            value={form.pdfUrl}
            onChange={setField("pdfUrl")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="editCategory">Category *</Label>
          <Select
            value={form.category}
            onValueChange={val => setForm(prev => ({ ...prev, category: val }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="editLanguage">Language *</Label>
          <Select
            value={form.language}
            onValueChange={val => setForm(prev => ({ ...prev, language: val }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 flex items-center gap-3 pt-2">
          <Switch
            id="editIsPublished"
            checked={form.isPublished}
            onCheckedChange={checked => setForm(prev => ({ ...prev, isPublished: checked }))}
          />
          <Label htmlFor="editIsPublished" className="cursor-pointer">
            Published
          </Label>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(form)} disabled={submitting}>
          {submitting ? "Updating…" : "Update Material"}
        </Button>
      </div>
    </>
  )
}

// ── View Dialog ───────────────────────────────────────────────────────────────

function ViewTrainingMaterialDialog({
  materialId,
  onClose,
  onEdit,
  onDelete,
}: {
  materialId: string | null
  onClose: () => void
  onEdit: (material: TrainingMaterial) => void
  onDelete: (id: string) => void
}) {
  const { data: material, loading } = useTrainingMaterial(materialId ?? "")

  return (
    <Dialog open={!!materialId} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Training Material Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 rounded" />
            ))}
          </div>
        ) : material ? (
          <div className="py-2 space-y-5">
            {/* Header */}
            <div className="p-4 rounded-xl bg-muted/50 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-foreground text-base leading-tight">
                  {material.title}
                </p>
                {statusBadge(material.isPublished)}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <Badge className={cn("text-xs", getCategoryColor(material.category))}>
                    {material.category}
                  </Badge>
                </span>
                <span className="flex items-center gap-1">
                  <Languages className="w-3 h-3" />
                  {languages.find(l => l.value === material.language)?.label || material.language}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(material.createdAt)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                <FileText className="w-3.5 h-3.5" /> Description
              </p>
              <p className="text-sm text-foreground bg-sky-50 border border-sky-100 rounded-lg p-3 leading-relaxed">
                {material.description}
              </p>
            </div>

            {/* Content */}
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                <BookOpen className="w-3.5 h-3.5" /> Content
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 leading-relaxed max-h-48 overflow-y-auto">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {material.content}
                </p>
              </div>
            </div>

            {/* Links */}
            {(material.videoUrl || material.pdfUrl) && (
              <div className="flex flex-wrap gap-3">
                {material.videoUrl && (
                  <a
                    href={material.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Youtube className="w-4 h-4" />
                    Watch Video
                  </a>
                )}
                {material.pdfUrl && (
                  <a
                    href={material.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <File className="w-4 h-4" />
                    Download PDF
                  </a>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => { onClose(); onDelete(material.id) }}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
              <Button
                size="sm"
                onClick={() => { onClose(); onEdit(material) }}
              >
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            Could not load training material details.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TrainingMaterialsPage() {
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState("")
  const [languageFilter, setLanguageFilter] = useState("")
  const [publishedFilter, setPublishedFilter] = useState<boolean | "all">("all")
  const [search, setSearch] = useState("")

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [viewId, setViewId] = useState<string | null>(null)
  const [editMaterial, setEditMaterial] = useState<TrainingMaterial | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Data
  const { data: materialsData, loading, refetch } = useTrainingMaterialsList({
    category: categoryFilter || undefined,
    language: languageFilter || undefined,
    isPublished: publishedFilter === "all" ? undefined : publishedFilter,
  })

  const materialsList: TrainingMaterial[] = materialsData?.materials ?? []

  // Mutations
  const { mutate: createMaterialFn, loading: creating } = useCreateTrainingMaterial()
  const { mutate: updateMaterialFn, loading: updating } = useUpdateTrainingMaterial()
  const { mutate: deleteMaterialFn, loading: deleting } = useDeleteTrainingMaterial()

  // Derived stats
  const total = materialsData?.total ?? materialsList.length
  const published = materialsList.filter(m => m.isPublished).length
  const drafts = materialsList.filter(m => !m.isPublished).length

  // Unique categories for filter
  const uniqueCategories = useMemo(() => {
    const unique = new Set(materialsList.map(m => m.category).filter(Boolean))
    return Array.from(unique)
  }, [materialsList])

  // Client-side search filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return materialsList
    return materialsList.filter(
      m =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q)
    )
  }, [materialsList, search])

  // Handlers
  const handleCreate = (values: CreateFormValues) => {
    createMaterialFn(values, () => { setCreateOpen(false); refetch() })
  }

  const handleUpdate = (values: UpdateFormValues) => {
    if (!editMaterial) return
    const body: UpdateTrainingMaterialInput = {
      title: values.title || undefined,
      description: values.description || undefined,
      content: values.content || undefined,
      videoUrl: values.videoUrl || undefined,
      pdfUrl: values.pdfUrl || undefined,
      category: values.category || undefined,
      language: values.language || undefined,
      isPublished: values.isPublished,
    }
    updateMaterialFn(editMaterial.id, body, () => { setEditMaterial(null); refetch() })
  }

  const handleDelete = () => {
    if (!deleteId) return
    deleteMaterialFn(deleteId, () => { setDeleteId(null); refetch() })
  }

  const editFormInitial = (material: TrainingMaterial): UpdateFormValues => ({
    title: material.title,
    description: material.description,
    content: material.content,
    videoUrl: material.videoUrl || "",
    pdfUrl: material.pdfUrl || "",
    category: material.category,
    language: material.language,
    isPublished: material.isPublished,
  })

  return (
    <div className="min-h-screen">
      <Header
        title="Training Materials"
        subtitle="Create and manage training resources for farmers"
      />

      <div className="p-6 space-y-6">

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            gradient="sky"
            icon={<BookOpen className="w-6 h-6" />}
            value={total}
            label="Total Materials"
            loading={loading}
          />
          <StatCard
            gradient="green"
            icon={<CheckCircle2 className="w-6 h-6" />}
            value={published}
            label="Published"
            loading={loading}
          />
          <StatCard
            gradient="gold"
            icon={<Clock className="w-6 h-6" />}
            value={drafts}
            label="Drafts"
            loading={loading}
          />
          <StatCard
            gradient="earth"
            icon={<Globe className="w-6 h-6" />}
            value={languages.length}
            label="Languages"
            loading={loading}
          />
        </div>

        {/* ── Training Materials Table ──────────────────────────────────────── */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Icon3D gradient="sky" size="sm">
                  <GraduationCap className="w-4 h-4" />
                </Icon3D>
                <div>
                  <CardTitle>Training Materials</CardTitle>
                  <CardDescription>
                    {loading
                      ? "Loading materials…"
                      : `${filtered.length} material${filtered.length !== 1 ? "s" : ""} found`}
                  </CardDescription>
                </div>
              </div>

              {/* Filters + CTA */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative w-52">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search materials…"
                    className="pl-9"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                {/* Category filter */}
                {uniqueCategories.length > 0 && (
                  <Select
                    value={categoryFilter || "all"}
                    onValueChange={val =>
                      setCategoryFilter(val === "all" ? "" : val)
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {uniqueCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Language filter */}
                <Select
                  value={languageFilter || "all"}
                  onValueChange={val =>
                    setLanguageFilter(val === "all" ? "" : val)
                  }
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="All languages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All languages</SelectItem>
                    {languages.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Published filter */}
                <Select
                  value={String(publishedFilter)}
                  onValueChange={val =>
                    setPublishedFilter(val === "all" ? "all" : val === "true")
                  }
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="true">Published</SelectItem>
                    <SelectItem value="false">Drafts</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> New Material
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
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Title</th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Category</th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Language</th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-center py-3 pr-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-center py-3 pr-4 text-sm font-medium text-muted-foreground">Resources</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(material => (
                      <tr
                        key={material.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 pr-4 text-sm font-medium text-foreground max-w-[180px] truncate">
                          {material.title}
                        </td>
                        <td className="py-3 pr-4 text-sm">
                          <Badge className={cn("text-xs", getCategoryColor(material.category))}>
                            {material.category}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">
                          {languages.find(l => l.value === material.language)?.label || material.language}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(material.createdAt)}
                        </td>
                        <td className="py-3 pr-4 text-center">
                          {statusBadge(material.isPublished)}
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {material.videoUrl && (
                              <Youtube className="w-4 h-4 text-red-500" />
                            )}
                            {material.pdfUrl && (
                              <File className="w-4 h-4 text-blue-500" />
                            )}
                            {!material.videoUrl && !material.pdfUrl && (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
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
                              <DropdownMenuItem onClick={() => setViewId(material.id)}>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditMaterial(material)}>
                                <Pencil className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              {material.videoUrl && (
                                <DropdownMenuItem onClick={() => window.open(material.videoUrl, '_blank')}>
                                  <Youtube className="w-4 h-4 mr-2" /> Watch Video
                                </DropdownMenuItem>
                              )}
                              {material.pdfUrl && (
                                <DropdownMenuItem onClick={() => window.open(material.pdfUrl, '_blank')}>
                                  <File className="w-4 h-4 mr-2" /> Download PDF
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => setDeleteId(material.id)}
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
                {materialsData?.total != null && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Showing {filtered.length} of {materialsData.total} materials
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">No training materials found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first training material to share knowledge with farmers.
                </p>
                <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> New Material
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Create Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={open => !open && setCreateOpen(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Training Material</DialogTitle>
          </DialogHeader>
          <CreateTrainingMaterialForm
            submitting={creating}
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={!!editMaterial} onOpenChange={open => !open && setEditMaterial(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Training Material</DialogTitle>
          </DialogHeader>
          {editMaterial && (
            <EditTrainingMaterialForm
              key={editMaterial.id}
              initial={editFormInitial(editMaterial)}
              submitting={updating}
              onSubmit={handleUpdate}
              onCancel={() => setEditMaterial(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── View Dialog ──────────────────────────────────────────────────────── */}
      <ViewTrainingMaterialDialog
        materialId={viewId}
        onClose={() => setViewId(null)}
        onEdit={material => setEditMaterial(material)}
        onDelete={id => setDeleteId(id)}
      />

      {/* ── Delete Alert ─────────────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Training Material</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The training material will be permanently deleted.
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