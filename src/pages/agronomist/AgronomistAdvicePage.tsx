import { useEffect, useState, useCallback } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  MessageSquare, Plus, ChevronLeft, ChevronRight, MoreHorizontal, Edit3, Trash2, MapPin,
} from "lucide-react"
import { toast } from "sonner"
import {
  agronomistAdviceService, type Advice, type AdviceStatus, type CreateAdvicePayload,
} from "@/services/agronomistAdvice.service"
import { useAgronomistFarmerFarmPicker } from "@/hooks/useAgronomistFarmerFarmPicker"

const STATUS_FILTERS: Array<AdviceStatus | 'all'> = ['all', 'pending', 'in_progress', 'resolved', 'closed']

const STATUS_BADGE: Record<AdviceStatus, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
  in_progress: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/40",
  resolved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
  closed: "bg-muted text-muted-foreground border-border",
}

interface FormState {
  farmerId: string
  farmId: string
  title: string
  problem: string
  recommendation: string
  status: AdviceStatus
}

const EMPTY_FORM: FormState = { farmerId: "", farmId: "", title: "", problem: "", recommendation: "", status: "pending" }

export default function AgronomistAdvicePage() {
  const [adviceList, setAdviceList] = useState<Advice[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<AdviceStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const limit = 10

  const {
    farmers, ensureFarmers, selectedFarmerFarms, setSelectedFarmerFarms,
    farmsLoading, loadFarmsForFarmer, extractFarmChoicesFromError,
  } = useAgronomistFarmerFarmPicker()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Advice | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Advice | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    agronomistAdviceService.getAdviceList({ page, limit, status: statusFilter === 'all' ? undefined : statusFilter })
      .then(({ advice, pagination }) => { setAdviceList(advice); setTotal(pagination.total) })
      .catch(() => toast.error("Failed to load advice records"))
      .finally(() => setLoading(false))
  }, [page, statusFilter])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [statusFilter])

  const openCreate = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setSelectedFarmerFarms([])
    setDialogOpen(true)
    ensureFarmers()
  }

  const openEdit = (item: Advice) => {
    setEditTarget(item)
    setForm({
      farmerId: item.farmerId, farmId: item.farmId || "",
      title: item.title, problem: item.problem, recommendation: item.recommendation,
      status: item.status,
    })
    setSelectedFarmerFarms(item.farm ? [item.farm] : [])
    setDialogOpen(true)
    ensureFarmers()
  }

  const handleFarmerChange = (farmerId: string) => {
    setForm(prev => ({ ...prev, farmerId, farmId: "" }))
    loadFarmsForFarmer(farmerId)
  }

  const handleSave = async () => {
    if (!form.farmerId || !form.title || !form.problem || !form.recommendation) {
      toast.error("Farmer, title, problem, and recommendation are required")
      return
    }
    if (selectedFarmerFarms.length > 1 && !form.farmId) {
      toast.error("This farmer has multiple farms — please choose one")
      return
    }
    setSaving(true)
    try {
      const payload: CreateAdvicePayload = {
        farmerId: form.farmerId,
        title: form.title,
        problem: form.problem,
        recommendation: form.recommendation,
        ...(form.farmId ? { farmId: form.farmId } : {}),
      }
      if (editTarget) {
        await agronomistAdviceService.updateAdvice(editTarget.id, { ...payload, status: form.status })
        toast.success("Advice updated")
      } else {
        await agronomistAdviceService.createAdvice(payload)
        toast.success("Advice logged")
      }
      setDialogOpen(false)
      load()
    } catch (err) {
      const farms = extractFarmChoicesFromError(err)
      if (farms) {
        setSelectedFarmerFarms(farms)
        toast.error("This farmer has multiple farms — please choose one")
      } else {
        toast.error(err instanceof Error ? err.message : "Failed to save advice")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await agronomistAdviceService.deleteAdvice(deleteTarget.id)
      toast.success("Advice deleted")
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete advice")
    } finally {
      setDeleting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="min-h-screen bg-background">
      <Header title="Advice" subtitle="Track advice given to farmers on active issues" />

      <div className="p-3 sm:p-6 space-y-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {STATUS_FILTERS.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium capitalize transition-colors ${
                    statusFilter === s
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  {s === 'all' ? 'All' : s.replace('_', ' ')}
                </button>
              ))}
            </div>
            <Button size="sm" className="gap-1.5" onClick={openCreate}>
              <Plus className="w-4 h-4" /> New Advice
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="w-4 h-4" /> Advice Records
              {!loading && <span className="text-sm font-normal text-muted-foreground">({total})</span>}
            </CardTitle>
          </CardHeader>

          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : adviceList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-semibold text-foreground">No advice records found</p>
              <p className="text-sm text-muted-foreground mt-1">Log advice for a farmer to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Farmer</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Problem</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {adviceList.map(item => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{item.farmer?.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{item.farmer?.location || ""}</p>
                      </td>
                      <td className="px-4 py-4 text-foreground font-medium">{item.title}</td>
                      <td className="px-4 py-4 text-muted-foreground max-w-xs truncate">{item.problem}</td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-md border font-medium capitalize ${STATUS_BADGE[item.status]}`}>{item.status.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(item)}>
                              <Edit3 className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setDeleteTarget(item)} className="text-destructive focus:text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Advice" : "New Advice"}</DialogTitle>
            {editTarget && (
              <DialogDescription>
                Created {new Date(editTarget.createdAt).toLocaleString()} · Last updated {new Date(editTarget.updatedAt).toLocaleString()}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4 py-2">
            {editTarget?.farm && (
              <div className="p-3 rounded-xl border border-border bg-muted/30 text-xs flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                {editTarget.farm.farmName} · {editTarget.farm.district}, {editTarget.farm.sector}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Farmer</Label>
                <select
                  className="w-full bg-background border border-input text-foreground text-sm rounded-lg px-3 py-2"
                  value={form.farmerId}
                  disabled={!!editTarget}
                  onChange={e => handleFarmerChange(e.target.value)}
                >
                  <option value="">Select a farmer…</option>
                  {editTarget && !farmers.some(f => f.id === editTarget.farmerId) && (
                    <option value={editTarget.farmerId}>{editTarget.farmer?.name}</option>
                  )}
                  {farmers.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Farm {farmsLoading && "(loading…)"}</Label>
                <select
                  className="w-full bg-background border border-input text-foreground text-sm rounded-lg px-3 py-2 disabled:opacity-50"
                  value={form.farmId}
                  disabled={selectedFarmerFarms.length <= 1}
                  onChange={e => setForm(prev => ({ ...prev, farmId: e.target.value }))}
                >
                  <option value="">{selectedFarmerFarms.length <= 1 ? "Auto-resolved" : "Select a farm…"}</option>
                  {selectedFarmerFarms.map(f => <option key={f.id} value={f.id}>{f.farmName}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Pest Control Issue" />
            </div>
            <div className="space-y-1.5">
              <Label>Problem</Label>
              <Textarea rows={3} value={form.problem} onChange={e => setForm(prev => ({ ...prev, problem: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Recommendation</Label>
              <Textarea rows={3} value={form.recommendation} onChange={e => setForm(prev => ({ ...prev, recommendation: e.target.value }))} />
            </div>

            {editTarget && (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select className="w-full bg-background border border-input text-foreground text-sm rounded-lg px-3 py-2 capitalize" value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value as AdviceStatus }))}>
                  {(['pending', 'in_progress', 'resolved', 'closed'] as AdviceStatus[]).map(s => <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editTarget ? "Save changes" : "Create advice"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes this advice record for {deleteTarget?.farmer?.name}. This cannot be undone.
            </AlertDialogDescription>
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
