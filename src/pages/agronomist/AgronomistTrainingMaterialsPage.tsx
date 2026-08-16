import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { BookOpen, Plus, ChevronLeft, ChevronRight, Eye, User } from "lucide-react"
import { toast } from "sonner"
import { authService } from "@/services/auth"
import {
  agronomistTrainingMaterialsService, type TrainingMaterial, type CreateTrainingMaterialPayload,
} from "@/services/agronomistTrainingMaterials.service"

interface FormState {
  title: string
  description: string
  content: string
  category: string
  language: string
  videoUrl: string
  pdfUrl: string
}

const EMPTY_FORM: FormState = { title: "", description: "", content: "", category: "", language: "en", videoUrl: "", pdfUrl: "" }

export default function AgronomistTrainingMaterialsPage() {
  const navigate = useNavigate()
  const currentUserId = authService.getCurrentUser()?.id

  const [materials, setMaterials] = useState<TrainingMaterial[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const limit = 10

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    agronomistTrainingMaterialsService.getMaterials({ page, limit })
      .then(({ materials, pagination }) => { setMaterials(materials); setTotal(pagination.total) })
      .catch(() => toast.error("Failed to load training materials"))
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const handleCreate = async () => {
    if (!form.title || !form.description || !form.content || !form.category) {
      toast.error("Title, description, content, and category are required")
      return
    }
    setSaving(true)
    try {
      const payload: CreateTrainingMaterialPayload = {
        title: form.title, description: form.description, content: form.content, category: form.category,
        language: form.language || undefined,
        ...(form.videoUrl ? { videoUrl: form.videoUrl } : {}),
        ...(form.pdfUrl ? { pdfUrl: form.pdfUrl } : {}),
      }
      await agronomistTrainingMaterialsService.createMaterial(payload)
      toast.success("Training material saved as draft")
      setDialogOpen(false)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create training material")
    } finally {
      setSaving(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="min-h-screen bg-background">
      <Header title="Training Materials" subtitle="Publish and manage farmer training content" />

      <div className="p-3 sm:p-6 space-y-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center justify-end">
            <Button size="sm" className="gap-1.5" onClick={openCreate}>
              <Plus className="w-4 h-4" /> New Material
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="w-4 h-4" /> Training Materials
              {!loading && <span className="text-sm font-normal text-muted-foreground">({total})</span>}
            </CardTitle>
          </CardHeader>

          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : materials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-semibold text-foreground">No training materials yet</p>
              <p className="text-sm text-muted-foreground mt-1">Publish your first training material to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {materials.map(m => (
                <button
                  key={m.id}
                  onClick={() => navigate(`/agronomist/training-materials/${m.id}`)}
                  className="w-full text-left p-4 sm:px-6 hover:bg-muted/30 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{m.title}</p>
                      {m.isPublished ? (
                        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800">Published</Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-700">Draft</Badge>
                      )}
                      {m.createdBy === currentUserId && <Badge variant="secondary">Mine</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{m.description}</p>
                    <div className="flex items-center gap-3 text-xs mt-1.5">
                      <span className="font-medium text-sky-600 dark:text-sky-400">{m.category}</span>
                      <span className="uppercase font-semibold bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800/40 rounded-full px-2 py-0.5 text-[10px]">{m.language}</span>
                      <span className="flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400"><Eye className="w-3 h-3" /> {m.viewCount}</span>
                      <span className="flex items-center gap-1 text-muted-foreground"><User className="w-3 h-3" /> {m.creator?.name || "Unknown"}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                <span className="text-xs text-foreground font-medium">{page} / {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Training Material</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={2} value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Content</Label>
              <Textarea rows={5} value={form.content} onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} placeholder="e.g. Crop Management" />
              </div>
              <div className="space-y-1.5">
                <Label>Language</Label>
                <Input value={form.language} onChange={e => setForm(prev => ({ ...prev, language: e.target.value }))} placeholder="en" />
              </div>
              <div className="space-y-1.5">
                <Label>Video URL (optional)</Label>
                <Input value={form.videoUrl} onChange={e => setForm(prev => ({ ...prev, videoUrl: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>PDF URL (optional)</Label>
                <Input value={form.pdfUrl} onChange={e => setForm(prev => ({ ...prev, pdfUrl: e.target.value }))} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">New materials are saved as a draft. Publish them from the detail page when ready.</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? "Saving…" : "Save as draft"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
