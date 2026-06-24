import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, BarChart3, TrendingUp, Grid3X3 } from "lucide-react"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, Cell,
} from "recharts"
import { adminAiService, type AiPerformance } from "@/services/adminAiMock"

const TOOLTIP_STYLE = {
  backgroundColor: 'oklch(var(--card))',
  border: '1px solid oklch(var(--border))',
  borderRadius: '8px',
  color: 'oklch(var(--foreground))',
}

function accuracyColor(v: number) {
  if (v >= 0.93) return '#10b981'
  if (v >= 0.88) return '#f59e0b'
  return '#ef4444'
}

export default function AiPerformancePage() {
  const { t } = useTranslation()
  const [perf, setPerf] = useState<AiPerformance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAiService.getAiPerformance()
      .then(setPerf)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header title={t('admin.ai.performance.title')} subtitle={t('admin.ai.performance.subtitle')} />

      <div className="p-6 space-y-6">

        {/* Accuracy over time */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              {t('admin.ai.performance.accuracyOverTime.title')}
            </CardTitle>
            <CardDescription>{t('admin.ai.performance.accuracyOverTime.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-52 rounded-xl" /> : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={perf?.accuracyOverTime ?? []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="date" className="fill-muted-foreground" fontSize={11} tickLine={false} />
                    <YAxis domain={[0.75, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${(v * 100).toFixed(1)}%`]} />
                    <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} name={t('admin.ai.performance.accuracyOverTime.trainAcc')} />
                    <Line type="monotone" dataKey="valAccuracy" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9', r: 3 }} strokeDasharray="4 2" name={t('admin.ai.performance.accuracyOverTime.valAcc')} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="flex items-center gap-6 mt-3">
              <div className="flex items-center gap-2"><span className="w-4 h-0.5 bg-emerald-500 rounded" /><span className="text-xs text-muted-foreground">{t('admin.ai.performance.accuracyOverTime.trainAcc')}</span></div>
              <div className="flex items-center gap-2"><span className="w-4 h-0.5 bg-sky-500 rounded border-dashed" /><span className="text-xs text-muted-foreground">{t('admin.ai.performance.accuracyOverTime.valAcc')}</span></div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Per-class accuracy */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="w-4 h-4 text-sky-500" />
                {t('admin.ai.performance.perClassAccuracy.title')}
              </CardTitle>
              <CardDescription>{t('admin.ai.performance.perClassAccuracy.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-64 rounded-xl" /> : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={perf?.perClass ?? []} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                      <XAxis type="number" domain={[0.8, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} className="fill-muted-foreground" fontSize={10} tickLine={false} />
                      <YAxis type="category" dataKey="disease" className="fill-muted-foreground" fontSize={9} tickLine={false} axisLine={false} width={100} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, t('admin.ai.performance.perClassAccuracy.accuracyLabel')]} />
                      <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} name={t('admin.ai.performance.perClassAccuracy.accuracyLabel')}>
                        {perf?.perClass.map(c => (
                          <Cell key={c.disease} fill={accuracyColor(c.accuracy)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Confidence distribution */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="w-4 h-4 text-amber-500" />
                {t('admin.ai.performance.confidenceDistribution.title')}
              </CardTitle>
              <CardDescription>{t('admin.ai.performance.confidenceDistribution.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-64 rounded-xl" /> : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={perf?.confidenceDistribution ?? []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                      <XAxis dataKey="range" className="fill-muted-foreground" fontSize={11} tickLine={false} />
                      <YAxis className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name={t('admin.ai.performance.confidenceDistribution.predictionsLabel')} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Confusion highlights */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Grid3X3 className="w-4 h-4 text-rose-500" />
              {t('admin.ai.performance.confusionHighlights.title')}
            </CardTitle>
            <CardDescription>{t('admin.ai.performance.confusionHighlights.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('admin.ai.performance.confusionHighlights.predictedAs')}</th>
                      <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('admin.ai.performance.confusionHighlights.actualDisease')}</th>
                      <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('admin.ai.performance.confusionHighlights.count')}</th>
                      <th className="py-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">{t('admin.ai.performance.confusionHighlights.severity')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {perf?.confusionHighlights.map((row, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 text-foreground font-medium">{row.predicted}</td>
                        <td className="py-3 px-4 text-muted-foreground">{row.actual}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden w-24">
                              <div
                                className="h-full bg-rose-500 rounded-full"
                                style={{ width: `${Math.min(100, (row.count / 40) * 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-foreground">{row.count}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${
                            row.count > 25
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40'
                              : row.count > 10
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}>
                            {row.count > 25 ? t('common.severity.high') : row.count > 10 ? t('common.severity.medium') : t('common.severity.low')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
