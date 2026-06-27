import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertTriangle, TrendingUp, Sprout, CloudRain,
  Lightbulb, X, ChevronDown, ChevronUp, MapPin,
} from "lucide-react"
import { toast } from "sonner"
import { cooperativeService, type FullAiInsight, type InsightType, type InsightSeverity } from "@/services/cooperativeMock"

// ─── Constants ───────────────────────────────────────────────────────────────

type TypeFilter = 'all' | InsightType

const TYPE_META: Record<InsightType, { icon: React.ElementType; bg: string; color: string; label: string }> = {
  alert:   { icon: AlertTriangle, bg: 'bg-red-500/10    dark:bg-red-500/15',    color: 'text-red-500',    label: 'Alert'   },
  market:  { icon: TrendingUp,    bg: 'bg-amber-500/10  dark:bg-amber-500/15',  color: 'text-amber-500',  label: 'Market'  },
  soil:    { icon: Sprout,        bg: 'bg-green-500/10  dark:bg-green-500/15',  color: 'text-green-500',  label: 'Soil'    },
  weather: { icon: CloudRain,     bg: 'bg-sky-500/10    dark:bg-sky-500/15',    color: 'text-sky-500',    label: 'Weather' },
}

const SEVERITY_BADGE: Record<InsightSeverity, string> = {
  critical: 'bg-red-500/15 text-red-500 border-red-500/30',
  high:     'bg-orange-500/15 text-orange-500 border-orange-500/30',
  medium:   'bg-amber-500/15 text-amber-500 border-amber-500/30',
  low:      'bg-zinc-500/15 text-zinc-500 border-zinc-500/30',
}

const SEVERITY_ORDER: InsightSeverity[] = ['critical', 'high', 'medium', 'low']

// ─── Skeleton ────────────────────────────────────────────────────────────────

