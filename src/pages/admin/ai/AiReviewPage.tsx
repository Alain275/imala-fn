import { useEffect, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ClipboardCheck, ThumbsUp, Edit3, XCircle, Clock, CheckCircle2,
  AlertTriangle, Leaf, ChevronLeft, ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { adminAiService, type PredictionReviewItem } from "@/services/adminAiMock"

type StatusFilter = 'all' | PredictionReviewItem['status']

const confidenceBand = (c: number) => {
  if (c >= 75) return {
    bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
  }
  if (c >= 65) return {
    bar: "bg-orange-500", text: "text-orange-600 dark:text-orange-400",
    badge: "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/40",
  }
  return {
    bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400",
    badge: "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40",
  }
}

const STATUS_BADGE: Record<PredictionReviewItem['status'], string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
  approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
  corrected: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/40',
  rejected: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
}

const FILTERS: StatusFilter[] = ['all', 'pending', 'approved', 'corrected', 'rejected']

export default function AiReviewPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState<PredictionReviewItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('pending')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const [selected, setSelected] = useState<PredictionReviewItem | null>(null)
  const [correctOpen, setCorrectOpen] = useState(false)
  const [correctedLabel, setCorrectedLabel] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    adminAiService.getReviewQueue({ page, pageSize, status: filter })
      .then(({ data, total }) => { setItems(data); setTotal(total) })
      .catch(() => toast.error(t('admin.ai.review.toast.loadFailed')))
      .finally(() => setLoading(false))
  }, [page, pageSize, filter, t])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [filter])

  const handleCorrect = async () => {
    if (!selected || !correctedLabel.trim()) {
      toast.warning(t('admin.ai.review.toast.enterCorrectLabel'))
      return
    }
    setActionLoading(true)
    try {
      await adminAiService.reviewPrediction(selected.id, 'correct', correctedLabel)
      toast.success(t('admin.ai.review.toast.corrected', { label: correctedLabel }))
      setSelected(null)
      setCorrectOpen(false)
      setCorrectedLabel('')
      load()
    } catch {
      toast.error(t('admin.ai.review.toast.actionFailed'))
    } finally {
      setActionLoading(false)
    }
  }

  const pendingCount = filter === 'all' ? total : undefined

  return (
    <div className="min-h-screen bg-background">
      <Header title={t('admin.ai.review.title')} subtitle={t('admin.ai.review.subtitle')} />

      <div className="p-6 space-y-6">
        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: t('admin.ai.review.kpi.pendingReviews'), value: items.filter(i => i.status === 'pending').length || '—', gradient: "gold" as const, icon: ClipboardCheck },
            { label: t('admin.ai.review.kpi.approvedToday'), value: '4', gradient: "green" as const, icon: CheckCircle2 },
            { label: t('admin.ai.review.kpi.correctedToTraining'), value: '1', gradient: "sky" as const, icon: Edit3 },
          ].map(k => (
            <Card key={k.label} className="border-0 shadow-md">
              <CardContent className="p-4 flex items-center gap-4">
                <Icon3D gradient={k.gradient} size="md"><k.icon className="w-5 h-5" /></Icon3D>
                <div>
                  <p className="text-2xl font-black text-foreground">{k.value}</p>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {f === 'all' ? t('common.activeStatus.all') : t(`admin.ai.reviewStatus.${f}`)}
            </button>
          ))}
          <span className="text-xs text-muted-foreground ml-2">{t('admin.ai.review.itemsCount', { count: total })}</span>
        </div>

        {/* Review items */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : items.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
              <p className="font-semibold text-foreground">{t('admin.ai.review.emptyTitle')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('admin.ai.review.emptyDescription')}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(item => {
                const cb = confidenceBand(item.confidence)
                return (
                  <Card key={item.id} className="border-0 shadow-md overflow-hidden">
                    <CardContent className="p-0">
                      {/* Image placeholder */}
                      <div className="h-28 bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center border-b border-border relative">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-emerald-900 to-green-800 shadow-lg flex items-center justify-center border border-border">
                            <Leaf className="w-6 h-6 text-emerald-300" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">{item.predictedDisease}</p>
                            <p className="text-[10px] text-muted-foreground">{item.cropType} · {item.location}</p>
                          </div>
                        </div>
                        <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cb.badge}`}>
                          {item.confidence}%
                        </span>
                        <span className={`absolute top-2 left-2 text-[10px] font-medium px-1.5 py-0.5 rounded border ${STATUS_BADGE[item.status]}`}>
                          {t(`admin.ai.reviewStatus.${item.status}`)}
                        </span>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.farmerName}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>

                        <Progress value={item.confidence} className="h-1 mb-3" />

                        {item.correctedLabel && (
                          <p className="text-xs text-sky-600 dark:text-sky-400 mb-2">
                            {t('admin.ai.review.correctedToLabel')}: <strong>{item.correctedLabel}</strong>
                          </p>
                        )}

                        {item.status === 'pending' && (
                          <div className="grid grid-cols-3 gap-2">
                            <Button size="sm" variant="outline"
                              onClick={async () => {
                                setSelected(item)
                                setActionLoading(true)
                                try {
                                  await adminAiService.reviewPrediction(item.id, 'approve')
                                  toast.success(t('admin.ai.review.toast.approved', { disease: item.predictedDisease, farmer: item.farmerName }))
                                  load()
                                } catch { toast.error(t('admin.ai.review.toast.actionFailed')) } finally { setActionLoading(false) }
                              }}
                              className="h-9 text-xs flex-col gap-0.5 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900/30 dark:hover:bg-emerald-950/20"
                              disabled={actionLoading}>
                              <ThumbsUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-emerald-600 dark:text-emerald-400">{t('admin.ai.reviewActions.approve')}</span>
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setSelected(item); setCorrectOpen(true) }}
                              className="h-9 text-xs flex-col gap-0.5 border-sky-200 hover:bg-sky-50 dark:border-sky-900/30 dark:hover:bg-sky-950/20">
                              <Edit3 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                              <span className="text-sky-600 dark:text-sky-400">{t('admin.ai.reviewActions.correct')}</span>
                            </Button>
                            <Button size="sm" variant="outline"
                              onClick={async () => {
                                setSelected(item)
                                setActionLoading(true)
                                try {
                                  await adminAiService.reviewPrediction(item.id, 'reject')
                                  toast.success(t('admin.ai.review.toast.rejected'))
                                  load()
                                } catch { toast.error(t('admin.ai.review.toast.actionFailed')) } finally { setActionLoading(false) }
                              }}
                              className="h-9 text-xs flex-col gap-0.5 border-rose-200 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-950/20"
                              disabled={actionLoading}>
                              <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                              <span className="text-rose-600 dark:text-rose-400">{t('admin.ai.reviewActions.reject')}</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Pagination */}
            {Math.ceil(total / pageSize) > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {t('admin.ai.review.pagination.showing', { from: (page - 1) * pageSize + 1, to: Math.min(page * pageSize, total), total })}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs font-medium">{page} / {Math.ceil(total / pageSize)}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === Math.ceil(total / pageSize)} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Correct label dialog */}
      <Dialog open={correctOpen} onOpenChange={open => { if (!open) { setCorrectOpen(false); setCorrectedLabel('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.ai.review.correctDialog.title')}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="bg-muted/50 border border-border rounded-xl p-3">
              <p className="text-xs text-muted-foreground">{t('admin.ai.review.correctDialog.predicted')}</p>
              <p className="text-sm font-semibold text-foreground">{selected?.predictedDisease}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">{t('admin.ai.review.correctDialog.confidence', { value: selected?.confidence })}</p>
            </div>
            <div className="space-y-1.5">
              <Label>{t('admin.ai.review.correctDialog.correctLabel')}</Label>
              <Input
                placeholder={t('admin.ai.review.correctDialog.placeholder')}
                value={correctedLabel}
                onChange={e => setCorrectedLabel(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{t('admin.ai.review.correctDialog.helperText')}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCorrectOpen(false); setCorrectedLabel('') }}>{t('common.actions.cancel')}</Button>
            <Button onClick={handleCorrect} disabled={actionLoading || !correctedLabel.trim()}>
              {actionLoading ? t('admin.ai.review.correctDialog.saving') : t('admin.ai.review.correctDialog.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
