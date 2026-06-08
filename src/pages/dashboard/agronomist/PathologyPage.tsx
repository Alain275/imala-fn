import { useState } from "react"
import {
  FlaskConical, Camera, AlertTriangle, CheckCircle2,
  Search, Download, Send, Plus, ChevronDown,
  Pill, Shield, FileText, Microscope, Leaf,
  AlertCircle, Info, Package, ExternalLink, Printer
} from "lucide-react"

interface DiseaseMatch {
  id: number
  name: string
  pathogen: string
  matchPct: number
  symptoms: string[]
  severity: "low" | "moderate" | "high" | "critical"
}

interface TreatmentEntry {
  id: number
  product: string
  type: "organic" | "chemical"
  activeIngredient: string
  dosage: string
  targetDisease: string
  rwandaCompliant: boolean
  organic: boolean
  withdrawalDays: number
  stock: "in_stock" | "low" | "out"
}

const diseaseMatches: DiseaseMatch[] = [
  { id: 1, name: "Maize Leaf Blight", pathogen: "Exserohilum turcicum", matchPct: 94, symptoms: ["Cigar-shaped lesions", "Tan-gray necrotic spots", "Starts on lower leaves"], severity: "high" },
  { id: 2, name: "Northern Corn Leaf Blight", pathogen: "Helminthosporium turcicum", matchPct: 87, symptoms: ["Long elliptical lesions", "Grayish-green color", "Spreads upward"], severity: "moderate" },
  { id: 3, name: "Common Rust", pathogen: "Puccinia sorghi", matchPct: 72, symptoms: ["Brick-red pustules", "Both leaf surfaces", "Powdery spores"], severity: "low" },
]

const treatmentLedger: TreatmentEntry[] = [
  { id: 1, product: "Mancozeb 80WP", type: "chemical", activeIngredient: "Mancozeb 80%", dosage: "2.5g/L water", targetDisease: "Leaf Blight, Rust", rwandaCompliant: true, organic: false, withdrawalDays: 7, stock: "in_stock" },
  { id: 2, product: "Neem Extract Oil", type: "organic", activeIngredient: "Azadirachtin 3000ppm", dosage: "5ml/L water", targetDisease: "Aphids, Leaf Miners", rwandaCompliant: true, organic: true, withdrawalDays: 0, stock: "in_stock" },
  { id: 3, product: "Ridomil Gold MZ", type: "chemical", activeIngredient: "Metalaxyl-M 4% + Mancozeb 64%", dosage: "2.5g/L water", targetDisease: "Downy Mildew, Blight", rwandaCompliant: true, organic: false, withdrawalDays: 14, stock: "low" },
  { id: 4, product: "Copper Hydroxide WP", type: "organic", activeIngredient: "Copper Hydroxide 77%", dosage: "3g/L water", targetDisease: "Bacterial Leaf Spot", rwandaCompliant: true, organic: true, withdrawalDays: 0, stock: "in_stock" },
  { id: 5, product: "Dithane M-45", type: "chemical", activeIngredient: "Mancozeb 80%", dosage: "2g/L water", targetDisease: "Powdery Mildew, Late Blight", rwandaCompliant: true, organic: false, withdrawalDays: 10, stock: "out" },
  { id: 6, product: "Kaolin Clay Spray", type: "organic", activeIngredient: "Kaolin Clay 95%", dosage: "30g/L water", targetDisease: "Thrips, Leaf Burns", rwandaCompliant: true, organic: true, withdrawalDays: 0, stock: "in_stock" },
]

