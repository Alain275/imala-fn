import { useTranslation } from "react-i18next"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Bug,
  Upload,
  Camera,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronRight,
  Search,
  Leaf,
} from "lucide-react"
import { useState, useRef, useCallback } from "react"
import { formatDistanceToNow } from "date-fns"
import { useMyDetections, useDetectDisease } from "@/hooks/useDisease"
import type { Detection } from "@/services/disease"

const MAX_FILE_SIZE = 10 * 1024 * 1024

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase()
  if (s === "verified" || s === "approved") {
    return (
      <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        Verified
      </span>
    )
  }
  if (s.includes("pending")) {
    return (
      <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
        Pending review
      </span>
    )
  }
  if (s === "rejected") {
    return (
      <span className="text-xs font-medium px-2 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
        Rejected
      </span>
    )
  }
  return (
    <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">
      {status.replace(/_/g, " ")}
    </span>
  )
}

function formatDate(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
  } catch {
    return dateStr
  }
}

function DetailSection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h4 className="font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{content}</p>
    </div>
  )
}

export default function DiseasePage() {
  const { t } = useTranslation()
  const [dragActive, setDragActive] = useState(false)
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [showAllRecent, setShowAllRecent] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { data: detectionsData, loading: listLoading, refetch } = useMyDetections()
  const { mutate: detect, loading: detectLoading } = useDetectDisease()

  const detections = detectionsData?.detections ?? []
  const visibleRecent = showAllRecent ? detections : detections.slice(0, 3)

  const lowerQuery = searchQuery.toLowerCase()
  const filteredDetections = searchQuery
    ? detections.filter(
        (d) =>
          d.aiDisease.toLowerCase().includes(lowerQuery) ||
          d.aiCrop.toLowerCase().includes(lowerQuery) ||
          d.symptoms.toLowerCase().includes(lowerQuery)
      )
    : detections
  // TODO: server-side search via my-detections query params when list grows large

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        return
      }
      await detect(file, (detection) => {
        setSelectedDetection(detection)
        refetch()
      })
    },
    [detect, refetch]
  )

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        title={t("dashboard.disease.pageTitle")}
        subtitle={t("dashboard.disease.pageSubtitle")}
      />

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ""
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ""
        }}
      />

      <div className="p-6 space-y-6">
        {/* Upload Section */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Icon3D gradient="earth" size="sm">
                <Camera className="w-4 h-4" />
              </Icon3D>
              <span>{t("dashboard.disease.scanCardTitle")}</span>
            </CardTitle>
            <CardDescription>{t("dashboard.disease.scanCardDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => {
                e.preventDefault()
                setDragActive(false)
                const file = e.dataTransfer.files[0]
                if (file) handleFile(file)
              }}
            >
              <div className="flex flex-col items-center gap-4">
                {detectLoading ? (
                  <>
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                      <Bug className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground">Analyzing your plant…</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        AI is detecting disease, please wait
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground">
                        {t("dashboard.disease.dragDropTitle")}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("dashboard.disease.dragDropSubtitle")}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        className="gap-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4" />
                        {t("dashboard.disease.uploadImageButton")}
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => cameraInputRef.current?.click()}
                      >
                        <Camera className="w-4 h-4" />
                        {t("dashboard.disease.takePhotoButton")}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("dashboard.disease.supportedFormats")}
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Detections */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              {t("dashboard.disease.recentDetectionsTitle")}
            </h2>
            <Button
              variant="ghost"
              className="text-primary"
              onClick={() => setShowAllRecent((v) => !v)}
            >
              {showAllRecent ? "Show less" : t("dashboard.disease.viewHistoryButton")}
              <ChevronRight
                className={`w-4 h-4 ml-1 transition-transform ${showAllRecent ? "rotate-90" : ""}`}
              />
            </Button>
          </div>

          {listLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <Card key={i} className="border-0 shadow-md overflow-hidden">
                  <Skeleton className="h-40 w-full rounded-none" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : visibleRecent.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No detections yet — upload a plant photo to get started
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {visibleRecent.map((detection) => (
                <Card
                  key={detection.id}
                  className="card-hover border-0 shadow-md overflow-hidden"
                >
                  <div className="h-40 bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center overflow-hidden">
                    {detection.imageUrl ? (
                      <img
                        src={detection.imageUrl}
                        alt={detection.aiDisease}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon3D gradient="earth" size="xl">
                        <Bug className="w-10 h-10" />
                      </Icon3D>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{detection.aiDisease}</h3>
                        <p className="text-sm text-muted-foreground">{detection.aiCrop}</p>
                      </div>
                      <StatusBadge status={detection.status} />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.round(detection.aiConfidence)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {Math.round(detection.aiConfidence)}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {detection.treatment}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(detection.createdAt)}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedDetection(detection)}
                      >
                        {t("common.actions.viewDetails")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Disease Tips (static) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-md bg-amber-500/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-1">
                    {t("dashboard.disease.tipEarlyDetectionTitle")}
                  </h3>
                  <p className="text-sm text-amber-700/70 dark:text-amber-300/70">
                    {t("dashboard.disease.tipEarlyDetectionDescription")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-emerald-500/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                    {t("dashboard.disease.tipPhotoTipsTitle")}
                  </h3>
                  <p className="text-sm text-emerald-700/70 dark:text-emerald-300/70">
                    {t("dashboard.disease.tipPhotoTipsDescription")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-sky-500/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sky-700 dark:text-sky-300 mb-1">
                    {t("dashboard.disease.tipExpertHelpTitle")}
                  </h3>
                  <p className="text-sm text-sky-700/70 dark:text-sky-300/70">
                    {t("dashboard.disease.tipExpertHelpDescription")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disease Database (from real my-detections data) */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Icon3D gradient="leaf" size="sm">
                <Bug className="w-4 h-4" />
              </Icon3D>
              <div>
                <CardTitle>{t("dashboard.disease.databaseTitle")}</CardTitle>
                <CardDescription>{t("dashboard.disease.databaseDescription")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="db-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by disease or crop…"
                className="pl-9"
              />
            </div>
            {listLoading ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/50"
                  >
                    <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : detections.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No detections yet — upload a plant photo to get started
              </div>
            ) : filteredDetections.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No results for &ldquo;{searchQuery}&rdquo; — try a different disease or crop name
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDetections.map((detection) => (
                  <div
                    key={detection.id}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => setSelectedDetection(detection)}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                      {detection.imageUrl ? (
                        <img
                          src={detection.imageUrl}
                          alt={detection.aiDisease}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                          <Leaf className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{detection.aiDisease}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {detection.aiCrop}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>{t("dashboard.disease.symptomsLabel")}</strong>{" "}
                        {detection.symptoms}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detection Detail Dialog */}
      <Dialog
        open={!!selectedDetection}
        onOpenChange={(open) => {
          if (!open) setSelectedDetection(null)
        }}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedDetection && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedDetection.aiDisease}</DialogTitle>
                <DialogDescription>{selectedDetection.aiCrop}</DialogDescription>
              </DialogHeader>

              {selectedDetection.imageUrl && (
                <img
                  src={selectedDetection.imageUrl}
                  alt={selectedDetection.aiDisease}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              <div className="flex items-center gap-3">
                <StatusBadge status={selectedDetection.status} />
                <span className="text-sm text-muted-foreground">
                  Confidence: {Math.round(selectedDetection.aiConfidence)}%
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatDate(selectedDetection.createdAt)}
                </span>
              </div>

              <div className="space-y-4">
                <DetailSection title="Symptoms" content={selectedDetection.symptoms} />
                <DetailSection title="Treatment" content={selectedDetection.treatment} />
                <DetailSection title="Prevention" content={selectedDetection.prevention} />

                {(selectedDetection.verifiedDisease ||
                  selectedDetection.agronomistComment ||
                  selectedDetection.verifiedBy) && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-foreground mb-3">
                      Agronomist Verification
                    </h4>
                    {selectedDetection.verifiedDisease && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Verified as:</strong> {selectedDetection.verifiedDisease}
                      </p>
                    )}
                    {selectedDetection.agronomistComment && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Comment:</strong> {selectedDetection.agronomistComment}
                      </p>
                    )}
                    {selectedDetection.verifiedBy && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>By:</strong> {selectedDetection.verifiedBy}
                      </p>
                    )}
                    {selectedDetection.verifiedAt && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>On:</strong> {formatDate(selectedDetection.verifiedAt)}
                      </p>
                    )}
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
