import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { formatDistanceToNow } from "date-fns"
import { useTheme } from "next-themes"
import {
  AlertTriangle,
  Bug,
  Camera,
  CheckCircle2,
  ChevronRight,
  Crosshair,
  Filter,
  ImagePlus,
  Leaf,
  Loader2,
  Menu,
  Moon,
  ScanLine,
  Search,
  Sun,
  Upload,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { NotificationsBell } from "@/components/NotificationsBell"
import { CommandCenterSidebar } from "@/components/CommandCenterSidebar"
import { CommandCenterMobileNav } from "@/components/CommandCenterMobileNav"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useDetectDisease, useMyDetections } from "@/hooks/useDisease"
import type { Detection } from "@/services/disease"
import { DISEASE_DETECTION_CROPS } from "@/constants/supportedCrops"

const MAX_FILE_SIZE = 10 * 1024 * 1024

function formatDate(date: string) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return date
  }
}

function confidenceTone(confidence: number) {
  if (confidence >= 75) return "text-[#d51f2c]"
  if (confidence >= 45) return "text-amber-600"
  return "text-emerald-600"
}

export default function DiseasePage() {
  const { t } = useTranslation()
  const { resolvedTheme, setTheme } = useTheme()
  const [searchParams] = useSearchParams()
  const requestedCrop = searchParams.get("crop") ?? ""
  const [selectedCrop, setSelectedCrop] = useState(
    () => DISEASE_DETECTION_CROPS.find((crop) => crop.toLowerCase() === requestedCrop.toLowerCase()) ?? ""
  )
  const [dragActive, setDragActive] = useState(false)
  const [uploadNotice, setUploadNotice] = useState<string | null>(null)
  const [lastDetection, setLastDetection] = useState<Detection | null>(null)
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null)
  const [scanPreview, setScanPreview] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [themeMounted, setThemeMounted] = useState(false)
  const isAuthenticated = Boolean(localStorage.getItem("token"))
  const [storeImage, setStoreImage] = useState(false)
  const [trainingConsent, setTrainingConsent] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<string | null>(null)

  const { data, loading: listLoading, refetch } = useMyDetections({ limit: 20 })
  const { mutate: detect, loading: detectLoading, error: detectError } = useDetectDisease()
  const detections = data?.detections ?? []
  const activeDetection = lastDetection ?? detections[0] ?? null

  const filteredDetections = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()
    if (!term) return detections
    return detections.filter((item) =>
      `${item.aiDisease} ${item.aiCrop} ${item.status}`.toLowerCase().includes(term)
    )
  }, [detections, searchQuery])

  useEffect(() => {
    if (detectError) setUploadNotice(detectError)
  }, [detectError])

  useEffect(() => setThemeMounted(true), [])

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
  }, [])

  const handleFile = useCallback(async (file: File) => {
    if (!selectedCrop) {
      setUploadNotice(t("dashboard.disease.selectCropMessage"))
      return
    }
    if (!file.type.startsWith("image/")) {
      setUploadNotice(t("dashboard.disease.invalidImageMessage"))
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadNotice(t("dashboard.disease.fileTooLargeMessage"))
      return
    }

    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    const preview = URL.createObjectURL(file)
    previewRef.current = preview
    setScanPreview(preview)
    setUploadNotice(null)

    await detect(
      file,
      selectedCrop,
      {
        storeImage: isAuthenticated && storeImage,
        useForTraining: isAuthenticated && storeImage && trainingConsent,
      },
      (detection) => {
      setLastDetection(detection)
      if (String(detection.id).startsWith("public-")) {
        window.dispatchEvent(new CustomEvent("imara-public-notification", {
          detail: {
            id: `public:disease:${detection.id}`,
            type: "disease",
            priority: detection.aiConfidence < 50 ? "high" : "medium",
            title: `Crop scan result: ${detection.aiDisease}`,
            message: `${detection.aiCrop} was identified with ${Math.round(detection.aiConfidence)}% confidence. Open the disease page to review guidance.`,
            data: { actionUrl: "/dashboard/disease" },
          },
        }))
      } else {
        window.dispatchEvent(new Event("imara-notifications-refresh"))
      }
      refetch()
      }
    )
  }, [detect, isAuthenticated, refetch, selectedCrop, storeImage, t, trainingConsent])

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    const file = event.dataTransfer.files[0]
    if (file) void handleFile(file)
  }

  const scannerImage = scanPreview || activeDetection?.imageUrl || "/disease-scanner-leaf.jpg"

  return (
    <div className="disease-command-shell h-screen overflow-hidden bg-[#eef8f1] dark:bg-[#101a14]">
      <style>{`
        .disease-command-shell { position: relative; width: 100%; height: 100vh; overflow: hidden; }
        .disease-command-sidebar {
          position: fixed; inset: 0 auto 0 0; z-index: 50; display: flex; width: 280px;
          flex-direction: column; background: #2e4d3d; color: white; transform: translateX(0);
        }
        .disease-command-content { display: flex; height: 100%; min-width: 0; margin-left: 280px; flex-direction: column; }
        .disease-command-header {
          display: flex; height: 48px; flex: 0 0 48px; align-items: center;
          border-bottom: 1px solid #dce9df; background: rgba(255,255,255,.82); padding: 0 28px;
        }
        .dark .disease-command-sidebar { background: #152a20; }
        .dark .disease-command-header { border-color: #294033; background: rgba(16,26,20,.94); color: #edf5ef; }
        .disease-mobile-overlay, .disease-menu-button, .disease-mobile-close { display: none; }
        @media (max-width: 1199px) {
          .disease-command-sidebar { width: 230px; }
          .disease-command-content { margin-left: 230px; }
        }
        @media (max-width: 767px) {
          .disease-command-sidebar { width: 280px; transform: translateX(-100%); transition: transform 250ms ease; }
          .disease-command-sidebar.is-open { transform: translateX(0); }
          .disease-command-content { margin-left: 0; }
          .disease-command-header { padding: 0 14px; }
          .disease-mobile-overlay { position: fixed; inset: 0; z-index: 40; display: block; background: rgba(0,0,0,.5); }
          .disease-menu-button { display: grid; width: 36px; height: 36px; place-items: center; }
          .disease-mobile-close { position: fixed; right: 16px; top: 16px; z-index: 60; display: grid; color: white; }
        }
      `}</style>

      {mobileOpen && <button type="button" className="disease-mobile-overlay" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}

      <CommandCenterSidebar
        active="diseaseDetection"
        open={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
        className="disease-command-sidebar"
      />

      <div className="disease-command-content">
        <header className="disease-command-header">
          <button type="button" className="disease-menu-button mr-2" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-[15px] font-bold"><span className="hidden sm:inline">Agri-Precision Command</span><span className="sm:hidden">IMARA</span></h1>
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {themeMounted && resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <NotificationsBell />
          <div className="hidden sm:block"><LanguageSwitcher /></div>
        </header>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleFile(file)
          event.target.value = ""
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleFile(file)
          event.target.value = ""
        }}
      />

      <main className="min-h-0 flex-1 overflow-y-auto px-3 pb-20 pt-3 sm:p-5 md:pb-5">
        <div className="mx-auto grid w-full max-w-[1180px] items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.9fr)]">
          <section className="min-w-0 overflow-hidden rounded-[6px] border border-[#d6e5da] bg-white shadow-[0_10px_35px_rgba(35,72,50,.06)] dark:border-[#2b4235] dark:bg-[#17271e]">
            <div
              className={`relative h-[310px] overflow-hidden bg-black sm:h-[520px] lg:h-[min(67vh,650px)] lg:min-h-[500px] ${dragActive ? "ring-2 ring-inset ring-[#9bf52e]" : ""}`}
              onDragEnter={(event) => { event.preventDefault(); setDragActive(true) }}
              onDragOver={(event) => { event.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <img
                src={scannerImage}
                alt="Plant leaf in the disease scanner"
                className="h-full w-full object-cover opacity-90"
              />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,.42)_100%)]" />

              <div className="absolute left-4 top-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.15em] text-[#9bf52e]">
                <span className="h-2 w-2 rounded-full bg-[#9bf52e] shadow-[0_0_0_4px_rgba(155,245,46,.13)]" />
                {detectLoading ? "AI analyzing live" : "Scanner ready"}
              </div>
              <div className="absolute right-4 top-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="grid h-8 w-8 place-items-center border border-white/20 bg-black/30 text-white/70 backdrop-blur hover:text-[#9bf52e]"
                  aria-label="Upload an image"
                >
                  <ImagePlus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="grid h-8 w-8 place-items-center border border-white/20 bg-black/30 text-white/70 backdrop-blur hover:text-[#9bf52e]"
                  aria-label="Open camera"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <div className="pointer-events-none absolute left-[38%] top-[30%] h-2 w-2 rounded-full bg-[#9bf52e] shadow-[0_0_0_5px_rgba(155,245,46,.12)]" />
              <div className="pointer-events-none absolute bottom-[30%] right-[32%] h-2 w-2 rounded-full bg-[#e62c39] shadow-[0_0_0_5px_rgba(230,44,57,.12)]" />
              <div className="pointer-events-none absolute bottom-[20%] left-[28%] h-2 w-2 rounded-full bg-[#9bf52e] shadow-[0_0_0_5px_rgba(155,245,46,.12)]" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 border border-[#9bf52e]/30">
                <span className="absolute -left-px -top-px h-4 w-4 border-l border-t border-[#9bf52e]" />
                <span className="absolute -right-px -top-px h-4 w-4 border-r border-t border-[#9bf52e]" />
                <span className="absolute -bottom-px -left-px h-4 w-4 border-b border-l border-[#9bf52e]" />
                <span className="absolute -bottom-px -right-px h-4 w-4 border-b border-r border-[#9bf52e]" />
              </div>
              {detectLoading && (
                <>
                  <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px animate-pulse bg-[#9bf52e] shadow-[0_0_16px_3px_rgba(155,245,46,.5)]" />
                  <div className="absolute inset-0 grid place-items-center bg-black/25">
                    <div className="flex items-center gap-2 bg-[#173020]/90 px-4 py-2 text-xs font-semibold text-[#9bf52e]">
                      <Loader2 className="h-4 w-4 animate-spin" /> Analyzing plant tissue…
                    </div>
                  </div>
                </>
              )}
              {dragActive && (
                <div className="absolute inset-0 grid place-items-center bg-[#173020]/80 text-sm font-semibold text-[#9bf52e]">
                  Drop image to start scan
                </div>
              )}
            </div>

            <div className="grid gap-3 border-t border-[#d9e5dc] bg-white p-3 dark:border-[#2b4235] dark:bg-[#17271e] sm:grid-cols-[1fr_auto_auto] sm:items-end">
              <label className="min-w-0">
                <span className="mb-1 block text-[8px] font-bold uppercase tracking-[.12em] text-muted-foreground">Crop under inspection</span>
                <select
                  value={selectedCrop}
                  onChange={(event) => {
                    setSelectedCrop(event.target.value)
                    setUploadNotice(null)
                  }}
                  className="h-9 w-full border border-input bg-background px-3 text-xs outline-none focus:border-[#77ad35]"
                >
                  <option value="">{t("dashboard.disease.selectCropPlaceholder")}</option>
                  {DISEASE_DETECTION_CROPS.map((crop) => <option key={crop} value={crop}>{crop}</option>)}
                </select>
              </label>
              <Button
                disabled={!selectedCrop || detectLoading}
                onClick={() => cameraInputRef.current?.click()}
                className="h-9 rounded-sm bg-[#315900] px-4 text-[9px] font-bold uppercase text-[#b3ff52] hover:bg-[#254500]"
              >
                <ScanLine className="mr-2 h-3.5 w-3.5" /> Start new scan
              </Button>
              <Button
                variant="outline"
                disabled={!selectedCrop || detectLoading}
                onClick={() => fileInputRef.current?.click()}
                className="h-9 rounded-sm px-4 text-[9px] font-bold uppercase"
              >
                <Upload className="mr-2 h-3.5 w-3.5" /> Upload image
              </Button>
              <div className="space-y-2 border-t border-[#e2ebe4] pt-3 text-[10px] text-muted-foreground dark:border-[#2b4235] sm:col-span-3">
                {isAuthenticated ? (
                  <>
                    <label className="flex cursor-pointer items-start gap-2">
                      <input
                        type="checkbox"
                        checked={storeImage}
                        onChange={(event) => {
                          setStoreImage(event.target.checked)
                          if (!event.target.checked) setTrainingConsent(false)
                        }}
                        className="mt-0.5"
                      />
                      <span>Save this private photo with my diagnosis history.</span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-2">
                      <input
                        type="checkbox"
                        checked={trainingConsent}
                        disabled={!storeImage}
                        onChange={(event) => setTrainingConsent(event.target.checked)}
                        className="mt-0.5"
                      />
                      <span>Allow agronomist-approved use of this photo to improve the disease model.</span>
                    </label>
                  </>
                ) : (
                  <p>Public scans are processed temporarily and are not saved. Sign in to save a private scan.</p>
                )}
              </div>
            </div>
            {uploadNotice && (
              <div className="flex items-start gap-2 border-t border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {uploadNotice}
              </div>
            )}
          </section>

          <aside className="min-w-0 space-y-4">
            <section className="rounded-[6px] border border-[#d6e5da] bg-white p-5 shadow-[0_8px_30px_rgba(35,72,50,.05)] dark:border-[#2b4235] dark:bg-[#17271e]">
              <h2 className="flex items-center gap-2 text-base font-medium">
                <AlertTriangle className={`h-4 w-4 ${activeDetection ? "text-[#d51f2c]" : "text-[#708078]"}`} />
                Active Diagnosis
              </h2>
              {activeDetection ? (
                <div className="mt-5">
                  <p className="text-[8px] font-bold uppercase tracking-[.12em] text-muted-foreground">Primary threat detected</p>
                  <div className="mt-1 flex items-end justify-between gap-3">
                    <div>
                      <p className={`text-lg font-bold ${confidenceTone(activeDetection.aiConfidence)}`}>{activeDetection.aiDisease}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{activeDetection.aiCrop}</p>
                    </div>
                    <span className="rounded-full bg-[#ffe8e9] px-2 py-1 text-[9px] font-bold text-[#b4131e] dark:bg-[#4a1c20] dark:text-[#ff9aa1]">
                      {Math.round(activeDetection.aiConfidence)}% confidence
                    </span>
                  </div>
                  <div className="mt-5">
                    <div className="flex justify-between text-[9px] text-muted-foreground">
                      <span>AI confidence</span>
                      <span>{Math.round(activeDetection.aiConfidence)}%</span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden bg-muted">
                      <div className="h-full bg-[#d51f2c]" style={{ width: `${activeDetection.aiConfidence}%` }} />
                    </div>
                  </div>
                  {activeDetection.aiConfidenceReliable === false && (
                    <div className="mt-4 flex items-start gap-2 border border-amber-200 bg-amber-50 p-3 text-[10px] leading-4 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        This prediction is uncertain and requires agronomist review.
                        {activeDetection.aiConfidenceReason === "calibration_not_fitted"
                          ? " Confidence calibration is waiting for verified validation images."
                          : ""}
                      </span>
                    </div>
                  )}
                  {activeDetection.captureGuidance && (
                    <div className={`mt-4 border p-3 text-[10px] leading-4 ${
                      activeDetection.captureGuidance.status === "more_images_required"
                        ? "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200"
                        : "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                    }`}>
                      <p className="font-semibold">
                        {activeDetection.captureGuidance.status === "more_images_required"
                          ? "Additional photo needed"
                          : "Leaf close-up is sufficient for this stage"}
                      </p>
                      {activeDetection.captureGuidance.missing_views.map((view) => (
                        <div key={view} className="mt-2">
                          <p className="font-semibold capitalize">{view.replaceAll("_", " ")}</p>
                          <p>{activeDetection.captureGuidance?.instructions?.[view]}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mt-4 line-clamp-3 text-[10px] leading-4 text-muted-foreground">{activeDetection.treatment}</p>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDetection(activeDetection)}
                    className="mt-4 h-8 w-full rounded-sm text-[9px]"
                  >
                    View detailed report
                  </Button>
                </div>
              ) : (
                <div className="mt-5 border border-dashed border-[#cbd9ce] p-5 text-center dark:border-[#344c3d]">
                  <Crosshair className="mx-auto h-7 w-7 text-[#78907f]" />
                  <p className="mt-3 text-xs font-semibold">Ready for inspection</p>
                  <p className="mt-1 text-[10px] leading-4 text-muted-foreground">Select a crop and upload or photograph a leaf to begin.</p>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-[6px] border border-[#d6e5da] bg-white shadow-[0_8px_30px_rgba(35,72,50,.05)] dark:border-[#2b4235] dark:bg-[#17271e]">
              <div className="flex items-center gap-2 border-b border-[#e2ebe4] px-4 py-3 dark:border-[#2b4235]">
                <span className="text-[9px] font-bold uppercase tracking-[.1em]">Recent scans</span>
                <span className="text-[8px] text-muted-foreground">({filteredDetections.length})</span>
                <Filter className="ml-auto h-3 w-3 text-muted-foreground" />
              </div>
              <div className="relative border-b border-[#e2ebe4] dark:border-[#2b4235]">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search scans…"
                  className="h-9 w-full bg-transparent pl-9 pr-3 text-[10px] outline-none"
                />
              </div>
              <div className="max-h-[390px] space-y-1 overflow-y-auto p-2">
                {listLoading ? (
                  [0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-[66px] w-full rounded-sm" />)
                ) : filteredDetections.length === 0 ? (
                  <div className="px-3 py-10 text-center text-[10px] text-muted-foreground">
                    No saved scans yet
                  </div>
                ) : (
                  filteredDetections.map((detection) => (
                    <button
                      key={detection.id}
                      type="button"
                      onClick={() => setSelectedDetection(detection)}
                      className="group flex w-full items-center gap-3 border border-transparent p-2 text-left transition hover:border-[#bed0c2] hover:bg-[#f1f7f2] dark:hover:border-[#344c3d] dark:hover:bg-[#203229]"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-[#dce9dd]">
                        {detection.imageUrl
                          ? <img src={detection.imageUrl} alt="" className="h-full w-full object-cover" />
                          : <Leaf className="m-3 h-6 w-6 text-[#46694f]" />}
                        <span className={`absolute bottom-1 right-1 h-2 w-2 rounded-full border border-white ${detection.aiConfidence >= 75 ? "bg-[#e12936]" : "bg-[#8eef2f]"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-semibold">SCN-{String(detection.id).slice(-5).toUpperCase()}</p>
                        <p className={`mt-0.5 truncate text-[9px] ${confidenceTone(detection.aiConfidence)}`}>
                          {detection.aiDisease} ({Math.round(detection.aiConfidence)}%)
                        </p>
                      </div>
                      <span className="shrink-0 text-[8px] text-muted-foreground">{formatDate(detection.createdAt)}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                    </button>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>
      </div>

      {mobileOpen && (
        <button type="button" className="disease-mobile-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      )}
      <CommandCenterMobileNav active="diseaseDetection" />

      <Dialog open={!!selectedDetection} onOpenChange={(open) => !open && setSelectedDetection(null)}>
        <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
          {selectedDetection && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5 text-[#d51f2c]" />
                  {selectedDetection.aiDisease}
                </DialogTitle>
                <DialogDescription>{selectedDetection.aiCrop} · {Math.round(selectedDetection.aiConfidence)}% confidence</DialogDescription>
              </DialogHeader>
              {selectedDetection.imageUrl && (
                <img src={selectedDetection.imageUrl} alt={selectedDetection.aiDisease} className="h-56 w-full rounded-md object-cover" />
              )}
              <div className="grid gap-4">
                <ReportSection title="Symptoms" content={selectedDetection.symptoms} />
                <ReportSection title="Treatment" content={selectedDetection.treatment} />
                <ReportSection title="Prevention" content={selectedDetection.prevention} />
                {(selectedDetection.verifiedDisease || selectedDetection.agronomistComment) && (
                  <div className="border-t pt-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Agronomist verification</h3>
                    {selectedDetection.verifiedDisease && <p className="mt-2 text-xs text-muted-foreground">Verified as: {selectedDetection.verifiedDisease}</p>}
                    {selectedDetection.agronomistComment && <p className="mt-1 text-xs text-muted-foreground">{selectedDetection.agronomistComment}</p>}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ReportSection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{content}</p>
    </div>
  )
}
