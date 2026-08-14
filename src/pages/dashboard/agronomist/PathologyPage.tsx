import { useEffect, useState, useCallback } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FlaskConical, Camera, CheckCircle2,
  Search, Send,
  Pill, Shield, FileText, Microscope, Leaf,
  ImageOff, BrainCircuit,
} from "lucide-react"
import { toast } from "sonner"
import {
  agronomistPathologyService, type Treatment,
} from "@/services/agronomistPathology.service"
import { agronomistFarmersService, type FarmerListEntry } from "@/services/agronomistFarmers.service"

export default function PathologyPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [treatmentsTotal, setTreatmentsTotal] = useState(0)
  const [treatmentsLoading, setTreatmentsLoading] = useState(true)
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null)
  const [showOnlyOrganic, setShowOnlyOrganic] = useState(false)
  const [showOnlyCompliant, setShowOnlyCompliant] = useState(true)
  const [treatmentSearch, setTreatmentSearch] = useState("")

  const [farmers, setFarmers] = useState<FarmerListEntry[]>([])
  const [prescriptionFarmerId, setPrescriptionFarmerId] = useState("")
  const [prescriptionCrop, setPrescriptionCrop] = useState("")
  const [prescriptionDistrict, setPrescriptionDistrict] = useState("")
  const [prescriptionDiagnosis, setPrescriptionDiagnosis] = useState("")
  const [prescriptionPathogen, setPrescriptionPathogen] = useState("")
  const [prescriptionNotes, setPrescriptionNotes] = useState("")
  const [sending, setSending] = useState(false)
  const [sentResult, setSentResult] = useState<{ smsText: string; sentAt: string; deliveredVia: string } | null>(null)
  const [activePanel, setActivePanel] = useState<"ledger" | "prescription">("ledger")

  const loadTreatments = useCallback(() => {
    setTreatmentsLoading(true)
    agronomistPathologyService.getTreatments({
      search: treatmentSearch || undefined,
      organicOnly: showOnlyOrganic || undefined,
      rwandaCompliantOnly: showOnlyCompliant || undefined,
      limit: 50,
    })
      .then(({ treatments, pagination }) => { setTreatments(treatments); setTreatmentsTotal(pagination.total) })
      .catch(() => toast.error("Failed to load treatments"))
      .finally(() => setTreatmentsLoading(false))
  }, [showOnlyOrganic, showOnlyCompliant])

  useEffect(() => { loadTreatments() }, [loadTreatments])

  // Debounce the free-text search separately so we don't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => loadTreatments(), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treatmentSearch])

  useEffect(() => {
    if (activePanel === "prescription" && farmers.length === 0) {
      agronomistFarmersService.getFarmers({ limit: 200 })
        .then(({ farmers }) => setFarmers(farmers))
        .catch(() => toast.error("Failed to load farmers list"))
    }
  }, [activePanel, farmers.length])

  const stockBadge = (s: Treatment["stock"]) => {
    if (s === "in_stock") return "text-emerald-600 dark:text-emerald-400"
    if (s === "low") return "text-amber-600 dark:text-amber-400"
    return "text-rose-600 dark:text-rose-400"
  }

  const handleSendPrescription = async () => {
    if (!prescriptionFarmerId || !prescriptionCrop || !prescriptionDiagnosis || !selectedTreatment) {
      toast.error("Farmer, crop, diagnosis, and a selected treatment are required")
      return
    }
    setSending(true)
    setSentResult(null)
    try {
      const result = await agronomistPathologyService.createPrescription({
        farmerId: prescriptionFarmerId,
        cropType: prescriptionCrop,
        district: prescriptionDistrict || undefined,
        diagnosis: prescriptionDiagnosis,
        pathogen: prescriptionPathogen || undefined,
        treatmentId: selectedTreatment.id,
        notes: prescriptionNotes || undefined,
      })
      setSentResult({ smsText: result.smsText, sentAt: result.sentAt, deliveredVia: result.deliveredVia })
      toast.success("Prescription delivered to the farmer")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send prescription")
    } finally {
      setSending(false)
    }
  }

  const deliveredViaLabel = (via: string) => {
    if (via === "realtime") return "Delivered in real-time"
    if (via === "notification-only") return "Delivered via notification"
    return via
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        title="Plant Pathology Lab"
        subtitle="Disease Diagnostics · Treatment Ledger · Prescription Builder"
      />

      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <Icon3D gradient="leaf" size="md">
                <FlaskConical className="w-5 h-5" />
              </Icon3D>
              <div>
                <p className="text-2xl font-black text-foreground">{treatmentsLoading ? "…" : treatmentsTotal}</p>
                <p className="text-xs text-muted-foreground">Treatments Available</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md border-dashed">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center flex-shrink-0">
                <BrainCircuit className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground">Coming Soon</p>
                <p className="text-xs text-muted-foreground">AI Diagnostics</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Diagnostic split view */}
        <div className="grid grid-cols-2 gap-6">
          {/* Farmer image — not connected yet */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="flex items-center gap-3 text-sm">
                <Icon3D gradient="earth" size="sm">
                  <Camera className="w-4 h-4" />
                </Icon3D>
                Farmer Submitted Image
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-col items-center justify-center gap-3 bg-muted/30 border-2 border-dashed border-border rounded-xl h-52 text-center px-6">
                <ImageOff className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Image capture not connected yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Farmer-submitted diagnostic photos will appear here once this feature is built on the backend.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI matches — not connected yet */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="flex items-center gap-3 text-sm">
                <Icon3D gradient="leaf" size="sm">
                  <Microscope className="w-4 h-4" />
                </Icon3D>
                AI Dataset Matches
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-col items-center justify-center gap-3 h-52 text-center px-6">
                <BrainCircuit className="w-8 h-8 text-muted-foreground" />
                <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Coming Soon</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">AI disease matching isn't available yet</p>
                  <p className="text-xs text-muted-foreground mt-1">This will show ranked disease matches from farmer-submitted photos once the backend AI matching endpoint is built. You can enter a diagnosis manually below in the meantime.</p>
                </div>
              </div>
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
              <div className="flex items-center gap-4 mb-4 flex-wrap">
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

              {treatmentsLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
                </div>
              ) : treatments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Pill className="w-8 h-8 text-muted-foreground mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">No treatments match your filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {treatments.map(t => (
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
                      <p className="text-[10px] text-muted-foreground mb-2">Targets: {t.targetDisease}</p>
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
                      <p className="text-[9px] text-muted-foreground/70 mt-2">Added {new Date(t.createdAt).toLocaleDateString()}</p>
                      {selectedTreatment?.id === t.id && (
                        <div className="mt-2 pt-2 border-t border-emerald-500/20 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Selected for prescription</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          )}

          {activePanel === "prescription" && (
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1">Farmer</label>
                  <select value={prescriptionFarmerId} onChange={e => setPrescriptionFarmerId(e.target.value)}
                    className="w-full bg-muted border border-border text-foreground text-xs px-2.5 py-2 rounded-lg focus:outline-none">
                    <option value="">Select a farmer…</option>
                    {farmers.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1">Crop Type</label>
                  <input value={prescriptionCrop} onChange={e => setPrescriptionCrop(e.target.value)}
                    placeholder="e.g. Maize"
                    className="w-full bg-muted border border-border text-foreground text-xs px-2.5 py-2 rounded-lg focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1">District (optional)</label>
                  <input value={prescriptionDistrict} onChange={e => setPrescriptionDistrict(e.target.value)}
                    className="w-full bg-muted border border-border text-foreground text-xs px-2.5 py-2 rounded-lg focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1">Diagnosis</label>
                  <input value={prescriptionDiagnosis} onChange={e => setPrescriptionDiagnosis(e.target.value)}
                    placeholder="e.g. Late Blight"
                    className="w-full bg-muted border border-border text-foreground text-xs px-2.5 py-2 rounded-lg focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1">Pathogen (optional)</label>
                  <input value={prescriptionPathogen} onChange={e => setPrescriptionPathogen(e.target.value)}
                    placeholder="e.g. Uromyces appendiculatus"
                    className="w-full bg-muted border border-border text-foreground text-xs px-2.5 py-2 rounded-lg focus:outline-none" />
                </div>
              </div>

              <div className="bg-muted/50 border border-border rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground mb-0.5">Treatment</p>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{selectedTreatment?.product ?? "— Not selected —"}</p>
                <p className="text-[10px] text-muted-foreground">{selectedTreatment?.dosage ?? "Select a treatment from the Treatment Ledger tab"}</p>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1">Additional Notes</label>
                <textarea value={prescriptionNotes} onChange={e => setPrescriptionNotes(e.target.value)} rows={2}
                  placeholder="Any specific agronomist instructions..."
                  className="w-full bg-muted border border-border text-foreground text-xs px-2.5 py-2 rounded-lg resize-none focus:outline-none placeholder:text-muted-foreground/50" />
              </div>

              <button onClick={handleSendPrescription} disabled={sending || !selectedTreatment}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  selectedTreatment ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20" : "bg-muted border border-border text-muted-foreground cursor-not-allowed"
                }`}>
                <Send className="w-4 h-4" /> {sending ? "Sending…" : "Send Prescription to Farmer"}
              </button>

              {sentResult && (
                <div className="border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Message sent to farmer</h4>
                  </div>
                  <div className="bg-muted/50 border border-border rounded-xl p-3 font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {sentResult.smsText}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {deliveredViaLabel(sentResult.deliveredVia)} · {new Date(sentResult.sentAt).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
