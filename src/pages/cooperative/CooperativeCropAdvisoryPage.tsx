import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sprout, AlertTriangle, CheckCircle2, Clock, Droplets, Calendar,
} from "lucide-react"
import { cooperativeService, type CropAdvisory } from "@/services/cooperativeMock"

// ─── Constants ───────────────────────────────────────────────────────────────

const SEVERITY_STYLE = {
  high:   'bg-red-500/15 text-red-500 border-red-500/30',
  medium: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  low:    'bg-zinc-500/15 text-zinc-500 border-zinc-500/30',
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function AdvisorySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-28 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <Skeleton className="h-36 rounded-xl" />
    </div>
  )
}

// ─── Advisory Panel ───────────────────────────────────────────────────────────

function AdvisoryPanel({ crop }: { crop: CropAdvisory }) {
  const { t } = useTranslation()

  return (
    <div className="space-y-5">

      {/* ── Stage & next action ────────────────────────────────────────── */}
      <Card className="border border-border bg-card shadow-none">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12px] text-muted-foreground uppercase tracking-wider">{t('cooperative.cropAdvisory.currentStage')}</span>
                <Badge className="bg-green-500/15 text-green-500 border-green-500/30 text-[12px]">{crop.currentStage}</Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{t('cooperative.cropAdvisory.seasonProgress')}</span>
                  <span>{crop.stagePct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${crop.stagePct}%` }} />
                </div>
              </div>
              <p className="text-[13px] text-foreground">
                <span className="text-muted-foreground">{t('cooperative.cropAdvisory.nextAction')}: </span>
                {crop.nextAction}
              </p>
            </div>
            <div className="flex gap-4 md:flex-col md:items-end">
              <div className="text-center">
                <p className="text-[22px] font-bold text-sky-500">{crop.daysToHarvest}</p>
                <p className="text-[11px] text-muted-foreground">{t('cooperative.cropAdvisory.daysToHarvest')}</p>
              </div>
              <div className="text-center">
                <p className="text-[22px] font-bold text-green-500">{crop.expectedYieldTons}t</p>
                <p className="text-[11px] text-muted-foreground">{t('cooperative.cropAdvisory.expectedYield')}</p>
              </div>
              <div className="text-center flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-sky-500">
                  <Droplets className="w-4 h-4" />
                  <p className="text-[18px] font-bold">{t('cooperative.cropAdvisory.everyDays', { n: crop.irrigationDays })}</p>
                </div>
                <p className="text-[11px] text-muted-foreground">{t('cooperative.cropAdvisory.irrigation')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Fertilizer schedule ────────────────────────────────────────── */}
        <Card className="border border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="text-[15px] text-foreground flex items-center gap-2">
              <Sprout className="w-4 h-4 text-green-500" />
              {t('cooperative.cropAdvisory.fertilizerTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase">{t('cooperative.cropAdvisory.fertName')}</th>
                  <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase">{t('cooperative.cropAdvisory.fertAmount')}</th>
                  <th className="px-5 py-2.5 text-left text-[11px] text-muted-foreground uppercase">{t('cooperative.cropAdvisory.fertTiming')}</th>
                </tr>
              </thead>
              <tbody>
                {crop.fertilizers.map(f => (
                  <tr key={f.name} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-semibold text-foreground">{f.name}</td>
                    <td className="px-5 py-3 text-amber-500 font-semibold">{f.amountKgPerHa} kg/ha</td>
                    <td className="px-5 py-3 text-muted-foreground">{f.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* ── Risks ──────────────────────────────────────────────────────── */}
        <Card className="border border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="text-[15px] text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {t('cooperative.cropAdvisory.risksTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {crop.risks.map(r => (
              <div key={r.name} className="p-3 rounded-xl border border-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-foreground">{r.name}</span>
                  <Badge className={cn("text-[11px] border", SEVERITY_STYLE[r.severity])}>
                    {r.severity}
                  </Badge>
                </div>
                <p className="text-[12px] text-muted-foreground">{r.prevention}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Seasonal calendar ──────────────────────────────────────────────── */}
      <Card className="border border-border bg-card shadow-none">
        <CardHeader>
          <CardTitle className="text-[15px] text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-500" />
            {t('cooperative.cropAdvisory.calendarTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {crop.calendar.map((entry, i) => (
              <div
                key={i}
                className={cn(
                  "p-3 rounded-xl border text-center space-y-2",
                  entry.done
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-border"
                )}
              >
                <p className="text-[12px] font-bold text-muted-foreground uppercase">{entry.month}</p>
                <div className="flex justify-center">
                  {entry.done
                    ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                    : <Clock className="w-5 h-5 text-muted-foreground" />}
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">{entry.activity}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function CooperativeCropAdvisoryPage() {
  const { t } = useTranslation()
  const [advisories, setAdvisories] = useState<CropAdvisory[]>([])
  const [loading, setLoading]       = useState(true)
  const [activeCrop, setActiveCrop] = useState(0)

  useEffect(() => {
    // TODO: GET /api/cooperative/crop-advisory
    cooperativeService.getCropAdvisories()
      .then(data => { setAdvisories(data) })
      .finally(() => setLoading(false))
  }, [])

  const current = advisories[activeCrop]

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Header title={t('cooperative.cropAdvisory.title')} subtitle={t('cooperative.cropAdvisory.subtitle')} />

      <div className="p-6 space-y-5">

        {/* ── Crop selector tabs ─────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-28 rounded-xl" />)
          ) : (
            advisories.map((adv, i) => (
              <button
                key={adv.cropId}
                onClick={() => setActiveCrop(i)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[14px] font-medium transition-all",
                  activeCrop === i
                    ? "border-green-500 bg-green-500/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-green-500/40 hover:text-foreground"
                )}
              >
                <span>{adv.icon}</span>
                <span>{adv.cropName}</span>
                {activeCrop === i && (
                  <span className="text-[11px] font-normal text-green-500">{adv.stagePct}%</span>
                )}
              </button>
            ))
          )}
        </div>

        {/* ── Advisory panel ─────────────────────────────────────────────── */}
        {loading ? (
          <AdvisorySkeleton />
        ) : current ? (
          <AdvisoryPanel crop={current} />
        ) : null}
      </div>
    </div>
  )
}
