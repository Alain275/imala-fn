import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Icon3D } from "@/components/icon-3d"
import { farmerOverviewService, type FarmerOverview } from "@/services/farmerOverview"
import {
  Sprout,
  Bug,
  CloudSun,
  Mountain,
  TrendingUp,
  Users,
  Leaf,
  Droplets,
  Sun,
  Wind,
  ArrowUpRight,
  ArrowDownRight,
  UserRound
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts"

const soilHealthKeys = ["excellent", "good", "fair", "poor"] as const
const soilHealthColors: Record<typeof soilHealthKeys[number], string> = {
  excellent: "#22c55e",
  good: "#84cc16",
  fair: "#eab308",
  poor: "#ef4444",
}

const statMeta = [
  { key: "activeFarms", icon: Leaf, gradient: "green" as const },
  { key: "cropsMonitored", icon: Sprout, gradient: "leaf" as const },
  { key: "diseaseAlerts", icon: Bug, gradient: "earth" as const },
  { key: "marketListings", icon: TrendingUp, gradient: "gold" as const },
]

const quickActions = [
  { key: "addCrop", icon: Sprout, gradient: "green" as const, href: "/dashboard/crops" },
  { key: "reportDisease", icon: Bug, gradient: "earth" as const, href: "/dashboard/disease" },
  { key: "checkWeather", icon: CloudSun, gradient: "sky" as const, href: "/dashboard/weather" },
  { key: "soilTest", icon: Mountain, gradient: "earth" as const, href: "/dashboard/soil" },
  { key: "viewPrices", icon: TrendingUp, gradient: "gold" as const, href: "/dashboard/market" },
  { key: "checkProfile", icon: UserRound, gradient: "green" as const, href: "/dashboard/farmer-profile" },
  { key: "findExpert", icon: Users, gradient: "leaf" as const, href: "/dashboard/agronomists" },
]

export default function DashboardPage() {
  const { t } = useTranslation()
  const [overview, setOverview] = useState<FarmerOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    farmerOverviewService
      .getOverview()
      .then((data) => {
        if (!cancelled) setOverview(data)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load dashboard overview")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const stats = overview?.stats
  const quickStats = statMeta.map((meta) => ({
    ...meta,
    value: stats?.[meta.key as keyof typeof stats]?.value ?? 0,
    change: stats?.[meta.key as keyof typeof stats]?.change ?? "+0%",
    up: stats?.[meta.key as keyof typeof stats]?.up ?? true,
  }))

  const soilHealthData = soilHealthKeys.map(key => ({
    key,
    name: t(`common.status.${key}`),
    value: overview?.soilHealth.find((item) => item.key === key)?.value ?? 0,
    color: soilHealthColors[key],
  }))

  return (
    <div className="min-h-screen">
      <Header
        title={t("dashboard.overview.title")}
        subtitle={t("dashboard.overview.subtitle", { name: overview?.farmer.name || "Farmer" })}
      />

      <div className="p-3 sm:p-6 space-y-6">
        {error && (
          <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <Card key={stat.key} className="card-hover border-0 shadow-md bg-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">{t(`dashboard.overview.stats.${stat.key}`)}</p>
                    {loading ? (
                      <Skeleton className="h-9 w-20" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                    )}
                    <div className={`flex items-center text-sm font-medium ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                      {stat.up ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                      {t("dashboard.overview.changeFromLastMonth", { change: stat.change })}
                    </div>
                  </div>
                  <Icon3D gradient={stat.gradient} size="md">
                    <stat.icon className="w-6 h-6" />
                  </Icon3D>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weather & Crop Yield Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weather Forecast */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Icon3D gradient="sky" size="sm">
                    <CloudSun className="w-4 h-4" />
                  </Icon3D>
                  <span>{t("dashboard.overview.weatherForecast.title")}</span>
                </CardTitle>
                <span className="text-sm text-muted-foreground">{t("dashboard.overview.weatherForecast.next7Days")}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={overview?.weatherForecast ?? []}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="day" className="fill-muted-foreground" fontSize={12} tickLine={false} />
                    <YAxis className="fill-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(var(--card))',
                        border: '1px solid oklch(var(--border))',
                        borderRadius: '8px',
                        color: 'oklch(var(--foreground))',
                      }}
                    />
                    <Area type="monotone" dataKey="temp" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTemp)" name={t("dashboard.overview.weatherForecast.tempLegend")} />
                    <Area type="monotone" dataKey="rain" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRain)" name={t("dashboard.overview.weatherForecast.rainLegend")} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-muted-foreground">{t("dashboard.overview.weatherForecast.temperature")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">{t("dashboard.overview.weatherForecast.rainfall")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Crop Yield */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Icon3D gradient="green" size="sm">
                    <Sprout className="w-4 h-4" />
                  </Icon3D>
                  <span>{t("dashboard.overview.cropYield.areaTitle", { defaultValue: "Registered Crop Area" })}</span>
                </CardTitle>
                <span className="text-sm text-muted-foreground">{t("dashboard.overview.cropYield.registeredArea", { defaultValue: "Registered area" })}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overview?.cropArea.data ?? []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="month" className="fill-muted-foreground" fontSize={12} tickLine={false} />
                    <YAxis className="fill-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(var(--card))',
                        border: '1px solid oklch(var(--border))',
                        borderRadius: '8px',
                        color: 'oklch(var(--foreground))',
                      }}
                    />
                    {(overview?.cropArea.cropSeries ?? []).map((series) => (
                      <Bar
                        key={series.key}
                        dataKey={series.key}
                        fill={series.color}
                        radius={[4, 4, 0, 0]}
                        name={`${series.name} (ha)`}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                {(overview?.cropArea.cropSeries ?? []).map((series) => (
                  <div key={series.key} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: series.color }} />
                    <span className="text-sm text-muted-foreground">{series.name}</span>
                  </div>
                ))}
                {!loading && (overview?.cropArea.cropSeries.length ?? 0) === 0 && (
                  <span className="text-sm text-muted-foreground">
                    {t("dashboard.overview.cropYield.noRegisteredCrops", { defaultValue: "No registered crops yet" })}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Soil Health & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Soil Health */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <Icon3D gradient="earth" size="sm">
                  <Mountain className="w-4 h-4" />
                </Icon3D>
                <span>{t("dashboard.overview.soilHealth.title")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={soilHealthData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {soilHealthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {soilHealthData.map((item) => (
                  <div key={item.key} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card className="lg:col-span-2 border-0 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Icon3D gradient="gold" size="sm">
                    <Wind className="w-4 h-4" />
                  </Icon3D>
                  <span>{t("dashboard.overview.recentAlerts.title")}</span>
                </CardTitle>
                <button className="text-sm text-primary hover:underline font-medium">{t("dashboard.overview.recentAlerts.viewAll")}</button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(overview?.recentAlerts ?? []).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                      alert.severity === 'danger' ? 'bg-red-500' :
                      alert.severity === 'warning' ? 'bg-amber-500' :
                      alert.severity === 'success' ? 'bg-emerald-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
                {loading && [0, 1, 2].map((item) => (
                  <div key={item} className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                    <Skeleton className="mt-1 h-3 w-3 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>{t("dashboard.overview.quickActions.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.key}
                  to={action.href}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all hover:scale-105"
                >
                  <Icon3D gradient={action.gradient} size="md">
                    <action.icon className="w-5 h-5" />
                  </Icon3D>
                  <span className="text-sm font-medium text-foreground">{t(`dashboard.overview.quickActions.${action.key}`)}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
