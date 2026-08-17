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
  Map, Plus, ChevronLeft, ChevronRight, MapPin, Clock, Calendar,
} from "lucide-react"
import { toast } from "sonner"
import {
  agronomistFarmVisitsService, type FarmVisit, type FarmVisitStatus, type FarmVisitType,
  type FarmVisitSeverity, type CreateFarmVisitPayload,
} from "@/services/agronomistFarmVisits.service"
import { useAgronomistFarmerFarmPicker } from "@/hooks/useAgronomistFarmerFarmPicker"

const STATUS_FILTERS: Array<FarmVisitStatus | 'all'> = ['all', 'scheduled', 'completed', 'cancelled']
const TYPE_OPTIONS: FarmVisitType[] = ['farm', 'office', 'meeting', 'break']
const SEVERITY_OPTIONS: Array<FarmVisitSeverity | ''> = ['', 'low', 'medium', 'high']

const STATUS_BADGE: Record<FarmVisitStatus, string> = {
  scheduled: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/40",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
  cancelled: "bg-muted text-muted-foreground border-border",
}

const SEVERITY_BADGE: Record<FarmVisitSeverity, string> = {
  high: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
  low: "bg-muted text-muted-foreground border-border",
}

interface FormState {
  farmerId: string
  farmId: string
  visitDate: string
  observations: string
  recommendations: string
  nextVisitDate: string
  severity: FarmVisitSeverity | ''
  type: FarmVisitType
  duration: string
  status: FarmVisitStatus
}

const EMPTY_FORM: FormState = {
  farmerId: "", farmId: "", visitDate: "", observations: "", recommendations: "",
  nextVisitDate: "", severity: "", type: "farm", duration: "", status: "scheduled",
}

