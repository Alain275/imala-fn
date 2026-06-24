import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  PlayCircle, MoreHorizontal, XCircle, RefreshCw, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, Clock, Loader2,
} from "lucide-react"
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts"
import { toast } from "sonner"
import { adminAiService, type TrainingJob } from "@/services/adminAiMock"

const TOOLTIP_STYLE = {
  backgroundColor: 'oklch(var(--card))',
  border: '1px solid oklch(var(--border))',
  borderRadius: '8px',
  color: 'oklch(var(--foreground))',
}

const STATUS_STYLE: Record<TrainingJob['status'], { badge: string; icon: React.ElementType }> = {
  queued: { badge: 'bg-muted text-muted-foreground border-border', icon: Clock },
  running: { badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/40', icon: Loader2 },
  completed: { badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40', icon: CheckCircle2 },
  failed: { badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40', icon: AlertCircle },
}

const BASE_MODELS = ['EfficientNet-B2', 'EfficientNet-B4', 'MobileNetV3-Large', 'ResNet-50', 'ResNet-101', 'ViT-B/16']

export default function AiTrainingPage() {
  const { t } = useTranslation()
  const [jobs, setJobs] = useState<TrainingJob[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [startOpen, setStartOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<TrainingJob | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [newBaseModel, setNewBaseModel] = useState(BASE_MODELS[0])
  const [newEpochs, setNewEpochs] = useState('30')
  const [newDatasetVersion, setNewDatasetVersion] = useState('2.4.0')

  useEffect(() => {
    adminAiService.getTrainingJobs()
      .then(setJobs)
      .finally(() => setLoading(false))
  }, [])

  const handleStartJob = async () => {
    setActionLoading(true)
    try {
      const job = await adminAiService.startTrainingJob({
        baseModel: newBaseModel,
        epochs: parseInt(newEpochs, 10),
        datasetVersion: newDatasetVersion,
      })
      setJobs(prev => [job, ...prev])
      setStartOpen(false)
      toast.success(t('admin.ai.training.toast.jobQueued', { name: job.name }))
    } catch {
      toast.error(t('admin.ai.training.toast.startJobFailed'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    setActionLoading(true)
    try {
      await adminAiService.cancelTrainingJob(cancelTarget.id)
      setJobs(prev => prev.map(j => j.id === cancelTarget.id ? { ...j, status: 'failed' as const, errorMessage: t('admin.ai.training.cancelledByAdmin') } : j))
      toast.success(t('admin.ai.training.toast.jobCancelled', { name: cancelTarget.name }))
      setCancelTarget(null)
    } catch {
      toast.error(t('admin.ai.training.toast.cancelFailed'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleRetry = async (job: TrainingJob) => {
    setActionLoading(true)
    try {
      const newJob = await adminAiService.startTrainingJob({
        baseModel: job.baseModel,
        epochs: job.epochs,
        datasetVersion: job.datasetVersion,
      })
      setJobs(prev => [newJob, ...prev])
      toast.success(t('admin.ai.training.toast.retryQueued', { name: newJob.name }))
    } catch {
      toast.error(t('admin.ai.training.toast.retryFailed'))
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title={t('admin.ai.training.title')} subtitle={t('admin.ai.training.subtitle')} />

      <div className="p-6 space-y-6">
        {/* Header action */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {loading ? '—' : t('admin.ai.training.jobsSummary', { total: jobs.length, completed: jobs.filter(j => j.status === 'completed').length })}
            </p>
          </div>
          <Button className="gap-2" onClick={() => setStartOpen(true)}>
            <PlayCircle className="w-4 h-4" /> {t('admin.ai.training.startTrainingRun')}
          </Button>
        </div>

        {/* Job list */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : jobs.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <PlayCircle className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-semibold text-foreground">{t('admin.ai.training.emptyTitle')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('admin.ai.training.emptyDescription')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => {
              const s = STATUS_STYLE[job.status]
              const isExpanded = expanded === job.id
              const lastMetric = job.metrics[job.metrics.length - 1]

              return (
                <Card key={job.id} className="border-0 shadow-md overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <p className="font-semibold text-foreground">{job.name}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-medium flex items-center gap-1 ${s.badge}`}>
                            <s.icon className={`w-3 h-3 ${job.status === 'running' ? 'animate-spin' : ''}`} />
                            {t(`admin.ai.trainingStatus.${job.status}`)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                          <span>{t('admin.ai.training.job.base')}: <span className="text-foreground font-medium">{job.baseModel}</span></span>
                          <span>{t('admin.ai.training.job.epochs')}: <span className="text-foreground font-medium">{job.epochs}</span></span>
                          <span>{t('admin.ai.training.job.dataset')}: <span className="text-foreground font-medium">v{job.datasetVersion}</span></span>
                          {lastMetric && (
                            <span>{t('admin.ai.training.job.bestAcc')}: <span className="text-emerald-600 dark:text-emerald-400 font-medium">{(lastMetric.valAccuracy * 100).toFixed(1)}%</span></span>
                          )}
                        </div>
                        {job.status === 'running' && (
                          <Progress value={job.progress} className="h-1.5 mb-2" />
                        )}
                        {job.errorMessage && (
                          <p className="text-xs text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 mt-1">
                            {job.errorMessage}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {job.metrics.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-xs"
                            onClick={() => setExpanded(isExpanded ? null : job.id)}
                          >
                            {t('admin.ai.training.job.metrics')} {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(job.status === 'queued' || job.status === 'running') && (
                              <DropdownMenuItem onClick={() => setCancelTarget(job)} className="text-destructive focus:text-destructive">
                                <XCircle className="w-4 h-4 mr-2" /> {t('common.actions.cancel')}
                              </DropdownMenuItem>
                            )}
                            {job.status === 'failed' && (
                              <DropdownMenuItem onClick={() => handleRetry(job)}>
                                <RefreshCw className="w-4 h-4 mr-2" /> {t('common.actions.retry')}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Expanded metrics chart */}
                    {isExpanded && job.metrics.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs font-semibold text-muted-foreground mb-3">{t('admin.ai.training.metricsChart.title')}</p>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={job.metrics}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                              <XAxis dataKey="epoch" className="fill-muted-foreground" fontSize={10} tickLine={false} label={{ value: t('admin.ai.training.metricsChart.epochAxis'), position: 'insideBottom', offset: -2, className: 'fill-muted-foreground', fontSize: 10 }} />
                              <YAxis yAxisId="left" className="fill-muted-foreground" fontSize={10} tickLine={false} axisLine={false} domain={[0, 1]} tickFormatter={v => v.toFixed(1)} />
                              <YAxis yAxisId="right" orientation="right" className="fill-muted-foreground" fontSize={10} tickLine={false} axisLine={false} />
                              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number, n: string) => [v.toFixed(4), n]} />
                              <Line yAxisId="right" type="monotone" dataKey="loss" stroke="#f59e0b" strokeWidth={1.5} dot={false} name={t('admin.ai.training.metricsChart.trainLoss')} />
                              <Line yAxisId="right" type="monotone" dataKey="valLoss" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name={t('admin.ai.training.metricsChart.valLoss')} />
                              <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={1.5} dot={false} name={t('admin.ai.training.metricsChart.trainAcc')} />
                              <Line yAxisId="left" type="monotone" dataKey="valAccuracy" stroke="#0ea5e9" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name={t('admin.ai.training.metricsChart.valAcc')} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex items-center gap-5 mt-2 flex-wrap">
                          {[['#10b981', t('admin.ai.training.metricsChart.trainAcc')], ['#0ea5e9', t('admin.ai.training.metricsChart.valAcc')], ['#f59e0b', t('admin.ai.training.metricsChart.trainLoss')], ['#ef4444', t('admin.ai.training.metricsChart.valLoss')]].map(([c, l]) => (
                            <div key={l} className="flex items-center gap-1.5">
                              <span className="w-3 h-0.5 rounded" style={{ background: c }} />
                              <span className="text-[11px] text-muted-foreground">{l}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Start Training Dialog */}
      <Dialog open={startOpen} onOpenChange={setStartOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.ai.training.startDialog.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>{t('admin.ai.training.startDialog.baseModel')}</Label>
              <Select value={newBaseModel} onValueChange={setNewBaseModel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BASE_MODELS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('admin.ai.training.startDialog.epochs')}</Label>
              <Input type="number" min={5} max={200} value={newEpochs} onChange={e => setNewEpochs(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('admin.ai.training.startDialog.datasetVersion')}</Label>
              <Input value={newDatasetVersion} onChange={e => setNewDatasetVersion(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStartOpen(false)}>{t('common.actions.cancel')}</Button>
            <Button onClick={handleStartJob} disabled={actionLoading} className="gap-2">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
              {actionLoading ? t('admin.ai.training.startDialog.starting') : t('admin.ai.training.startDialog.startTraining')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirm */}
      <AlertDialog open={!!cancelTarget} onOpenChange={open => !open && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.ai.training.cancelDialog.title', { name: cancelTarget?.name })}</AlertDialogTitle>
            <AlertDialogDescription>{t('admin.ai.training.cancelDialog.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.ai.training.cancelDialog.keepRunning')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={actionLoading} className="bg-destructive text-white hover:bg-destructive/90">
              {actionLoading ? t('admin.ai.training.cancelDialog.cancelling') : t('admin.ai.training.cancelDialog.cancelJob')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
