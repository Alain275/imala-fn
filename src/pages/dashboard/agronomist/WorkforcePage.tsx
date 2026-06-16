import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import {
  Users2, Download, Clock, MapPin,
  Calendar, Target,
  Wifi, WifiOff, HardDrive, Database, Map,
  Phone, BarChart2, Award,
  ArrowUpRight, ArrowDownRight, Star
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts"

const yieldCurveData = [
  { week: "W1", kigali: 72, eastern: 65, northern: 58 },
  { week: "W2", kigali: 75, eastern: 68, northern: 61 },
  { week: "W3", kigali: 74, eastern: 71, northern: 66 },
  { week: "W4", kigali: 78, eastern: 74, northern: 70 },
  { week: "W5", kigali: 80, eastern: 77, northern: 73 },
  { week: "W6", kigali: 83, eastern: 79, northern: 76 },
  { week: "W7", kigali: 85, eastern: 82, northern: 79 },
  { week: "W8", kigali: 87, eastern: 84, northern: 82 },
]

const ticketResolutionData = [
  { day: "Mon", resolved: 12, escalated: 3 },
  { day: "Tue", resolved: 18, escalated: 2 },
  { day: "Wed", resolved: 14, escalated: 5 },
  { day: "Thu", resolved: 22, escalated: 1 },
  { day: "Fri", resolved: 16, escalated: 4 },
  { day: "Sat", resolved: 9, escalated: 2 },
  { day: "Sun", resolved: 6, escalated: 1 },
]

const itinerary = [
  { time: "07:00", farmer: "Dept. Briefing", location: "IMARA Kigali HQ", type: "office", status: "done", crop: "—", duration: "30 min", notes: "Daily sync with district leads" },
  { time: "08:15", farmer: "Uwimana Esperance", location: "Nyamata, Bugesera", type: "farm", status: "done", crop: "Maize", duration: "45 min", notes: "Disease follow-up · Leaf blight" },
  { time: "09:30", farmer: "Habimana Pierre", location: "Remera, Gasabo", type: "farm", status: "active", crop: "Irish Potato", duration: "40 min", notes: "NPK prescription delivery" },
  { time: "10:45", farmer: "COOPAC Coop Meeting", location: "Kayonza Hub", type: "meeting", status: "pending", crop: "Various", duration: "60 min", notes: "Quarterly market advisory" },
  { time: "12:15", farmer: "Lunch Break", location: "Kayonza Town", type: "break", status: "pending", crop: "—", duration: "45 min", notes: "" },
  { time: "13:15", farmer: "Niyonzima Jean", location: "Kabarore, Gatsibo", type: "farm", status: "pending", crop: "Sorghum", duration: "50 min", notes: "Fungal treatment verification" },
  { time: "14:30", farmer: "Mukamana Francoise", location: "Niboye, Kicukiro", type: "farm", status: "pending", crop: "Beans", duration: "35 min", notes: "Inoculation follow-up" },
  { time: "15:30", farmer: "Bizimana Claude", location: "Mahama, Kirehe", type: "farm", status: "pending", crop: "Rice", duration: "45 min", notes: "Irrigation system check" },
  { time: "17:00", farmer: "End-of-Day Report", location: "IMARA Field Office", type: "office", status: "pending", crop: "—", duration: "30 min", notes: "Submit visit logs" },
]

const cacheItems = [
  { id: 1, name: "Farmer Directory", description: "2,847 farmer profiles with contacts", icon: Database, size: "124 MB", priority: "critical" },
  { id: 2, name: "Spatial Tile Layers", description: "NDVI + soil moisture rasters for 12 districts", icon: Map, size: "847 MB", priority: "high" },
  { id: 3, name: "Offline Profile Records", description: "Full agronomy histories & soil test logs", icon: HardDrive, size: "238 MB", priority: "high" },
  { id: 4, name: "Prescription Templates", description: "SMS & USSD treatment response templates", icon: Phone, size: "18 MB", priority: "medium" },
  { id: 5, name: "Market Price Cache", description: "48h offline market price snapshots", icon: BarChart2, size: "42 MB", priority: "medium" },
]

const agronomists = [
  { name: "Jean Mugabo", role: "Sr. Agronomist", visits: 28, resolved: 94, yield: "+14%", rating: 4.9, district: "Kigali", status: "active" },
  { name: "Amina Uwase", role: "Field Officer", visits: 22, resolved: 87, yield: "+11%", rating: 4.7, district: "Eastern", status: "active" },
  { name: "Patrick Nkusi", role: "Agronomist", visits: 19, resolved: 76, yield: "+9%", rating: 4.5, district: "Northern", status: "on_leave" },
  { name: "Grace Ingabire", role: "Field Officer", visits: 31, resolved: 102, yield: "+17%", rating: 4.8, district: "Southern", status: "active" },
  { name: "Eric Ndayisaba", role: "Jr. Agronomist", visits: 14, resolved: 58, yield: "+7%", rating: 4.3, district: "Western", status: "active" },
]

interface CacheProgress { [key: number]: number }

export default function WorkforcePage() {
  const [cacheProgress, setCacheProgress] = useState<CacheProgress>({})
  const [syncing, setSyncing] = useState<number[]>([])
  const [syncAll, setSyncAll] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [kpiTab, setKpiTab] = useState<"tickets" | "yield" | "team">("tickets")

  const startSync = (id: number) => {
    if (syncing.includes(id)) return
    setSyncing(s => [...s, id])
    setCacheProgress(p => ({ ...p, [id]: 0 }))
    const interval = setInterval(() => {
      setCacheProgress(p => {
        const current = p[id] ?? 0
        if (current >= 100) {
          clearInterval(interval)
          setSyncing(s => s.filter(i => i !== id))
          return p
        }
        return { ...p, [id]: current + Math.floor(Math.random() * 12) + 4 }
      })
    }, 250)
  }

  const startSyncAll = () => {
    setSyncAll(true)
    cacheItems.forEach((item, idx) => {
      setTimeout(() => startSync(item.id), idx * 600)
    })
  }

  const getProgress = (id: number) => Math.min(cacheProgress[id] ?? 0, 100)
  const isDone = (id: number) => getProgress(id) === 100

  const typeStyle = (type: string) => {
    const map: Record<string, string> = {
      farm: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
      office: "bg-muted border-border text-muted-foreground",
      meeting: "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400",
      break: "bg-muted/50 border-border text-muted-foreground",
    }
    return map[type] ?? "bg-muted border-border text-muted-foreground"
  }



  const statusLabel = (s: string) => {
    if (s === "done") return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
    if (s === "active") return "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400"
    return "bg-muted border-border text-muted-foreground"
  }

  const tooltipStyle = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        title="Workforce & Field Operations"
        subtitle="Offline Sync · Daily Itinerary · KPI Dashboard"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Quick KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Field Team Active", val: `${agronomists.filter(a => a.status === "active").length}`, gradient: "green" as const, icon: Users2 },
            { label: "Visits This Week", val: "28", gradient: "sky" as const, icon: MapPin },
            { label: "Tickets Resolved", val: "97", gradient: "gold" as const, icon: Award },
            { label: "Connection", val: isOnline ? "Online" : "Offline", gradient: isOnline ? "leaf" as const : "earth" as const, icon: isOnline ? Wifi : WifiOff },
          ].map(s => (
            <Card key={s.label} className="border-0 shadow-md card-hover">
              <CardContent className="p-4 flex items-center gap-4">
                <Icon3D gradient={s.gradient} size="md">
                  <s.icon className="w-5 h-5" />
                </Icon3D>
                <div>
                  <p className="text-2xl font-black text-foreground">{s.val}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Row 1: Offline Sync + Itinerary */}
        <div className="grid grid-cols-5 gap-6">

          {/* Offline Sync Terminal */}
          <Card className="col-span-2 border-0 shadow-md flex flex-col">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-sm">
                  <Icon3D gradient="sky" size="sm">
                    <HardDrive className="w-4 h-4" />
                  </Icon3D>
                  Offline Field-Cache
                </CardTitle>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsOnline(!isOnline)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                      isOnline ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                    }`}>
                    {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {isOnline ? "Online" : "Offline"}
                  </button>
                  <button onClick={startSyncAll} disabled={syncAll}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                      syncAll ? "bg-muted border-border text-muted-foreground cursor-not-allowed" : "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20"
                    }`}>
                    <Download className="w-3 h-3" /> Sync All
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-3 space-y-2">
              {cacheItems.map(item => {
                const prog = getProgress(item.id)
                const done = isDone(item.id)
                const isSyncing = syncing.includes(item.id)
                return (
                  <div key={item.id} className={`p-3 rounded-xl border transition-all ${done ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/40 border-border"}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${done ? "bg-emerald-500/10 border-emerald-500/20" : "bg-muted border-border"}`}>
                          <item.icon className={`w-4 h-4 ${done ? "text-emerald-500" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.size}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                        item.priority === "critical" ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400" :
                        item.priority === "high" ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" :
                        "bg-muted border-border text-muted-foreground"
                      }`}>{item.priority}</span>
                    </div>
                    {(isSyncing || done || prog > 0) ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">{done ? "Cached ✓" : `Downloading... ${prog}%`}</span>
                          <span className={`text-[10px] font-bold ${done ? "text-emerald-500" : "text-sky-500"}`}>{prog}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${done ? "bg-emerald-500" : "bg-sky-500"}`} style={{ width: `${prog}%` }} />
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => startSync(item.id)} disabled={!isOnline}
                        className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          isOnline ? "bg-muted border-border text-muted-foreground hover:border-sky-500/30 hover:text-sky-500" : "bg-muted/50 border-border text-muted-foreground/50 cursor-not-allowed"
                        }`}>
                        <Download className="w-3 h-3" /> Download to Device
                      </button>
                    )}
                  </div>
                )
              })}
            </CardContent>
            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Device Storage</span>
                <span className="text-foreground font-medium">1.27 GB / 8 GB</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-[16%] bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full" />
              </div>
            </div>
          </Card>

          {/* Daily Itinerary */}
          <Card className="col-span-3 border-0 shadow-md flex flex-col">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-sm">
                  <Icon3D gradient="green" size="sm">
                    <Calendar className="w-4 h-4" />
                  </Icon3D>
                  Daily Itinerary
                  <span className="text-xs text-muted-foreground font-normal">Jun 8, 2026 · Jean Mugabo</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{itinerary.filter(i => i.status === "done").length}/{itinerary.length} done</span>
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(itinerary.filter(i => i.status === "done").length / itinerary.length) * 100}%` }} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              {/* Active visit banner */}
              {itinerary.filter(i => i.status === "active").map(activeVisit => (
                <div key={activeVisit.time} className="mb-4 bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-sky-500 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-sky-600 dark:text-sky-400 font-bold uppercase tracking-widest">Currently Visiting</p>
                    <p className="text-sm font-semibold text-foreground">{activeVisit.farmer} · {activeVisit.location}</p>
                    <p className="text-xs text-muted-foreground">{activeVisit.crop} · {activeVisit.notes}</p>
                  </div>
                  <p className="text-sm font-bold text-sky-600 dark:text-sky-400">{activeVisit.time}</p>
                </div>
              ))}

              <div className="relative space-y-1.5">
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border" />
                {itinerary.map((visit, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    <div className="flex-shrink-0 w-7 flex flex-col items-center z-10">
                      <span className="text-[10px] text-muted-foreground font-mono mb-1">{visit.time}</span>
                      <div className={`w-3 h-3 rounded-full border-2 ${
                        visit.status === "done" ? "border-emerald-500 bg-emerald-500" :
                        visit.status === "active" ? "border-sky-400 bg-sky-400" :
                        "border-border bg-card"
                      }`} />
                    </div>
                    <div className={`flex-1 mb-1 p-2.5 rounded-xl border transition-all ${
                      visit.status === "active" ? "bg-sky-500/5 border-sky-500/20" :
                      visit.status === "done" ? "bg-muted/30 border-border opacity-60" :
                      visit.type === "break" ? "bg-muted/20 border-border opacity-70" :
                      "bg-muted/40 border-border"
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-foreground">{visit.farmer}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${typeStyle(visit.type)}`}>{visit.type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <MapPin className="w-3 h-3" />{visit.location}
                            {visit.crop !== "—" && <><span>·</span><span className="text-emerald-600 dark:text-emerald-400">{visit.crop}</span></>}
                            <Clock className="w-3 h-3" />{visit.duration}
                          </div>
                          {visit.notes && <p className="text-[10px] text-muted-foreground mt-0.5 italic">{visit.notes}</p>}
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium flex-shrink-0 ${statusLabel(visit.status)}`}>
                          {visit.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI Dashboard */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-base">
                <Icon3D gradient="gold" size="sm">
                  <Target className="w-4 h-4" />
                </Icon3D>
                Performance KPI Dashboard
              </CardTitle>
              <div className="flex gap-2">
                {(["tickets", "yield", "team"] as const).map(tab => (
                  <button key={tab} onClick={() => setKpiTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      kpiTab === tab ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" : "border-border text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
                    }`}>
                    {tab === "tickets" ? "Ticket Resolution" : tab === "yield" ? "Yield Improvement" : "Team Performance"}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          {kpiTab === "tickets" && (
            <CardContent className="p-5">
              <div className="grid grid-cols-5 gap-3 mb-5">
                {[
                  { label: "Tickets Resolved", val: "97", sub: "this week", trend: "+18%", up: true, colorClass: "text-emerald-500", bgClass: "bg-emerald-500/5 border-emerald-500/20" },
                  { label: "Avg Resolution", val: "4.2h", sub: "vs 6.1h last week", trend: "-31%", up: true, colorClass: "text-sky-500", bgClass: "bg-sky-500/5 border-sky-500/20" },
                  { label: "Field Visits", val: "28", sub: "of 30 planned", trend: "93%", up: true, colorClass: "text-violet-500", bgClass: "bg-violet-500/5 border-violet-500/20" },
                  { label: "Escalation Rate", val: "12%", sub: "below 15% target", trend: "-3%", up: true, colorClass: "text-emerald-500", bgClass: "bg-emerald-500/5 border-emerald-500/20" },
                  { label: "Satisfaction", val: "4.7★", sub: "out of 5.0", trend: "+0.3", up: true, colorClass: "text-amber-500", bgClass: "bg-amber-500/5 border-amber-500/20" },
                ].map(k => (
                  <div key={k.label} className={`border rounded-xl p-3.5 ${k.bgClass}`}>
                    <p className="text-[10px] text-muted-foreground mb-1">{k.label}</p>
                    <p className={`text-2xl font-black ${k.colorClass}`}>{k.val}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</p>
                    <div className={`flex items-center gap-1 mt-1.5 text-xs font-semibold ${k.up ? "text-emerald-500" : "text-rose-500"}`}>
                      {k.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {k.trend}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mb-2">Daily Ticket Resolution (This Week)</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ticketResolutionData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="resolved" fill="#22c55e" radius={[4, 4, 0, 0]} name="Resolved" />
                    <Bar dataKey="escalated" fill="#ef4444" radius={[4, 4, 0, 0]} name="Escalated" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          )}

          {kpiTab === "yield" && (
            <CardContent className="p-5">
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Kigali Province", val: "+14.2%", colorClass: "text-emerald-500", bgClass: "bg-emerald-500/5 border-emerald-500/20" },
                  { label: "Eastern Province", val: "+11.8%", colorClass: "text-sky-500", bgClass: "bg-sky-500/5 border-sky-500/20" },
                  { label: "Northern Province", val: "+9.5%", colorClass: "text-violet-500", bgClass: "bg-violet-500/5 border-violet-500/20" },
                ].map(k => (
                  <div key={k.label} className={`border rounded-xl p-4 text-center ${k.bgClass}`}>
                    <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
                    <p className={`text-3xl font-black ${k.colorClass}`}>{k.val}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Sector Yield Improvement · 8wk avg</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mb-2">8-Week Sector Yield Improvement Curves (%)</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yieldCurveData}>
                    <defs>
                      {[{ id: "kg2", color: "#22c55e" }, { id: "ea2", color: "#38bdf8" }, { id: "no2", color: "#a78bfa" }].map(g => (
                        <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={g.color} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} domain={[50, 100]} unit="%" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="kigali" stroke="#22c55e" fill="url(#kg2)" name="Kigali" strokeWidth={2} />
                    <Area type="monotone" dataKey="eastern" stroke="#38bdf8" fill="url(#ea2)" name="Eastern" strokeWidth={2} />
                    <Area type="monotone" dataKey="northern" stroke="#a78bfa" fill="url(#no2)" name="Northern" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          )}

          {kpiTab === "team" && (
            <CardContent className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Agronomist", "District", "Field Visits", "Tickets Resolved", "Yield Impact", "Rating", "Status"].map(h => (
                        <th key={h} className="text-left pb-3 pr-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {agronomists.map((ag, idx) => (
                      <tr key={ag.name} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                              idx === 0 ? "bg-gradient-to-br from-emerald-500 to-emerald-600" :
                              idx === 3 ? "bg-gradient-to-br from-violet-500 to-violet-600" :
                              "bg-gradient-to-br from-muted-foreground/50 to-muted-foreground/70"
                            }`}>
                              {ag.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                {ag.name}
                                {idx === 3 && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{ag.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{ag.district}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-sm font-bold text-foreground">{ag.visits}</span>
                          <span className="text-[10px] text-muted-foreground ml-1">visits</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-sm font-bold text-emerald-500">{ag.resolved}</span>
                          <span className="text-[10px] text-muted-foreground ml-1">cases</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`text-sm font-bold ${ag.yield.startsWith("+") ? "text-emerald-500" : "text-rose-500"}`}>{ag.yield}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-bold text-foreground">{ag.rating}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`text-[10px] px-2 py-1 rounded border font-medium ${
                            ag.status === "active" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                          }`}>
                            {ag.status === "active" ? "Active" : "On Leave"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
