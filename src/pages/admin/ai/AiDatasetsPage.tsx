import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Database, Plus, Upload, AlertTriangle, CheckCircle2, Image as ImageIcon } from "lucide-react"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine,
} from "recharts"
import { toast } from "sonner"
import { adminAiService, type Dataset } from "@/services/adminAiMock"

const TOOLTIP_STYLE = {
  backgroundColor: 'oklch(var(--card))',
  border: '1px solid oklch(var(--border))',
  borderRadius: '8px',
  color: 'oklch(var(--foreground))',
}

const PLACEHOLDER_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ef4444', '#f97316', '#14b8a6', '#ec4899', '#6366f1']

export default function AiDatasetsPage() {
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAiService.getDatasets()
      .then(setDataset)
      .finally(() => setLoading(false))
  }, [])

  const imbalancedCount = dataset?.classes.filter(c => !c.isBalanced).length ?? 0
  const targetCount = 10000

  return (
    <div className="min-h-screen bg-background">
      <Header title="Dataset Management" subtitle="Manage disease class images for model training" />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Images", value: loading ? '—' : dataset?.totalImages.toLocaleString(), gradient: "sky" as const, icon: Database },
            { label: "Disease Classes", value: loading ? '—' : dataset?.classes.length, gradient: "green" as const, icon: ImageIcon },
            {
              label: "Imbalanced Classes",
              value: loading ? '—' : imbalancedCount,
              gradient: imbalancedCount > 0 ? "earth" as const : "green" as const,
              icon: imbalancedCount > 0 ? AlertTriangle : CheckCircle2,
            },
          ].map(k => (
            <Card key={k.label} className="border-0 shadow-md">
              <CardContent className="p-4 flex items-center gap-4">
                <Icon3D gradient={k.gradient} size="md">
                  <k.icon className="w-5 h-5" />
                </Icon3D>
                <div>
                  <p className="text-2xl font-black text-foreground">{k.value}</p>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Class balance chart */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Class Balance</CardTitle>
                <CardDescription>Image count vs. target (10,000) per disease class</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => toast.info('Add class — coming soon (mock)')}>
                <Plus className="w-4 h-4" /> Add Class
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? <Skeleton className="h-60 rounded-xl" /> : (
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataset?.classes ?? []} margin={{ left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="name" className="fill-muted-foreground" fontSize={9} tickLine={false} angle={-30} textAnchor="end" height={50} />
                    <YAxis className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <ReferenceLine y={targetCount} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: 'Target', fill: '#f59e0b', fontSize: 10 }} />
                    <Bar dataKey="imageCount" radius={[4, 4, 0, 0]} name="Images">
                      {dataset?.classes.map((cls, i) => (
                        <Cell key={cls.id} fill={cls.isBalanced ? PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length] : '#ef4444'} fillOpacity={cls.isBalanced ? 0.85 : 0.7} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="flex items-center gap-6 mt-2">
              <div className="flex items-center gap-2"><span className="w-3 h-1.5 rounded bg-emerald-500" /><span className="text-xs text-muted-foreground">Balanced class</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-1.5 rounded bg-rose-500" /><span className="text-xs text-muted-foreground">Imbalanced (below target)</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500" /><span className="text-xs text-muted-foreground">Target (10k)</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Class list */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-base">Disease Classes</CardTitle>
            <CardDescription>Dataset v{dataset?.version} · Last updated {dataset?.createdAt}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {dataset?.classes.map((cls, i) => (
                  <div key={cls.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                    {/* Thumbnail placeholder */}
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 border border-border overflow-hidden">
                      <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length]}33, ${PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length]}66)` }}>
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-foreground">{cls.name}</p>
                        {!cls.isBalanced && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> Imbalanced
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{cls.imageCount.toLocaleString()} images</span>
                        <span>Target: {cls.targetCount.toLocaleString()}</span>
                        <span>Updated: {cls.lastUpdated}</span>
                      </div>
                      {/* Mini progress bar */}
                      <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden w-40">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (cls.imageCount / cls.targetCount) * 100)}%`,
                            background: cls.isBalanced ? '#10b981' : '#f59e0b',
                          }}
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      onClick={() => toast.info(`Upload images for "${cls.name}" — mock`)}
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
