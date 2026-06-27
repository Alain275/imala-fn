import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MapPin, Users, Package, Sprout, AlertTriangle,
  Calendar, TrendingUp, Eye, Bell, ShoppingCart,
  FileText, UserPlus, Lightbulb, BarChart3, Home,
  Store, Settings,
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts"
import {
  cooperativeService,
  type CooperativeStats,
  type YieldDataPoint,
  type FarmStatusItem,
  type AiInsightItem,
} from "@/services/cooperativeMock"

// ─── Design tokens ───────────────────────────────────────────────────────────

const ICON_SCHEMES = {
  amber:  { bg: 'bg-amber-500/10  dark:bg-amber-500/15',  color: 'text-amber-500'  },
  green:  { bg: 'bg-green-500/10  dark:bg-green-500/15',  color: 'text-green-500'  },
  blue:   { bg: 'bg-sky-500/10    dark:bg-sky-500/15',    color: 'text-sky-500'    },
  red:    { bg: 'bg-red-500/10    dark:bg-red-500/15',    color: 'text-red-500'    },
  purple: { bg: 'bg-violet-500/10 dark:bg-violet-500/15', color: 'text-violet-500' },
} as const

const FARM_STATUS_COLORS = ['#22c55e', '#38bdf8', '#f59e0b', '#a78bfa']

const TOOLTIP_STYLE = {
  backgroundColor: 'oklch(var(--card))',
  border: '1px solid oklch(var(--border))',
  borderRadius: '8px',
  color: 'oklch(var(--foreground))',
  fontSize: 12,
}

// ─── Insight icon/colour per type ────────────────────────────────────────────

const INSIGHT_META = {
  alert:  { Icon: AlertTriangle, bg: 'bg-red-500/10    dark:bg-red-500/15',    color: 'text-red-500'    },
  market: { Icon: TrendingUp,   bg: 'bg-amber-500/10  dark:bg-amber-500/15',  color: 'text-amber-500'  },
  soil:   { Icon: Sprout,       bg: 'bg-green-500/10  dark:bg-green-500/15',  color: 'text-green-500'  },
} as const

// ─── Quick actions ────────────────────────────────────────────────────────────

const buildQuickActions = (t: (k: string) => string) => [
  { labelKey: 'cooperative.overview.quickActions.viewFarms',      Icon: Eye,          bg: 'bg-sky-500/10    dark:bg-sky-500/15',    color: 'text-sky-500',    href: '/cooperative/farms'         },
  { labelKey: 'cooperative.overview.quickActions.sendAlert',      Icon: Bell,         bg: 'bg-red-500/10    dark:bg-red-500/15',    color: 'text-red-500',    href: '/cooperative/disease-alerts' },
  { labelKey: 'cooperative.overview.quickActions.bulkSale',       Icon: ShoppingCart, bg: 'bg-amber-500/10  dark:bg-amber-500/15',  color: 'text-amber-500',  href: '/cooperative/market'         },
  { labelKey: 'cooperative.overview.quickActions.generateReport', Icon: FileText,     bg: 'bg-violet-500/10 dark:bg-violet-500/15', color: 'text-violet-500', href: '/cooperative/analytics'      },
  { labelKey: 'cooperative.overview.quickActions.addMember',      Icon: UserPlus,     bg: 'bg-green-500/10  dark:bg-green-500/15',  color: 'text-green-500',  href: '/cooperative/members'        },
  { labelKey: 'cooperative.overview.quickActions.aiAdvisory',     Icon: Lightbulb,    bg: 'bg-indigo-500/10 dark:bg-indigo-500/15', color: 'text-indigo-500', href: '/cooperative/crop-advisory'  },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <Card className="border border-border bg-card shadow-none">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <Skeleton className="h-3 w-20 mb-4" />
          <Skeleton className="h-11 w-11 rounded-full" />
        </div>
        <Skeleton className="h-7 w-14 mb-1" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  )
}

interface MetricCardProps {
  label: string
  value: string | number
  sub: string
  subPositive?: boolean
  iconScheme: keyof typeof ICON_SCHEMES
  Icon: React.ElementType
}

