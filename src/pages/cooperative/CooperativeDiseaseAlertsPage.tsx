import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  AlertTriangle, Bell, CheckCircle2, ChevronDown, ChevronUp,
  Megaphone, Sprout, MapPin,
} from "lucide-react"
import { toast } from "sonner"
import {
  cooperativeService, type DiseaseAlert, type AlertSeverity,
} from "@/services/cooperativeMock"

// ─── Constants ───────────────────────────────────────────────────────────────

const SEV_STYLE: Record<AlertSeverity, { badge: string; bg: string; color: string; border: string }> = {
  critical: { badge: 'bg-red-500/15 text-red-500 border-red-500/30',         bg: 'bg-red-500/10    dark:bg-red-500/15',    color: 'text-red-500',    border: 'border-red-500/40'    },
  high:     { badge: 'bg-orange-500/15 text-orange-500 border-orange-500/30', bg: 'bg-orange-500/10 dark:bg-orange-500/15', color: 'text-orange-500', border: 'border-orange-500/40' },
  medium:   { badge: 'bg-amber-500/15 text-amber-500 border-amber-500/30',    bg: 'bg-amber-500/10  dark:bg-amber-500/15',  color: 'text-amber-500',  border: 'border-amber-500/40'  },
  low:      { badge: 'bg-zinc-500/15 text-zinc-500 border-zinc-500/30',       bg: 'bg-muted',                               color: 'text-muted-foreground', border: 'border-border' },
}

const SEV_ORDER: AlertSeverity[] = ['critical', 'high', 'medium', 'low']

const URGENCY_LEVELS = ['critical', 'high', 'medium', 'low'] as const
type UrgencyLevel = typeof URGENCY_LEVELS[number]

// ─── Skeleton ────────────────────────────────────────────────────────────────

