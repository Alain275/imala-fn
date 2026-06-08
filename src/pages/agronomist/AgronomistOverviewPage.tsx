import { Link } from "react-router-dom"
import {
  Map, BrainCircuit, MessageSquare, FlaskConical,
  BarChart3, Users2, AlertTriangle, CheckCircle2,
  Clock, TrendingUp, ArrowUpRight, Wifi, Zap,
  Activity, Sprout
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
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
    statColor: "text-emerald-400",
    alert: "3 critical pins",
    alertColor: "text-rose-400",
    accent: "from-emerald-600/20 to-emerald-900/10",
    border: "border-emerald-600/20",
    iconBg: "bg-emerald-600/20 border-emerald-600/30 text-emerald-400",
  },
  {
    name: "AI Validation Engine",
    href: "/agronomist/ai-validation",
    icon: BrainCircuit,
    description: "Review low-confidence crop recommendations before dispatch",
    stat: "12 pending review",
    statColor: "text-amber-400",
    alert: "85% threshold active",
    alertColor: "text-amber-400",
    accent: "from-amber-600/20 to-amber-900/10",
    border: "border-amber-600/20",
    iconBg: "bg-amber-600/20 border-amber-600/30 text-amber-400",
  },
  {
    name: "Comms Studio",
    href: "/agronomist/comms",
    icon: MessageSquare,
    description: "Bulk SMS/USSD messaging with Kinyarwanda translation",
    stat: "1,204 sent today",
    statColor: "text-sky-400",
    alert: "4 open tickets",
    alertColor: "text-rose-400",
    accent: "from-sky-600/20 to-sky-900/10",
    border: "border-sky-600/20",
    iconBg: "bg-sky-600/20 border-sky-600/30 text-sky-400",
  },
  {
    name: "Pathology Lab",
    href: "/agronomist/pathology",
    icon: FlaskConical,
    description: "Diagnose crop diseases and build treatment prescriptions",
    stat: "8 cases today",
    statColor: "text-violet-400",
    alert: "88% avg match",
    alertColor: "text-emerald-400",
    accent: "from-violet-600/20 to-violet-900/10",
    border: "border-violet-600/20",
    iconBg: "bg-violet-600/20 border-violet-600/30 text-violet-400",
  },
  {
    name: "Advisory Hub",
    href: "/agronomist/advisory",
    icon: BarChart3,
    description: "NPK fertilizer calculator and regional market arbitrage",
    stat: "Kigali: RWF 480/kg",
    statColor: "text-amber-400",
    alert: "Maize up +4.2%",
    alertColor: "text-emerald-400",
    accent: "from-amber-600/20 to-orange-900/10",
    border: "border-amber-600/20",
    iconBg: "bg-amber-600/20 border-amber-600/30 text-amber-400",
  },
  {
    name: "Workforce Desk",
    href: "/agronomist/workforce",
    icon: Users2,
    description: "Track field visits, offline sync, and team KPI metrics",
    stat: "5 active agents",
    statColor: "text-sky-400",
    alert: "28/30 visits done",
    alertColor: "text-emerald-400",
    accent: "from-sky-600/20 to-slate-900/10",
    border: "border-sky-600/20",
    iconBg: "bg-sky-600/20 border-sky-600/30 text-sky-400",
  },
]

const recentActivity = [
  { icon: AlertTriangle, text: "Uwimana E. reported leaf blight — Bugesera", time: "9m ago", color: "text-rose-400" },
  { icon: CheckCircle2, text: "AI recommendation approved for Habimana P.", time: "22m ago", color: "text-emerald-400" },
  { icon: MessageSquare, text: "Bulk SMS dispatched to 847 COOPAC members", time: "1h ago", color: "text-sky-400" },
  { icon: BrainCircuit, text: "6 validation items flagged for review", time: "1.5h ago", color: "text-amber-400" },
  { icon: FlaskConical, text: "Mancozeb prescription sent to Niyonzima J.", time: "2h ago", color: "text-violet-400" },
  { icon: Map, text: "Drone scan uploaded — Bugesera Sector A (847 tiles)", time: "3h ago", color: "text-emerald-400" },
]

