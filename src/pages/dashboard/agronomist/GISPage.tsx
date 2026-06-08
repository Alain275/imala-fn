import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Map, Layers, Navigation, Upload, MapPin, Eye, EyeOff,
  Clock, CheckCircle2,
  Plus, RotateCcw, Maximize2, ZoomIn,
  ZoomOut, Crosshair, Filter, Camera
} from "lucide-react"

const rwandaDistricts = [
  { id: 1, name: "Gasabo", sector: "Remera", fields: 14, health: "good", area: "2.3 ha" },
  { id: 2, name: "Kicukiro", sector: "Niboye", fields: 8, health: "warning", area: "1.8 ha" },
  { id: 3, name: "Nyarugenge", sector: "Gitega", fields: 22, health: "good", area: "4.1 ha" },
  { id: 4, name: "Bugesera", sector: "Nyamata", fields: 31, health: "critical", area: "7.5 ha" },
  { id: 5, name: "Gatsibo", sector: "Kabarore", fields: 19, health: "good", area: "5.2 ha" },
  { id: 6, name: "Kayonza", sector: "Ruramira", fields: 11, health: "warning", area: "3.0 ha" },
  { id: 7, name: "Kirehe", sector: "Mahama", fields: 27, health: "good", area: "6.8 ha" },
  { id: 8, name: "Ngoma", sector: "Zaza", fields: 9, health: "critical", area: "2.1 ha" },
]

const inspectionLogs = [
  { id: 1, farmer: "Uwimana E.", district: "Bugesera", note: "Severe leaf curl on maize crop — water stress suspected", time: "08:24 AM", severity: "critical", coords: "-2.147, 30.069" },
  { id: 2, farmer: "Habimana P.", district: "Gasabo", note: "Yellowing observed in upper leaf canopy — N-deficiency", time: "07:55 AM", severity: "warning", coords: "-1.921, 30.131" },
  { id: 3, farmer: "Mukamana F.", district: "Kicukiro", note: "Bean pods developing well, no stress markers", time: "Yesterday", severity: "ok", coords: "-1.998, 30.103" },
  { id: 4, farmer: "Niyonzima J.", district: "Gatsibo", note: "Fungal lesions on sorghum stems — lab sample collected", time: "Yesterday", severity: "critical", coords: "-1.553, 30.472" },
  { id: 5, farmer: "Bizimana C.", district: "Kirehe", note: "Irrigation channel blocked — drainage review needed", time: "2 days ago", severity: "warning", coords: "-2.261, 30.663" },
]

const routeStops = [
  { time: "07:00", location: "Kigali Office", type: "start", duration: "–", status: "completed" },
  { time: "08:15", location: "Uwimana Farm, Bugesera", type: "farm", duration: "45 min", status: "completed" },
  { time: "09:30", location: "Habimana Plot, Gasabo", type: "farm", duration: "30 min", status: "active" },
  { time: "10:45", location: "Cooperative Hub, Kayonza", type: "hub", duration: "20 min", status: "pending" },
  { time: "11:30", location: "Niyonzima Fields, Gatsibo", type: "farm", duration: "60 min", status: "pending" },
  { time: "13:00", location: "Musanze Extension Office", type: "office", duration: "45 min", status: "pending" },
  { time: "14:30", location: "Bizimana Homestead, Kirehe", type: "farm", duration: "50 min", status: "pending" },
]

type Layer = "ndvi" | "moisture" | "none"
type SelectedDistrict = number | null

