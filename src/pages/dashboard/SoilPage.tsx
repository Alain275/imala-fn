import { useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { getIntlLocale } from "@/lib/dateLocale"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Mountain,
  Droplets,
  Thermometer,
  Leaf,
  FlaskConical,
  MapPin,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Info,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts"
import {
  useSoilAnalysis,
  useSoilTests,
  useLatestSoilTest,
  useSoilTest,
  useCreateSoilTest,
  useUpdateSoilTest,
  useDeleteSoilTest,
} from "@/hooks/useSoil"
import type {
  NutrientProfile,
  SoilTest,
  Recommendation,
  CropSuitability,
  CreateSoilTestInput,
} from "@/services/soil"

// ── Form value types ──────────────────────────────────────────────────────────

type FormValues = {
  ph: string
  nitrogen: string
  phosphorus: string
  potassium: string
  organicMatter: string
  texture: string
  location: string
  notes: string
}

const defaultForm: FormValues = {
  ph: "",
  nitrogen: "",
  phosphorus: "",
  potassium: "",
  organicMatter: "",
  texture: "",
  location: "",
  notes: "",
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

function testToForm(test: SoilTest): FormValues {
  return {
    ph: String(test.ph),
    nitrogen: String(test.nitrogen),
    phosphorus: String(test.phosphorus),
    potassium: String(test.potassium),
    organicMatter: String(test.organicMatter),
    texture: test.texture,
    location: test.location,
    notes: test.notes,
  }
}

function parseFormValues(form: FormValues): CreateSoilTestInput {
  return {
    ph: parseFloat(form.ph),
    nitrogen: parseFloat(form.nitrogen),
    phosphorus: parseFloat(form.phosphorus),
    potassium: parseFloat(form.potassium),
    organicMatter: parseFloat(form.organicMatter),
    texture: form.texture,
    location: form.location,
    notes: form.notes,
  }
}

function statusColor(status: string | undefined): string {
  switch (status) {
    case "excellent":
    case "good":
      return "text-emerald-600"
    case "fair":
      return "text-amber-600"
    case "poor":
      return "text-red-600"
    default:
      return "text-muted-foreground"
  }
}

function formatTestDate(iso: string, intlLocale: string): string {
  return new Date(iso).toLocaleDateString(intlLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function statusToScore(status: string | undefined): number {
  switch (status) {
    case "excellent": return 100
    case "good":      return 75
    case "fair":      return 50
    case "poor":      return 25
    default:          return 0
  }
}

type RadarLabels = { ph: string; nitrogen: string; phosphorus: string; potassium: string; organicMatter: string }

function buildRadarData(profile: NutrientProfile, labels: RadarLabels) {
  const axis = (score: number | null, status: string | undefined) =>
    score !== null ? score : statusToScore(status)
  return [
    { subject: labels.ph,            A: axis(profile.ph.score,            profile.ph.status),            fullMark: 100 },
    { subject: labels.nitrogen,      A: axis(profile.nitrogen.score,      profile.nitrogen.status),      fullMark: 100 },
    { subject: labels.phosphorus,    A: axis(profile.phosphorus.score,    profile.phosphorus.status),    fullMark: 100 },
    { subject: labels.potassium,     A: axis(profile.potassium.score,     profile.potassium.status),     fullMark: 100 },
    { subject: labels.organicMatter, A: axis(profile.organicMatter.score, profile.organicMatter.status), fullMark: 100 },
  ]
}

type HistTable = {
  headers: string[]
  rows: { parameter: string; values: number[]; change: string }[]
  showChange: boolean
}

function buildHistoricalTable(tests: SoilTest[], intlLocale: string, paramLabels: RadarLabels): HistTable {
  // sort oldest → newest, keep last 4
  const sorted = [...tests]
    .sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime())
    .slice(-4)

  // only as many columns as we actually have — no "—" padding
  const headers = sorted.map(t =>
    new Date(t.testDate).toLocaleString(intlLocale, { month: "short" })
  )

  const showChange = sorted.length >= 2

  type NumKey = "ph" | "nitrogen" | "phosphorus" | "potassium" | "organicMatter"

  const computeChange = (key: NumKey): string => {
    if (!showChange) return ""
    const diff = (sorted[sorted.length - 1][key] as number) - (sorted[0][key] as number)
    return diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)
  }

  const rowDefs: { parameter: string; key: NumKey }[] = [
    { parameter: paramLabels.ph, key: "ph" },
    { parameter: paramLabels.nitrogen, key: "nitrogen" },
    { parameter: paramLabels.phosphorus, key: "phosphorus" },
    { parameter: paramLabels.potassium, key: "potassium" },
    { parameter: paramLabels.organicMatter, key: "organicMatter" },
  ]

  return {
    headers,
    showChange,
    rows: rowDefs.map(({ parameter, key }) => ({
      parameter,
      values: sorted.map(t => t[key] as number),
      change: computeChange(key),
    })),
  }
}

// ── Shared form component (create + edit) ─────────────────────────────────────

interface SoilFormProps {
  initial?: FormValues
  submitLabel: string
  submitting: boolean
  onSubmit: (values: FormValues) => void
  onCancel: () => void
}

function SoilForm({ initial, submitLabel, submitting, onSubmit, onCancel }: SoilFormProps) {
  const { t } = useTranslation()
  const [form, setForm] = useState<FormValues>(initial ?? defaultForm)

  const setField =
    (key: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = () => {
    const numKeys = ["ph", "nitrogen", "phosphorus", "potassium", "organicMatter"] as const
    if (
      numKeys.some(k => !form[k] || isNaN(parseFloat(form[k]))) ||
      !form.texture ||
      !form.location
    ) {
      toast.error(t("dashboard.soil.formValidationError"))
      return
    }
    onSubmit(form)
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="ph">{t("dashboard.soil.phLabel")}</Label>
          <Input
            id="ph"
            type="number"
            step="0.1"
            min="0"
            max="14"
            placeholder={t("dashboard.soil.phPlaceholder")}
            value={form.ph}
            onChange={setField("ph")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nitrogen">{t("dashboard.soil.nitrogenHeader")}</Label>
          <Input
            id="nitrogen"
            type="number"
            placeholder={t("dashboard.soil.nitrogenPlaceholder")}
            value={form.nitrogen}
            onChange={setField("nitrogen")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phosphorus">{t("dashboard.soil.phosphorusHeader")}</Label>
          <Input
            id="phosphorus"
            type="number"
            placeholder={t("dashboard.soil.phosphorusPlaceholder")}
            value={form.phosphorus}
            onChange={setField("phosphorus")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="potassium">{t("dashboard.soil.potassiumHeader")}</Label>
          <Input
            id="potassium"
            type="number"
            placeholder={t("dashboard.soil.potassiumPlaceholder")}
            value={form.potassium}
            onChange={setField("potassium")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organicMatter">{t("dashboard.soil.organicMatterHeader")}</Label>
          <Input
            id="organicMatter"
            type="number"
            step="0.1"
            placeholder={t("dashboard.soil.organicMatterPlaceholder")}
            value={form.organicMatter}
            onChange={setField("organicMatter")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="texture">{t("dashboard.soil.textureHeader")}</Label>
          <Input
            id="texture"
            placeholder={t("dashboard.soil.texturePlaceholder")}
            value={form.texture}
            onChange={setField("texture")}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="location">{t("dashboard.soil.locationHeader")}</Label>
          <Input
            id="location"
            placeholder={t("dashboard.soil.locationPlaceholder")}
            value={form.location}
            onChange={setField("location")}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="notes">{t("dashboard.soil.notesLabel")}</Label>
          <Textarea
            id="notes"
            placeholder={t("dashboard.soil.notesPlaceholder")}
            value={form.notes}
            onChange={setField("notes")}
            rows={3}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          {t("common.actions.cancel")}
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? t("common.actions.saving") : submitLabel}
        </Button>
      </div>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const isHigh = rec.priority === "high"
  const isMedium = rec.priority === "medium"
  return (
    <div
      className={`p-4 rounded-xl ${
        isHigh
          ? "bg-red-50 border border-red-200"
          : isMedium
          ? "bg-amber-50 border border-amber-200"
          : "bg-emerald-50 border border-emerald-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {rec.type === "action" ? (
          <AlertTriangle
            className={`w-5 h-5 flex-shrink-0 ${isHigh ? "text-red-500" : "text-amber-500"}`}
          />
        ) : (
          <Info className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        )}
        <div>
          <h4 className="font-medium text-foreground">{rec.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
        </div>
      </div>
    </div>
  )
}

function CropCard({ crop }: { crop: CropSuitability }) {
  const { t } = useTranslation()
  const pct = crop.suitability ?? 0
  return (
    <div className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-foreground">{crop.crop}</span>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            crop.status === "excellent"
              ? "bg-emerald-100 text-emerald-700"
              : crop.status === "good"
              ? "bg-blue-100 text-blue-700"
              : crop.status === "fair"
              ? "bg-amber-100 text-amber-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {t(`common.status.${crop.status}`, { defaultValue: crop.status })}
        </span>
      </div>
      <Progress value={pct} className="h-2 mb-2" />
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t("dashboard.soil.suitabilityLabel")}</span>
        <span className="font-medium text-foreground">
          {crop.suitability != null ? `${crop.suitability}%` : "—"}
        </span>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SoilPage() {
  const { t, i18n } = useTranslation()
  const intlLocale = getIntlLocale(i18n.language)

  // Dialog / modal state
  const [formOpen, setFormOpen] = useState(false)
  const [editTest, setEditTest] = useState<SoilTest | null>(null)
  const [viewId, setViewId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Data hooks
  const { data: analysis, loading: analysisLoading, refetch: refetchAnalysis } = useSoilAnalysis()
  // Latest test is the authoritative source of location — avoids useSoilTests running with ""
  const { data: latest, refetch: refetchLatest } = useLatestSoilTest()
  const location = latest?.location ?? ""
  // limit=10: serves both the history card and the trends table (slice(-4) inside buildHistoricalTable)
  const { data: testsData, loading: testsLoading, refetch: refetchTests } = useSoilTests(location, 1, 10)
  // Only fetches when viewId is set (useSoilTest skips when id is falsy)
  const { data: viewTest, loading: viewLoading } = useSoilTest(viewId ?? "")

  // Mutation hooks
  const { mutate: createTest, loading: creating } = useCreateSoilTest()
  const { mutate: updateTest, loading: updating } = useUpdateSoilTest()
  const { mutate: deleteTest, loading: deleting } = useDeleteSoilTest()

  // Derived data
  const radarLabels: RadarLabels = {
    ph: t("dashboard.soil.radarPh"),
    nitrogen: t("dashboard.soil.radarNitrogen"),
    phosphorus: t("dashboard.soil.radarPhosphorus"),
    potassium: t("dashboard.soil.radarPotassium"),
    organicMatter: t("dashboard.soil.radarOrganicMatter"),
  }
  const tableParamLabels: RadarLabels = {
    ph: t("dashboard.soil.phHeader"),
    nitrogen: t("dashboard.soil.nitrogenHeader"),
    phosphorus: t("dashboard.soil.phosphorusHeader"),
    potassium: t("dashboard.soil.potassiumHeader"),
    organicMatter: t("dashboard.soil.organicMatterHeader"),
  }
  const radarData = analysis ? buildRadarData(analysis.nutrientProfile, radarLabels) : []
  const histTable: HistTable = testsData?.tests?.length
    ? buildHistoricalTable(testsData.tests, intlLocale, tableParamLabels)
    : { headers: [], rows: [], showChange: false }

  // ── Handlers ────────────────────────────────────────────────────────────────

  const closeForm = () => { setFormOpen(false); setEditTest(null) }

  const openCreate = () => { setEditTest(null); setFormOpen(true) }
  const openEdit   = (test: SoilTest) => { setEditTest(test); setFormOpen(true) }
  const openView   = (id: string) => setViewId(id)
  const openDelete = (id: string) => setDeleteId(id)

  const afterMutation = () => {
    refetchTests()
    refetchAnalysis()
    refetchLatest()
  }

  const handleFormSubmit = (values: FormValues) => {
    const body = parseFormValues(values)
    if (editTest) {
      updateTest(editTest.id, body, () => { closeForm(); afterMutation() })
    } else {
      createTest(body, () => { closeForm(); afterMutation() })
    }
  }

  const handleDelete = () => {
    if (!deleteId) return
    deleteTest(deleteId, () => { setDeleteId(null); afterMutation() })
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen">
      <Header
        title={t("dashboard.soil.pageTitle")}
        subtitle={t("dashboard.soil.pageSubtitle")}
      />

      <div className="p-6 space-y-6">

        {/* ── Soil Overview ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Soil Health Card */}
          <Card className="lg:col-span-2 border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon3D gradient="earth" size="md">
                    <Mountain className="w-6 h-6" />
                  </Icon3D>
                  <div>
                    <CardTitle>{t("dashboard.soil.healthScoreTitle")}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {analysisLoading ? (
                        <Skeleton className="h-3 w-40" />
                      ) : (
                        analysis?.test?.location ?? "—"
                      )}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  {analysisLoading ? (
                    <Skeleton className="h-10 w-16 ml-auto" />
                  ) : (
                    <>
                      <p className="text-4xl font-bold text-primary">
                        {analysis?.healthScore ?? "—"}
                      </p>
                      <p className="text-sm text-muted-foreground">{t("dashboard.soil.outOf100")}</p>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {analysisLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {/* pH */}
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <FlaskConical className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">{t("dashboard.soil.phLabel")}</span>
                    </div>
                    <p className="text-2xl font-semibold text-foreground">
                      {analysis?.test?.ph ?? "—"}
                    </p>
                    <p className={`text-xs ${statusColor(analysis?.nutrientProfile?.ph?.status)}`}>
                      {analysis?.nutrientProfile?.ph?.status
                        ? t(`common.status.${analysis.nutrientProfile.ph.status}`, { defaultValue: analysis.nutrientProfile.ph.status })
                        : "—"}
                    </p>
                  </div>

                  {/* Nitrogen — unit is mg/kg, not % */}
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-muted-foreground">{t("dashboard.soil.nitrogenLabel")}</span>
                    </div>
                    <p className="text-2xl font-semibold text-foreground">
                      {analysis?.test?.nitrogen != null
                        ? `${analysis.test.nitrogen} mg/kg`
                        : "—"}
                    </p>
                    <p className={`text-xs ${statusColor(analysis?.nutrientProfile?.nitrogen?.status)}`}>
                      {analysis?.nutrientProfile?.nitrogen?.status
                        ? t(`common.status.${analysis.nutrientProfile.nitrogen.status}`, { defaultValue: analysis.nutrientProfile.nitrogen.status })
                        : "—"}
                    </p>
                  </div>

                  {/* Moisture — placeholder, no API endpoint yet */}
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-muted-foreground">{t("dashboard.soil.moistureLabel")}</span>
                    </div>
                    <p className="text-2xl font-semibold text-foreground">—</p>
                    <p className="text-xs text-muted-foreground">{t("dashboard.soil.noDataYet")}</p>
                  </div>

                  {/* Texture */}
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-muted-foreground">{t("dashboard.soil.textureHeader")}</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {analysis?.test?.texture ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">—</p>
                  </div>
                </div>
              )}

              <Button className="w-full" onClick={openCreate}>
                {t("dashboard.soil.requestNewTest")}
              </Button>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-0">
              <CardTitle className="text-base">{t("dashboard.soil.nutrientProfileTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              {analysisLoading ? (
                <Skeleton className="h-64 rounded-xl" />
              ) : radarData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar
                        name={t("dashboard.soil.radarSeriesName")}
                        dataKey="A"
                        stroke="#22c55e"
                        fill="#22c55e"
                        fillOpacity={0.3}
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={800}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">{t("dashboard.soil.noNutrientData")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Crop Suitability ─────────────────────────────────────────────── */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Icon3D gradient="green" size="sm">
                <Leaf className="w-4 h-4" />
              </Icon3D>
              <span>{t("dashboard.soil.cropSuitabilityTitle")}</span>
            </CardTitle>
            <CardDescription>{t("dashboard.soil.cropSuitabilityDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {analysisLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : analysis?.cropSuitability && analysis.cropSuitability.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.cropSuitability.map(crop => (
                  <CropCard key={crop.crop} crop={crop} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("dashboard.soil.noCropSuitabilityData")}</p>
            )}
          </CardContent>
        </Card>

        {/* ── Recommendations & Historical Trends ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommendations */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Icon3D gradient="gold" size="sm">
                  <CheckCircle className="w-4 h-4" />
                </Icon3D>
                <span>{t("dashboard.soil.recommendationsTitle")}</span>
              </CardTitle>
              <CardDescription>{t("dashboard.soil.recommendationsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {analysisLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : analysis?.recommendations && analysis.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {analysis.recommendations.map((rec, i) => (
                    <RecommendationCard key={i} rec={rec} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("dashboard.soil.noRecommendations")}</p>
              )}
            </CardContent>
          </Card>

          {/* Historical Trends */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Icon3D gradient="sky" size="sm">
                    <FlaskConical className="w-4 h-4" />
                  </Icon3D>
                  <span>{t("dashboard.soil.historicalTrendsTitle")}</span>
                </CardTitle>
                {/* Wired: opens detail view for the latest test */}
                <Button
                  variant="ghost"
                  className="text-primary text-sm"
                  disabled={!latest}
                  onClick={() => latest && openView(latest.id)}
                >
                  {t("dashboard.soil.viewFullReport")} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {testsLoading || analysisLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded" />
                  ))}
                </div>
              ) : histTable.rows.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 text-sm font-medium text-muted-foreground">
                            {t("dashboard.soil.parameterHeader")}
                          </th>
                          {histTable.headers.map((h, i) => (
                            <th
                              key={i}
                              className="text-center py-3 text-sm font-medium text-muted-foreground"
                            >
                              {h}
                            </th>
                          ))}
                          {histTable.showChange && (
                            <th className="text-right py-3 text-sm font-medium text-muted-foreground">
                              {t("dashboard.soil.changeHeader")}
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {histTable.rows.map((row, i) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="py-3 text-sm font-medium text-foreground">
                              {row.parameter}
                            </td>
                            {row.values.map((v, j) => (
                              <td
                                key={j}
                                className="py-3 text-sm text-center text-muted-foreground"
                              >
                                {String(v)}
                              </td>
                            ))}
                            {histTable.showChange && (
                              <td className="py-3 text-sm text-right text-emerald-600 font-medium">
                                {row.change}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {!histTable.showChange && (
                    <p className="text-xs text-muted-foreground mt-3">
                      {t("dashboard.soil.addMoreTestsHint")}
                    </p>
                  )}
                  {analysis?.test?.testDate && (
                    <p className="text-xs text-muted-foreground mt-4">
                      {t("dashboard.soil.lastUpdated", { date: formatTestDate(analysis.test.testDate, intlLocale) })}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.soil.noHistoricalData")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Soil Test History ─────────────────────────────────────────────── */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Icon3D gradient="earth" size="sm">
                <FlaskConical className="w-4 h-4" />
              </Icon3D>
              <span>{t("dashboard.soil.testHistoryTitle")}</span>
            </CardTitle>
            <CardDescription>
              {location
                ? t("dashboard.soil.testHistoryDescriptionWithLocation", { location })
                : t("dashboard.soil.testHistoryDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded" />
                ))}
              </div>
            ) : testsData?.tests && testsData.tests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        {t("dashboard.soil.dateHeader")}
                      </th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">
                        {t("dashboard.soil.locationHeader")}
                      </th>
                      <th className="text-center py-3 pr-4 text-sm font-medium text-muted-foreground">
                        {t("dashboard.soil.phHeader")}
                      </th>
                      <th className="text-center py-3 pr-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        {t("dashboard.soil.nitrogenHeader")}
                      </th>
                      <th className="text-center py-3 pr-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        {t("dashboard.soil.phosphorusHeader")}
                      </th>
                      <th className="text-center py-3 pr-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        {t("dashboard.soil.potassiumHeader")}
                      </th>
                      <th className="text-center py-3 pr-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        {t("dashboard.soil.organicMatterHeader")}
                      </th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">
                        {t("dashboard.soil.textureHeader")}
                      </th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">
                        {t("dashboard.soil.actionsHeader")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {testsData.tests.map(test => (
                      <tr
                        key={test.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 pr-4 text-sm text-foreground whitespace-nowrap">
                          {formatTestDate(test.testDate, intlLocale)}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground max-w-[160px] truncate">
                          {test.location}
                        </td>
                        <td className="py-3 pr-4 text-sm text-center text-foreground font-medium">
                          {test.ph}
                        </td>
                        <td className="py-3 pr-4 text-sm text-center text-muted-foreground">
                          {test.nitrogen}
                        </td>
                        <td className="py-3 pr-4 text-sm text-center text-muted-foreground">
                          {test.phosphorus}
                        </td>
                        <td className="py-3 pr-4 text-sm text-center text-muted-foreground">
                          {test.potassium}
                        </td>
                        <td className="py-3 pr-4 text-sm text-center text-muted-foreground">
                          {test.organicMatter}
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">
                          {test.texture}
                        </td>
                        <td className="py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                                <span className="sr-only">{t("dashboard.soil.actionsHeader")}</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={4}>
                              <DropdownMenuItem onClick={() => openView(test.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                {t("common.actions.view")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEdit(test)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                {t("common.actions.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDelete(test.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t("common.actions.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {testsData.pagination && (
                  <p className="text-xs text-muted-foreground mt-3">
                    {t("dashboard.soil.showingOfTests", { count: testsData.tests.length, total: testsData.pagination.total })}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("dashboard.soil.noTestsRecorded")}</p>
            )}
          </CardContent>
        </Card>

      </div>

      {/* ── Form Dialog (shared create / edit) ───────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={open => !open && closeForm()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editTest ? t("dashboard.soil.editSoilTest") : t("dashboard.soil.recordNewSoilTest")}
            </DialogTitle>
          </DialogHeader>
          {/* key forces remount when switching between create and edit */}
          <SoilForm
            key={editTest?.id ?? "create"}
            initial={editTest ? testToForm(editTest) : undefined}
            submitLabel={editTest ? t("dashboard.soil.updateTest") : t("dashboard.soil.saveTest")}
            submitting={creating || updating}
            onSubmit={handleFormSubmit}
            onCancel={closeForm}
          />
        </DialogContent>
      </Dialog>

      {/* ── View Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={!!viewId} onOpenChange={open => !open && setViewId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("dashboard.soil.soilTestDetailsTitle")}</DialogTitle>
          </DialogHeader>
          {viewLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 rounded" />
              ))}
            </div>
          ) : viewTest ? (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{t("dashboard.soil.dateHeader")}</p>
                  <p className="font-medium mt-0.5">{formatTestDate(viewTest.testDate, intlLocale)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("dashboard.soil.textureHeader")}</p>
                  <p className="font-medium mt-0.5">{viewTest.texture}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("dashboard.soil.phHeader")}</p>
                  <p className="font-medium mt-0.5">{viewTest.ph}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("dashboard.soil.nitrogenLabel")}</p>
                  <p className="font-medium mt-0.5">{viewTest.nitrogen} mg/kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("dashboard.soil.phosphorusDetailLabel")}</p>
                  <p className="font-medium mt-0.5">{viewTest.phosphorus} mg/kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("dashboard.soil.potassiumDetailLabel")}</p>
                  <p className="font-medium mt-0.5">{viewTest.potassium} mg/kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("dashboard.soil.organicMatterDetailLabel")}</p>
                  <p className="font-medium mt-0.5">{viewTest.organicMatter}%</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("dashboard.soil.locationHeader")}</p>
                <p className="text-sm mt-0.5">{viewTest.location}</p>
              </div>
              {viewTest.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("dashboard.soil.notesLabel")}</p>
                  <p className="text-sm mt-0.5 text-foreground">{viewTest.notes}</p>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => { setViewId(null); openEdit(viewTest) }}>
                  <Pencil className="w-4 h-4 mr-2" /> {t("common.actions.edit")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => { setViewId(null); openDelete(viewTest.id) }}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> {t("common.actions.delete")}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">{t("dashboard.soil.couldNotLoadDetails")}</p>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete AlertDialog ───────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.soil.deleteTestTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.soil.deleteTestDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t("common.actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? t("dashboard.soil.deletingLabel") : t("common.actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
