import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Skeleton } from "@/components/ui/skeleton"
import { Brain, Database, Activity, ClipboardCheck, Package, BarChart3, AlertTriangle, Bug, CloudRain } from "lucide-react"
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar,
} from "recharts"
import { adminAiService, type AiStats, type RiskAlert } from "@/services/adminAiMock"

const TOOLTIP_STYLE = {
  backgroundColor: 'oklch(var(--card))',
  border: '1px solid oklch(var(--border))',
  borderRadius: '8px',
  color: 'oklch(var(--foreground))',
}

const SEVERITY_STYLE: Record<RiskAlert['severity'], {
  badge: string; icon: string; border: string; bg: string
}> = {
  low: {
    badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/40',
    icon: 'text-sky-500', border: 'border-sky-200 dark:border-sky-900/40', bg: 'bg-sky-500/5',
  },
  medium: {
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
    icon: 'text-amber-500', border: 'border-amber-200 dark:border-amber-900/40', bg: 'bg-amber-500/5',
  },
  high: {
    badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/40',
    icon: 'text-orange-500', border: 'border-orange-200 dark:border-orange-900/40', bg: 'bg-orange-500/5',
  },
  critical: {
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
    icon: 'text-rose-500', border: 'border-rose-200 dark:border-rose-900/40', bg: 'bg-rose-500/5',
  },
}

