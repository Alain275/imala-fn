import { useState } from "react"
import {
  Map, Layers, Navigation, Upload, MapPin, Eye, EyeOff,
  Clock, Truck, Radio, AlertTriangle, CheckCircle2,
  ChevronRight, Plus, RotateCcw, Maximize2, ZoomIn,
  ZoomOut, Crosshair, Filter, Download, Camera
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
        return p + 8
      })
    }, 200)
  }

  const severityColor = (s: string) => {
    if (s === "critical") return "text-rose-400 bg-rose-500/10 border-rose-500/30"
    if (s === "warning") return "text-amber-400 bg-amber-500/10 border-amber-500/30"
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
  }

  const healthDot = (h: string) => {
    if (h === "critical") return "bg-rose-500"
    if (h === "warning") return "bg-amber-500"
    return "bg-emerald-500"
  }

  const routeStatusStyle = (s: string) => {
    if (s === "completed") return "bg-emerald-500 text-white"
    if (s === "active") return "bg-sky-500 text-white animate-pulse"
    return "bg-slate-700 text-slate-400"
  }

  const routeIconStyle = (s: string) => {
    if (s === "completed") return "border-emerald-500 bg-emerald-500/10"
    if (s === "active") return "border-sky-500 bg-sky-500/10"
    return "border-slate-700 bg-slate-800"
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center">
            <Map className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">GIS & Field Scouting</h2>
            <p className="text-xs text-slate-400">Spatial Analytics · Rwanda Agricultural Zones</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live · Kigali Province
          </span>
          <button className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Panel */}
        <div className="w-80 flex-shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col overflow-hidden">
          {/* Tab selector */}
          <div className="flex border-b border-slate-800">
            {(["boundaries", "logs", "drone"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab === "boundaries" ? "Field Zones" : tab === "logs" ? "Geo-Tags" : "Drone"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* FIELD BOUNDARIES TAB */}
            {activeTab === "boundaries" && (
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-300">Polygonal Field Boundaries</p>
                  <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors">
                    <Filter className="w-3 h-3" /> Filter
                  </button>
                </div>
                {rwandaDistricts.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDistrict(selectedDistrict === d.id ? null : d.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                      selectedDistrict === d.id
                        ? "bg-emerald-600/15 border-emerald-600/40"
                        : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${healthDot(d.health)}`} />
                        <span className="text-sm font-medium text-slate-200">{d.name}</span>
                      </div>
                      <span className="text-xs text-slate-500">{d.area}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 pl-4">
                      <span>{d.sector} Sector</span>
                      <span>{d.fields} fields</span>
                    </div>
                    {selectedDistrict === d.id && (
                      <div className="mt-2 pt-2 border-t border-slate-700 grid grid-cols-2 gap-2">
                        <div className="bg-slate-900 rounded p-2">
                          <p className="text-[10px] text-slate-500">NDVI Avg</p>
                          <p className="text-sm font-bold text-emerald-400">0.74</p>
                        </div>
                        <div className="bg-slate-900 rounded p-2">
                          <p className="text-[10px] text-slate-500">Soil Moisture</p>
                          <p className="text-sm font-bold text-sky-400">62%</p>
                        </div>
                        <div className="bg-slate-900 rounded p-2">
                          <p className="text-[10px] text-slate-500">Crop Stage</p>
                          <p className="text-sm font-bold text-amber-400">V4</p>
                        </div>
                        <div className="bg-slate-900 rounded p-2">
                          <p className="text-[10px] text-slate-500">Last Scout</p>
                          <p className="text-sm font-bold text-slate-300">2d ago</p>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* GEO-TAGGED LOGS TAB */}
            {activeTab === "logs" && (
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-300">Geo-Tagged Inspection Log</p>
                  <button className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                    <Plus className="w-3 h-3" /> Add Pin
                  </button>
                </div>
                {inspectionLogs.map(log => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-lg border bg-slate-800/50 ${
                      log.severity === "critical" ? "border-rose-500/30" :
                      log.severity === "warning" ? "border-amber-500/30" : "border-slate-700/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${
                          log.severity === "critical" ? "text-rose-400" :
                          log.severity === "warning" ? "text-amber-400" : "text-emerald-400"
                        }`} />
                        <span className="text-xs font-semibold text-slate-200">{log.farmer}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 flex-shrink-0">{log.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-2">{log.note}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">{log.district} · {log.coords}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${severityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* DRONE UPLOAD TAB */}
            {activeTab === "drone" && (
              <div className="p-4 space-y-4">
                <p className="text-xs font-semibold text-slate-300">Drone Scouting Scan Upload</p>

                {/* Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDraggingOver(true) }}
                  onDragLeave={() => setDraggingOver(false)}
                  onDrop={e => { e.preventDefault(); setDraggingOver(false); handleDroneUpload() }}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                    draggingOver
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-700 hover:border-emerald-600/50 hover:bg-slate-800/50"
                  }`}
                  onClick={handleDroneUpload}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-300 font-medium">Drop scan files here</p>
                      <p className="text-xs text-slate-500 mt-1">GeoTIFF, KMZ, SHP supported</p>
                    </div>
                    <button className="text-xs text-emerald-400 border border-emerald-600/30 bg-emerald-600/10 px-3 py-1.5 rounded-lg hover:bg-emerald-600/20 transition-colors">
                      Browse Files
                    </button>
                  </div>
                </div>

                {droneUploading && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-300 font-medium">Processing scan...</span>
                      <span className="text-xs text-emerald-400 font-bold">{droneProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300"
                        style={{ width: `${droneProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5">Georeferencing tiles · Applying NDVI model...</p>
                  </div>
                )}

                {droneProgress === 100 && !droneUploading && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <p className="text-xs text-emerald-300 font-medium">Scan uploaded · 847 tiles processed</p>
                  </div>
                )}

                {/* Previous uploads */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Previous Scans</p>
                  {[
                    { name: "Bugesera_Sector_A.tif", date: "Jun 06", size: "124 MB", tiles: 1204 },
                    { name: "Gatsibo_NE_Zone.kmz", date: "Jun 04", size: "87 MB", tiles: 931 },
                    { name: "Kigali_Pilot_Run.shp", date: "Jun 01", size: "43 MB", tiles: 422 },
                  ].map(f => (
                    <div key={f.name} className="flex items-center gap-2 p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <Camera className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 font-medium truncate">{f.name}</p>
                        <p className="text-[10px] text-slate-500">{f.date} · {f.size} · {f.tiles} tiles</p>
                      </div>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Map Canvas */}
        <div className="flex-1 flex flex-col relative">
          {/* Map toolbar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-900/80 backdrop-blur z-10">
            <span className="text-xs text-slate-500 font-medium mr-1">Overlays:</span>
            {(["ndvi", "moisture", "none"] as Layer[]).map(layer => (
              <button
                key={layer}
                onClick={() => setActiveLayer(layer)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  activeLayer === layer
                    ? layer === "ndvi" ? "bg-emerald-600/20 border-emerald-600/40 text-emerald-300"
                      : layer === "moisture" ? "bg-sky-600/20 border-sky-600/40 text-sky-300"
                      : "bg-slate-700 border-slate-600 text-slate-200"
                    : "bg-transparent border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                }`}
              >
                {layer === "ndvi" ? "🌿 NDVI" : layer === "moisture" ? "💧 Soil Moisture" : "🗺 Base"}
              </button>
            ))}
            <div className="h-4 w-px bg-slate-700 mx-1" />
            <button
              onClick={() => setShowBoundaries(!showBoundaries)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                showBoundaries ? "bg-violet-600/20 border-violet-600/40 text-violet-300" : "border-slate-700 text-slate-500"
              }`}
            >
              {showBoundaries ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              Boundaries
            </button>
            <button
              onClick={() => setShowPins(!showPins)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                showPins ? "bg-rose-600/20 border-rose-600/40 text-rose-300" : "border-slate-700 text-slate-500"
              }`}
            >
              {showPins ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              Pins
            </button>
            <div className="ml-auto flex items-center gap-1">
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors border border-slate-700"><ZoomIn className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors border border-slate-700"><ZoomOut className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors border border-slate-700"><Crosshair className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors border border-slate-700"><Maximize2 className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors border border-slate-700"><RotateCcw className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Map Canvas */}
          <div className="relative flex-1 overflow-hidden bg-slate-900">
            {/* Simulated satellite map */}
            <div className="absolute inset-0" style={{
              backgroundImage: `
                radial-gradient(ellipse at 20% 30%, rgba(34,197,94,0.06) 0%, transparent 60%),
                radial-gradient(ellipse at 70% 60%, rgba(34,197,94,0.04) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 80%, rgba(34,197,94,0.08) 0%, transparent 40%),
                linear-gradient(180deg, #0f172a 0%, #0d1a12 50%, #0a1a0d 100%)
              `
            }} />

            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `
                linear-gradient(rgba(100,116,139,0.4) 1px, transparent 1px),
                linear-gradient(90deg, rgba(100,116,139,0.4) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px"
            }} />

            {/* Topographic contour lines */}
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

            {/* NDVI overlay */}
            {activeLayer === "ndvi" && (
              <div className="absolute inset-0 pointer-events-none">
                {[
                  { left: "12%", top: "20%", w: 180, h: 120, opacity: 0.45, color: "#22c55e" },
                  { left: "38%", top: "12%", w: 130, h: 90, opacity: 0.35, color: "#16a34a" },
                  { left: "60%", top: "35%", w: 200, h: 130, opacity: 0.5, color: "#22c55e" },
                  { left: "25%", top: "55%", w: 160, h: 100, opacity: 0.4, color: "#4ade80" },
                  { left: "70%", top: "60%", w: 120, h: 80, opacity: 0.3, color: "#86efac" },
                  { left: "45%", top: "70%", w: 140, h: 90, opacity: 0.25, color: "#ef4444" },
                  { left: "8%", top: "65%", w: 100, h: 70, opacity: 0.3, color: "#eab308" },
                ].map((blob, i) => (
                  <div key={i} className="absolute rounded-full blur-2xl transition-all duration-500" style={{
                    left: blob.left, top: blob.top,
                    width: blob.w, height: blob.h,
                    backgroundColor: blob.color,
                    opacity: blob.opacity,
                  }} />
                ))}
                {/* NDVI legend */}
                <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-3">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-2">NDVI Index</p>
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-24 h-3 rounded-full" style={{ background: "linear-gradient(to right, #ef4444, #eab308, #22c55e, #166534)" }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 w-24">
                    <span>0.0</span><span>0.5</span><span>1.0</span>
                  </div>
                </div>
              </div>
            )}

            {/* Soil Moisture overlay */}
            {activeLayer === "moisture" && (
              <div className="absolute inset-0 pointer-events-none">
                {[
                  { left: "15%", top: "25%", w: 160, h: 110, opacity: 0.4, color: "#0ea5e9" },
                  { left: "42%", top: "15%", w: 110, h: 80, opacity: 0.3, color: "#38bdf8" },
                  { left: "65%", top: "40%", w: 170, h: 120, opacity: 0.45, color: "#0ea5e9" },
                  { left: "28%", top: "58%", w: 140, h: 95, opacity: 0.35, color: "#7dd3fc" },
                  { left: "72%", top: "65%", w: 100, h: 75, opacity: 0.25, color: "#bae6fd" },
                  { left: "48%", top: "72%", w: 120, h: 85, opacity: 0.2, color: "#e0f2fe" },
                ].map((blob, i) => (
                  <div key={i} className="absolute rounded-full blur-3xl transition-all duration-500" style={{
                    left: blob.left, top: blob.top,
                    width: blob.w, height: blob.h,
                    backgroundColor: blob.color,
                    opacity: blob.opacity,
                  }} />
                ))}
                {/* Moisture percentages */}
                {[
                  { left: "18%", top: "28%", val: "74%" },
                  { left: "47%", top: "18%", val: "58%" },
                  { left: "67%", top: "43%", val: "81%" },
                  { left: "30%", top: "62%", val: "62%" },
                ].map((label, i) => (
                  <div key={i} className="absolute bg-slate-900/80 border border-sky-500/30 rounded px-1.5 py-0.5 text-[10px] text-sky-300 font-bold" style={{ left: label.left, top: label.top }}>
                    {label.val}
                  </div>
                ))}
                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-3">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-2">Soil Moisture %</p>
                  <div className="w-24 h-3 rounded-full mb-1" style={{ background: "linear-gradient(to right, #eff6ff, #7dd3fc, #0ea5e9, #0369a1)" }} />
                  <div className="flex justify-between text-[10px] text-slate-500 w-24">
                    <span>0%</span><span>50%</span><span>100%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Field boundary polygons */}
            {showBoundaries && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
                <polygon points="120,80 280,60 310,160 150,180" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4,2" />
                <polygon points="350,50 480,40 510,130 370,140" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4,2" />
                <polygon points="530,200 700,180 720,310 540,320" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4,2" />
                <polygon points="80,260 230,240 260,360 90,380" fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,2" />
                <polygon points="290,360 450,350 470,440 310,455" fill="rgba(234,179,8,0.08)" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="180" y="130" fill="#22c55e" fontSize="11" textAnchor="middle" opacity="0.8">Gasabo</text>
                <text x="425" y="95" fill="#22c55e" fontSize="11" textAnchor="middle" opacity="0.8">Gatsibo</text>
                <text x="625" y="255" fill="#22c55e" fontSize="11" textAnchor="middle" opacity="0.8">Kirehe</text>
                <text x="165" y="320" fill="#ef4444" fontSize="11" textAnchor="middle" opacity="0.8">Bugesera</text>
                <text x="380" y="405" fill="#eab308" fontSize="11" textAnchor="middle" opacity="0.8">Kicukiro</text>
              </svg>
            )}

            {/* Geo pins */}
            {showPins && (
              <div className="absolute inset-0 pointer-events-none">
                {[
                  { left: "22%", top: "32%", type: "critical" },
                  { left: "47%", top: "18%", type: "warning" },
                  { left: "67%", top: "52%", type: "ok" },
                  { left: "20%", top: "62%", type: "critical" },
                  { left: "37%", top: "75%", type: "warning" },
                ].map((pin, i) => (
                  <div key={i} className="absolute" style={{ left: pin.left, top: pin.top }}>
                    <div className={`w-3 h-3 rounded-full border-2 border-white shadow-lg ${
                      pin.type === "critical" ? "bg-rose-500" :
                      pin.type === "warning" ? "bg-amber-500" : "bg-emerald-500"
                    }`} />
                    {pin.type === "critical" && (
                      <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-40" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Coords readout */}
            <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg px-3 py-1.5">
              <p className="text-[11px] text-slate-400 font-mono">-1.9441°N &nbsp;30.0619°E &nbsp;|&nbsp; Zoom 12 &nbsp;|&nbsp; WGS84</p>
            </div>
          </div>
        </div>

        {/* Right Panel — Route Timeline */}
        <div className="w-72 flex-shrink-0 border-l border-slate-800 bg-slate-900 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Navigation className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-semibold text-slate-200">Route Optimization</h3>
            </div>
            <p className="text-xs text-slate-500">Daily field visit itinerary · Jun 8</p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-px border-b border-slate-800 bg-slate-800">
            {[
              { label: "Stops", val: "7" },
              { label: "Distance", val: "142km" },
              { label: "ETA", val: "6.5h" },
            ].map(s => (
              <div key={s.label} className="bg-slate-900 py-2.5 text-center">
                <p className="text-base font-bold text-white">{s.val}</p>
                <p className="text-[10px] text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-800" />

              <div className="space-y-3">
                {routeStops.map((stop, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    {/* Timeline node */}
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 ${routeIconStyle(stop.status)}`}>
                      {stop.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : stop.type === "hub" ? (
                        <Radio className="w-3.5 h-3.5 text-slate-400" />
                      ) : stop.type === "office" ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 p-2.5 rounded-lg border transition-all ${
                      stop.status === "active"
                        ? "bg-sky-500/10 border-sky-500/30"
                        : stop.status === "completed"
                        ? "bg-slate-800/30 border-slate-700/30 opacity-70"
                        : "bg-slate-800/50 border-slate-700/50"
                    }`}>
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-semibold text-slate-200 leading-tight">{stop.location}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${routeStatusStyle(stop.status)}`}>
                          {stop.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{stop.time}</span>
                        {stop.duration !== "–" && (
                          <>
                            <span>·</span>
                            <Truck className="w-3 h-3" />
                            <span>{stop.duration}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Route actions */}
          <div className="px-3 py-3 border-t border-slate-800 space-y-2">
            <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600/20 border border-emerald-600/30 text-sm text-emerald-300 font-medium hover:bg-emerald-600/30 transition-colors">
              <Navigation className="w-4 h-4" /> Start Navigation
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-400 font-medium hover:bg-slate-700 transition-colors">
              <RotateCcw className="w-4 h-4" /> Re-optimize Route
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