export default function PathologyPage() {
  const [selectedMatch, setSelectedMatch] = useState<DiseaseMatch>(diseaseMatches[0])
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentEntry | null>(null)
  const [showOnlyOrganic, setShowOnlyOrganic] = useState(false)
  const [showOnlyCompliant, setShowOnlyCompliant] = useState(true)
  const [treatmentSearch, setTreatmentSearch] = useState("")
  const [prescriptionFarmer, setPrescriptionFarmer] = useState("Uwimana Esperance")
  const [prescriptionCrop, setPrescriptionCrop] = useState("Maize")
  const [prescriptionDistrict, setPrescriptionDistrict] = useState("Bugesera")
  const [prescriptionNotes, setPrescriptionNotes] = useState("")
  const [generated, setGenerated] = useState(false)
  const [activePanel, setActivePanel] = useState<"ledger" | "prescription">("ledger")

  const filteredTreatments = treatmentLedger.filter(t => {
    const matchSearch = t.product.toLowerCase().includes(treatmentSearch.toLowerCase()) || t.targetDisease.toLowerCase().includes(treatmentSearch.toLowerCase())
    const matchOrganic = !showOnlyOrganic || t.organic
    const matchCompliant = !showOnlyCompliant || t.rwandaCompliant
    return matchSearch && matchOrganic && matchCompliant
  })

  const severityStyle = (s: string) => {
    if (s === "critical") return "bg-rose-500/10 border-rose-500/30 text-rose-400"
    if (s === "high") return "bg-orange-500/10 border-orange-500/30 text-orange-400"
    if (s === "moderate") return "bg-amber-500/10 border-amber-500/30 text-amber-400"
    return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
  }

  const stockStyle = (s: string) => {
    if (s === "in_stock") return "text-emerald-400"
    if (s === "low") return "text-amber-400"
    return "text-rose-400"
  }

  const smsTemplate = selectedTreatment
    ? `Dear ${prescriptionFarmer}, our agronomist has diagnosed ${selectedMatch.name} (${selectedMatch.pathogen}) on your ${prescriptionCrop} crop in ${prescriptionDistrict}. TREATMENT: Apply ${selectedTreatment.product} (${selectedTreatment.dosage}) every 7 days for 3 applications. ${selectedTreatment.organic ? "This is an organic, safe solution." : `Observe ${selectedTreatment.withdrawalDays}-day pre-harvest withdrawal.`} ${prescriptionNotes ? `Notes: ${prescriptionNotes}` : ""} Contact *321# for support. — IMARA Agro`
    : ""

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-600/20 border border-violet-600/30 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Plant Pathology Lab</h2>
            <p className="text-xs text-slate-400">Disease Diagnostics · Treatment Ledger · Prescription Builder</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {[
            { label: "Cases Today", val: "8", color: "text-white" },
            { label: "Avg Match", val: "88%", color: "text-emerald-400" },
            { label: "Treatments", val: `${treatmentLedger.length}`, color: "text-violet-400" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
              <p className="text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TOP: Diagnostic Split View */}
      <div className="grid grid-cols-2 border-b border-slate-800" style={{ height: "340px" }}>
        {/* Left: Farmer uploaded image */}
        <div className="border-r border-slate-800 bg-slate-900 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-200">Farmer Submitted Image</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500">Uwimana E. · Bugesera · Maize</span>
              <button className="p-1 hover:bg-slate-800 rounded"><Download className="w-3.5 h-3.5 text-slate-400" /></button>
            </div>
          </div>
          <div className="flex-1 relative flex items-center justify-center bg-slate-950 overflow-hidden">
            {/* Simulated diseased leaf image */}
            <div className="relative w-48 h-56 rounded-lg overflow-hidden border border-slate-700 shadow-2xl">
              <div className="w-full h-full" style={{
                background: "linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 30%, #1f4a1f 60%, #2a5a2a 100%)"
              }}>
                {/* Simulated lesion spots */}
                <div className="absolute" style={{ top: "20%", left: "15%", width: "60px", height: "20px", borderRadius: "50%", background: "rgba(180, 120, 60, 0.8)", filter: "blur(2px)", transform: "rotate(-15deg)" }} />
                <div className="absolute" style={{ top: "35%", left: "40%", width: "45px", height: "15px", borderRadius: "50%", background: "rgba(160, 100, 40, 0.7)", filter: "blur(1.5px)", transform: "rotate(10deg)" }} />
                <div className="absolute" style={{ top: "55%", left: "20%", width: "70px", height: "18px", borderRadius: "50%", background: "rgba(140, 80, 30, 0.75)", filter: "blur(2px)", transform: "rotate(-5deg)" }} />
                <div className="absolute" style={{ top: "70%", left: "50%", width: "50px", height: "14px", borderRadius: "50%", background: "rgba(170, 110, 50, 0.6)", filter: "blur(1.5px)", transform: "rotate(20deg)" }} />
                {/* Leaf vein pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 192 224">
                  <line x1="96" y1="0" x2="96" y2="224" stroke="#4ade80" strokeWidth="1.5" />
                  <line x1="96" y1="50" x2="30" y2="100" stroke="#4ade80" strokeWidth="0.8" />
                  <line x1="96" y1="80" x2="160" y2="130" stroke="#4ade80" strokeWidth="0.8" />
                  <line x1="96" y1="110" x2="25" y2="155" stroke="#4ade80" strokeWidth="0.8" />
                  <line x1="96" y1="140" x2="165" y2="175" stroke="#4ade80" strokeWidth="0.8" />
                </svg>
              </div>
              {/* Sample label */}
              <div className="absolute bottom-0 left-0 right-0 bg-slate-900/80 px-2 py-1 text-center">
                <p className="text-[10px] text-slate-400">IMG_20260608_0914 · Sample BUG-2026-047</p>
              </div>
            </div>
            {/* Annotations */}
            <div className="absolute top-3 right-3 bg-rose-500/20 border border-rose-500/40 rounded-lg px-2 py-1.5">
              <p className="text-[10px] text-rose-400 font-bold">STRESS MARKERS DETECTED</p>
              <p className="text-[10px] text-rose-300">3 lesion zones identified</p>
            </div>
          </div>
        </div>

        {/* Right: AI Dataset Match */}
        <div className="bg-slate-900 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Microscope className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-slate-200">AI Dataset Matches</span>
            </div>
            <span className="text-[10px] text-slate-500">Trained on 847k pathology images</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {diseaseMatches.map(match => (
              <button
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedMatch.id === match.id ? "bg-violet-600/15 border-violet-600/40" : "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-sm font-bold text-slate-100">{match.name}</span>
                      {match.id === 1 && <span className="text-[10px] bg-violet-500/20 border border-violet-500/30 text-violet-400 px-1.5 py-0.5 rounded font-bold">BEST MATCH</span>}
                    </div>
                    <p className="text-xs text-slate-500 italic mt-0.5">{match.pathogen}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black ${match.matchPct >= 90 ? "text-emerald-400" : match.matchPct >= 75 ? "text-amber-400" : "text-rose-400"}`}>{match.matchPct}%</p>
                    <p className="text-[10px] text-slate-500">match</p>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${match.matchPct >= 90 ? "bg-emerald-500" : match.matchPct >= 75 ? "bg-amber-500" : "bg-rose-500"}`}
                    style={{ width: `${match.matchPct}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {match.symptoms.slice(0, 2).map(s => (
                      <span key={s} className="text-[10px] bg-slate-900 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${severityStyle(match.severity)}`}>{match.severity}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM: Treatment Ledger + Prescription Builder */}
      <div className="flex flex-1 overflow-hidden">
        {/* Treatment Ledger */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* Panel tabs */}
          <div className="flex border-b border-slate-800 bg-slate-900">
            <button onClick={() => setActivePanel("ledger")} className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activePanel === "ledger" ? "border-violet-500 text-violet-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
              <Pill className="w-4 h-4" /> Treatment Ledger
            </button>
            <button onClick={() => setActivePanel("prescription")} className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activePanel === "prescription" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
              <FileText className="w-4 h-4" /> Prescription Builder
            </button>
          </div>

          {activePanel === "ledger" && (
            <div className="flex-1 overflow-y-auto">
              {/* Ledger filters */}
              <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-800 bg-slate-900/80">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    value={treatmentSearch}
                    onChange={e => setTreatmentSearch(e.target.value)}
                    placeholder="Search treatments..."
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:border-violet-500/40 placeholder-slate-600"
                  />
                </div>
                <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                  <input type="checkbox" checked={showOnlyOrganic} onChange={e => setShowOnlyOrganic(e.target.checked)} className="accent-emerald-500" />
                  Organic only
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                  <input type="checkbox" checked={showOnlyCompliant} onChange={e => setShowOnlyCompliant(e.target.checked)} className="accent-emerald-500" />
                  RW Compliant
                </label>
              </div>

              <div className="p-3 space-y-2">
                {/* Current diagnosis banner */}
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 flex items-start gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-violet-300">Showing treatments for: <span className="text-white">{selectedMatch.name}</span></p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Pathogen: {selectedMatch.pathogen} · Severity: {selectedMatch.severity}</p>
                  </div>
                </div>

                {filteredTreatments.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTreatment(selectedTreatment?.id === t.id ? null : t)}
                    disabled={t.stock === "out"}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      t.stock === "out" ? "opacity-40 cursor-not-allowed bg-slate-800/30 border-slate-700/30" :
                      selectedTreatment?.id === t.id ? "bg-emerald-600/15 border-emerald-600/40" :
                      "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.organic ? "bg-emerald-600/20 border border-emerald-600/30" : "bg-slate-800 border border-slate-700"}`}>
                          {t.organic ? <Leaf className="w-4 h-4 text-emerald-400" /> : <Pill className="w-4 h-4 text-slate-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-100">{t.product}</p>
                          <p className="text-[10px] text-slate-500 italic">{t.activeIngredient}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {t.organic && (
                          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded font-bold">ORGANIC</span>
                        )}
                        {t.rwandaCompliant && (
                          <span className="flex items-center gap-0.5 text-[10px] text-emerald-400">
                            <Shield className="w-3 h-3" /> Compliant
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-500 mb-0.5">Dosage</p>
                        <p className="text-slate-300 font-medium">{t.dosage}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 mb-0.5">Withdrawal</p>
                        <p className={t.withdrawalDays === 0 ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>{t.withdrawalDays === 0 ? "None" : `${t.withdrawalDays} days`}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 mb-0.5">Stock</p>
                        <p className={`font-medium ${stockStyle(t.stock)}`}>{t.stock.replace("_", " ")}</p>
                      </div>
                    </div>

                    {selectedTreatment?.id === t.id && (
                      <div className="mt-2 pt-2 border-t border-emerald-600/20 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs text-emerald-400 font-medium">Selected for prescription</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activePanel === "prescription" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-semibold text-slate-200">Prescription Details</h4>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Farmer Name", val: prescriptionFarmer, setter: setPrescriptionFarmer },
                    { label: "Crop Type", val: prescriptionCrop, setter: setPrescriptionCrop },
                    { label: "District", val: prescriptionDistrict, setter: setPrescriptionDistrict },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-1">{f.label}</label>
                      <input
                        value={f.val}
                        onChange={e => f.setter(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs px-2.5 py-2 rounded-lg focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-500 mb-0.5">Diagnosis</p>
                    <p className="text-sm font-semibold text-violet-300">{selectedMatch.name}</p>
                    <p className="text-[10px] text-slate-500 italic">{selectedMatch.pathogen}</p>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-500 mb-0.5">Treatment</p>
                    <p className="text-sm font-semibold text-emerald-300">{selectedTreatment?.product ?? "— Not selected —"}</p>
                    <p className="text-[10px] text-slate-500">{selectedTreatment?.dosage ?? "Select from ledger"}</p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-1">Additional Notes</label>
                  <textarea
                    value={prescriptionNotes}
                    onChange={e => setPrescriptionNotes(e.target.value)}
                    rows={2}
                    placeholder="Any specific agronomist instructions..."
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs px-2.5 py-2 rounded-lg resize-none focus:outline-none focus:border-emerald-500/50 placeholder-slate-600"
                  />
                </div>

                <button
                  onClick={() => setGenerated(true)}
                  disabled={!selectedTreatment}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    selectedTreatment ? "bg-emerald-600/20 border border-emerald-600/30 text-emerald-300 hover:bg-emerald-600/30" : "bg-slate-800 border border-slate-700 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  <FileText className="w-4 h-4" /> Generate SMS Prescription
                </button>
              </div>

              {generated && selectedTreatment && (
                <div className="bg-slate-900 rounded-xl border border-emerald-600/30 p-4">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-sm font-semibold text-emerald-300">SMS Prescription Generated</h4>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors">
                        <Printer className="w-3.5 h-3.5" /> Print
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-600/20 border border-emerald-600/30 px-2.5 py-1.5 rounded-lg transition-colors">
                        <Send className="w-3.5 h-3.5" /> Send via SMS
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 font-mono text-xs text-slate-300 leading-relaxed">
                    {smsTemplate}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">{smsTemplate.length} characters · {Math.ceil(smsTemplate.length / 160)} SMS segment(s) · Rwanda compliant</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
