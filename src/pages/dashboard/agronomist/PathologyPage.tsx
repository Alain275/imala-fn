import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import {
  FlaskConical, Camera, CheckCircle2,
  Search, Send,
  Pill, Shield, FileText, Microscope, Leaf,
  AlertCircle, Printer
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
    if (s === "critical") return "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
    if (s === "high") return "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400"
    if (s === "moderate") return "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
    return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
  }

  const stockBadge = (s: string) => {
    if (s === "in_stock") return "text-emerald-600 dark:text-emerald-400"
    if (s === "low") return "text-amber-600 dark:text-amber-400"
    return "text-rose-600 dark:text-rose-400"
  }

  const smsTemplate = selectedTreatment
    ? `Dear ${prescriptionFarmer}, our agronomist has diagnosed ${selectedMatch.name} (${selectedMatch.pathogen}) on your ${prescriptionCrop} crop in ${prescriptionDistrict}. TREATMENT: Apply ${selectedTreatment.product} (${selectedTreatment.dosage}) every 7 days for 3 applications. ${selectedTreatment.organic ? "This is an organic, safe solution." : `Observe ${selectedTreatment.withdrawalDays}-day pre-harvest withdrawal.`} ${prescriptionNotes ? `Notes: ${prescriptionNotes}` : ""} Contact *321# for support. — IMARA Agro`
    : ""

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        title="Plant Pathology Lab"
        subtitle="Disease Diagnostics · Treatment Ledger · Prescription Builder"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Cases Today", val: "8", gradient: "earth" as const },
            { label: "Avg Match Accuracy", val: "88%", gradient: "green" as const },
            { label: "Treatments Available", val: `${treatmentLedger.length}`, gradient: "leaf" as const },
          ].map(s => (
            <Card key={s.label} className="border-0 shadow-md">
              <CardContent className="p-4 flex items-center gap-4">
                <Icon3D gradient={s.gradient} size="md">
                  <FlaskConical className="w-5 h-5" />
                </Icon3D>
                <div>
                  <p className="text-2xl font-black text-foreground">{s.val}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Diagnostic split view */}
        <div className="grid grid-cols-2 gap-6">
          {/* Farmer image */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="flex items-center gap-3 text-sm">
                <Icon3D gradient="earth" size="sm">
                  <Camera className="w-4 h-4" />
                </Icon3D>
                Farmer Submitted Image
                <span className="ml-auto text-xs text-muted-foreground font-normal">Uwimana E. · Bugesera · Maize</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative flex items-center justify-center bg-muted/30 rounded-xl overflow-hidden h-52">
                <div className="relative w-40 h-48 rounded-lg overflow-hidden border border-border shadow-lg">
                  <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 30%, #1f4a1f 60%, #2a5a2a 100%)" }}>
                    <div className="absolute" style={{ top: "20%", left: "15%", width: "60px", height: "20px", borderRadius: "50%", background: "rgba(180, 120, 60, 0.8)", filter: "blur(2px)", transform: "rotate(-15deg)" }} />
                    <div className="absolute" style={{ top: "35%", left: "40%", width: "45px", height: "15px", borderRadius: "50%", background: "rgba(160, 100, 40, 0.7)", filter: "blur(1.5px)", transform: "rotate(10deg)" }} />
                    <div className="absolute" style={{ top: "55%", left: "20%", width: "70px", height: "18px", borderRadius: "50%", background: "rgba(140, 80, 30, 0.75)", filter: "blur(2px)", transform: "rotate(-5deg)" }} />
                    <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 160 192">
                      <line x1="80" y1="0" x2="80" y2="192" stroke="#4ade80" strokeWidth="1.5" />
                      <line x1="80" y1="50" x2="20" y2="90" stroke="#4ade80" strokeWidth="0.8" />
                      <line x1="80" y1="90" x2="140" y2="130" stroke="#4ade80" strokeWidth="0.8" />
                    </svg>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-center">
                    <p className="text-[10px] text-white/70">Sample BUG-2026-047</p>
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-rose-500/20 border border-rose-500/30 rounded-lg px-2 py-1.5">
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">STRESS DETECTED</p>
                  <p className="text-[10px] text-rose-500">3 lesion zones</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI matches */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="flex items-center gap-3 text-sm">
                <Icon3D gradient="leaf" size="sm">
                  <Microscope className="w-4 h-4" />
                </Icon3D>
                AI Dataset Matches
                <span className="ml-auto text-xs text-muted-foreground font-normal">Trained on 847k images</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {diseaseMatches.map(match => (
                <button key={match.id} onClick={() => setSelectedMatch(match)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedMatch.id === match.id
                      ? "bg-primary/5 border-primary"
                      : "bg-muted/40 border-border hover:bg-muted hover:border-muted-foreground/30"
                  }`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-sm font-bold text-foreground">{match.name}</span>
                        {match.id === 1 && <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">BEST MATCH</span>}
                      </div>
                      <p className="text-xs text-muted-foreground italic mt-0.5">{match.pathogen}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${match.matchPct >= 90 ? "text-emerald-500" : match.matchPct >= 75 ? "text-amber-500" : "text-rose-500"}`}>{match.matchPct}%</p>
                      <p className="text-[10px] text-muted-foreground">match</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                    <div className={`h-full rounded-full ${match.matchPct >= 90 ? "bg-emerald-500" : match.matchPct >= 75 ? "bg-amber-500" : "bg-rose-500"}`}
                      style={{ width: `${match.matchPct}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {match.symptoms.slice(0, 2).map(s => (
                        <span key={s} className="text-[10px] bg-muted border border-border text-muted-foreground px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${severityStyle(match.severity)}`}>{match.severity}</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Treatment Ledger + Prescription Builder */}
        <Card className="border-0 shadow-md">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button onClick={() => setActivePanel("ledger")}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                activePanel === "ledger" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <Pill className="w-4 h-4" /> Treatment Ledger
            </button>
            <button onClick={() => setActivePanel("prescription")}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                activePanel === "prescription" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <FileText className="w-4 h-4" /> Prescription Builder
            </button>
          </div>

          {activePanel === "ledger" && (
            <CardContent className="p-5">
              {/* Filters */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input value={treatmentSearch} onChange={e => setTreatmentSearch(e.target.value)}
                    placeholder="Search treatments..."
                    className="w-full bg-muted border border-border text-foreground text-xs pl-8 pr-3 py-2 rounded-lg focus:outline-none" />
                </div>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={showOnlyOrganic} onChange={e => setShowOnlyOrganic(e.target.checked)} className="accent-emerald-500" />
                  Organic only
                </label>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={showOnlyCompliant} onChange={e => setShowOnlyCompliant(e.target.checked)} className="accent-emerald-500" />
                  RW Compliant
                </label>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Treatments for: <span className="text-primary">{selectedMatch.name}</span></p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Pathogen: {selectedMatch.pathogen} · Severity: {selectedMatch.severity}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {filteredTreatments.map(t => (
                  <button key={t.id} onClick={() => setSelectedTreatment(selectedTreatment?.id === t.id ? null : t)}
                    disabled={t.stock === "out"}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      t.stock === "out" ? "opacity-40 cursor-not-allowed bg-muted/30 border-border" :
                      selectedTreatment?.id === t.id ? "bg-emerald-500/10 border-emerald-500/20" :
                      "bg-muted/40 border-border hover:bg-muted hover:border-muted-foreground/30"
                    }`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${t.organic ? "bg-emerald-500/10 border-emerald-500/20" : "bg-muted border-border"}`}>
                          {t.organic ? <Leaf className="w-4 h-4 text-emerald-500" /> : <Pill className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{t.product}</p>
                          <p className="text-[10px] text-muted-foreground italic">{t.activeIngredient}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {t.organic && <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold">ORGANIC</span>}
                        {t.rwandaCompliant && <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400"><Shield className="w-3 h-3" /> RW✓</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-0.5">Dosage</p>
                        <p className="text-foreground font-medium text-xs">{t.dosage}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-0.5">Withdrawal</p>
                        <p className={`font-medium text-xs ${t.withdrawalDays === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                          {t.withdrawalDays === 0 ? "None" : `${t.withdrawalDays} days`}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-0.5">Stock</p>
                        <p className={`font-medium text-xs ${stockBadge(t.stock)}`}>{t.stock.replace("_", " ")}</p>
                      </div>
                    </div>
                    {selectedTreatment?.id === t.id && (
                      <div className="mt-2 pt-2 border-t border-emerald-500/20 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Selected for prescription</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          )}

          {activePanel === "prescription" && (
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Farmer Name", val: prescriptionFarmer, setter: setPrescriptionFarmer },
                  { label: "Crop Type", val: prescriptionCrop, setter: setPrescriptionCrop },
                  { label: "District", val: prescriptionDistrict, setter: setPrescriptionDistrict },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1">{f.label}</label>
                    <input value={f.val} onChange={e => f.setter(e.target.value)}
                      className="w-full bg-muted border border-border text-foreground text-xs px-2.5 py-2 rounded-lg focus:outline-none" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 border border-border rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Diagnosis</p>
                  <p className="text-sm font-semibold text-primary">{selectedMatch.name}</p>
                  <p className="text-[10px] text-muted-foreground italic">{selectedMatch.pathogen}</p>
                </div>
                <div className="bg-muted/50 border border-border rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Treatment</p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{selectedTreatment?.product ?? "— Not selected —"}</p>
                  <p className="text-[10px] text-muted-foreground">{selectedTreatment?.dosage ?? "Select from ledger"}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1">Additional Notes</label>
                <textarea value={prescriptionNotes} onChange={e => setPrescriptionNotes(e.target.value)} rows={2}
                  placeholder="Any specific agronomist instructions..."
                  className="w-full bg-muted border border-border text-foreground text-xs px-2.5 py-2 rounded-lg resize-none focus:outline-none placeholder:text-muted-foreground/50" />
              </div>

              <button onClick={() => setGenerated(true)} disabled={!selectedTreatment}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  selectedTreatment ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20" : "bg-muted border border-border text-muted-foreground cursor-not-allowed"
                }`}>
                <FileText className="w-4 h-4" /> Generate SMS Prescription
              </button>

              {generated && selectedTreatment && (
                <div className="border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">SMS Prescription Generated</h4>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-muted px-2.5 py-1.5 rounded-lg border border-border transition-colors">
                        <Printer className="w-3.5 h-3.5" /> Print
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg transition-colors hover:bg-emerald-500/20">
                        <Send className="w-3.5 h-3.5" /> Send via SMS
                      </button>
                    </div>
                  </div>
                  <div className="bg-muted/50 border border-border rounded-xl p-3 font-mono text-xs text-foreground leading-relaxed">
                    {smsTemplate}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">{smsTemplate.length} characters · {Math.ceil(smsTemplate.length / 160)} SMS segment(s) · Rwanda compliant</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
