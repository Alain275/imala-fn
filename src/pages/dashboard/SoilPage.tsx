import { useState } from "react"
import { toast } from "sonner"
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

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatTestDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
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

function buildRadarData(profile: NutrientProfile) {
  const axis = (score: number | null, status: string | undefined) =>
    score !== null ? score : statusToScore(status)
  return [
    { subject: "pH Balance",     A: axis(profile.ph.score,            profile.ph.status),            fullMark: 100 },
    { subject: "Nitrogen",       A: axis(profile.nitrogen.score,      profile.nitrogen.status),      fullMark: 100 },
    { subject: "Phosphorus",     A: axis(profile.phosphorus.score,    profile.phosphorus.status),    fullMark: 100 },
    { subject: "Potassium",      A: axis(profile.potassium.score,     profile.potassium.status),     fullMark: 100 },
    { subject: "Organic Matter", A: axis(profile.organicMatter.score, profile.organicMatter.status), fullMark: 100 },
  ]
}

type HistTable = {
  headers: string[]
  rows: { parameter: string; values: number[]; change: string }[]
  showChange: boolean
}

function buildHistoricalTable(tests: SoilTest[]): HistTable {
  // sort oldest → newest, keep last 4
  const sorted = [...tests]
    .sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime())
    .slice(-4)

  // only as many columns as we actually have — no "—" padding
  const headers = sorted.map(t =>
    new Date(t.testDate).toLocaleString("en-US", { month: "short" })
  )

  const showChange = sorted.length >= 2

  type NumKey = "ph" | "nitrogen" | "phosphorus" | "potassium" | "organicMatter"

  const computeChange = (key: NumKey): string => {
    if (!showChange) return ""
    const diff = (sorted[sorted.length - 1][key] as number) - (sorted[0][key] as number)
    return diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)
  }

  const rowDefs: { parameter: string; key: NumKey }[] = [
    { parameter: "pH", key: "ph" },
    { parameter: "Nitrogen (mg/kg)", key: "nitrogen" },
    { parameter: "Phosphorus (mg/kg)", key: "phosphorus" },
    { parameter: "Potassium (mg/kg)", key: "potassium" },
    { parameter: "Organic Matter (%)", key: "organicMatter" },
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
      toast.error("Please fill in all required fields correctly")
      return
    }
    onSubmit(form)
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="ph">pH Level</Label>
          <Input
            id="ph"
            type="number"
            step="0.1"
            min="0"
            max="14"
            placeholder="e.g. 6.5"
            value={form.ph}
            onChange={setField("ph")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nitrogen">Nitrogen (mg/kg)</Label>
          <Input
            id="nitrogen"
            type="number"
            placeholder="e.g. 45"
            value={form.nitrogen}
            onChange={setField("nitrogen")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phosphorus">Phosphorus (mg/kg)</Label>
          <Input
            id="phosphorus"
            type="number"
            placeholder="e.g. 38"
            value={form.phosphorus}
            onChange={setField("phosphorus")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="potassium">Potassium (mg/kg)</Label>
          <Input
            id="potassium"
            type="number"
            placeholder="e.g. 165"
            value={form.potassium}
            onChange={setField("potassium")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organicMatter">Organic Matter (%)</Label>
          <Input
            id="organicMatter"
            type="number"
            step="0.1"
            placeholder="e.g. 3.2"
            value={form.organicMatter}
            onChange={setField("organicMatter")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="texture">Texture</Label>
          <Input
            id="texture"
            placeholder="e.g. Silty Loam"
            value={form.texture}
            onChange={setField("texture")}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g. Musanze District, Rwanda"
            value={form.location}
            onChange={setField("location")}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional observations about the soil…"
            value={form.notes}
            onChange={setField("notes")}
            rows={3}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
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
          {crop.status}
        </span>
      </div>
      <Progress value={pct} className="h-2 mb-2" />
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Suitability</span>
        <span className="font-medium text-foreground">
          {crop.suitability != null ? `${crop.suitability}%` : "—"}
        </span>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SoilPage() {
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
  const radarData = analysis ? buildRadarData(analysis.nutrientProfile) : []
  const histTable: HistTable = testsData?.tests?.length
    ? buildHistoricalTable(testsData.tests)
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
        title="Soil Analysis"
        subtitle="Comprehensive soil health assessment and crop suitability recommendations"
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
                    <CardTitle>Soil Health Score</CardTitle>
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
                      <p className="text-sm text-muted-foreground">out of 100</p>
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
                      <span className="text-sm text-muted-foreground">pH Level</span>
                    </div>
                    <p className="text-2xl font-semibold text-foreground">
                      {analysis?.test?.ph ?? "—"}
                    </p>
                    <p className={`text-xs ${statusColor(analysis?.nutrientProfile?.ph?.status)}`}>
                      {analysis?.nutrientProfile?.ph?.status
                        ? capitalize(analysis.nutrientProfile.ph.status)
                        : "—"}
                    </p>
                  </div>

                  {/* Nitrogen — unit is mg/kg, not % */}
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-muted-foreground">Nitrogen</span>
                    </div>
                    <p className="text-2xl font-semibold text-foreground">
                      {analysis?.test?.nitrogen != null
                        ? `${analysis.test.nitrogen} mg/kg`
                        : "—"}
                    </p>
                    <p className={`text-xs ${statusColor(analysis?.nutrientProfile?.nitrogen?.status)}`}>
                      {analysis?.nutrientProfile?.nitrogen?.status
                        ? capitalize(analysis.nutrientProfile.nitrogen.status)
                        : "—"}
                    </p>
                  </div>

                  {/* Moisture — placeholder, no API endpoint yet */}
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-muted-foreground">Moisture</span>
                    </div>
                    <p className="text-2xl font-semibold text-foreground">—</p>
                    <p className="text-xs text-muted-foreground">No data yet</p>
                  </div>

                  {/* Texture */}
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-muted-foreground">Texture</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {analysis?.test?.texture ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">—</p>
                  </div>
                </div>
              )}

              <Button className="w-full" onClick={openCreate}>
                Request New Soil Test
              </Button>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-0">
              <CardTitle className="text-base">Nutrient Profile</CardTitle>
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
                        name="Soil Health"
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
                  <p className="text-sm text-muted-foreground">No nutrient data available.</p>
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
              <span>Crop Suitability Analysis</span>
            </CardTitle>
            <CardDescription>Based on your soil composition and local climate conditions</CardDescription>
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
              <p className="text-sm text-muted-foreground">No crop suitability data available.</p>
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
                <span>Recommendations</span>
              </CardTitle>
              <CardDescription>Actions to improve your soil health</CardDescription>
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
                <p className="text-sm text-muted-foreground">No recommendations at this time.</p>
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
                  <span>Historical Trends</span>
                </CardTitle>
                {/* Wired: opens detail view for the latest test */}
                <Button
                  variant="ghost"
                  className="text-primary text-sm"
                  disabled={!latest}
                  onClick={() => latest && openView(latest.id)}
                >
                  View Full Report <ChevronRight className="w-4 h-4 ml-1" />
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
                            Parameter
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
                              Change
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
                      Add more soil tests over time to see trends and changes.
                    </p>
                  )}
                  {analysis?.test?.testDate && (
                    <p className="text-xs text-muted-foreground mt-4">
                      Last updated: {formatTestDate(analysis.test.testDate)}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No historical test data available yet.
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
              <span>Soil Test History</span>
            </CardTitle>
            <CardDescription>
              Individual test records{location ? ` for ${location}` : ""}
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
                        Date
                      </th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">
                        Location
                      </th>
                      <th className="text-center py-3 pr-4 text-sm font-medium text-muted-foreground">
                        pH
                      </th>
                      <th className="text-center py-3 pr-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Nitrogen (mg/kg)
                      </th>
                      <th className="text-center py-3 pr-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Phosphorus (mg/kg)
                      </th>
                      <th className="text-center py-3 pr-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Potassium (mg/kg)
                      </th>
                      <th className="text-center py-3 pr-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Organic Matter (%)
                      </th>
                      <th className="text-left py-3 pr-4 text-sm font-medium text-muted-foreground">
                        Texture
                      </th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">
                        Actions
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
                          {formatTestDate(test.testDate)}
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
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={4}>
                              <DropdownMenuItem onClick={() => openView(test.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEdit(test)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDelete(test.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
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
                    Showing {testsData.tests.length} of {testsData.pagination.total} tests
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No soil tests recorded yet.</p>
            )}
          </CardContent>
        </Card>

      </div>

      {/* ── Form Dialog (shared create / edit) ───────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={open => !open && closeForm()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editTest ? "Edit Soil Test" : "Record New Soil Test"}
            </DialogTitle>
          </DialogHeader>
          {/* key forces remount when switching between create and edit */}
          <SoilForm
            key={editTest?.id ?? "create"}
            initial={editTest ? testToForm(editTest) : undefined}
            submitLabel={editTest ? "Update Test" : "Save Test"}
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
            <DialogTitle>Soil Test Details</DialogTitle>
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
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium mt-0.5">{formatTestDate(viewTest.testDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Texture</p>
                  <p className="font-medium mt-0.5">{viewTest.texture}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">pH</p>
                  <p className="font-medium mt-0.5">{viewTest.ph}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Nitrogen</p>
                  <p className="font-medium mt-0.5">{viewTest.nitrogen} mg/kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phosphorus</p>
                  <p className="font-medium mt-0.5">{viewTest.phosphorus} mg/kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Potassium</p>
                  <p className="font-medium mt-0.5">{viewTest.potassium} mg/kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Organic Matter</p>
                  <p className="font-medium mt-0.5">{viewTest.organicMatter}%</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="text-sm mt-0.5">{viewTest.location}</p>
              </div>
              {viewTest.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm mt-0.5 text-foreground">{viewTest.notes}</p>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => { setViewId(null); openEdit(viewTest) }}>
                  <Pencil className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => { setViewId(null); openDelete(viewTest.id) }}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">Could not load test details.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete AlertDialog ───────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this soil test?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The test record will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