function toDatetimeLocal(iso?: string | null) {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AgronomistFarmVisitsPage() {
  const [visits, setVisits] = useState<FarmVisit[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<FarmVisitStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const limit = 10

  const {
    farmers, ensureFarmers, selectedFarmerFarms, setSelectedFarmerFarms,
    farmsLoading, loadFarmsForFarmer, extractFarmChoicesFromError,
  } = useAgronomistFarmerFarmPicker()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<FarmVisit | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    agronomistFarmVisitsService.getFarmVisits({ page, limit, status: statusFilter === 'all' ? undefined : statusFilter })
      .then(({ visits, pagination }) => { setVisits(visits); setTotal(pagination.total) })
      .catch(() => toast.error("Failed to load farm visits"))
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

  const openEdit = (visit: FarmVisit) => {
    setEditTarget(visit)
    setForm({
      farmerId: visit.farmerId,
      farmId: visit.farmId || "",
      visitDate: toDatetimeLocal(visit.visitDate),
      observations: visit.observations,
      recommendations: visit.recommendations,
      nextVisitDate: toDatetimeLocal(visit.nextVisitDate),
      severity: visit.severity || "",
      type: visit.type,
      duration: visit.duration != null ? String(visit.duration) : "",
      status: visit.status,
    })
    setSelectedFarmerFarms(visit.farm ? [visit.farm] : [])
    setDialogOpen(true)
    ensureFarmers()
  }

  const handleFarmerChange = (farmerId: string) => {
    setForm(prev => ({ ...prev, farmerId, farmId: "" }))
    loadFarmsForFarmer(farmerId)
  }

  const handleSave = async () => {
    if (!form.farmerId || !form.visitDate || !form.observations || !form.recommendations) {
      toast.error("Farmer, visit date, observations, and recommendations are required")
      return
    }
    if (selectedFarmerFarms.length > 1 && !form.farmId) {
      toast.error("This farmer has multiple farms — please choose one")
      return
    }
    setSaving(true)
    try {
      const payload: CreateFarmVisitPayload = {
        farmerId: form.farmerId,
        visitDate: new Date(form.visitDate).toISOString(),
        observations: form.observations,
        recommendations: form.recommendations,
        ...(form.farmId ? { farmId: form.farmId } : {}),
        ...(form.nextVisitDate ? { nextVisitDate: new Date(form.nextVisitDate).toISOString() } : {}),
        ...(form.severity ? { severity: form.severity } : {}),
        type: form.type,
        ...(form.duration ? { duration: Number(form.duration) } : {}),
      }
      if (editTarget) {
        await agronomistFarmVisitsService.updateFarmVisit(editTarget.id, { ...payload, status: form.status })
        toast.success("Farm visit updated")
      } else {
        await agronomistFarmVisitsService.createFarmVisit(payload)
        toast.success("Farm visit logged")
      }
      setDialogOpen(false)
      load()
    } catch (err) {
      const farms = extractFarmChoicesFromError(err)
      if (farms) {
        setSelectedFarmerFarms(farms)
        toast.error("This farmer has multiple farms — please choose one")
      } else {
        toast.error(err instanceof Error ? err.message : "Failed to save farm visit")
      }
    } finally {
      setSaving(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="min-h-screen bg-background">
      <Header title="Farm Visits" subtitle="Log, schedule, and review field visits" />

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
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
            <Button size="sm" className="gap-1.5" onClick={openCreate}>
              <Plus className="w-4 h-4" /> Log Visit
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-base">
              <Map className="w-4 h-4" /> Farm Visits
              {!loading && <span className="text-sm font-normal text-muted-foreground">({total})</span>}
            </CardTitle>
          </CardHeader>

          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : visits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Map className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-semibold text-foreground">No farm visits found</p>
              <p className="text-sm text-muted-foreground mt-1">Log your first farm visit to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Farmer</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Farm</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Visit date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Severity</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visits.map(visit => (
                    <tr key={visit.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => openEdit(visit)}>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{visit.farmer?.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{visit.farmer?.location || ""}</p>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{visit.farm?.farmName || "—"}</td>
                      <td className="px-4 py-4 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(visit.visitDate).toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs px-2 py-0.5 rounded-md border font-medium bg-muted text-muted-foreground border-border capitalize">{visit.type}</span>
                      </td>
                      <td className="px-4 py-4">
                        {visit.severity ? (
                          <span className={`text-xs px-2 py-0.5 rounded-md border font-medium capitalize ${SEVERITY_BADGE[visit.severity]}`}>{visit.severity}</span>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-md border font-medium capitalize ${STATUS_BADGE[visit.status]}`}>{visit.status}</span>
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
            <DialogTitle>{editTarget ? "Edit Farm Visit" : "Log Farm Visit"}</DialogTitle>
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

              <div className="space-y-1.5">
                <Label>Visit date</Label>
                <Input type="datetime-local" value={form.visitDate} onChange={e => setForm(prev => ({ ...prev, visitDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Next visit date (optional)</Label>
                <Input type="datetime-local" value={form.nextVisitDate} onChange={e => setForm(prev => ({ ...prev, nextVisitDate: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>Type</Label>
                <select className="w-full bg-background border border-input text-foreground text-sm rounded-lg px-3 py-2 capitalize" value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value as FarmVisitType }))}>
                  {TYPE_OPTIONS.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Severity (optional)</Label>
                <select className="w-full bg-background border border-input text-foreground text-sm rounded-lg px-3 py-2 capitalize" value={form.severity} onChange={e => setForm(prev => ({ ...prev, severity: e.target.value as FarmVisitSeverity | '' }))}>
                  {SEVERITY_OPTIONS.map(s => <option key={s || 'none'} value={s}>{s || "None"}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Duration in minutes (optional)</Label>
                <Input type="number" min={0} value={form.duration} onChange={e => setForm(prev => ({ ...prev, duration: e.target.value }))} />
              </div>
              {editTarget && (
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <select className="w-full bg-background border border-input text-foreground text-sm rounded-lg px-3 py-2 capitalize" value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value as FarmVisitStatus }))}>
                    {(['scheduled', 'completed', 'cancelled'] as FarmVisitStatus[]).map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Observations</Label>
              <Textarea rows={3} value={form.observations} onChange={e => setForm(prev => ({ ...prev, observations: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Recommendations</Label>
              <Textarea rows={3} value={form.recommendations} onChange={e => setForm(prev => ({ ...prev, recommendations: e.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-1.5">
              <Clock className="w-4 h-4" /> {saving ? "Saving…" : editTarget ? "Save changes" : "Log visit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
