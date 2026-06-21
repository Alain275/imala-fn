import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Icon3D } from "@/components/icon-3d"

import {
  CloudSun,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  Cloud,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Clock,
  MapPin,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from "recharts"

import {
  useCurrentWeather,
  useHourlyForecast,
  useDailyForecast,
  useFarmingAlerts,
  useRainfallHistory,
} from "@/hooks/useWeather"
import type { HourlyForecast, DailyForecast, FarmingAlert } from "@/services/weather"

const LOCATION = "Musanze"

function formatHourLabel(isoTime: string, index: number): string {
  if (index === 0) return "Now"
  const d = new Date(isoTime)
  return d.toLocaleTimeString("en-US", { hour: "numeric", hour12: true })
}

type WeatherCondition = "sunny" | "partly_cloudy" | "cloudy" | "rainy"

const WeatherIcon = ({ condition, size = "md" }: { condition: WeatherCondition | string; size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = { sm: "w-6 h-6", md: "w-8 h-8", lg: "w-12 h-12" }
  switch (condition) {
    case "sunny":
      return <Sun className={`${sizeClasses[size]} text-amber-500`} />
    case "cloudy":
      return <Cloud className={`${sizeClasses[size]} text-gray-400`} />
    case "rainy":
      return <CloudRain className={`${sizeClasses[size]} text-blue-500`} />
    default:
      return <CloudSun className={`${sizeClasses[size]} text-amber-400`} />
  }
}

function AlertCard({ alert }: { alert: FarmingAlert }) {
  const isWarning = alert.type === "warning"
  return (
    <div
      className={`p-3 rounded-xl text-sm ${
        isWarning
          ? "bg-amber-50 border border-amber-200"
          : "bg-blue-50 border border-blue-200"
      }`}
    >
      <p className={`font-medium ${isWarning ? "text-amber-700" : "text-blue-700"}`}>
        {alert.message}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {new Date(alert.validFrom).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </p>
    </div>
  )
}

function HourlyCard({ hour, index }: { hour: HourlyForecast; index: number }) {
  return (
    <div
      className={`flex-shrink-0 w-20 p-4 rounded-xl text-center ${
        index === 0 ? "bg-primary text-primary-foreground" : "bg-muted/50"
      }`}
    >
      <p className={`text-sm font-medium ${index === 0 ? "" : "text-muted-foreground"}`}>
        {formatHourLabel(hour.time, index)}
      </p>
      <div className="my-2 flex justify-center">
        <WeatherIcon condition={hour.condition} size="sm" />
      </div>
      <p className={`text-lg font-semibold ${index === 0 ? "" : "text-foreground"}`}>
        {hour.temperature}°
      </p>
      <div className="flex items-center justify-center gap-1 mt-1">
        <Droplets className={`w-3 h-3 ${index === 0 ? "text-white/70" : "text-blue-500"}`} />
        <span className={`text-xs ${index === 0 ? "text-white/70" : "text-muted-foreground"}`}>
          {hour.rainChance}%
        </span>
      </div>
    </div>
  )
}

function DailyRow({ day, index }: { day: DailyForecast; index: number }) {
  const label = index === 0 ? "Today" : day.day
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl ${
        index === 0 ? "bg-primary/10" : "hover:bg-muted/50"
      } transition-colors`}
    >
      <div className="flex items-center gap-3 w-24">
        <span className={`font-medium ${index === 0 ? "text-primary" : "text-foreground"}`}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <WeatherIcon condition={day.condition} size="sm" />
        <span className="text-sm text-muted-foreground w-24 hidden sm:block">
          {day.condition.replace("_", " ")}
        </span>
      </div>
      <div className="flex items-center gap-1 text-sm">
        <Droplets className="w-4 h-4 text-blue-500" />
        <span className="text-muted-foreground">{day.rainChance}%</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-foreground">{day.tempHigh}°</span>
        <span className="text-muted-foreground">{day.tempLow}°</span>
      </div>
    </div>
  )
}

export default function WeatherPage() {
  const { data: current, loading: currentLoading } = useCurrentWeather(LOCATION)
  const { data: hourly, loading: hourlyLoading } = useHourlyForecast(LOCATION, 12)
  const { data: daily, loading: dailyLoading } = useDailyForecast(LOCATION, 7)
  const { data: alerts, loading: alertsLoading } = useFarmingAlerts(LOCATION)
  const { data: rainfall, loading: rainfallLoading } = useRainfallHistory(LOCATION, 12)

  return (
    <div className="min-h-screen">
      <Header
        title="Weather Intelligence"
        subtitle="Real-time weather data and farming-specific forecasts for your location"
      />

      <div className="p-6 space-y-6">
        {/* Current Weather */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-md bg-gradient-to-br from-sky-500 to-blue-600 text-white overflow-hidden">
            <CardContent className="p-6">
              {currentLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32 bg-white/20" />
                  <Skeleton className="h-20 w-48 bg-white/20" />
                  <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 bg-white/20 rounded-xl" />
                    ))}
                  </div>
                </div>
              ) : current ? (
                <>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-white/80 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{current.location}</span>
                      </div>
                      <div className="flex items-start gap-4">
                        <span className="text-7xl font-light">{current.temperature}°</span>
                        <div className="pt-2">
                          <p className="text-xl font-medium">{current.condition}</p>
                          <p className="text-white/70">Feels like {current.feelsLike}°C</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-4 text-sm text-white/80">
                        <div className="flex items-center gap-1">
                          <ArrowUp className="w-4 h-4" />
                          <span>{daily?.[0]?.tempHigh ?? "—"}°</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ArrowDown className="w-4 h-4" />
                          <span>{daily?.[0]?.tempLow ?? "—"}°</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 md:mt-0">
                      <CloudSun className="w-32 h-32 text-white/90" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
                    <div className="text-center">
                      <Droplets className="w-6 h-6 mx-auto mb-2 text-white/80" />
                      <p className="text-2xl font-semibold">{current.humidity}%</p>
                      <p className="text-sm text-white/70">Humidity</p>
                    </div>
                    <div className="text-center">
                      <Wind className="w-6 h-6 mx-auto mb-2 text-white/80" />
                      <p className="text-2xl font-semibold">{current.windSpeed}</p>
                      <p className="text-sm text-white/70">Wind (km/h)</p>
                    </div>
                    <div className="text-center">
                      <Sun className="w-6 h-6 mx-auto mb-2 text-white/80" />
                      <p className="text-2xl font-semibold">{current.uvIndex}</p>
                      <p className="text-sm text-white/70">UV Index</p>
                    </div>
                    <div className="text-center">
                      <CloudRain className="w-6 h-6 mx-auto mb-2 text-white/80" />
                      <p className="text-2xl font-semibold">{current.rainChance}%</p>
                      <p className="text-sm text-white/70">Rain Chance</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-white/70 text-sm">No weather data available.</p>
              )}
            </CardContent>
          </Card>

          {/* Farming Alerts */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <Icon3D gradient="gold" size="sm">
                  <AlertTriangle className="w-4 h-4" />
                </Icon3D>
                <span>Farming Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : alerts && alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active alerts.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Hourly Forecast */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3">
              <Icon3D gradient="sky" size="sm">
                <Clock className="w-4 h-4" />
              </Icon3D>
              <span>Hourly Forecast</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hourlyLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="flex-shrink-0 w-20 h-28 rounded-xl" />
                ))}
              </div>
            ) : hourly && hourly.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {hourly.map((hour, i) => (
                  <HourlyCard key={i} hour={hour} index={i} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hourly data available.</p>
            )}
          </CardContent>
        </Card>

        {/* Weekly Forecast & Rainfall Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Forecast */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <Icon3D gradient="green" size="sm">
                  <CloudSun className="w-4 h-4" />
                </Icon3D>
                <span>7-Day Forecast</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-xl" />
                  ))}
                </div>
              ) : daily && daily.length > 0 ? (
                <div className="space-y-3">
                  {daily.map((day, i) => (
                    <DailyRow key={day.date} day={day} index={i} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No forecast available.</p>
              )}
            </CardContent>
          </Card>

          {/* Rainfall Chart */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <Icon3D gradient="sky" size="sm">
                  <CloudRain className="w-4 h-4" />
                </Icon3D>
                <span>Annual Rainfall</span>
              </CardTitle>
              <CardDescription>Monthly rainfall vs average (mm)</CardDescription>
            </CardHeader>
            <CardContent>
              {rainfallLoading ? (
                <Skeleton className="h-64 rounded-xl" />
              ) : rainfall && rainfall.length > 0 ? (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={rainfall}>
                        <defs>
                          <linearGradient id="colorRainfall" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="rainfall"
                          stroke="#3b82f6"
                          fillOpacity={1}
                          fill="url(#colorRainfall)"
                          name="Rainfall (mm)"
                        />
                        <Line
                          type="monotone"
                          dataKey="average"
                          stroke="#9ca3af"
                          strokeDasharray="5 5"
                          name="Average (mm)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-blue-500 rounded" />
                      <span className="text-muted-foreground">This Year</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-gray-400 rounded border-dashed" />
                      <span className="text-muted-foreground">Average</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No rainfall data available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