function AlertSkeleton() {
  return (
    <Card className="border border-border bg-card shadow-none">
      <CardContent className="p-5 space-y-3">
        <div className="flex gap-3"><Skeleton className="w-10 h-10 rounded-full flex-shrink-0" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-full" /></div></div>
        <div className="flex gap-2"><Skeleton className="h-7 w-28" /><Skeleton className="h-7 w-20" /><Skeleton className="h-7 w-24" /></div>
      </CardContent>
    </Card>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function CooperativeDiseaseAlertsPage() {
  const { t } = useTranslation()
  const [alerts, setAlerts]               = useState<DiseaseAlert[]>([])
  const [loading, setLoading]             = useState(true)
  const [showResolved, setShowResolved]   = useState(false)
  const [groupOpen, setGroupOpen]         = useState(false)
  const [resolveTarget, setResolveTarget] = useState<DiseaseAlert | null>(null)
  const [detailTarget, setDetailTarget]   = useState<DiseaseAlert | null>(null)
  const [resolving, setResolving]         = useState<string | null>(null)
  const [broadcasting, setBroadcasting]   = useState<string | null>(null)

  const [gType, setGType]       = useState('disease')
  const [gMessage, setGMessage] = useState('')
  const [gUrgency, setGUrgency] = useState<UrgencyLevel>('high')
  const [gTargetAll, setGTargetAll] = useState(true)
  const [gSending, setGSending] = useState(false)

  useEffect(() => {
    // TODO: GET /api/cooperative/disease-alerts
    cooperativeService.getDiseaseAlerts()
      .then(data => setAlerts(data.sort((a, b) => SEV_ORDER.indexOf(a.severity) - SEV_ORDER.indexOf(b.severity))))
      .finally(() => setLoading(false))
  }, [])

  const activeAlerts   = alerts.filter(a => a.status === 'active')
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved')

  const summaryBySeverity = SEV_ORDER.map(s => ({
    severity: s,
    count: activeAlerts.filter(a => a.severity === s).length,
  })).filter(x => x.count > 0)

  async function handleBroadcast(alert: DiseaseAlert) {
    setBroadcasting(alert.id)
    try {
      // TODO: POST /api/cooperative/disease-alerts/:id/broadcast
      await cooperativeService.broadcastAlert(alert.id)
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, broadcastSent: true } : a))
      toast.success(t('cooperative.diseaseAlerts.broadcastSent', { disease: alert.diseaseName }))
    } catch {
      toast.error(t('cooperative.diseaseAlerts.broadcastError'))
    } finally {
      setBroadcasting(null)
    }
  }

  async function handleResolve() {
    if (!resolveTarget) return
    setResolving(resolveTarget.id)
    try {
      // TODO: PATCH /api/cooperative/disease-alerts/:id/resolve
      await cooperativeService.resolveAlert(resolveTarget.id)
      setAlerts(prev => prev.map(a => a.id === resolveTarget.id ? { ...a, status: 'resolved' } : a))
      setResolveTarget(null)
      toast.success(t('cooperative.diseaseAlerts.resolveSuccess'))
    } catch {
      toast.error(t('cooperative.diseaseAlerts.resolveError'))
    } finally {
      setResolving(null)
    }
  }

  async function handleGroupAlert() {
    if (!gMessage.trim()) { toast.error(t('cooperative.diseaseAlerts.groupDialog.validation')); return }
    setGSending(true)
    try {
      // TODO: POST /api/cooperative/group-alerts
      await cooperativeService.sendGroupAlert({ type: gType, message: gMessage, urgency: gUrgency, targetAll: gTargetAll })
      setGroupOpen(false)
      setGMessage(''); setGType('disease'); setGUrgency('high'); setGTargetAll(true)
      toast.success(t('cooperative.diseaseAlerts.groupSent'))
    } catch {
      toast.error(t('cooperative.diseaseAlerts.groupError'))
    } finally {
      setGSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Header title={t('cooperative.diseaseAlerts.title')} subtitle={t('cooperative.diseaseAlerts.subtitle')} />

      <div className="p-6 space-y-5">

        {/* ── Top action bar ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-wrap gap-2">
            {summaryBySeverity.map(s => (
              <span key={s.severity} className={cn("px-3 py-1 rounded-full text-[12px] font-semibold border", SEV_STYLE[s.severity].badge)}>
                {s.count} {t(`cooperative.diseaseAlerts.severity.${s.severity}`)}
              </span>
            ))}
          </div>
          <Button onClick={() => setGroupOpen(true)} className="bg-red-600 hover:bg-red-700 text-white font-semibold gap-2">
            <Megaphone className="w-4 h-4" />
            {t('cooperative.diseaseAlerts.sendGroupBtn')}
          </Button>
        </div>

        {/* ── Active alerts ──────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-[15px] font-semibold text-foreground">
            {t('cooperative.diseaseAlerts.activeSection')} <span className="text-muted-foreground font-normal">({activeAlerts.length})</span>
          </h2>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <AlertSkeleton key={i} />)
          ) : activeAlerts.length === 0 ? (
            <Card className="border border-border bg-card shadow-none">
              <CardContent className="py-14 flex flex-col items-center gap-3">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
                <p className="text-muted-foreground text-sm">{t('cooperative.diseaseAlerts.noActive')}</p>
              </CardContent>
            </Card>
          ) : (
            activeAlerts.map(alert => {
              const sev = SEV_STYLE[alert.severity]
              return (
                <Card key={alert.id} className={cn("border shadow-none bg-card", sev.border)}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex gap-3">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", sev.bg)}>
                        <AlertTriangle className={cn("w-[18px] h-[18px]", sev.color)} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start gap-2 flex-wrap">
                          <h3 className="text-[14px] font-bold text-foreground">{alert.diseaseName}</h3>
                          <Badge className={cn("text-[11px] border", sev.badge)}>{t(`cooperative.diseaseAlerts.severity.${alert.severity}`)}</Badge>
                          {alert.broadcastSent && (
                            <Badge className="bg-blue-500/15 text-blue-500 border-blue-500/30 text-[11px]">
                              <Bell className="w-3 h-3 mr-1" /> {t('cooperative.diseaseAlerts.broadcastTag')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[12px] text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Sprout className="w-3.5 h-3.5" />{alert.cropType}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{alert.affectedFarms} {t('cooperative.diseaseAlerts.farmsAffected')}</span>
                          <span>{t('cooperative.diseaseAlerts.detected')}: {alert.detectedDate}</span>
                        </div>
                        <p className="text-[13px] text-muted-foreground">{alert.symptoms}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-border">
                      <Button size="sm" variant="outline" onClick={() => setDetailTarget(alert)}
                        className="h-8 px-3 text-[12px] border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40">
                        {t('cooperative.diseaseAlerts.viewDetails')}
                      </Button>
                      {!alert.broadcastSent ? (
                        <Button size="sm" disabled={broadcasting === alert.id} onClick={() => handleBroadcast(alert)}
                          className="h-8 px-3 text-[12px] bg-red-600 hover:bg-red-700 text-white font-semibold">
                          <Bell className="w-3.5 h-3.5 mr-1.5" />
                          {broadcasting === alert.id ? t('cooperative.diseaseAlerts.sending') : t('cooperative.diseaseAlerts.broadcastBtn')}
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled
                          className="h-8 px-3 text-[12px] border-blue-500/30 text-blue-500">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> {t('cooperative.diseaseAlerts.broadcastDone')}
                        </Button>
                      )}
                      <Button size="sm" variant="outline" disabled={resolving === alert.id} onClick={() => setResolveTarget(alert)}
                        className="h-8 px-3 text-[12px] border-green-500/30 text-green-500 hover:bg-green-500/10">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        {t('cooperative.diseaseAlerts.markResolved')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* ── Resolved history ───────────────────────────────────────────── */}
        {resolvedAlerts.length > 0 && (
          <div>
            <button
              onClick={() => setShowResolved(!showResolved)}
              className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-3"
            >
              {showResolved ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {t('cooperative.diseaseAlerts.resolvedSection')} ({resolvedAlerts.length})
            </button>
            {showResolved && (
              <div className="space-y-3 opacity-60">
                {resolvedAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground">{alert.diseaseName} — {alert.cropType}</p>
                      <p className="text-[12px] text-muted-foreground">{alert.detectedDate} · {alert.affectedFarms} farms</p>
                    </div>
                    <Badge className="bg-green-500/15 text-green-500 border-green-500/30 text-[11px]">
                      {t('cooperative.diseaseAlerts.resolved')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Alert Detail Dialog ───────────────────────────────────────────────── */}
      <Dialog open={!!detailTarget} onOpenChange={open => !open && setDetailTarget(null)}>
        <DialogContent className="bg-card border-border text-foreground max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">{detailTarget?.diseaseName}</DialogTitle>
          </DialogHeader>
          {detailTarget && (
            <div className="space-y-4 py-2 text-[13px]">
              <div className="flex flex-wrap gap-2">
                <Badge className={cn("border", SEV_STYLE[detailTarget.severity].badge)}>{detailTarget.severity}</Badge>
                <Badge className="bg-muted text-muted-foreground border-border">{detailTarget.cropType}</Badge>
                <Badge className="bg-muted text-muted-foreground border-border">{detailTarget.affectedFarms} farms</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{t('cooperative.diseaseAlerts.symptoms')}</p>
                <p className="text-foreground leading-relaxed">{detailTarget.symptoms}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{t('cooperative.diseaseAlerts.prevention')}</p>
                <p className="text-foreground leading-relaxed">{detailTarget.prevention}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setDetailTarget(null)}>
              {t('common.actions.cancel')}
            </Button>
            {detailTarget && !detailTarget.broadcastSent && (
              <Button className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => { handleBroadcast(detailTarget!); setDetailTarget(null) }}>
                <Megaphone className="w-4 h-4 mr-2" /> {t('cooperative.diseaseAlerts.broadcastBtn')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Resolve Confirmation ──────────────────────────────────────────────── */}
      <AlertDialog open={!!resolveTarget} onOpenChange={open => !open && setResolveTarget(null)}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('cooperative.diseaseAlerts.resolveDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {t('cooperative.diseaseAlerts.resolveDialog.description', { disease: resolveTarget?.diseaseName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted border-border text-foreground hover:bg-muted/80">
              {t('common.actions.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction className="bg-green-500 hover:bg-green-600 text-black font-semibold" onClick={handleResolve}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> {t('cooperative.diseaseAlerts.resolveDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Send Group Alert Dialog ───────────────────────────────────────────── */}
      <Dialog open={groupOpen} onOpenChange={open => !open && setGroupOpen(false)}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-red-500" />
              {t('cooperative.diseaseAlerts.groupDialog.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground">{t('cooperative.diseaseAlerts.groupDialog.type')}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'disease', label: t('cooperative.diseaseAlerts.groupDialog.typeDisease') },
                  { val: 'weather', label: t('cooperative.diseaseAlerts.groupDialog.typeWeather') },
                  { val: 'market',  label: t('cooperative.diseaseAlerts.groupDialog.typeMarket')  },
                ].map(opt => (
                  <button key={opt.val} onClick={() => setGType(opt.val)}
                    className={cn("px-3 py-2 rounded-xl border text-[12px] transition-all",
                      gType === opt.val ? "border-red-500 bg-red-500/10 text-foreground" : "border-border text-muted-foreground hover:border-muted-foreground/40"
                    )}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground">{t('cooperative.diseaseAlerts.groupDialog.urgency')}</label>
              <div className="grid grid-cols-4 gap-2">
                {URGENCY_LEVELS.map(u => (
                  <button key={u} onClick={() => setGUrgency(u)}
                    className={cn("py-2 rounded-xl border text-[12px] transition-all capitalize",
                      gUrgency === u ? "border-red-500 bg-red-500/10 text-foreground" : "border-border text-muted-foreground hover:border-muted-foreground/40"
                    )}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground">{t('cooperative.diseaseAlerts.groupDialog.message')} *</label>
              <textarea
                rows={4}
                placeholder={t('cooperative.diseaseAlerts.groupDialog.messagePlaceholder')}
                value={gMessage}
                onChange={e => setGMessage(e.target.value)}
                className="w-full rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground p-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-red-500/40 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground">{t('cooperative.diseaseAlerts.groupDialog.target')}</label>
              <div className="flex gap-2">
                {[
                  { val: true,  label: t('cooperative.diseaseAlerts.groupDialog.allMembers') },
                  { val: false, label: t('cooperative.diseaseAlerts.groupDialog.affectedOnly') },
                ].map(opt => (
                  <button key={String(opt.val)} onClick={() => setGTargetAll(opt.val)}
                    className={cn("flex-1 py-2.5 rounded-xl border text-[13px] transition-all",
                      gTargetAll === opt.val ? "border-red-500 bg-red-500/10 text-foreground" : "border-border text-muted-foreground hover:border-muted-foreground/40"
                    )}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setGroupOpen(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button disabled={gSending} onClick={handleGroupAlert} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
              <Megaphone className="w-4 h-4 mr-2" />
              {gSending ? t('cooperative.diseaseAlerts.sending') : t('cooperative.diseaseAlerts.groupDialog.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
