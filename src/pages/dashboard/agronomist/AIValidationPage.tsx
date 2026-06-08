import { useState } from "react"
import {
  BrainCircuit, AlertTriangle, CheckCircle2, XCircle,
  ChevronDown, Filter, RefreshCw, Sliders, ThumbsUp,
  ThumbsDown, Edit3, Info, BarChart2, Beaker, Leaf,
  Clock, ArrowUpDown, Wifi, Database
} from "lucide-react"

type QueueStatus = "pending" | "approved" | "rejected" | "modified"
type ErrorCode = "" | "mismatched_soil" | "outdated_window" | "sensor_error" | "region_mismatch" | "crop_stage_error" | "weather_conflict"

interface RecommendationItem {
  id: number
  farmer: string
  district: string
  cropType: string
  recommendation: string
  confidence: number
  soilPH: number
  nitrogenPPM: number
  phosphorusPPM: number
  potassiumPPM: number
  moisturePct: number
  soilType: string
  telemetryAge: string
  status: QueueStatus
  errorCode: ErrorCode
  notes: string
}

const initialQueue: RecommendationItem[] = [
  { id: 1, farmer: "Uwimana E.", district: "Bugesera", cropType: "Maize", recommendation: "Apply 120kg/ha NPK 17-17-17 + 40kg Urea supplement at V6 stage", confidence: 71, soilPH: 5.2, nitrogenPPM: 48, phosphorusPPM: 22, potassiumPPM: 180, moisturePct: 58, soilType: "Sandy Loam", telemetryAge: "3h ago", status: "pending", errorCode: "", notes: "" },
  { id: 2, farmer: "Habimana P.", district: "Gasabo", cropType: "Irish Potato", recommendation: "Reduce nitrogen by 30% due to elevated leaf NDRE index; switch to K-dominant 10-5-25 blend", confidence: 62, soilPH: 6.1, nitrogenPPM: 92, phosphorusPPM: 31, potassiumPPM: 95, moisturePct: 72, soilType: "Clay Loam", telemetryAge: "1h ago", status: "pending", errorCode: "", notes: "" },
  { id: 3, farmer: "Niyonzima J.", district: "Gatsibo", cropType: "Sorghum", recommendation: "Emergency fungicide application (Mancozeb 80WP @ 2.5g/L) — Fusarium risk level HIGH", confidence: 78, soilPH: 5.9, nitrogenPPM: 36, phosphorusPPM: 18, potassiumPPM: 142, moisturePct: 83, soilType: "Silty Clay", telemetryAge: "45m ago", status: "pending", errorCode: "", notes: "" },
  { id: 4, farmer: "Mukamana F.", district: "Kicukiro", cropType: "Beans", recommendation: "Inoculate with Rhizobium leguminosarum at planting; skip synthetic N application this cycle", confidence: 67, soilPH: 6.4, nitrogenPPM: 28, phosphorusPPM: 44, potassiumPPM: 210, moisturePct: 65, soilType: "Sandy Clay", telemetryAge: "6h ago", status: "pending", errorCode: "", notes: "" },
  { id: 5, farmer: "Bizimana C.", district: "Kirehe", cropType: "Rice", recommendation: "Increase irrigation frequency to every 3 days; apply iron chelate to correct Fe-deficiency chlorosis", confidence: 73, soilPH: 5.5, nitrogenPPM: 54, phosphorusPPM: 29, potassiumPPM: 160, moisturePct: 91, soilType: "Heavy Clay", telemetryAge: "2h ago", status: "pending", errorCode: "", notes: "" },
  { id: 6, farmer: "Kagabo R.", district: "Ngoma", cropType: "Maize", recommendation: "Delay planting by 14 days pending rainfall normalization per RMA seasonal model", confidence: 59, soilPH: 6.8, nitrogenPPM: 62, phosphorusPPM: 38, potassiumPPM: 195, moisturePct: 42, soilType: "Loam", telemetryAge: "8h ago", status: "pending", errorCode: "", notes: "" },
]

