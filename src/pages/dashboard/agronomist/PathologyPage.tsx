import { useEffect, useState, useCallback } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FlaskConical, Camera, CheckCircle2,
  Search, Send,
  Pill, Shield, FileText, Microscope, Leaf,
  ImageOff, BrainCircuit, AlertTriangle,
  XCircle, User, MapPin, X, Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import {
  agronomistPathologyService, type Treatment, type DiseaseDetection,
} from "@/services/agronomistPathology.service"
import { agronomistFarmersService, type FarmerListEntry, type FarmerDetail } from "@/services/agronomistFarmers.service"

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
  const [prescriptionDosageOverride, setPrescriptionDosageOverride] = useState("")
  const [prescriptionNotes, setPrescriptionNotes] = useState("")
  const [prescriptionDetectionId, setPrescriptionDetectionId] = useState("")
  const [sending, setSending] = useState(false)
  const [sentResult, setSentResult] = useState<{ smsText: string; sentAt: string; deliveredVia: string } | null>(null)
  const [activePanel, setActivePanel] = useState<"queue" | "ledger" | "prescription">("queue")

  const [detections, setDetections] = useState<DiseaseDetection[]>([])
  const [detectionsTotal, setDetectionsTotal] = useState(0)
  const [detectionsLoading, setDetectionsLoading] = useState(true)
  const [selectedDetection, setSelectedDetection] = useState<DiseaseDetection | null>(null)
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerDetail | null>(null)
  const [farmerLoading, setFarmerLoading] = useState(false)
  const [verifiedDisease, setVerifiedDisease] = useState("")
  const [verifiedTreatment, setVerifiedTreatment] = useState("")
  const [agronomistComment, setAgronomistComment] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

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

  const loadDetections = useCallback(() => {
    setDetectionsLoading(true)
    agronomistPathologyService.getPendingDetections({ limit: 50 })
      .then(({ detections, pagination }) => { setDetections(detections); setDetectionsTotal(pagination.total) })
      .catch(() => toast.error("Failed to load pending disease detections"))
      .finally(() => setDetectionsLoading(false))
  }, [])

  useEffect(() => { loadDetections() }, [loadDetections])

  // Reset the verify form + fetch the submitting farmer whenever selection changes.
  useEffect(() => {
    if (!selectedDetection) { setSelectedFarmer(null); return }
    setVerifiedDisease(selectedDetection.aiDisease.trim())
    setVerifiedTreatment(selectedDetection.treatment)
    setAgronomistComment("")
    setImageFailed(false)
    setSelectedFarmer(null)
    setFarmerLoading(true)
    agronomistFarmersService.getFarmerDetail(selectedDetection.userId)
      .then(setSelectedFarmer)
      .catch(() => toast.error("Failed to load the submitting farmer's details"))
      .finally(() => setFarmerLoading(false))
  }, [selectedDetection])

  const stockBadge = (s: Treatment["stock"]) => {
    if (s === "in_stock") return "text-emerald-600 dark:text-emerald-400"
    if (s === "low") return "text-amber-600 dark:text-amber-400"
    return "text-rose-600 dark:text-rose-400"
  }

  const confidenceBadge = (c: number) => {
    if (c >= 90) return "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
    if (c >= 65) return "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"
    return "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40"
  }

  const handleVerify = async (status: "verified" | "rejected") => {
    if (!selectedDetection) return
    setVerifying(true)
    try {
      const result = await agronomistPathologyService.verifyDetection(selectedDetection.id, {
        status,
        verifiedDisease: verifiedDisease || undefined,
        verifiedTreatment: verifiedTreatment || undefined,
        agronomistComment: agronomistComment || undefined,
      })
      // The backend can return success:true without actually persisting the change
      // (observed live: response/refetch both still show status "pending_review").
      // Treat a response that doesn't reflect the requested status as a failure
      // rather than showing a false-positive success toast.
      if (result.status !== status) {
        throw new Error("The server accepted the request but did not update the detection's status. Please try again or contact backend support.")
      }
      toast.success(status === "verified" ? "Detection verified" : "Detection rejected")
      setSelectedDetection(null)
      loadDetections()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit verification")
    } finally {
      setVerifying(false)
    }
  }

  const handleUseForPrescription = () => {
    if (!selectedDetection) return
    setPrescriptionDiagnosis(selectedDetection.aiDisease.trim())
    setPrescriptionCrop(selectedDetection.aiCrop)
    setPrescriptionDetectionId(selectedDetection.id)
    if (selectedFarmer) {
      setFarmers(prev => prev.some(f => f.id === selectedFarmer.id) ? prev : [...prev, {
        id: selectedFarmer.id, name: selectedFarmer.name, email: selectedFarmer.email, phone: selectedFarmer.phone,
        location: selectedFarmer.location, farmSize: selectedFarmer.farmSize, isEmailVerified: selectedFarmer.isEmailVerified,
        isActive: selectedFarmer.isActive, lastLogin: selectedFarmer.lastLogin, createdAt: selectedFarmer.createdAt,
      }])
      setPrescriptionFarmerId(selectedFarmer.id)
      setPrescriptionDistrict(selectedFarmer.location || "")
    }
    setActivePanel("prescription")
    toast.info("Diagnosis pre-filled from the AI detection — review before sending.")
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
        diagnosisName: prescriptionDiagnosis,
        pathogenName: prescriptionPathogen || undefined,
        diseaseDetectionId: prescriptionDetectionId || undefined,
        treatmentId: selectedTreatment.id,
        dosageOverride: prescriptionDosageOverride || undefined,
        notes: prescriptionNotes || undefined,
      })
      setSentResult({ smsText: result.smsText, sentAt: result.sentAt, deliveredVia: result.deliveredVia })
      toast.success("Prescription delivered to the farmer")
      setPrescriptionDetectionId("")
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
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <Icon3D gradient="gold" size="md">
                <BrainCircuit className="w-5 h-5" />
              </Icon3D>
              <div>
                <p className="text-2xl font-black text-foreground">{detectionsLoading ? "…" : detectionsTotal}</p>
                <p className="text-xs text-muted-foreground">Pending AI Detections</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="border-0 shadow-md">
          <div className="flex border-b border-border">
            <button onClick={() => setActivePanel("queue")}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                activePanel === "queue" ? "border-amber-500 text-amber-600 dark:text-amber-400" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <Microscope className="w-4 h-4" /> Detection Queue
            </button>
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

          {activePanel === "queue" && (
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[560px]">
                {/* Left: queue list */}
                <Card className="w-full lg:w-[36%] border-border/60 shadow-sm flex flex-col overflow-hidden">
                  <CardHeader className="p-3 border-b border-border/50">
                    <CardTitle className="text-xs font-bold text-foreground">
                      {detectionsLoading ? "Loading…" : `${detections.length} pending review`}
                    </CardTitle>
                  </CardHeader>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[420px] lg:max-h-none">
                    {detectionsLoading ? (
                      Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
                    ) : detections.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                        <p className="text-sm font-semibold text-foreground">Queue cleared</p>
                        <p className="text-xs text-muted-foreground mt-0.5">No pending AI disease detections need review.</p>
                      </div>
                    ) : detections.map(d => (
                      <button key={d.id} onClick={() => setSelectedDetection(d)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          selectedDetection?.id === d.id ? "bg-amber-500/10 border-amber-500/30" : "bg-muted/40 border-border hover:bg-muted hover:border-muted-foreground/20"
                        }`}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-xs font-bold text-foreground">{d.aiDisease.trim()}</p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${confidenceBadge(d.aiConfidence)}`}>
                            {d.aiConfidence}%
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{d.aiCrop}</p>
                        <p className="text-[9px] text-muted-foreground/70 mt-1">{new Date(d.createdAt).toLocaleDateString()}</p>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Right: detail */}
                <Card className="flex-1 border-border/60 shadow-sm flex flex-col overflow-hidden">
                  {!selectedDetection ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
                        <Microscope className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-foreground font-bold text-base mb-1">Select a Detection to Review</p>
                      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                        Click any pending detection from the queue to see the submitted photo and AI prediction.
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {/* Farmer identity */}
                      <div className="flex items-center gap-3 p-3 bg-muted/40 border border-border rounded-xl">
                        <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        {farmerLoading ? (
                          <Skeleton className="h-8 w-40" />
                        ) : selectedFarmer ? (
                          <div>
                            <p className="text-xs font-bold text-foreground">{selectedFarmer.name}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" /> {selectedFarmer.location || "Location not set"}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Farmer details unavailable</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Farmer image */}
                        <Card className="border-border/60 shadow-sm">
                          <CardHeader className="pb-2 p-3 border-b border-border/50">
                            <CardTitle className="flex items-center gap-2 text-xs">
                              <Camera className="w-3.5 h-3.5" /> Submitted Image
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-3">
                            {selectedDetection.imageUrl && !imageFailed ? (
                              <img
                                src={selectedDetection.imageUrl}
                                alt="Farmer-submitted diagnostic photo"
                                onError={() => setImageFailed(true)}
                                className="w-full h-44 object-cover rounded-lg border border-border"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-2 bg-muted/30 border-2 border-dashed border-border rounded-lg h-44 text-center px-4">
                                <ImageOff className="w-6 h-6 text-muted-foreground" />
                                <p className="text-[10px] text-muted-foreground">
                                  {imageFailed ? "Image failed to load" : "No photo was submitted with this detection"}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* AI prediction — single result, not a ranked list */}
                        <Card className="border-border/60 shadow-sm">
                          <CardHeader className="pb-2 p-3 border-b border-border/50">
                            <CardTitle className="flex items-center gap-2 text-xs">
                              <Sparkles className="w-3.5 h-3.5" /> AI Prediction
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-bold text-foreground">{selectedDetection.aiDisease.trim()}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${confidenceBadge(selectedDetection.aiConfidence)}`}>
                                {selectedDetection.aiConfidence}% confidence
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">Crop: {selectedDetection.aiCrop}</p>
                            {!selectedDetection.aiConfidenceReliable && (
                              <div className="flex items-start gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                                <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-[9px] text-amber-700 dark:text-amber-400 leading-relaxed">
                                  Model flagged this confidence estimate as unreliable — verify manually before confirming.
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Symptoms / treatment / prevention */}
                      <Card className="border-border/60 shadow-sm">
                        <CardContent className="p-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
                          <div>
                            <p className="text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">Symptoms</p>
                            <p className="text-foreground">{selectedDetection.symptoms}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">Treatment</p>
                            <p className="text-foreground">{selectedDetection.treatment}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">Prevention</p>
                            <p className="text-foreground">{selectedDetection.prevention}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Verify form */}
                      <Card className="border-border/60 shadow-sm">
                        <CardContent className="p-3 space-y-2">
                          <div>
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1">Verified Disease</label>
                            <input value={verifiedDisease} onChange={e => setVerifiedDisease(e.target.value)}
                              className="w-full bg-muted border border-border text-foreground text-xs px-2.5 py-2 rounded-lg focus:outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1">Verified Treatment</label>
                            <input value={verifiedTreatment} onChange={e => setVerifiedTreatment(e.target.value)}
                              className="w-full bg-muted border border-border text-foreground text-xs px-2.5 py-2 rounded-lg focus:outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1">Comment (optional)</label>
                            <textarea value={agronomistComment} onChange={e => setAgronomistComment(e.target.value)} rows={2}
                              className="w-full bg-muted border border-border text-foreground text-xs px-2.5 py-2 rounded-lg resize-none focus:outline-none" />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button onClick={() => handleVerify("verified")} disabled={verifying} variant="outline"
                          className="h-12 flex items-center justify-center gap-2 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900/30 dark:hover:bg-emerald-950/20">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Verify</span>
                        </Button>
                        <Button onClick={() => handleVerify("rejected")} disabled={verifying} variant="outline"
                          className="h-12 flex items-center justify-center gap-2 border-rose-200 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-950/20">
                          <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Reject</span>
                        </Button>
                      </div>

                      <button onClick={handleUseForPrescription}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-xs border border-sky-200 dark:border-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/20 transition-colors">
                        <FileText className="w-3.5 h-3.5" /> Use This Diagnosis for a Prescription
                      </button>
                    </div>
                  )}
                </Card>
              </div>
            </CardContent>
          )}

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
              {prescriptionDetectionId && (
                <div className="flex items-center justify-between gap-2 bg-sky-500/10 border border-sky-500/20 rounded-xl px-3 py-2">
                  <p className="text-[11px] text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Linked to an AI detection — diagnosis and crop were pre-filled
                  </p>
                  <button onClick={() => setPrescriptionDetectionId("")} className="text-sky-600 dark:text-sky-400 hover:opacity-70">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
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
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1">Dosage override (optional)</label>
                <input value={prescriptionDosageOverride} onChange={e => setPrescriptionDosageOverride(e.target.value)}
                  placeholder={selectedTreatment?.dosage || "Uses the treatment's default dosage if left blank"}
                  className="w-full bg-muted border border-border text-foreground text-xs px-2.5 py-2 rounded-lg focus:outline-none" />
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
