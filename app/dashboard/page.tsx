"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
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
  ArrowDownRight
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

// Dummy data
const weatherData = [
  { day: "Mon", temp: 24, rain: 10 },
  { day: "Tue", temp: 26, rain: 5 },
  { day: "Wed", temp: 25, rain: 15 },
  { day: "Thu", temp: 23, rain: 30 },
  { day: "Fri", temp: 22, rain: 45 },
  { day: "Sat", temp: 24, rain: 20 },
  { day: "Sun", temp: 27, rain: 8 },
]

const cropYieldData = [
  { month: "Jan", maize: 400, beans: 240, rice: 180 },
  { month: "Feb", maize: 300, beans: 139, rice: 220 },
  { month: "Mar", maize: 520, beans: 280, rice: 250 },
  { month: "Apr", maize: 470, beans: 390, rice: 200 },
  { month: "May", maize: 540, beans: 480, rice: 280 },
  { month: "Jun", maize: 580, beans: 380, rice: 300 },
]

const soilHealthData = [
  { name: "Excellent", value: 35, color: "#22c55e" },
  { name: "Good", value: 40, color: "#84cc16" },
  { name: "Fair", value: 18, color: "#eab308" },
  { name: "Poor", value: 7, color: "#ef4444" },
]

const recentAlerts = [
  { id: 1, type: "weather", message: "Heavy rainfall expected in Kigali tomorrow", time: "2 hours ago", severity: "warning" },
  { id: 2, type: "disease", message: "Maize leaf blight detected in Eastern Province", time: "5 hours ago", severity: "danger" },
  { id: 3, type: "market", message: "Bean prices increased by 15% this week", time: "1 day ago", severity: "info" },
  { id: 4, type: "crop", message: "Optimal planting time for tomatoes begins next week", time: "1 day ago", severity: "success" },
]

const quickStats = [
  { title: "Active Farms", value: "2,847", change: "+12%", up: true, icon: Leaf, gradient: "green" as const },
  { title: "Crops Monitored", value: "15,234", change: "+8%", up: true, icon: Sprout, gradient: "leaf" as const },
  { title: "Disease Alerts", value: "23", change: "-15%", up: false, icon: Bug, gradient: "earth" as const },
  { title: "Market Listings", value: "1,456", change: "+25%", up: true, icon: TrendingUp, gradient: "gold" as const },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Header 
        title="Dashboard" 
        subtitle="Welcome back, Jean! Here's your farm overview."
      />
      
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <Card key={stat.title} className="card-hover border-0 shadow-md bg-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <div className={`flex items-center text-sm font-medium ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                      {stat.up ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                      {stat.change} from last month
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
                  <span>Weather Forecast</span>
                </CardTitle>
                <span className="text-sm text-muted-foreground">Next 7 days</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weatherData}>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Area type="monotone" dataKey="temp" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTemp)" name="Temp (°C)" />
                    <Area type="monotone" dataKey="rain" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRain)" name="Rain (%)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-muted-foreground">Temperature</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Rainfall</span>
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
                  <span>Crop Yield Analysis</span>
                </CardTitle>
                <span className="text-sm text-muted-foreground">Last 6 months</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cropYieldData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Bar dataKey="maize" fill="#22c55e" radius={[4, 4, 0, 0]} name="Maize (kg)" />
                    <Bar dataKey="beans" fill="#84cc16" radius={[4, 4, 0, 0]} name="Beans (kg)" />
                    <Bar dataKey="rice" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Rice (kg)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-muted-foreground">Maize</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-lime-500" />
                  <span className="text-sm text-muted-foreground">Beans</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-500" />
                  <span className="text-sm text-muted-foreground">Rice</span>
                </div>
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
                <span>Soil Health Overview</span>
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
                  <div key={item.name} className="flex items-center gap-2">
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
                  <span>Recent Alerts</span>
                </CardTitle>
                <button className="text-sm text-primary hover:underline font-medium">View All</button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: Sprout, label: "Add Crop", gradient: "green" as const },
                { icon: Bug, label: "Report Disease", gradient: "earth" as const },
                { icon: CloudSun, label: "Check Weather", gradient: "sky" as const },
                { icon: Mountain, label: "Soil Test", gradient: "earth" as const },
                { icon: TrendingUp, label: "View Prices", gradient: "gold" as const },
                { icon: Users, label: "Find Expert", gradient: "leaf" as const },
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all hover:scale-105"
                >
                  <Icon3D gradient={action.gradient} size="md">
                    <action.icon className="w-5 h-5" />
                  </Icon3D>
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