function MetricCard({ label, value, sub, subPositive = true, iconScheme, Icon }: MetricCardProps) {
  const scheme = ICON_SCHEMES[iconScheme]
  return (
    <Card className="border border-border bg-card shadow-none">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[13px] text-muted-foreground font-normal leading-tight">{label}</span>
          <div className={cn("w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0", scheme.bg)}>
            <Icon className={cn("w-5 h-5", scheme.color)} />
          </div>
        </div>
        <p className="text-[28px] font-semibold text-foreground leading-none mt-3">{value}</p>
        <p className={cn("text-[12px] mt-1.5", subPositive ? "text-green-500" : "text-red-500")}>
          {sub}
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function CooperativeOverviewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [stats, setStats]         = useState<CooperativeStats | null>(null)
  const [yieldData, setYieldData] = useState<YieldDataPoint[]>([])
  const [farmStatus, setFarmStatus] = useState<FarmStatusItem[]>([])
  const [insights, setInsights]   = useState<AiInsightItem[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    // TODO: Replace with real API calls when backend is ready
    Promise.all([
      cooperativeService.getStats(),
      cooperativeService.getYieldTrend(),
      cooperativeService.getFarmStatus(),
      cooperativeService.getAiInsights(),
    ]).then(([s, y, f, a]) => {
      setStats(s)
      setYieldData(y)
      setFarmStatus(f)
      setInsights(a)
    }).finally(() => setLoading(false))
  }, [])

  const location = useLocation()
  const quickActions = buildQuickActions(t)

  const farmStatusDisplay = farmStatus.map((f, i) => ({
    label: t(`cooperative.overview.farmStatus.${f.key}`),
    value: f.value,
    color: FARM_STATUS_COLORS[i],
  }))

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">

      {/* ── Top header ─────────────────────────────────────────────────── */}
      <Header
        title={t('cooperative.overview.title')}
        subtitle={t('cooperative.overview.subtitle')}
      />

      {/* ── Season badge row ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 pt-4 pb-0">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-green-500/15 text-green-500 border border-green-500/30">
          <Calendar className="w-3.5 h-3.5" />
          {t('cooperative.overview.seasonBadge')}
        </span>
      </div>

      <div className="p-6 space-y-6">

        {/* ── 1. Metric cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i} />)
          ) : (
            <>
              <MetricCard label={t('cooperative.overview.kpis.totalFarms')}      value={stats?.totalFarms ?? 0}       sub={`${stats?.pendingReview ?? 0} ${t('cooperative.overview.kpis.totalFarmsSub')}`}              iconScheme="amber"  Icon={MapPin}       />
              <MetricCard label={t('cooperative.overview.kpis.activeMembers')}   value={stats?.activeMembers ?? 0}    sub={t('cooperative.overview.kpis.activeMembersSub')}                                               iconScheme="green"  Icon={Users}        />
              <MetricCard label={t('cooperative.overview.kpis.totalYield')}      value={`${stats?.totalYield ?? 0}t`} sub={t('cooperative.overview.kpis.totalYieldSub')}                                                  iconScheme="blue"   Icon={Package}      />
              <MetricCard label={t('cooperative.overview.kpis.cropsPlanted')}    value={stats?.cropsPlanted ?? 0}     sub={t('cooperative.overview.kpis.cropsPlantedSub')}                                                iconScheme="green"  Icon={Sprout}       />
              <MetricCard label={t('cooperative.overview.kpis.aiAlerts')}        value={stats?.aiAlerts ?? 0}         sub={t('cooperative.overview.kpis.aiAlertsSub')}         subPositive={false}                        iconScheme="red"    Icon={AlertTriangle}/>
              <MetricCard label={t('cooperative.overview.kpis.seasonProgress')}  value={`${stats?.seasonProgress ?? 0}%`} sub={t('cooperative.overview.kpis.seasonProgressSub')}                                        iconScheme="purple" Icon={Calendar}     />
            </>
          )}
        </div>

        {/* ── 2. Charts row ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Yield Trend (70%) */}
          <Card className="lg:col-span-2 border border-border bg-card shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[16px] font-semibold text-foreground">
                <BarChart3 className="w-5 h-5 text-green-500" />
                {t('cooperative.overview.yieldTrend.title')}
              </CardTitle>
              <CardDescription className="text-[13px] text-muted-foreground">
                {t('cooperative.overview.yieldTrend.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-56 w-full rounded-xl" />
              ) : (
                <>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={yieldData}>
                        <defs>
                          <linearGradient id="coopGMaize" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="coopGBeans" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="coopGPotato" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border))" />
                        <XAxis dataKey="month" tick={{ fill: 'oklch(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: 'oklch(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Area type="monotone" dataKey="maize"  stroke="#22c55e" strokeWidth={2} fill="url(#coopGMaize)"  name={t('cooperative.overview.yieldTrend.maize')}  />
                        <Area type="monotone" dataKey="beans"  stroke="#38bdf8" strokeWidth={2} fill="url(#coopGBeans)"  name={t('cooperative.overview.yieldTrend.beans')}  />
                        <Area type="monotone" dataKey="potato" stroke="#f59e0b" strokeWidth={2} fill="url(#coopGPotato)" name={t('cooperative.overview.yieldTrend.potato')} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-5 mt-3 flex-wrap">
                    {[
                      { key: 'maize',  color: '#22c55e' },
                      { key: 'beans',  color: '#38bdf8' },
                      { key: 'potato', color: '#f59e0b' },
                    ].map(l => (
                      <div key={l.key} className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                        <span className="text-xs text-muted-foreground">
                          {t(`cooperative.overview.yieldTrend.${l.key}`)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Farm Status Donut (30%) */}
          <Card className="border border-border bg-card shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[16px] font-semibold text-foreground">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                {t('cooperative.overview.farmStatus.title')}
              </CardTitle>
              <CardDescription className="text-[13px] text-muted-foreground">
                {t('cooperative.overview.farmStatus.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-48 w-full rounded-xl" />
              ) : (
                <>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={farmStatus} dataKey="value" cx="50%" cy="50%" innerRadius={46} outerRadius={72} paddingAngle={3}>
                          {farmStatus.map((_, i) => (
                            <Cell key={i} fill={FARM_STATUS_COLORS[i]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={TOOLTIP_STYLE}
                          formatter={(value, _name, props) => [
                            value,
                            t(`cooperative.overview.farmStatus.${(props.payload as FarmStatusItem).key}`),
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-1">
                    {farmStatusDisplay.map(s => (
                      <div key={s.label} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-muted-foreground">{s.label}</span>
                        </div>
                        <span className="font-semibold text-foreground">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── 3. Quick Actions ─────────────────────────────────────────────── */}
        <Card className="border border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[16px] font-semibold text-foreground">
              <TrendingUp className="w-5 h-5 text-violet-500" />
              {t('cooperative.overview.quickActions.title')}
            </CardTitle>
            <CardDescription className="text-[13px] text-muted-foreground">
              {t('cooperative.overview.quickActions.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickActions.map(a => (
                <button
                  key={a.labelKey}
                  onClick={() => navigate(a.href)}
                  className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border hover:border-green-500/50 hover:brightness-105 transition-all duration-200 text-center group bg-card"
                >
                  <div className={cn("w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110", a.bg)}>
                    <a.Icon className={cn("w-5 h-5", a.color)} />
                  </div>
                  <span className="text-[13px] font-semibold text-foreground leading-tight">
                    {t(a.labelKey)}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── 4. AI Group Insights ──────────────────────────────────────────── */}
        <Card className="border border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[16px] font-semibold text-foreground">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              {t('cooperative.overview.aiInsights.title')}
            </CardTitle>
            <CardDescription className="text-[13px] text-muted-foreground">
              {t('cooperative.overview.aiInsights.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-7 w-20 rounded-md" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => {
                  const meta = INSIGHT_META[insight.type]
                  const InsightIcon = meta.Icon
                  const timeLabel = t(`cooperative.overview.aiInsights.time.${insight.time}`)
                  const insightText = t(`cooperative.overview.aiInsights.items.${insight.textKey}`)

                  return (
                    <div
                      key={insight.id}
                      className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/30"
                    >
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", meta.bg)}>
                        <InsightIcon className={cn("w-[18px] h-[18px]", meta.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-foreground leading-snug">{insightText}</p>
                        <p className="text-[12px] text-muted-foreground mt-0.5">{timeLabel}</p>
                      </div>
                      <button
                        onClick={() => navigate('/cooperative/ai-insights')}
                        className="flex-shrink-0 text-[12px] font-medium text-green-500 border border-green-500/50 rounded-md px-3 py-1 hover:bg-green-500/10 transition-colors whitespace-nowrap"
                      >
                        {t('cooperative.overview.aiInsights.takeAction')}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* ── Mobile bottom nav (lg:hidden) ───────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-card border-t border-border">
        <div className="flex items-stretch h-16">
          {[
            { key: 'home',     Icon: Home,          href: '/cooperative'               },
            { key: 'farms',    Icon: MapPin,         href: '/cooperative/farms'         },
            { key: 'market',   Icon: Store,          href: '/cooperative/market'        },
            { key: 'alerts',   Icon: AlertTriangle,  href: '/cooperative/disease-alerts'},
            { key: 'settings', Icon: Settings,       href: '/cooperative/settings'      },
          ].map(tab => {
            const active = tab.href === '/cooperative'
              ? location.pathname === tab.href
              : location.pathname.startsWith(tab.href)
            return (
              <button
                key={tab.key}
                onClick={() => navigate(tab.href)}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 transition-colors",
                  active ? "text-green-500" : "text-muted-foreground"
                )}
              >
                <tab.Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">
                  {t(`cooperative.overview.bottomNav.${tab.key}`)}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

    </div>
  )
}