export default function GISPage() {
  const [activeLayer, setActiveLayer] = useState<Layer>("ndvi")
  const [showBoundaries, setShowBoundaries] = useState(true)
  const [showPins, setShowPins] = useState(true)
  const [selectedDistrict, setSelectedDistrict] = useState<SelectedDistrict>(null)
  const [droneUploading, setDroneUploading] = useState(false)
  const [droneProgress, setDroneProgress] = useState(0)
  const [activeTab, setActiveTab] = useState<"boundaries" | "logs" | "drone">("boundaries")
  const [draggingOver, setDraggingOver] = useState(false)

  const handleDroneUpload = () => {
    setDroneUploading(true)
    setDroneProgress(0)
    const interval = setInterval(() => {
      setDroneProgress(p => {
        if (p >= 100) { clearInterval(interval); setDroneUploading(false); return 100 }
        return p + 10
      })
    }, 200)
  }

  const severityStyle = (s: string) => {
    if (s === "critical") return "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/20 dark:border-rose-900/30"
    if (s === "warning") return "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/30"
    return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/30"
  }

  const healthDot = (h: string) => {
    if (h === "critical") return "bg-rose-500"
    if (h === "warning") return "bg-amber-500"
    return "bg-emerald-500"
  }

  const routeStatusStyle = (s: string) => {
    if (s === "completed") return "bg-emerald-500 text-white"
    if (s === "active") return "bg-sky-500 text-white animate-pulse"
    return "bg-muted text-muted-foreground"
  }

  const routeIconStyle = (s: string) => {
    if (s === "completed") return "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
    if (s === "active") return "border-sky-500 bg-sky-50 dark:bg-sky-950/20"
    return "border-border bg-muted"
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        title="GIS & Field Scouting"
        subtitle="Spatial analytics, district boundaries & drone telemetry scans"
      />

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-73px)]">
        {/* Left Tab Panel */}
        <div className="w-80 flex-shrink-0 border-r border-border bg-card flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border bg-muted/30">
            {(["boundaries", "logs", "drone"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-semibold capitalize transition-all border-b-2 ${
                  activeTab === tab
                    ? "text-primary border-primary bg-background"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}>
                {tab === "boundaries" ? "Field Zones" : tab === "logs" ? "Geo-Tags" : "Drone"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* FIELD ZONES TAB */}
            {activeTab === "boundaries" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider">Field Boundaries</p>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground">
                    <Filter className="w-3.5 h-3.5 mr-1" /> Filter
                  </Button>
                </div>
                {rwandaDistricts.map(d => (
                  <button key={d.id} onClick={() => setSelectedDistrict(selectedDistrict === d.id ? null : d.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedDistrict === d.id
                        ? "bg-primary/5 border-primary"
                        : "bg-muted/40 border-border hover:bg-muted hover:border-muted-foreground/30"
                    }`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${healthDot(d.health)}`} />
                        <span className="text-sm font-semibold text-foreground">{d.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{d.area}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pl-4">
                      <span>{d.sector} Sector</span>
                      <span>{d.fields} fields</span>
                    </div>
                    {selectedDistrict === d.id && (
                      <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2">
                        {[
                          { label: "NDVI Avg", val: "0.74", colorClass: "text-emerald-600 dark:text-emerald-400" },
                          { label: "Moisture", val: "62%", colorClass: "text-sky-600 dark:text-sky-400" },
                          { label: "Crop Stage", val: "V4", colorClass: "text-amber-600 dark:text-amber-400" },
                          { label: "Last Scout", val: "2d ago", colorClass: "text-foreground" },
                        ].map(m => (
                          <div key={m.label} className="bg-background rounded-lg p-2 border border-border">
                            <p className="text-[10px] text-muted-foreground">{m.label}</p>
                            <p className={`text-sm font-bold ${m.colorClass}`}>{m.val}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* GEO-TAGGED LOGS */}
            {activeTab === "logs" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider">Inspection Log</p>
                  <Button variant="outline" size="sm" className="h-7 text-xs text-primary gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Pin
                  </Button>
                </div>
                {inspectionLogs.map(log => (
                  <div key={log.id} className={`p-3 rounded-xl border bg-muted/30 ${
                    log.severity === "critical" ? "border-rose-200 dark:border-rose-900/30" :
                    log.severity === "warning" ? "border-amber-200 dark:border-amber-900/30" : "border-border"
                  }`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${
                          log.severity === "critical" ? "text-rose-500" :
                          log.severity === "warning" ? "text-amber-500" : "text-emerald-500"
                        }`} />
                        <span className="text-xs font-bold text-foreground">{log.farmer}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{log.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{log.note}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-mono">{log.district}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${severityStyle(log.severity)}`}>
                        {log.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* DRONE UPLOAD */}
            {activeTab === "drone" && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">Drone Scan Upload</p>
                <div
                  onDragOver={e => { e.preventDefault(); setDraggingOver(true) }}
                  onDragLeave={() => setDraggingOver(false)}
                  onDrop={e => { e.preventDefault(); setDraggingOver(false); handleDroneUpload() }}
                  className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                    draggingOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"
                  }`}
                  onClick={handleDroneUpload}>
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground font-semibold">Drop geotagged scan here</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">GeoTIFF, KMZ, SHP (Max 250MB)</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs">Browse Files</Button>
                  </div>
                </div>

                {droneUploading && (
                  <div className="bg-muted/40 rounded-xl p-3 border border-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-semibold">Processing tiles...</span>
                      <span className="text-primary font-bold">{droneProgress}%</span>
                    </div>
                    <Progress value={droneProgress} className="h-1.5" />
                    <p className="text-[10px] text-muted-foreground">Georeferencing boundaries · Applying NDVI model...</p>
                  </div>
                )}

                {droneProgress === 100 && !droneUploading && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">Scan processed · 847 tiles indexed</p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recent Scans</p>
                  {[
                    { name: "Bugesera_Sector_A.tif", date: "Jun 06", size: "124 MB" },
                    { name: "Gatsibo_NE_Zone.kmz", date: "Jun 04", size: "87 MB" },
                  ].map(f => (
                    <div key={f.name} className="flex items-center gap-2.5 p-2 bg-muted/30 rounded-lg border border-border">
                      <Camera className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground font-semibold truncate">{f.name}</p>
                        <p className="text-[10px] text-muted-foreground">{f.date} · {f.size}</p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Map Canvas — intentionally dark (satellite map aesthetic) */}
        <div className="flex-1 flex flex-col relative bg-muted/20">
          {/* Map toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card/90 backdrop-blur-md z-10">
            <span className="text-xs text-muted-foreground font-semibold mr-1">Overlays:</span>
            {(["ndvi", "moisture", "none"] as Layer[]).map(layer => (
              <button key={layer} onClick={() => setActiveLayer(layer)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  activeLayer === layer
                    ? layer === "ndvi" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : layer === "moisture" ? "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400"
                      : "bg-muted border-border text-foreground"
                    : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}>
                {layer === "ndvi" ? "🌿 NDVI" : layer === "moisture" ? "💧 Soil Moisture" : "🗺 Base"}
              </button>
            ))}
            <div className="h-4 w-px bg-border mx-1" />
            <button onClick={() => setShowBoundaries(!showBoundaries)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                showBoundaries ? "bg-primary/10 border-primary/20 text-primary" : "border-transparent text-muted-foreground"
              }`}>
              {showBoundaries ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              Boundaries
            </button>
            <button onClick={() => setShowPins(!showPins)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                showPins ? "bg-rose-500/10 border-rose-500/20 text-rose-600" : "border-transparent text-muted-foreground"
              }`}>
              {showPins ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              Pins
            </button>
            <div className="ml-auto flex items-center gap-1">
              <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"><ZoomIn className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"><ZoomOut className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"><Crosshair className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"><Maximize2 className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"><RotateCcw className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Simulated Satellite Map (dark by design) */}
          <div className="relative flex-1 overflow-hidden bg-slate-900">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                radial-gradient(ellipse at 20% 30%, rgba(34,197,94,0.06) 0%, transparent 60%),
                radial-gradient(ellipse at 70% 60%, rgba(34,197,94,0.04) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 80%, rgba(34,197,94,0.08) 0%, transparent 40%),
                linear-gradient(180deg, #0f172a 0%, #0d1a12 50%, #0a1a0d 100%)
              `
            }} />
            <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
              <ellipse cx="200" cy="180" rx="140" ry="90" fill="none" stroke="#22c55e" strokeWidth="0.8" />
              <ellipse cx="200" cy="180" rx="110" ry="68" fill="none" stroke="#22c55e" strokeWidth="0.6" />
              <ellipse cx="200" cy="180" rx="80" ry="46" fill="none" stroke="#22c55e" strokeWidth="0.5" />
              <ellipse cx="580" cy="300" rx="160" ry="100" fill="none" stroke="#22c55e" strokeWidth="0.8" />
              <ellipse cx="580" cy="300" rx="120" ry="74" fill="none" stroke="#22c55e" strokeWidth="0.6" />
              <ellipse cx="400" cy="380" rx="200" ry="80" fill="none" stroke="#22c55e" strokeWidth="0.7" />
              <path d="M100,400 Q250,350 400,420 Q550,490 700,380" fill="none" stroke="#22c55e" strokeWidth="0.6" />
              <path d="M0,300 Q200,280 400,320 Q600,360 800,290" fill="none" stroke="#22c55e" strokeWidth="0.5" />
            </svg>

            {activeLayer === "ndvi" && (
              <div className="absolute inset-0 pointer-events-none">
                {[
                  { left: "12%", top: "20%", w: 180, h: 120, opacity: 0.45, color: "#22c55e" },
                  { left: "38%", top: "12%", w: 130, h: 90, opacity: 0.35, color: "#16a34a" },
                  { left: "60%", top: "35%", w: 200, h: 130, opacity: 0.5, color: "#22c55e" },
                  { left: "25%", top: "55%", w: 160, h: 100, opacity: 0.4, color: "#4ade80" },
                  { left: "45%", top: "70%", w: 140, h: 90, opacity: 0.25, color: "#ef4444" },
                ].map((blob, i) => (
                  <div key={i} className="absolute rounded-full blur-2xl transition-all duration-500" style={{
                    left: blob.left, top: blob.top, width: blob.w, height: blob.h, backgroundColor: blob.color, opacity: blob.opacity
                  }} />
                ))}
              </div>
            )}

            {activeLayer === "moisture" && (
              <div className="absolute inset-0 pointer-events-none">
                {[
                  { left: "15%", top: "25%", w: 160, h: 110, opacity: 0.4, color: "#0ea5e9" },
                  { left: "65%", top: "40%", w: 170, h: 120, opacity: 0.45, color: "#0ea5e9" },
                  { left: "28%", top: "58%", w: 140, h: 95, opacity: 0.35, color: "#7dd3fc" },
                ].map((blob, i) => (
                  <div key={i} className="absolute rounded-full blur-3xl transition-all duration-500" style={{
                    left: blob.left, top: blob.top, width: blob.w, height: blob.h, backgroundColor: blob.color, opacity: blob.opacity
                  }} />
                ))}
              </div>
            )}

            {showBoundaries && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
                <polygon points="120,80 280,60 310,160 150,180" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4,2" />
                <polygon points="80,260 230,240 260,360 90,380" fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,2" />
                <polygon points="290,360 450,350 470,440 310,455" fill="rgba(234,179,8,0.08)" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="180" y="130" fill="#22c55e" fontSize="11" textAnchor="middle" opacity="0.8">Gasabo</text>
                <text x="165" y="320" fill="#ef4444" fontSize="11" textAnchor="middle" opacity="0.8">Bugesera</text>
                <text x="380" y="405" fill="#eab308" fontSize="11" textAnchor="middle" opacity="0.8">Kicukiro</text>
              </svg>
            )}

            {showPins && (
              <div className="absolute inset-0 pointer-events-none">
                {[
                  { left: "22%", top: "32%", type: "critical" },
                  { left: "20%", top: "62%", type: "critical" },
                  { left: "37%", top: "75%", type: "warning" },
                ].map((pin, i) => (
                  <div key={i} className="absolute animate-pulse" style={{ left: pin.left, top: pin.top }}>
                    <div className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg ${pin.type === "critical" ? "bg-rose-500" : "bg-amber-500"}`} />
                  </div>
                ))}
              </div>
            )}

            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur border border-white/10 rounded-lg px-2.5 py-1">
              <p className="text-[10px] text-white/80 font-mono">-1.9441°N · 30.0619°E · Zoom 12</p>
            </div>
          </div>
        </div>

        {/* Right Route Panel */}
        <div className="w-72 flex-shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-2 mb-1">
              <Navigation className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Route Optimization</h3>
            </div>
            <p className="text-xs text-muted-foreground">Daily field visit itinerary</p>
          </div>

          <div className="grid grid-cols-3 gap-px bg-border border-b border-border">
            {[
              { label: "Stops", val: "7" },
              { label: "Distance", val: "142km" },
              { label: "ETA", val: "6.5h" },
            ].map(s => (
              <div key={s.label} className="bg-card py-2 text-center">
                <p className="text-sm font-bold text-foreground">{s.val}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="relative space-y-4">
              <div className="absolute left-3.5 top-3 bottom-3 w-px bg-border" />
              {routeStops.map((stop, idx) => (
                <div key={idx} className="flex items-start gap-3 relative text-xs">
                  <div className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 z-10 ${routeIconStyle(stop.status)}`}>
                    {stop.status === "completed" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className={`flex-1 p-2.5 rounded-xl border transition-all ${
                    stop.status === "active"
                      ? "bg-sky-500/5 border-sky-300 dark:border-sky-800"
                      : "bg-muted/30 border-border"
                  }`}>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-foreground truncate">{stop.location}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${routeStatusStyle(stop.status)}`}>
                        {stop.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{stop.time}</span>
                      {stop.duration !== "–" && <span>· {stop.duration}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-border space-y-2">
            <Button className="w-full text-xs font-semibold gap-1.5" size="sm">
              <Navigation className="w-4 h-4" /> Start Navigation
            </Button>
            <Button variant="outline" className="w-full text-xs font-semibold gap-1.5" size="sm">
              <RotateCcw className="w-4 h-4" /> Re-optimize Route
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
