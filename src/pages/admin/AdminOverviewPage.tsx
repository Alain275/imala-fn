import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users, Sprout, BrainCircuit, Building2,
  Activity, Clock, TrendingUp, UserCheck,
  Wheat, PlayCircle, ClipboardCheck, BarChart3,
} from "lucide-react"
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts"
import { adminService, type AdminStats, type UserGrowthPoint } from "@/services/adminMock"

const ROLE_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6']

const TOOLTIP_STYLE = {
  backgroundColor: 'oklch(var(--card))',
  border: '1px solid oklch(var(--border))',
  borderRadius: '8px',
  color: 'oklch(var(--foreground))',
}

const recentActivity = [
  { icon: UserCheck, text: "New farmer registered — Nyagatare District", time: "12m ago", color: "text-emerald-500" },
  { icon: BrainCircuit, text: "AI model v3.0.0 accuracy reached 93.4%", time: "1h ago", color: "text-violet-500" },
  { icon: Building2, text: "ABIRUHA Cooperative added 24 new members", time: "2h ago", color: "text-sky-500" },
  { icon: Users, text: "Agronomist Patrick Nkurunziza logged in", time: "3h ago", color: "text-amber-500" },
  { icon: Activity, text: "Platform: 8 active users today", time: "4h ago", color: "text-emerald-500" },
  { icon: TrendingUp, text: "3 new users registered this week", time: "6h ago", color: "text-emerald-500" },
]

function StatSkeleton() {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )
}

const QUICK_ACTIONS = [
  { label: "Register Cooperative", icon: Building2, color: "text-amber-500", bg: "bg-amber-500/10 dark:bg-amber-500/15", href: "/admin/cooperatives" },
  { label: "Add Crop", icon: Wheat, color: "text-emerald-500", bg: "bg-emerald-500/10 dark:bg-emerald-500/15", href: "/admin/crops" },
  { label: "Start Training Run", icon: PlayCircle, color: "text-violet-500", bg: "bg-violet-500/10 dark:bg-violet-500/15", href: "/admin/ai/training" },
  { label: "Review Predictions", icon: ClipboardCheck, color: "text-sky-500", bg: "bg-sky-500/10 dark:bg-sky-500/15", href: "/admin/ai/review" },
  { label: "View Analytics", icon: BarChart3, color: "text-rose-500", bg: "bg-rose-500/10 dark:bg-rose-500/15", href: "/admin/analytics" },
  { label: "Manage Users", icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10 dark:bg-indigo-500/15", href: "/admin/users" },
]

export default function AdminOverviewPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [growth, setGrowth] = useState<UserGrowthPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([adminService.getStats(), adminService.getUserGrowth()])
      .then(([s, g]) => { setStats(s); setGrowth(g) })
      .catch(() => setError('Failed to load overview data.'))
      .finally(() => setLoading(false))
  }, [])

  const kpis = stats ? [
    { label: "Total Users", value: stats.totalUsers, icon: Users, gradient: "gold" as const, sub: `+${stats.newThisWeek} this week` },
    { label: "Farmers", value: stats.farmerCount, icon: Sprout, gradient: "green" as const, sub: "registered" },
    { label: "Agronomists", value: stats.agronomistCount, icon: BrainCircuit, gradient: "sky" as const, sub: "active" },
    { label: "Cooperatives", value: stats.cooperativeCount, icon: Building2, gradient: "earth" as const, sub: "onboarded" },
    { label: "Active Today", value: stats.activeToday, icon: Activity, gradient: "leaf" as const, sub: "unique sessions" },
    { label: "New This Week", value: stats.newThisWeek, icon: TrendingUp, gradient: "gold" as const, sub: `+${stats.growthRate}% growth` },
  ] : []

  const roleDistribution = stats ? [
    { name: 'Farmers', value: stats.farmerCount },
    { name: 'Agronomists', value: stats.agronomistCount },
    { name: 'Cooperatives', value: stats.cooperativeCount },
    { name: 'Admins', value: stats.adminCount },
  ] : []

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Admin Overview" subtitle="Platform management & system health" />
        <div className="p-6 flex items-center justify-center">
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Admin Overview" subtitle="Platform management & system health" />

      <div className="p-6 space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i} />)
            : kpis.map(k => (
              <Card key={k.label} className="border-0 shadow-md">
                <CardContent className="p-4 flex flex-col justify-between h-28">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">{k.label}</span>
                    <Icon3D gradient={k.gradient} size="sm">
                      <k.icon className="w-4 h-4" />
                    </Icon3D>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{k.value}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">{k.sub}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          }
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User growth */}
          <Card className="lg:col-span-2 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                User Growth
              </CardTitle>
              <CardDescription>Monthly registrations by role</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-56 w-full rounded-xl" /> : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growth}>
                      <defs>
                        <linearGradient id="gFarmer" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gAgro" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                      <XAxis dataKey="month" className="fill-muted-foreground" fontSize={11} tickLine={false} />
                      <YAxis className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Area type="monotone" dataKey="farmers" stroke="#10b981" fill="url(#gFarmer)" name="Farmers" />
                      <Area type="monotone" dataKey="agronomists" stroke="#0ea5e9" fill="url(#gAgro)" name="Agronomists" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="flex items-center gap-6 mt-3">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs text-muted-foreground">Farmers</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-sky-500" /><span className="text-xs text-muted-foreground">Agronomists</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Role distribution */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-5 h-5 text-muted-foreground" />
                Role Distribution
              </CardTitle>
              <CardDescription>Current user breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-48 w-full rounded-xl" /> : (
                <>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                          {roleDistribution.map((_, i) => (
                            <Cell key={i} fill={ROLE_COLORS[i]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-2">
                    {roleDistribution.map((r, i) => (
                      <div key={r.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: ROLE_COLORS[i] }} />
                          <span className="text-muted-foreground">{r.name}</span>
                        </div>
                        <span className="font-semibold text-foreground">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-5 h-5 text-violet-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {QUICK_ACTIONS.map(a => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.href)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-border/80 hover:bg-muted/40 transition-all duration-200 text-center group"
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", a.bg)}>
                    <a.icon className={cn("w-5 h-5", a.color)} />
                  </div>
                  <span className="text-xs font-medium text-foreground leading-tight">{a.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Recent Activity
            </CardTitle>
            <CardDescription>Platform events and user actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={cn("w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0", a.color)}>
                    <a.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{a.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