const errorOptions: { value: ErrorCode; label: string }[] = [
  { value: "", label: "— Select Error Classification —" },
  { value: "mismatched_soil", label: "Mismatched Soil Type" },
  { value: "outdated_window", label: "Outdated Planting Window" },
  { value: "sensor_error", label: "Sensor Telemetry Error" },
  { value: "region_mismatch", label: "Region Climate Mismatch" },
  { value: "crop_stage_error", label: "Crop Stage Calculation Error" },
  { value: "weather_conflict", label: "Weather Model Conflict" },
]

const confidenceBand = (c: number) => {
  if (c >= 75) return { bar: "bg-amber-500", text: "text-amber-400", badge: "bg-amber-500/10 border-amber-500/30 text-amber-400" }
  if (c >= 65) return { bar: "bg-orange-500", text: "text-orange-400", badge: "bg-orange-500/10 border-orange-500/30 text-orange-400" }
  return { bar: "bg-rose-500", text: "text-rose-400", badge: "bg-rose-500/10 border-rose-500/30 text-rose-400" }
}

export default function AIValidationPage() {
  const [queue, setQueue] = useState<RecommendationItem[]>(initialQueue)
  const [selected, setSelected] = useState<RecommendationItem | null>(null)
  const [filterMin, setFilterMin] = useState(0)
  const [sortBy, setSortBy] = useState<"confidence" | "farmer">("confidence")
  const [actionNote, setActionNote] = useState("")
  const [selectedError, setSelectedError] = useState<ErrorCode>("")
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "error" | "warn" } | null>(null)

  const pendingQueue = queue
    .filter(item => item.status === "pending" && item.confidence >= filterMin)
    .sort((a, b) => sortBy === "confidence" ? a.confidence - b.confidence : a.farmer.localeCompare(b.farmer))

  const processedCount = queue.filter(q => q.status !== "pending").length

  const showToast = (msg: string, type: "ok" | "error" | "warn") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAction = (action: "approve" | "reject" | "modify") => {
    if (!selected) return
    if ((action === "reject" || action === "modify") && !selectedError) {
      showToast("Please select an error classification before proceeding.", "warn")
      return
    }
    const newStatus: QueueStatus = action === "approve" ? "approved" : action === "reject" ? "rejected" : "modified"
    setQueue(q => q.map(item =>
      item.id === selected.id ? { ...item, status: newStatus, errorCode: selectedError, notes: actionNote } : item
    ))
    showToast(
      action === "approve" ? `✓ Recommendation approved for ${selected.farmer}` :
      action === "reject" ? `✗ Recommendation rejected — flagged for retraining` :
      `⟳ Parameters modified — queued for re-evaluation`,
      action === "approve" ? "ok" : action === "reject" ? "error" : "warn"
    )
    setSelected(null)
    setActionNote("")
    setSelectedError("")
  }

  const band = selected ? confidenceBand(selected.confidence) : null

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-600/20 border border-amber-600/30 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">AI Validation Engine</h2>
            <p className="text-xs text-slate-400">70/30 Hybrid Loop · Human-in-the-Loop Review</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{pendingQueue.length}</p>
              <p className="text-slate-500">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-400">{queue.filter(q=>q.status==="approved").length}</p>
              <p className="text-slate-500">Approved</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-rose-400">{queue.filter(q=>q.status==="rejected").length}</p>
              <p className="text-slate-500">Rejected</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-sky-400">{queue.filter(q=>q.status==="modified").length}</p>
              <p className="text-slate-500">Modified</p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Sync Engine
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl transition-all ${
          toast.type === "ok" ? "bg-emerald-900/90 border-emerald-500/50 text-emerald-300" :
          toast.type === "error" ? "bg-rose-900/90 border-rose-500/50 text-rose-300" :
          "bg-amber-900/90 border-amber-500/50 text-amber-300"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — Queue Panel */}
        <div className="w-[52%] border-r border-slate-800 flex flex-col overflow-hidden bg-slate-900">
          {/* Queue controls */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-500">Min confidence:</span>
              <input
                type="range" min={0} max={80} step={5} value={filterMin}
                onChange={e => setFilterMin(Number(e.target.value))}
                className="w-24 h-1.5 accent-amber-500"
              />
              <span className="text-xs font-bold text-amber-400 w-8">{filterMin}%</span>
            </div>
            <button
              onClick={() => setSortBy(s => s === "confidence" ? "farmer" : "confidence")}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort: {sortBy === "confidence" ? "Confidence ↑" : "Farmer A-Z"}
            </button>
          </div>

          {/* Confidence threshold banner */}
          <div className="px-4 py-2 bg-amber-500/5 border-b border-amber-500/20 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <p className="text-xs text-amber-400 font-medium">Showing {pendingQueue.length} recommendations below 85% confidence threshold — human review required</p>
          </div>

          {/* Queue list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {pendingQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
                <p className="text-slate-300 font-medium">All items reviewed</p>
                <p className="text-xs text-slate-500 mt-1">Queue is clear — system re-syncing in 15 min</p>
              </div>
            ) : pendingQueue.map(item => {
              const cb = confidenceBand(item.confidence)
              return (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${
                    selected?.id === item.id
                      ? "bg-slate-700 border-amber-500/50"
                      : "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center flex-shrink-0">
                        <Leaf className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{item.farmer}</p>
                        <p className="text-xs text-slate-500">{item.district} · {item.cropType}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${cb.badge}`}>
                        {item.confidence}% conf.
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Wifi className="w-3 h-3" /> {item.telemetryAge}
                      </span>
                    </div>
                  </div>

                  {/* Confidence bar */}
                  <div className="mb-2.5">
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full ${cb.bar} rounded-full transition-all`} style={{ width: `${item.confidence}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                      <span>0%</span>
                      <span className="text-amber-600">85% threshold</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-2">{item.recommendation}</p>

                  {/* Soil telemetry row */}
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { label: "pH", val: item.soilPH, icon: Beaker },
                      { label: "N", val: `${item.nitrogenPPM}ppm`, icon: BarChart2 },
                      { label: "P", val: `${item.phosphorusPPM}ppm`, icon: BarChart2 },
                      { label: "K", val: `${item.potassiumPPM}ppm`, icon: BarChart2 },
                      { label: "H₂O", val: `${item.moisturePct}%`, icon: Database },
                    ].map(t => (
                      <div key={t.label} className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded text-[10px] border border-slate-700">
                        <span className="text-slate-500">{t.label}:</span>
                        <span className="text-slate-300 font-medium">{t.val}</span>
                      </div>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Processed section */}
          {processedCount > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-900">
              <p className="text-xs text-slate-500">
                <span className="text-emerald-400 font-bold">{processedCount}</span> items processed this session · Feeding AI retraining pipeline
              </p>
            </div>
          )}
        </div>

        {/* RIGHT — Action Panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-5">
                <BrainCircuit className="w-10 h-10 text-slate-600" />
              </div>
              <p className="text-slate-300 font-semibold text-lg mb-2">Select a recommendation</p>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                Click any item in the validation queue to review it here. Your decision feeds back into the AI retraining engine.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-sm">
                {[
                  { label: "Approved", count: queue.filter(q=>q.status==="approved").length, color: "emerald" },
                  { label: "Rejected", count: queue.filter(q=>q.status==="rejected").length, color: "rose" },
                  { label: "Modified", count: queue.filter(q=>q.status==="modified").length, color: "sky" },
                ].map(s => (
                  <div key={s.label} className={`bg-${s.color}-500/5 border border-${s.color}-500/20 rounded-xl p-3 text-center`}>
                    <p className={`text-2xl font-bold text-${s.color}-400`}>{s.count}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Case header */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">{selected.farmer}</h3>
                    <p className="text-xs text-slate-400">{selected.district} · {selected.cropType} · Soil: {selected.soilType}</p>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1.5 rounded-lg border ${confidenceBand(selected.confidence).badge}`}>
                    {selected.confidence}% Confidence
                  </span>
                </div>

                {/* Full confidence bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">AI Confidence Score</span>
                    <span className={confidenceBand(selected.confidence).text}>{selected.confidence}% / 85% threshold</span>
                  </div>
                  <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${confidenceBand(selected.confidence).bar} rounded-full transition-all`} style={{ width: `${selected.confidence}%` }} />
                    <div className="absolute top-0 bottom-0 w-0.5 bg-white/30" style={{ left: "85%" }} />
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed bg-slate-800 rounded-lg p-3 border border-slate-700">
                  {selected.recommendation}
                </p>
              </div>

              {/* Soil telemetry grid */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-4 h-4 text-sky-400" />
                  <h4 className="text-sm font-semibold text-slate-200">Soil Telemetry Log</h4>
                  <span className="flex items-center gap-1 ml-auto text-[10px] text-slate-500">
                    <Clock className="w-3 h-3" /> {selected.telemetryAge}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Soil pH", val: selected.soilPH, unit: "", ideal: "6.0–7.0", ok: selected.soilPH >= 6 && selected.soilPH <= 7 },
                    { label: "Nitrogen", val: selected.nitrogenPPM, unit: "ppm", ideal: "50–80ppm", ok: selected.nitrogenPPM >= 50 && selected.nitrogenPPM <= 80 },
                    { label: "Phosphorus", val: selected.phosphorusPPM, unit: "ppm", ideal: "25–45ppm", ok: selected.phosphorusPPM >= 25 && selected.phosphorusPPM <= 45 },
                    { label: "Potassium", val: selected.potassiumPPM, unit: "ppm", ideal: "150–220ppm", ok: selected.potassiumPPM >= 150 && selected.potassiumPPM <= 220 },
                    { label: "Soil Moisture", val: selected.moisturePct, unit: "%", ideal: "60–75%", ok: selected.moisturePct >= 60 && selected.moisturePct <= 75 },
                    { label: "Soil Type", val: selected.soilType, unit: "", ideal: "—", ok: true },
                  ].map(m => (
                    <div key={m.label} className={`p-2.5 rounded-lg border ${m.ok ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-500 font-medium">{m.label}</span>
                        {m.ok ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertTriangle className="w-3 h-3 text-rose-400" />}
                      </div>
                      <p className="text-sm font-bold text-white">{m.val}{m.unit}</p>
                      <p className="text-[10px] text-slate-600">Ideal: {m.ideal}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Classification */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-semibold text-slate-200">Error Classification</h4>
                  <span className="text-[10px] text-amber-500 ml-auto">Required for Reject / Modify</span>
                </div>
                <div className="relative mb-3">
                  <select
                    value={selectedError}
                    onChange={e => setSelectedError(e.target.value as ErrorCode)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 appearance-none cursor-pointer hover:border-amber-500/40 focus:border-amber-500 focus:outline-none transition-colors"
                  >
                    {errorOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <textarea
                  value={actionNote}
                  onChange={e => setActionNote(e.target.value)}
                  placeholder="Add reviewer notes for the retraining engine (optional)..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 placeholder-slate-600 focus:border-amber-500/60 focus:outline-none resize-none transition-colors"
                />
              </div>

              {/* Action buttons */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sliders className="w-4 h-4 text-slate-400" />
                  <h4 className="text-sm font-semibold text-slate-200">Agronomist Decision</h4>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleAction("approve")}
                    className="flex flex-col items-center gap-2 py-4 rounded-xl bg-emerald-600/15 border border-emerald-600/30 hover:bg-emerald-600/25 hover:border-emerald-500/50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-600/30 group-hover:bg-emerald-600/30 flex items-center justify-center transition-colors">
                      <ThumbsUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-emerald-400">Approve</p>
                      <p className="text-[10px] text-slate-500">Send to farmer</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleAction("modify")}
                    className="flex flex-col items-center gap-2 py-4 rounded-xl bg-sky-600/15 border border-sky-600/30 hover:bg-sky-600/25 hover:border-sky-500/50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-sky-600/20 border border-sky-600/30 group-hover:bg-sky-600/30 flex items-center justify-center transition-colors">
                      <Edit3 className="w-5 h-5 text-sky-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-sky-400">Modify</p>
                      <p className="text-[10px] text-slate-500">Re-evaluate params</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleAction("reject")}
                    className="flex flex-col items-center gap-2 py-4 rounded-xl bg-rose-600/15 border border-rose-600/30 hover:bg-rose-600/25 hover:border-rose-500/50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-rose-600/20 border border-rose-600/30 group-hover:bg-rose-600/30 flex items-center justify-center transition-colors">
                      <XCircle className="w-5 h-5 text-rose-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-rose-400">Reject</p>
                      <p className="text-[10px] text-slate-500">Flag for retraining</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