export default function AgronomistOverviewPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-600/20 border border-sky-600/30 flex items-center justify-center">
            <Sprout className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Agronomist Command Centre</h2>
            <p className="text-xs text-slate-400">Welcome back, Jean · Rwanda Agricultural System</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {[
            { label: "Farmers Active", val: "2,847", color: "text-emerald-400" },
            { label: "AI Queue", val: "12", color: "text-amber-400" },
            { label: "Open Tickets", val: "4", color: "text-rose-400" },
            { label: "Field Agents", val: "5", color: "text-sky-400" },
          ].map(s => (
            <div key={s.label} className="text-center border-l border-slate-800 pl-4 first:border-0 first:pl-0">
              <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
              <p className="text-slate-500">{s.label}</p>
            </div>
          ))}
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-medium">
            <Wifi className="w-3.5 h-3.5" />
            System Online
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* KPI Strip */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Tickets Resolved", val: "97", trend: "+18%", icon: CheckCircle2, color: "emerald" },
            { label: "Field Visits", val: "28", trend: "93%", icon: Map, color: "sky" },
            { label: "Messages Sent", val: "1.2K", trend: "98% delivery", icon: MessageSquare, color: "violet" },
            { label: "Avg Confidence", val: "82%", trend: "+3% this week", icon: BrainCircuit, color: "amber" },
            { label: "Yield Improvement", val: "+12%", trend: "Kigali avg", icon: TrendingUp, color: "emerald" },
          ].map(k => (
            <div key={k.label} className={`bg-${k.color}-500/5 border border-${k.color}-500/20 rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <k.icon className={`w-4 h-4 text-${k.color}-400`} />
                <ArrowUpRight className={`w-3.5 h-3.5 text-${k.color}-400 opacity-60`} />
              </div>
              <p className={`text-2xl font-black text-${k.color}-400`}>{k.val}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{k.label}</p>
              <p className={`text-[10px] text-${k.color}-400 mt-0.5 font-medium`}>{k.trend}</p>
            </div>
          ))}
        </div>

        {/* Module Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Core Modules
            </h3>
            <span className="text-xs text-slate-500">Click a module to enter</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {modules.map(mod => (
              <Link
                key={mod.name}
                to={mod.href}
                className={`group relative bg-gradient-to-br ${mod.accent} border ${mod.border} rounded-2xl p-5 hover:border-opacity-60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${mod.iconBg}`}>
                    <mod.icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1 group-hover:text-slate-100">{mod.name}</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{mod.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className={`text-xs font-semibold ${mod.statColor}`}>{mod.stat}</span>
                  <span className={`text-xs ${mod.alertColor}`}>{mod.alert}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom row: Chart + Activity */}
        <div className="grid grid-cols-5 gap-5">
          {/* Weekly activity chart */}
          <div className="col-span-3 bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-slate-200">Weekly Activity</h3>
              </div>
              <div className="flex items-center gap-4 text-xs">
                {[{ label: "Field Visits", color: "#22c55e" }, { label: "New Tickets", color: "#f59e0b" }, { label: "Resolved", color: "#38bdf8" }].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-slate-500">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#475569" fontSize={11} />
                  <YAxis stroke="#475569" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="visits" fill="#22c55e" radius={[3, 3, 0, 0]} name="Field Visits" />
                  <Bar dataKey="tickets" fill="#f59e0b" radius={[3, 3, 0, 0]} name="New Tickets" />
                  <Bar dataKey="resolved" fill="#38bdf8" radius={[3, 3, 0, 0]} name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent activity feed */}
          <div className="col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-200">Activity Feed</h3>
              <span className="ml-auto text-xs text-slate-500">Today</span>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <activity.icon className={`w-3.5 h-3.5 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 leading-relaxed">{activity.text}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
