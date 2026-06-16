import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BrainCircuit, AlertTriangle, CheckCircle2, XCircle,
  ChevronDown, Filter, Sliders, ThumbsUp,
  Edit3, Info, Leaf,
  Clock, ArrowUpDown, Database
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
  if (c >= 75) return { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", badge: "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40" }
  if (c >= 65) return { bar: "bg-orange-500", text: "text-orange-600 dark:text-orange-400", badge: "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/40" }
  return { bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", badge: "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40" }
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
      action === "reject" ? `✗ Recommendation rejected — retrain flag logged` :
      `⟳ Modified successfully for re-evaluation`,
      action === "approve" ? "ok" : action === "reject" ? "error" : "warn"
    )
    setSelected(null)
    setActionNote("")
    setSelectedError("")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        title="AI Validation Engine"
        subtitle="70/30 Hybrid Loop · Expert review & model validation dispatch desk"
      />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl border text-sm font-semibold shadow-lg transition-all ${
          toast.type === "ok" ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-300" :
          toast.type === "error" ? "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/80 dark:border-rose-800 dark:text-rose-300" :
          "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/80 dark:border-amber-800 dark:text-amber-300"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 px-6 pt-6 pb-0">
        {[
          { label: "Pending Review", val: pendingQueue.length, gradient: "gold" as const, icon: BrainCircuit },
          { label: "Processed Today", val: processedCount, gradient: "green" as const, icon: CheckCircle2 },
          { label: "Confidence Threshold", val: `>${filterMin}%`, gradient: "sky" as const, icon: Sliders },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm">
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

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-210px)] mx-6 mt-4 mb-6 gap-6">

        {/* Left queue panel */}
        <Card className="w-[52%] border-0 shadow-md flex flex-col overflow-hidden">
          {/* Controls */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 bg-muted/20">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-semibold">Min Confidence:</span>
              <input
                type="range" min={0} max={85} step={5} value={filterMin}
                onChange={e => setFilterMin(Number(e.target.value))}
                className="w-24 h-1 accent-primary rounded-lg"
              />
              <span className="text-xs font-bold text-foreground w-8">{filterMin}%</span>
            </div>
            <Button variant="outline" size="sm"
              onClick={() => setSortBy(s => s === "confidence" ? "farmer" : "confidence")}
              className="text-xs h-8 gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort: {sortBy === "confidence" ? "Confidence" : "Farmer A-Z"}
            </Button>
          </div>

          <div className="px-4 py-2 bg-amber-500/10 border-b border-border flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
              {pendingQueue.length} recommendations under 85% confidence — review required
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {pendingQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-foreground font-bold">Queue Cleared</p>
                <p className="text-xs text-muted-foreground mt-0.5">All pending crop advisories have been validated</p>
              </div>
            ) : pendingQueue.map(item => {
              const cb = confidenceBand(item.confidence)
              return (
                <button key={item.id} onClick={() => setSelected(item)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selected?.id === item.id
                      ? "bg-primary/5 border-primary shadow-sm"
                      : "bg-muted/40 border-border hover:bg-muted hover:border-muted-foreground/20"
                  }`}>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center flex-shrink-0">
                        <Leaf className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{item.farmer}</p>
                        <p className="text-[10px] text-muted-foreground">{item.district} · {item.cropType}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cb.badge}`}>
                        {item.confidence}% match
                      </span>
                      <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-medium">
                        <Clock className="w-2.5 h-2.5" /> {item.telemetryAge}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <Progress value={item.confidence} className="h-1.5" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{item.recommendation}</p>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Right validation panel */}
        <Card className="flex-1 border-0 shadow-md flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
                <BrainCircuit className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-bold text-base mb-1">Select Recommendation to Validate</p>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Click any crop prescription from the queue. Approved decisions are sent directly to farmers via SMS.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Farmer + Recommendation */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-border/50">
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">{selected.farmer}</CardTitle>
                    <CardDescription className="text-[11px]">{selected.district} · {selected.cropType} · {selected.soilType}</CardDescription>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${confidenceBand(selected.confidence).badge}`}>
                    {selected.confidence}% Match Confidence
                  </span>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-xs text-foreground font-semibold leading-relaxed p-3 bg-muted/50 rounded-lg border border-border">
                    {selected.recommendation}
                  </p>
                </CardContent>
              </Card>

              {/* Soil Chemistry Telemetry */}
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                    <Database className="w-4 h-4 text-sky-500" />
                    <span className="text-xs font-bold text-foreground">Soil Chemistry Telemetry</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {[
                      { label: "pH Level", val: selected.soilPH, ideal: "6.0 - 7.0", ok: selected.soilPH >= 6.0 && selected.soilPH <= 7.0 },
                      { label: "Nitrogen", val: `${selected.nitrogenPPM}ppm`, ideal: "50-80ppm", ok: selected.nitrogenPPM >= 50 && selected.nitrogenPPM <= 80 },
                      { label: "Phosphorus", val: `${selected.phosphorusPPM}ppm`, ideal: "25-45ppm", ok: selected.phosphorusPPM >= 25 && selected.phosphorusPPM <= 45 },
                      { label: "Potassium", val: `${selected.potassiumPPM}ppm`, ideal: "150-220ppm", ok: selected.potassiumPPM >= 150 && selected.potassiumPPM <= 220 },
                      { label: "Moisture", val: `${selected.moisturePct}%`, ideal: "60-75%", ok: selected.moisturePct >= 60 && selected.moisturePct <= 75 },
                    ].map(t => (
                      <div key={t.label} className={`p-2 rounded-lg border ${t.ok ? "bg-emerald-500/5 border-emerald-200 dark:border-emerald-900/30" : "bg-rose-500/5 border-rose-200 dark:border-rose-900/30"}`}>
                        <p className="text-[10px] text-muted-foreground">{t.label}</p>
                        <p className="text-sm font-bold text-foreground mt-0.5">{t.val}</p>
                        <p className="text-[9px] text-muted-foreground font-mono">Target: {t.ideal}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Retraining Classification */}
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                    <Info className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-foreground">Retraining Classification (Required for reject/modify)</span>
                  </div>
                  <div className="relative">
                    <select value={selectedError} onChange={e => setSelectedError(e.target.value as ErrorCode)}
                      className="w-full bg-background border border-input text-foreground text-xs rounded-lg px-3 py-2 appearance-none cursor-pointer focus:outline-none">
                      {errorOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                  <textarea value={actionNote} onChange={e => setActionNote(e.target.value)}
                    placeholder="Enter notes for Retraining Pipeline..."
                    rows={2}
                    className="w-full bg-background border border-input text-foreground text-xs rounded-lg px-3 py-2 focus:outline-none resize-none" />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Button onClick={() => handleAction("approve")} variant="outline"
                      className="h-16 flex flex-col gap-1 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900/30 dark:hover:bg-emerald-950/20">
                      <ThumbsUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Approve</span>
                    </Button>
                    <Button onClick={() => handleAction("modify")} variant="outline"
                      className="h-16 flex flex-col gap-1 border-sky-200 hover:bg-sky-50 dark:border-sky-900/30 dark:hover:bg-sky-950/20">
                      <Edit3 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      <span className="text-xs font-bold text-sky-600 dark:text-sky-400">Modify</span>
                    </Button>
                    <Button onClick={() => handleAction("reject")} variant="outline"
                      className="h-16 flex flex-col gap-1 border-rose-200 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-950/20">
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Reject</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