function RiskAlertCard({ alert }: { alert: RiskAlert }) {
  const { t } = useTranslation()
  const s = SEVERITY_STYLE[alert.severity]
  const CategoryIcon = alert.category === 'pest_disease' ? Bug : CloudRain
  return (
    <div className={`rounded-xl border p-4 ${s.border} ${s.bg}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5 ${s.icon}`}>
          <CategoryIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-foreground leading-snug">{alert.title}</p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 uppercase ${s.badge}`}>
              {t(`common.severity.${alert.severity}`)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{alert.description}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{t('admin.ai.overview.alertRegion')}: <strong className="text-foreground">{alert.affectedRegion}</strong></span>
            {alert.affectedCrop && <span>{t('admin.ai.overview.alertCrop')}: <strong className="text-foreground">{alert.affectedCrop}</strong></span>}
            {alert.probability !== undefined && <span>{t('admin.ai.overview.alertProbability')}: <strong className="text-foreground">{alert.probability}%</strong></span>}
            <span>{t('admin.ai.overview.alertTimeframe')}: <strong className="text-foreground">{alert.timeframe}</strong></span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AiOverviewPage() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<AiStats | null>(null)
  const [trend, setTrend] = useState<{ date: string; accuracy: number }[]>([])
  const [confidence, setConfidence] = useState<{ range: string; count: number }[]>([])
  const [alerts, setAlerts] = useState<RiskAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [alertsLoading, setAlertsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminAiService.getAiOverview(),
      adminAiService.getAccuracyTrend(),
      adminAiService.getAiPerformance().then(p => p.confidenceDistribution),
    ])
      .then(([s, t, c]) => { setStats(s); setTrend(t); setConfidence(c) })
      .finally(() => setLoading(false))

    adminAiService.getRiskAlerts()
      .then(setAlerts)
      .finally(() => setAlertsLoading(false))
  }, [])

  const kpis = stats ? [
    { label: t('admin.ai.overview.kpi.deployedModel'), value: stats.deployedModel, sub: stats.modelVersion, icon: Package, gradient: "leaf" as const },
    { label: t('admin.ai.overview.kpi.overallAccuracy'), value: `${(stats.overallAccuracy * 100).toFixed(1)}%`, sub: t('admin.ai.overview.kpi.onValidationSet'), icon: Brain, gradient: "green" as const },
    { label: t('admin.ai.overview.kpi.totalPredictions'), value: stats.totalPredictions.toLocaleString(), sub: t('admin.ai.overview.kpi.sinceDeployment'), icon: BarChart3, gradient: "sky" as const },
    { label: t('admin.ai.overview.kpi.pendingReviews'), value: stats.pendingReviews, sub: t('admin.ai.overview.kpi.awaitingValidation'), icon: ClipboardCheck, gradient: "gold" as const },
    { label: t('admin.ai.overview.kpi.datasetImages'), value: stats.datasetImageCount.toLocaleString(), sub: t('admin.ai.overview.kpi.trainingSamples'), icon: Database, gradient: "earth" as const },
    { label: t('admin.ai.overview.kpi.diseaseClasses'), value: stats.diseaseClassCount, sub: t('admin.ai.overview.kpi.categories'), icon: Activity, gradient: "leaf" as const },
  ] : []

  const pestAlerts = alerts.filter(a => a.category === 'pest_disease')
  const weatherAlerts = alerts.filter(a => a.category === 'weather')
  const criticalCount = alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length

  return (
    <div className="min-h-screen bg-background">
      <Header title={t('admin.ai.overview.title')} subtitle={t('admin.ai.overview.subtitle')} />

      <div className="p-6 space-y-6">
        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-md">
                <CardContent className="p-4 h-28 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-16 mt-3" />
                  <Skeleton className="h-3 w-14" />
                </CardContent>
              </Card>
            ))
            : kpis.map(k => (
              <Card key={k.label} className="border-0 shadow-md">
                <CardContent className="p-4 flex flex-col justify-between h-28">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-medium leading-tight">{k.label}</span>
                    <Icon3D gradient={k.gradient} size="sm">
                      <k.icon className="w-4 h-4" />
                    </Icon3D>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground truncate">{k.value}</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{k.sub}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          }
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Accuracy trend */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="w-4 h-4 text-emerald-500" />
                {t('admin.ai.overview.accuracyTrend.title')}
              </CardTitle>
              <CardDescription>{t('admin.ai.overview.accuracyTrend.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-52 rounded-xl" /> : (
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                      <XAxis dataKey="date" className="fill-muted-foreground" fontSize={11} tickLine={false} />
                      <YAxis domain={[0.75, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, t('admin.ai.overview.accuracyTrend.tooltipLabel')]} />
                      <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} name={t('admin.ai.overview.accuracyTrend.tooltipLabel')} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Confidence distribution */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="w-4 h-4 text-sky-500" />
                {t('admin.ai.overview.confidenceDistribution.title')}
              </CardTitle>
              <CardDescription>{t('admin.ai.overview.confidenceDistribution.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-52 rounded-xl" /> : (
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={confidence}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                      <XAxis dataKey="range" className="fill-muted-foreground" fontSize={11} tickLine={false} />
                      <YAxis className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} name={t('admin.ai.overview.confidenceDistribution.predictionsLabel')} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Risk Alerts */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  {t('admin.ai.overview.riskAlerts.title')}
                </CardTitle>
                <CardDescription>{t('admin.ai.overview.riskAlerts.description')}</CardDescription>
              </div>
              {!alertsLoading && criticalCount > 0 && (
                <span className="text-xs font-bold px-2 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
                  {t('admin.ai.overview.riskAlerts.criticalCount', { count: criticalCount })}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
              </div>
            ) : alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Activity className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="font-medium text-foreground">{t('admin.ai.overview.riskAlerts.emptyTitle')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('admin.ai.overview.riskAlerts.emptyDescription')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Pest & Disease */}
                {pestAlerts.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Bug className="w-3.5 h-3.5 text-muted-foreground" />
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('admin.ai.overview.riskAlerts.pestSectionTitle')}</p>
                    </div>
                    {pestAlerts.map(a => <RiskAlertCard key={a.id} alert={a} />)}
                  </div>
                )}
                {/* Weather */}
                {weatherAlerts.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CloudRain className="w-3.5 h-3.5 text-muted-foreground" />
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('admin.ai.overview.riskAlerts.weatherSectionTitle')}</p>
                    </div>
                    {weatherAlerts.map(a => <RiskAlertCard key={a.id} alert={a} />)}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
