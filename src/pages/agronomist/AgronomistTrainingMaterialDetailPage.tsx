import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft, AlertCircle, Eye, User, Calendar, Video, FileText, Edit3, Trash2, Upload, Undo2,
} from "lucide-react"
import { toast } from "sonner"
import { authService } from "@/services/auth"
import { agronomistTrainingMaterialsService, type UpdateTrainingMaterialPayload } from "@/services/agronomistTrainingMaterials.service"
import { useAgronomistTrainingMaterial } from "@/hooks/useAgronomistTrainingMaterial"

interface FormState {
  title: string
  description: string
  content: string
  category: string
  language: string
  videoUrl: string
  pdfUrl: string
}

export default function AgronomistTrainingMaterialDetailPage() {
  const { materialId } = useParams<{ materialId: string }>()
  const navigate = useNavigate()
  const currentUserId = authService.getCurrentUser()?.id
  const { data: material, loading, error, refetch } = useAgronomistTrainingMaterial(materialId)

  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isOwner = !!material && material.createdBy === currentUserId

  const openEdit = () => {
    if (!material) return
    setForm({
      title: material.title, description: material.description, content: material.content,
      category: material.category, language: material.language,
      videoUrl: material.videoUrl || "", pdfUrl: material.pdfUrl || "",
    })
    setEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!material || !form) return
    setSaving(true)
    try {
      const payload: UpdateTrainingMaterialPayload = {
        title: form.title, description: form.description, content: form.content,
        category: form.category, language: form.language,
        videoUrl: form.videoUrl || undefined, pdfUrl: form.pdfUrl || undefined,
      }
      await agronomistTrainingMaterialsService.updateMaterial(material.id, payload)
      toast.success("Training material updated")
      setEditOpen(false)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update training material")
    } finally {
      setSaving(false)
    }
  }

  const togglePublish = async () => {
    if (!material) return
    setPublishing(true)
    try {
      await agronomistTrainingMaterialsService.updateMaterial(material.id, { isPublished: !material.isPublished })
      toast.success(material.isPublished ? "Unpublished — back to draft" : "Published")
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update publish status")
    } finally {
      setPublishing(false)
    }
  }

  const handleDelete = async () => {
    if (!material) return
    setDeleting(true)
    try {
      await agronomistTrainingMaterialsService.deleteMaterial(material.id)
      toast.success("Training material deleted")
      navigate("/agronomist/training-materials")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete training material")
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Training Material" subtitle="View, edit, and publish farmer training content" />

      <div className="p-3 sm:p-6 space-y-6 max-w-4xl">
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={() => navigate("/agronomist/training-materials")}>
          <ArrowLeft className="w-4 h-4" /> Back to Training Materials
        </Button>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : error ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-10 flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
            </CardContent>
          </Card>
        ) : material && (
          <>
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-border">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <CardTitle className="text-xl">{material.title}</CardTitle>
                      {material.isPublished ? (
                        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800">Published</Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-700">Draft</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{material.description}</p>
                  </div>
                  {isOwner && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={openEdit}>
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={togglePublish} disabled={publishing}>
                        {material.isPublished ? <Undo2 className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                        {publishing ? "Working…" : material.isPublished ? "Unpublish" : "Publish"}
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 flex-wrap">
                  <span>{material.category}</span>
                  <span className="uppercase">{material.language}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {material.viewCount} views</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {material.creator?.name || "Unknown"}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Updated {new Date(material.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{material.content}</p>

                <div className="flex flex-wrap gap-3 pt-2">
                  {material.videoUrl && (
                    <a href={material.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-border bg-muted/40 text-foreground hover:bg-muted transition-colors">
                      <Video className="w-3.5 h-3.5" /> Watch video
                    </a>
                  )}
                  {material.pdfUrl && material.pdfUrl !== "N/A" && (
                    <a href={material.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-border bg-muted/40 text-foreground hover:bg-muted transition-colors">
                      <FileText className="w-3.5 h-3.5" /> Open PDF
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Training Material</DialogTitle>
          </DialogHeader>
          {form && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={form.title} onChange={e => setForm(prev => prev && ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea rows={2} value={form.description} onChange={e => setForm(prev => prev && ({ ...prev, description: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Content</Label>
                <Textarea rows={5} value={form.content} onChange={e => setForm(prev => prev && ({ ...prev, content: e.target.value }))} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Input value={form.category} onChange={e => setForm(prev => prev && ({ ...prev, category: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Language</Label>
                  <Input value={form.language} onChange={e => setForm(prev => prev && ({ ...prev, language: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Video URL (optional)</Label>
                  <Input value={form.videoUrl} onChange={e => setForm(prev => prev && ({ ...prev, videoUrl: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>PDF URL (optional)</Label>
                  <Input value={form.pdfUrl} onChange={e => setForm(prev => prev && ({ ...prev, pdfUrl: e.target.value }))} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{material?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>This permanently deletes this training material. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-white hover:bg-destructive/90">
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
