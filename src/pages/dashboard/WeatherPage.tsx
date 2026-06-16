import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  MapPin
} from "lucide-react"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line
} from "recharts"

// Dummy weather data
const currentWeather = {
  temperature: 24,
  feelsLike: 26,
  humidity: 68,
  windSpeed: 12,
  windDirection: "NE",
  uvIndex: 6,
  visibility: 10,
  pressure: 1013,
  condition: "Partly Cloudy",
  sunrise: "06:15",
  sunset: "18:30"
}

const hourlyForecast = [
  { time: "Now", temp: 24, icon: "cloudy", rain: 10 },
  { time: "10AM", temp: 25, icon: "sunny", rain: 5 },
  { time: "11AM", temp: 27, icon: "sunny", rain: 5 },
  { time: "12PM", temp: 28, icon: "sunny", rain: 10 },
  { time: "1PM", temp: 29, icon: "sunny", rain: 15 },
  { time: "2PM", temp: 28, icon: "cloudy", rain: 25 },
  { time: "3PM", temp: 27, icon: "rainy", rain: 60 },
  { time: "4PM", temp: 25, icon: "rainy", rain: 75 },
  { time: "5PM", temp: 24, icon: "cloudy", rain: 40 },
  { time: "6PM", temp: 23, icon: "cloudy", rain: 20 },
]

const weeklyForecast = [
  { day: "Today", high: 28, low: 18, condition: "Partly Cloudy", rain: 30, icon: "cloudy" },
  { day: "Tomorrow", high: 26, low: 17, condition: "Rainy", rain: 80, icon: "rainy" },
  { day: "Wed", high: 24, low: 16, condition: "Rainy", rain: 70, icon: "rainy" },
  { day: "Thu", high: 25, low: 17, condition: "Cloudy", rain: 40, icon: "cloudy" },
  { day: "Fri", high: 27, low: 18, condition: "Sunny", rain: 10, icon: "sunny" },
  { day: "Sat", high: 29, low: 19, condition: "Sunny", rain: 5, icon: "sunny" },
  { day: "Sun", high: 28, low: 18, condition: "Partly Cloudy", rain: 20, icon: "cloudy" },
]

const rainfallData = [
  { month: "Jan", rainfall: 85, avg: 70 },
  { month: "Feb", rainfall: 95, avg: 85 },
  { month: "Mar", rainfall: 120, avg: 110 },
  { month: "Apr", rainfall: 180, avg: 160 },
  { month: "May", rainfall: 90, avg: 80 },
  { month: "Jun", rainfall: 25, avg: 20 },
  { month: "Jul", rainfall: 15, avg: 10 },
  { month: "Aug", rainfall: 40, avg: 30 },
  { month: "Sep", rainfall: 80, avg: 70 },
  { month: "Oct", rainfall: 100, avg: 95 },
  { month: "Nov", rainfall: 110, avg: 105 },
  { month: "Dec", rainfall: 75, avg: 65 },
]

const farmingAlerts = [
  { id: 1, type: "warning", message: "Heavy rainfall expected tomorrow - Avoid fertilizer application", time: "2 hours ago" },
  { id: 2, type: "info", message: "Good conditions for planting beans in the next 3 days", time: "5 hours ago" },
  { id: 3, type: "danger", message: "High UV index today - Irrigate in early morning or evening", time: "Today" },
  { id: 4, type: "success", message: "Optimal spraying conditions expected on Friday", time: "Yesterday" },
]

const WeatherIcon = ({ condition, size = "md" }: { condition: string, size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  }
  
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

export default function WeatherPage() {
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-white/80 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>Kigali, Rwanda</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-7xl font-light">{currentWeather.temperature}°</span>
                    <div className="pt-2">
                      <p className="text-xl font-medium">{currentWeather.condition}</p>
                      <p className="text-white/70">Feels like {currentWeather.feelsLike}°C</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-sm text-white/80">
                    <div className="flex items-center gap-1">
                      <ArrowUp className="w-4 h-4" />
                      <span>28°</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowDown className="w-4 h-4" />
                      <span>18°</span>
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
                  <p className="text-2xl font-semibold">{currentWeather.humidity}%</p>
                  <p className="text-sm text-white/70">Humidity</p>
                </div>
                <div className="text-center">
                  <Wind className="w-6 h-6 mx-auto mb-2 text-white/80" />
                  <p className="text-2xl font-semibold">{currentWeather.windSpeed}</p>
                  <p className="text-sm text-white/70">Wind (km/h)</p>
                </div>
                <div className="text-center">
                  <Sun className="w-6 h-6 mx-auto mb-2 text-white/80" />
                  <p className="text-2xl font-semibold">{currentWeather.uvIndex}</p>
                  <p className="text-sm text-white/70">UV Index</p>
                </div>
                <div className="text-center">
                  <CloudRain className="w-6 h-6 mx-auto mb-2 text-white/80" />
                  <p className="text-2xl font-semibold">30%</p>
                  <p className="text-sm text-white/70">Rain Chance</p>
                </div>
              </div>
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
              <div className="space-y-3">
                {farmingAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-xl text-sm ${
                      alert.type === 'danger' ? 'bg-red-50 border border-red-200' :
                      alert.type === 'warning' ? 'bg-amber-50 border border-amber-200' :
                      alert.type === 'success' ? 'bg-emerald-50 border border-emerald-200' :
                      'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <p className={`font-medium ${
                      alert.type === 'danger' ? 'text-red-700' :
                      alert.type === 'warning' ? 'text-amber-700' :
                      alert.type === 'success' ? 'text-emerald-700' :
                      'text-blue-700'
                    }`}>
                      {alert.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                ))}
              </div>
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
            <div className="flex gap-4 overflow-x-auto pb-2">
              {hourlyForecast.map((hour, i) => (
                <div 
                  key={i}
                  className={`flex-shrink-0 w-20 p-4 rounded-xl text-center ${
                    i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
                  }`}
                >
                  <p className={`text-sm font-medium ${i === 0 ? '' : 'text-muted-foreground'}`}>
                    {hour.time}
                  </p>
                  <div className="my-2 flex justify-center">
                    <WeatherIcon condition={hour.icon} size="sm" />
                  </div>
                  <p className={`text-lg font-semibold ${i === 0 ? '' : 'text-foreground'}`}>
                    {hour.temp}°
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Droplets className={`w-3 h-3 ${i === 0 ? 'text-white/70' : 'text-blue-500'}`} />
                    <span className={`text-xs ${i === 0 ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {hour.rain}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
              <div className="space-y-3">
                {weeklyForecast.map((day, i) => (
                  <div 
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      i === 0 ? 'bg-primary/10' : 'hover:bg-muted/50'
                    } transition-colors`}
                  >
                    <div className="flex items-center gap-3 w-24">
                      <span className={`font-medium ${i === 0 ? 'text-primary' : 'text-foreground'}`}>
                        {day.day}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <WeatherIcon condition={day.icon} size="sm" />
                      <span className="text-sm text-muted-foreground w-24 hidden sm:block">
                        {day.condition}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-muted-foreground">{day.rain}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-foreground">{day.high}°</span>
                      <span className="text-muted-foreground">{day.low}°</span>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rainfallData}>
                    <defs>
                      <linearGradient id="colorRainfall" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
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
                      dataKey="avg" 
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
