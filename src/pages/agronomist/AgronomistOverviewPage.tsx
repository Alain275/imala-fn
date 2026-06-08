import { Link } from "react-router-dom"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import {
  Map, BrainCircuit, MessageSquare, FlaskConical,
  BarChart3, Users2, AlertTriangle, CheckCircle2,
  Clock, TrendingUp, ArrowUpRight, Activity, Sprout, ArrowRight
} from "lucide-react"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts"

const weeklyActivity = [
  { day: "Mon", visits: 8, tickets: 12, resolved: 11 },
  { day: "Tue", visits: 12, tickets: 18, resolved: 16 },
  { day: "Wed", visits: 7, tickets: 14, resolved: 12 },
  { day: "Thu", visits: 15, tickets: 22, resolved: 21 },
  { day: "Fri", visits: 11, tickets: 16, resolved: 15 },
  { day: "Sat", visits: 5, tickets: 9, resolved: 8 },
  { day: "Sun", visits: 3, tickets: 6, resolved: 6 },
]

const modules = [
  {
    name: "GIS & Field Scouting",
    href: "/agronomist/gis",
    icon: Map,
    description: "Monitor field boundaries, drone scans & route optimization",
    stat: "8 active zones",
    alert: "3 critical pins",
    gradient: "green",
  },
  {
    name: "AI Validation Engine",
    href: "/agronomist/ai-validation",
    icon: BrainCircuit,
    description: "Review low-confidence crop recommendations before dispatch",
    stat: "12 pending review",
    alert: "85% threshold active",
    gradient: "gold",
  },
  {
    name: "Comms Studio",
    href: "/agronomist/comms",
    icon: MessageSquare,
    description: "Bulk SMS/USSD messaging with Kinyarwanda translation",
    stat: "1,204 sent today",
    alert: "4 open tickets",
    gradient: "sky",
  },
  {
    name: "Pathology Lab",
    href: "/agronomist/pathology",
    icon: FlaskConical,
    description: "Diagnose crop diseases and build treatment prescriptions",
    stat: "8 cases today",
    alert: "88% avg match",
    gradient: "violet",
  },
  {
    name: "Advisory Hub",
    href: "/agronomist/advisory",
    icon: BarChart3,
    description: "NPK fertilizer calculator and regional market arbitrage",
    stat: "Kigali: RWF 480/kg",
    alert: "Maize up +4.2%",
    gradient: "earth",
  },
  {
    name: "Workforce Desk",
    href: "/agronomist/workforce",
    icon: Users2,
    description: "Track field visits, offline sync, and team KPI metrics",
    stat: "5 active agents",
    alert: "28/30 visits done",
    gradient: "green",
  },
]

const recentActivity = [
  { icon: AlertTriangle, text: "Uwimana E. reported leaf blight — Bugesera", time: "9m ago", color: "text-rose-500" },
  { icon: CheckCircle2, text: "AI recommendation approved for Habimana P.", time: "22m ago", color: "text-emerald-500" },
  { icon: MessageSquare, text: "Bulk SMS dispatched to 847 COOPAC members", time: "1h ago", color: "text-sky-500" },
  { icon: BrainCircuit, text: "6 validation items flagged for review", time: "1.5h ago", color: "text-amber-500" },
  { icon: FlaskConical, text: "Mancozeb prescription sent to Niyonzima J.", time: "2h ago", color: "text-indigo-500" },
  { icon: Map, text: "Drone scan uploaded — Bugesera Sector A", time: "3h ago", color: "text-emerald-500" },
]

export default function AgronomistOverviewPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Agronomist Command Centre"
        subtitle="Rwanda Agricultural System · Overview & Regional Operations"
      />

      <div className="p-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Tickets Resolved", val: "97", trend: "+18%", icon: CheckCircle2, gradient: "green" },
            { label: "Field Visits", val: "28", trend: "93%", icon: Map, gradient: "sky" },
            { label: "Messages Sent", val: "1.2K", trend: "98% delivery", icon: MessageSquare, gradient: "sky" },
            { label: "Avg Confidence", val: "82%", trend: "+3% this week", icon: BrainCircuit, gradient: "gold" },
            { label: "Yield Improvement", val: "+12%", trend: "Kigali Province", icon: TrendingUp, gradient: "green" },
          ].map((k) => (
            <Card key={k.label} className="border-0 shadow-md">
              <CardContent className="p-4 flex flex-col justify-between h-32">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">{k.label}</span>
                  <Icon3D gradient={k.gradient as any} size="sm">
                    <k.icon className="w-4 h-4 text-white" />
                  </Icon3D>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-foreground">{k.val}</p>
                  <p className="text-xs text-emerald-600 font-semibold mt-0.5">{k.trend}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modules Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Core Modules</h2>
            <span className="text-xs text-muted-foreground">Select a module to manage</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modules.map((mod) => (
              <Card key={mod.name} className="card-hover border-0 shadow-md overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="h-24 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center border-b border-border">
                    <Icon3D gradient={mod.gradient as any} size="lg">
                      <mod.icon className="w-6 h-6 text-white" />
                    </Icon3D>
                  </div>
                  <CardContent className="p-5 space-y-2">
                    <h3 className="font-semibold text-foreground text-base">{mod.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{mod.description}</p>
                  </CardContent>
                </div>
                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-border/50">
                  <span className="text-xs font-semibold text-primary">{mod.stat}</span>
                  <Button variant="ghost" size="sm" className="gap-1.5 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground" asChild>
                    <Link to={mod.href}>
                      Open Desk <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Weekly Activity + Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Weekly activity chart */}
          <Card className="lg:col-span-3 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <span>Weekly Activity</span>
              </CardTitle>
              <CardDescription>Field operations and support ticket diagnostics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivity} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="day" className="fill-muted-foreground" fontSize={11} tickLine={false} />
                    <YAxis className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--background)" }} />
                    <Bar dataKey="visits" fill="#10b981" radius={[4, 4, 0, 0]} name="Field Visits" />
                    <Bar dataKey="tickets" fill="#f59e0b" radius={[4, 4, 0, 0]} name="New Tickets" />
                    <Bar dataKey="resolved" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Resolved" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Activity feed */}
          <Card className="lg:col-span-2 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span>Operations Feed</span>
              </CardTitle>
              <CardDescription>Real-time field logs & telemetry events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium leading-normal">{activity.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