function InsightSkeleton() {
  return (
    <Card className="border border-border bg-card shadow-none">
      <CardContent className="p-5 space-y-3">
        <div className="flex gap-3"><Skeleton className="w-10 h-10 rounded-full flex-shrink-0" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-2/3" /></div></div>
        <div className="flex gap-2"><Skeleton className="h-7 w-24" /><Skeleton className="h-7 w-16" /></div>
      </CardContent>
    </Card>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function CooperativeAiInsightsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [insights, setInsights]       = useState<FullAiInsight[]>([])
  const [loading, setLoading]         = useState(true)
  const [typeFilter, setTypeFilter]   = useState<TypeFilter>('all')
  const [showDismissed, setShowDismissed] = useState(false)

  useEffect(() => {
    // TODO: GET /api/cooperative/ai-insights/full
    cooperativeService.getFullInsights()
      .then(setInsights)
      .finally(() => setLoading(false))
  }, [])

  async function handleDismiss(id: string) {
    // TODO: PATCH /api/cooperative/ai-insights/:id/dismiss
    await cooperativeService.dismissInsight(id)
    setInsights(prev => prev.map(i => i.id === id ? { ...i, dismissed: true } : i))
    toast.success(t('cooperative.aiInsights.dismissed'))
  }

  const active    = insights.filter(i => !i.dismissed)
  const dismissed = insights.filter(i => i.dismissed)

  const activeFiltered = active
    .filter(i => typeFilter === 'all' || i.type === typeFilter)
    .sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity))

  const counts: Record<TypeFilter, number> = {
    all:     active.length,
    alert:   active.filter(i => i.type === 'alert').length,
    market:  active.filter(i => i.type === 'market').length,
    soil:    active.filter(i => i.type === 'soil').length,
    weather: active.filter(i => i.type === 'weather').length,
  }

  const filterTabs: { key: TypeFilter; label: string }[] = [
    { key: 'all',     label: t('cooperative.aiInsights.filterAll')     },
    { key: 'alert',   label: t('cooperative.aiInsights.filterAlert')   },
    { key: 'market',  label: t('cooperative.aiInsights.filterMarket')  },
    { key: 'soil',    label: t('cooperative.aiInsights.filterSoil')    },
    { key: 'weather', label: t('cooperative.aiInsights.filterWeather') },
  ]

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Header title={t('cooperative.aiInsights.pageTitle')} subtitle={t('cooperative.aiInsights.pageSubtitle')} />

      <div className="p-6 space-y-5">

        {/* ── Summary chips ──────────────────────────────────────────────── */}
        {!loading && (
          <div className="flex flex-wrap gap-3">
            {(['critical','high','medium','low'] as InsightSeverity[]).map(sev => {
              const cnt = activeFiltered.filter(i => i.severity === sev).length
              if (!cnt) return null
              return (
                <span key={sev} className={cn("px-3 py-1 rounded-full text-[12px] font-semibold border", SEVERITY_BADGE[sev])}>
                  {cnt} {t(`cooperative.aiInsights.severity.${sev}`)}
                </span>
              )
            })}
          </div>
        )}

        {/* ── Filter tabs ────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setTypeFilter(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all",
                typeFilter === tab.key
                  ? "bg-green-500 text-black border-green-500"
                  : "bg-card text-muted-foreground border-border hover:border-green-500/50 hover:text-foreground"
              )}
            >
              {tab.label} <span className="ml-1 opacity-70">{counts[tab.key]}</span>
            </button>
          ))}
        </div>

        {/* ── Active insights ────────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <InsightSkeleton key={i} />)}
          </div>
        ) : activeFiltered.length === 0 ? (
          <Card className="border border-border bg-card shadow-none">
            <CardContent className="py-16 flex flex-col items-center gap-3">
              <Lightbulb className="w-10 h-10 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">{t('cooperative.aiInsights.noInsights')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeFiltered.map(insight => {
              const meta = TYPE_META[insight.type]
              const Icon = meta.icon
              return (
                <Card
                  key={insight.id}
                  className={cn(
                    "border shadow-none transition-colors",
                    insight.severity === 'critical'
                      ? "border-red-500/40 bg-red-50 dark:bg-[#1a0e0e]"
                      : "border-border bg-card"
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", meta.bg)}>
                        <Icon className={cn("w-[18px] h-[18px]", meta.color)} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={cn("text-[11px] border", SEVERITY_BADGE[insight.severity])}>
                                {t(`cooperative.aiInsights.severity.${insight.severity}`)}
                              </Badge>
                              <Badge className="bg-muted text-muted-foreground border-border text-[11px]">
                                {meta.label}
                              </Badge>
                            </div>
                            <h3 className="text-[14px] font-semibold text-foreground">{insight.title}</h3>
                          </div>
                          <button
                            onClick={() => handleDismiss(insight.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                            title={t('cooperative.aiInsights.dismissBtn')}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-[13px] text-muted-foreground leading-relaxed">{insight.description}</p>

                        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                          <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{insight.affectedFarms} {t('cooperative.aiInsights.farmsAffected')}</span>
                            <span>{insight.timestamp}</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => navigate(insight.actionRoute)}
                            className="h-7 px-4 text-[12px] font-semibold bg-green-500 hover:bg-green-600 text-black"
                          >
                            {t('cooperative.overview.aiInsights.takeAction')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* ── Dismissed section ──────────────────────────────────────────── */}
        {dismissed.length > 0 && (
          <div>
            <button
              onClick={() => setShowDismissed(!showDismissed)}
              className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-3"
            >
              {showDismissed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {t('cooperative.aiInsights.dismissedSection')} ({dismissed.length})
            </button>
            {showDismissed && (
              <div className="space-y-3 opacity-50">
                {dismissed.map(insight => {
                  const meta = TYPE_META[insight.type]
                  const Icon = meta.icon
                  return (
                    <div key={insight.id} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", meta.bg)}>
                        <Icon className={cn("w-4 h-4", meta.color)} />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{insight.title}</p>
                        <p className="text-[12px] text-muted-foreground">{insight.timestamp}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
