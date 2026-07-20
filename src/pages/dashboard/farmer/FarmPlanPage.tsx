import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  Coins,
  History,
  Leaf,
  Loader2,
  Plus,
  Sprout,
  TrendingUp,
  Users,
  WalletCards,
  Wheat,
  Pencil,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { authService } from "@/services/auth"
import {
  farmPlanService,
  type CropRecommendation,
  type FarmManagement,
  type FarmPlan,
  type FarmPlanRecommendation,
} from "@/services/farmPlan"
import { FarmManagementCrudDialog } from "./FarmManagementCrudDialog"

const todayIso = () => new Date().toISOString().slice(0, 10)
const currentYear = new Date().getFullYear()

const seasons = [
  { id: "A", name: "Season A", localName: "Umuhindo", months: "September – February", planting: "September – October", rain: "Main rainy season" },
  { id: "B", name: "Season B", localName: "Itumba", months: "March – June", planting: "March", rain: "Second rainy season" },
  { id: "C", name: "Season C", localName: "Impeshyi", months: "July – September", planting: "July", rain: "Dry season; irrigation may be needed" },
] as const

type SeasonId = typeof seasons[number]["id"]
type WorkspaceTab = "plan" | "today" | "records" | "results"
type AreaUnit = "ha" | "acre" | "sqm"

const tabItems: Array<{ id: WorkspaceTab; icon: typeof Sprout }> = [
  { id: "plan", icon: Sprout },
  { id: "today", icon: ClipboardCheck },
  { id: "records", icon: History },
  { id: "results", icon: TrendingUp },
]

const activityOptions = [
  ["land_preparation", "Land preparation"],
  ["planting", "Planting"],
  ["fertilizer", "Fertilizer or manure"],
  ["weeding", "Weeding"],
  ["spraying", "Spraying"],
  ["irrigation", "Irrigation"],
  ["harvest", "Harvesting"],
  ["other", "Other work"],
] as const

const formatMoney = (value: number | string) => new Intl.NumberFormat("en-RW", {
  style: "currency", currency: "RWF", maximumFractionDigits: 0,
}).format(Number(value) || 0)

const formatNumber = (value: number | string, digits = 1) => new Intl.NumberFormat("en", {
  maximumFractionDigits: digits,
}).format(Number(value) || 0)

const formatDate = (value?: string | null) => value
  ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value))
  : "—"

const hectares = (size: number, unit: AreaUnit) => unit === "acre" ? size * 0.404686 : unit === "sqm" ? size / 10000 : size

function message(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function StatCard({ label, value, hint, icon: Icon }: { label: string; value: string; hint?: string; icon: typeof Sprout }) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="flex items-start gap-3 p-4">
        <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Icon className="h-5 w-5" /></div>
        <div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold text-foreground">{value}</p>{hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}</div>
      </CardContent>
    </Card>
  )
}

export default function FarmPlanPage() {
  const { t } = useTranslation()
  const user = authService.getCurrentUser()
  const [tab, setTab] = useState<WorkspaceTab>("plan")
  const [plans, setPlans] = useState<FarmPlan[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [management, setManagement] = useState<FarmManagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [seasonId, setSeasonId] = useState<SeasonId>("A")
  const [seasonYear, setSeasonYear] = useState(currentYear)
  const [cropName, setCropName] = useState("")
  const [recommendation, setRecommendation] = useState<FarmPlanRecommendation | null>(null)
  const [size, setSize] = useState("1")
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("ha")
  const [location, setLocation] = useState(user?.location || "")
  const [soilType, setSoilType] = useState("")
  const [irrigation, setIrrigation] = useState(false)
  const [notes, setNotes] = useState("")

  const [activity, setActivity] = useState({
    category: "planting", date: todayIso(), workers: "0", workerRate: "0", area: "0",
    seed: "0", fertilizer: "0", manure: "0", materialCost: "0", otherCost: "0", notes: "",
  })
  const [harvest, setHarvest] = useState({
    date: todayIso(), harvested: "0", sold: "0", lost: "0", kept: "0", unit: "kg", price: "0", buyer: "", notes: "",
  })

  const selectedPlan = useMemo(() => plans.find((plan) => plan.id === selectedId) ?? plans[0] ?? null, [plans, selectedId])
  const preview = recommendation?.preview
  const selectedSeason = seasons.find((season) => season.id === seasonId) ?? seasons[0]
  const plantingDays = selectedPlan
    ? Math.max(1, Math.round((new Date(selectedPlan.plantingEndDate).getTime() - new Date(selectedPlan.plantingStartDate).getTime()) / 86400000) + 1)
    : 1
  const plannedSeed = selectedPlan?.inputEstimates?.filter((input) => input.inputType === "seed").reduce((sum, input) => sum + Number(input.quantity), 0) ?? 0
  const plannedPlantingFertilizer = selectedPlan?.inputEstimates?.filter((input) => input.inputType === "fertilizer" && input.recommendedTiming?.toLowerCase().includes("plant")).reduce((sum, input) => sum + Number(input.quantity), 0) ?? 0
  const plannedManure = selectedPlan?.inputEstimates?.filter((input) => input.inputType === "manure").reduce((sum, input) => sum + Number(input.quantity), 0) ?? 0

  const loadPlans = async () => {
    setLoading(true)
    try {
      const data = await farmPlanService.list()
      setPlans(data)
      setSelectedId((current) => current && data.some((plan) => plan.id === current) ? current : data[0]?.id ?? null)
    } catch (error) {
      toast.error(message(error, "Could not load farm plans"))
    } finally { setLoading(false) }
  }

  const loadManagement = async (planId: string) => {
    try { setManagement(await farmPlanService.getManagement(planId)) }
    catch (error) { toast.error(message(error, "Could not load farm records")) }
  }

  useEffect(() => { void loadPlans() }, [])
  useEffect(() => {
    if (selectedPlan?.id) void loadManagement(selectedPlan.id)
    else setManagement(null)
  }, [selectedPlan?.id])

  const getCropRecommendations = async () => {
    setSaving(true)
    try {
      const data = await farmPlanService.recommend({ seasonId, seasonYear, irrigationAvailable: irrigation })
      setRecommendation(data)
      setStep(2)
    } catch (error) { toast.error(message(error, "Could not recommend crops")) }
    finally { setSaving(false) }
  }

  const startNewPlan = () => {
    setEditingPlanId(null)
    setRecommendation(null)
    setCropName("")
    setWizardOpen(true)
    setStep(1)
  }

  const calculatePlan = async () => {
    const farmSize = hectares(Number(size), areaUnit)
    if (!cropName || !location.trim() || !Number.isFinite(farmSize) || farmSize <= 0) {
      toast.error("Choose a crop and enter a valid farm location and size")
      return
    }
    setSaving(true)
    try {
      const data = await farmPlanService.recommend({
        seasonId, seasonYear, cropName, farmSize, locationName: location.trim(), soilType, irrigationAvailable: irrigation,
      })
      setRecommendation(data)
      setStep(4)
    } catch (error) { toast.error(message(error, "Could not calculate the farm plan")) }
    finally { setSaving(false) }
  }

  const savePlan = async () => {
    if (!preview) return
    setSaving(true)
    try {
      const farmSize = hectares(Number(size), areaUnit)
      const payload = {
        cropName,
        season: `Season ${seasonId} — ${selectedSeason.localName} ${seasonYear}`,
        locationName: location.trim(), farmSize, soilType: soilType || undefined,
        plantingStartDate: preview.plantingStartDate, plantingEndDate: preview.plantingEndDate,
        notes: [notes, irrigation ? "Irrigation available" : "No irrigation recorded"].filter(Boolean).join(". "),
        inputEstimates: preview.inputEstimates,
      }
      const saved = editingPlanId
        ? await farmPlanService.update(editingPlanId, payload)
        : await farmPlanService.create(payload)
      setPlans((current) => editingPlanId
        ? current.map((plan) => plan.id === saved.id ? saved : plan)
        : [saved, ...current])
      setSelectedId(saved.id)
      setWizardOpen(false)
      setEditingPlanId(null)
      setStep(1)
      setTab("today")
      toast.success(editingPlanId ? "Farm plan updated" : "Your farm plan is ready")
      window.dispatchEvent(new Event("imara-notifications-refresh"))
    } catch (error) { toast.error(message(error, "Could not save the farm plan")) }
    finally { setSaving(false) }
  }

  const editPlan = async () => {
    if (!selectedPlan) return
    const matchedSeason = (selectedPlan.season.match(/Season\s+([ABC])/i)?.[1]?.toUpperCase() ?? "A") as SeasonId
    const year = new Date(selectedPlan.plantingStartDate).getFullYear()
    setSaving(true)
    try {
      const data = await farmPlanService.recommend({
        seasonId: matchedSeason, seasonYear: year, cropName: selectedPlan.cropName,
        farmSize: Number(selectedPlan.farmSize), locationName: selectedPlan.locationName, soilType: selectedPlan.soilType ?? undefined,
        irrigationAvailable: selectedPlan.notes?.includes("Irrigation available") ?? false,
      })
      setSeasonId(matchedSeason)
      setSeasonYear(year)
      setCropName(selectedPlan.cropName)
      setSize(String(selectedPlan.farmSize))
      setAreaUnit("ha")
      setLocation(selectedPlan.locationName)
      setSoilType(selectedPlan.soilType ?? "")
      setIrrigation(selectedPlan.notes?.includes("Irrigation available") ?? false)
      setNotes(selectedPlan.notes ?? "")
      setRecommendation(data)
      setEditingPlanId(selectedPlan.id)
      setWizardOpen(true)
      setStep(4)
    } catch (error) { toast.error(message(error, "Could not open the farm plan")) }
    finally { setSaving(false) }
  }

  const deletePlan = async () => {
    if (!selectedPlan || !window.confirm(`Delete the ${selectedPlan.cropName} farm plan and all of its records? This cannot be undone.`)) return
    setSaving(true)
    try {
      await farmPlanService.delete(selectedPlan.id)
      const remaining = plans.filter((plan) => plan.id !== selectedPlan.id)
      setPlans(remaining)
      setSelectedId(remaining[0]?.id ?? null)
      setManagement(null)
      toast.success("Farm plan deleted")
    } catch (error) { toast.error(message(error, "Could not delete the farm plan")) }
    finally { setSaving(false) }
  }

  const saveActivity = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedPlan) return
    setSaving(true)
    try {
      const label = activityOptions.find(([value]) => value === activity.category)?.[1] ?? "Farm work"
      await farmPlanService.addActivity(selectedPlan.id, {
        title: label, category: activity.category, activityDate: activity.date, notes: activity.notes || null,
        workerCount: Number(activity.workers), workerDailyRate: Number(activity.workerRate), areaWorked: Number(activity.area),
        seedQuantity: Number(activity.seed), fertilizerQuantity: Number(activity.fertilizer), manureQuantity: Number(activity.manure),
        materialCost: Number(activity.materialCost), otherCost: Number(activity.otherCost),
      })
      await loadManagement(selectedPlan.id)
      setActivity((current) => ({ ...current, workers: "0", area: "0", seed: "0", fertilizer: "0", manure: "0", materialCost: "0", otherCost: "0", notes: "" }))
      toast.success("Today’s farm work was saved")
      window.dispatchEvent(new Event("imara-notifications-refresh"))
    } catch (error) { toast.error(message(error, "Could not save farm work")) }
    finally { setSaving(false) }
  }

  const saveHarvest = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedPlan) return
    setSaving(true)
    try {
      await farmPlanService.addHarvest(selectedPlan.id, {
        harvestDate: harvest.date, quantityHarvested: Number(harvest.harvested), quantitySold: Number(harvest.sold),
        quantityLost: Number(harvest.lost), quantityKept: Number(harvest.kept), unit: harvest.unit,
        saleUnitPrice: Number(harvest.price), buyer: harvest.buyer || null, notes: harvest.notes || null,
      })
      await loadManagement(selectedPlan.id)
      setHarvest((current) => ({ ...current, harvested: "0", sold: "0", lost: "0", kept: "0", price: "0", buyer: "", notes: "" }))
      toast.success("Harvest and sales were saved")
      window.dispatchEvent(new Event("imara-notifications-refresh"))
    } catch (error) { toast.error(message(error, "Could not save harvest")) }
    finally { setSaving(false) }
  }

  if (user?.role !== "farmer") return <div className="p-6">Farm planning is available for farmer accounts.</div>

  return (
    <div className="min-h-screen bg-muted/20">
      <Header
        title={t("farmWorkspace.title")}
        subtitle={tab === "today" && selectedPlan
          ? `Daily planting guide: ${formatNumber(plannedSeed / plantingDays)} kg seed, ${formatNumber(plannedPlantingFertilizer / plantingDays)} kg planting fertilizer, and ${formatNumber(plannedManure / plantingDays)} kg manure.`
          : t("farmWorkspace.subtitle")}
      />

      <div className="mx-auto max-w-6xl space-y-5 p-3 pb-28 sm:p-6 lg:p-8 lg:pb-8">
        {plans.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {plans.map((plan) => (
              <button key={plan.id} onClick={() => setSelectedId(plan.id)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${selectedPlan?.id === plan.id ? "border-emerald-600 bg-emerald-600 text-white" : "bg-card text-foreground"}`}>
              {plan.cropName} · {plan.farmSize} ha
              </button>
            ))}
            <Button variant="outline" className="shrink-0 rounded-full" onClick={startNewPlan}><Plus className="mr-1 h-4 w-4" /> {t("farmWorkspace.newPlan")}</Button>
          </div>
        )}

        <nav className="grid grid-cols-4 gap-1 rounded-2xl border bg-card p-1 shadow-sm">
          {tabItems.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold sm:flex-row sm:justify-center sm:text-sm ${tab === item.id ? "bg-emerald-600 text-white" : "text-muted-foreground hover:bg-muted"}`}><item.icon className="h-4 w-4" /><span className="truncate">{t(`farmWorkspace.tabs.${item.id}`)}</span></button>)}
        </nav>

        {selectedPlan && tab === "plan" && !wizardOpen && <div className="flex flex-col gap-2 sm:flex-row sm:justify-end"><Button variant="outline" onClick={editPlan} disabled={saving}><Pencil className="mr-2 h-4 w-4" />Edit farm plan</Button><Button variant="outline" className="text-red-600 hover:text-red-700" onClick={deletePlan} disabled={saving}><Trash2 className="mr-2 h-4 w-4" />Delete farm plan</Button></div>}
        {selectedPlan && tab === "records" && <div className="flex justify-end"><FarmManagementCrudDialog planId={selectedPlan.id} management={management} onChanged={() => loadManagement(selectedPlan.id)} /></div>}

        {loading ? <Card><CardContent className="flex items-center justify-center gap-2 p-12"><Loader2 className="h-5 w-5 animate-spin" /> Loading your farm…</CardContent></Card> : null}

        {!loading && tab === "plan" && (
          <>
            {!selectedPlan && !wizardOpen && <Card className="border-dashed"><CardContent className="flex flex-col items-center p-8 text-center sm:p-12"><div className="rounded-full bg-emerald-100 p-4 text-emerald-700"><Sprout className="h-9 w-9" /></div><h2 className="mt-5 text-2xl font-bold">Plan your first farming season</h2><p className="mt-2 max-w-lg text-muted-foreground">Choose a season, select a suitable crop, and enter your farm size. IMARA will calculate the dates, seed, manure, fertilizer, budget, and harvest estimate.</p><Button className="mt-6" size="lg" onClick={() => setWizardOpen(true)}>Start farm plan <ChevronRight className="ml-2 h-4 w-4" /></Button></CardContent></Card>}

            {wizardOpen && <Card className="overflow-hidden shadow-lg">
              <CardHeader className="border-b bg-card"><div className="flex items-center justify-between"><div><CardTitle>Create a farm plan</CardTitle><CardDescription>Step {step} of 4</CardDescription></div><Badge variant="outline">{step === 1 ? "Season" : step === 2 ? "Crop" : step === 3 ? "Farm size" : "Review"}</Badge></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-emerald-600 transition-all" style={{ width: `${step * 25}%` }} /></div></CardHeader>
              <CardContent className="p-4 sm:p-7">
                {step === 1 && <div className="space-y-5"><div><h3 className="text-xl font-bold">1. Choose the farming season</h3><p className="text-sm text-muted-foreground">Select when you want to grow the crop.</p></div><div className="grid gap-3 sm:grid-cols-3">{seasons.map((season) => <button key={season.id} onClick={() => setSeasonId(season.id)} className={`rounded-2xl border p-4 text-left transition ${seasonId === season.id ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/20 dark:bg-emerald-950/30" : "hover:border-emerald-300"}`}><div className="flex items-center justify-between"><span className="font-bold">{season.name}</span>{seasonId === season.id && <Check className="h-5 w-5 text-emerald-600" />}</div><p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{season.localName}</p><p className="mt-3 text-sm">{season.months}</p><p className="mt-1 text-xs text-muted-foreground">Planting: {season.planting}</p><p className="mt-1 text-xs text-muted-foreground">{season.rain}</p></button>)}</div><div className="max-w-xs"><Label htmlFor="seasonYear">Season year</Label><Input id="seasonYear" type="number" min="2020" max="2100" value={seasonYear} onChange={(e) => setSeasonYear(Number(e.target.value))} /></div><Button onClick={getCropRecommendations} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}See suitable crops <ChevronRight className="ml-2 h-4 w-4" /></Button></div>}

                {step === 2 && <div className="space-y-5"><div><h3 className="text-xl font-bold">2. Choose what to plant</h3><p className="text-sm text-muted-foreground">The best matches are shown first. You remain in control of the final choice.</p></div><div className="grid gap-3 sm:grid-cols-2">{recommendation?.recommendations.map((crop: CropRecommendation) => <button key={crop.key} onClick={() => setCropName(crop.cropName)} className={`rounded-2xl border p-4 text-left ${cropName === crop.cropName ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/20 dark:bg-emerald-950/30" : "hover:border-emerald-300"}`}><div className="flex items-center justify-between gap-2"><span className="text-lg font-bold">{crop.cropName}</span><Badge className={crop.suitability === "high" ? "bg-emerald-600" : crop.suitability === "conditional" ? "bg-amber-500" : "bg-slate-500"}>{crop.suitability === "high" ? "Recommended" : crop.suitability === "conditional" ? "Needs care" : "Lower match"}</Badge></div><p className="mt-2 text-sm text-muted-foreground">{crop.reason}</p></button>)}</div><div className="flex gap-2"><Button variant="outline" onClick={() => setStep(1)}>Back</Button><Button disabled={!cropName} onClick={() => setStep(3)}>Continue <ChevronRight className="ml-2 h-4 w-4" /></Button></div></div>}

                {step === 3 && <div className="space-y-5"><div><h3 className="text-xl font-bold">3. Tell us about the farm</h3><p className="text-sm text-muted-foreground">We use the size to calculate all input quantities.</p></div><div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><Label htmlFor="location">Farm location</Label><Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Example: Musanze" /></div><div><Label htmlFor="size">Farm size</Label><Input id="size" type="number" min="0.01" step="0.01" inputMode="decimal" value={size} onChange={(e) => setSize(e.target.value)} /></div><div><Label htmlFor="unit">Area unit</Label><select id="unit" value={areaUnit} onChange={(e) => setAreaUnit(e.target.value as AreaUnit)} className="h-10 w-full rounded-md border bg-background px-3"><option value="ha">Hectares</option><option value="acre">Acres</option><option value="sqm">Square metres</option></select></div><div><Label htmlFor="soil">Soil type (optional)</Label><select id="soil" value={soilType} onChange={(e) => setSoilType(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3"><option value="">I do not know</option><option value="loam">Loam</option><option value="clay">Clay</option><option value="sandy">Sandy</option><option value="volcanic">Volcanic</option></select></div><label className="flex min-h-10 items-center gap-3 rounded-xl border px-4 py-3"><input type="checkbox" checked={irrigation} onChange={(e) => setIrrigation(e.target.checked)} className="h-5 w-5" /><span><span className="block font-medium">I have irrigation</span><span className="text-xs text-muted-foreground">Water is available when rain is low</span></span></label><div className="sm:col-span-2"><Label htmlFor="notes">Notes (optional)</Label><Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything important about this field" /></div></div><div className="flex gap-2"><Button variant="outline" onClick={() => setStep(2)}>Back</Button><Button onClick={calculatePlan} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Calculate my plan</Button></div></div>}

                {step === 4 && preview && <div className="space-y-6"><div><h3 className="text-xl font-bold">4. Your recommended plan</h3><p className="text-sm text-muted-foreground">Review the quantities and expected results before saving.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><StatCard label="Plant from" value={formatDate(preview.plantingStartDate)} icon={CalendarDays} /><StatCard label="Harvest around" value={formatDate(preview.expectedHarvestStartDate)} icon={Wheat} /><StatCard label="Estimated cost" value={formatMoney(preview.estimatedCost)} icon={WalletCards} /><StatCard label="Expected profit" value={formatMoney(preview.expectedProfit)} icon={TrendingUp} /></div><div><h4 className="mb-3 font-bold">What you should prepare</h4><div className="grid gap-2 sm:grid-cols-2">{preview.inputEstimates.map((input, index) => <div key={`${input.inputName}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 p-3"><div><p className="font-medium">{input.inputName}</p><p className="text-xs text-muted-foreground">{input.recommendedTiming}</p></div><div className="text-right"><p className="font-bold">{formatNumber(input.quantity)} {input.unit}</p><p className="text-xs text-muted-foreground">{formatMoney(Number(input.quantity) * Number(input.unitCost))}</p></div></div>)}</div></div><div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">Recommendations are planning estimates. Soil-test results and advice from a local agronomist should take priority when available.</div><div className="flex flex-col gap-2 sm:flex-row"><Button variant="outline" onClick={() => setStep(3)}>Change details</Button><Button size="lg" onClick={savePlan} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save and start managing</Button></div></div>}
              </CardContent>
            </Card>}

            {selectedPlan && !wizardOpen && <div className="space-y-5"><Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-700 to-green-900 text-white shadow-lg"><CardContent className="p-6 sm:p-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><Badge className="bg-white/15 text-white hover:bg-white/20">{selectedPlan.status}</Badge><h2 className="mt-3 text-3xl font-bold">{selectedPlan.cropName}</h2><p className="mt-1 text-emerald-50">{selectedPlan.season} · {selectedPlan.locationName} · {selectedPlan.farmSize} ha</p></div><Button className="bg-white text-emerald-900 hover:bg-emerald-50" onClick={() => setWizardOpen(true)}><Plus className="mr-2 h-4 w-4" />Plan another farm</Button></div></CardContent></Card><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Planting window" value={formatDate(selectedPlan.plantingStartDate)} hint={`until ${formatDate(selectedPlan.plantingEndDate)}`} icon={CalendarDays} /><StatCard label="Inputs budget" value={formatMoney(selectedPlan.estimatedCost)} icon={Coins} /><StatCard label="Expected harvest" value={`${formatNumber(selectedPlan.expectedYield, 0)} kg`} icon={Wheat} /><StatCard label="Expected profit" value={formatMoney(selectedPlan.expectedProfit)} icon={TrendingUp} /></div><Card><CardHeader><CardTitle>Season schedule</CardTitle><CardDescription>Mark each task when the work is completed.</CardDescription></CardHeader><CardContent className="space-y-2">{selectedPlan.tasks?.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map((task) => <button key={task.id} onClick={async () => { const updated = await farmPlanService.updateTask(selectedPlan.id, task.id, task.status === "completed" ? "pending" : "completed"); setPlans((items) => items.map((plan) => plan.id === selectedPlan.id ? { ...plan, tasks: plan.tasks?.map((item) => item.id === task.id ? updated : item) } : plan)) }} className="flex w-full items-start gap-3 rounded-xl border p-3 text-left hover:bg-muted/50"><span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${task.status === "completed" ? "border-emerald-600 bg-emerald-600 text-white" : "border-muted-foreground/30"}`}>{task.status === "completed" && <Check className="h-4 w-4" />}</span><span className="flex-1"><span className="font-semibold">{task.title}</span><span className="block text-xs text-muted-foreground">{formatDate(task.dueDate)} · {task.description}</span></span></button>)}</CardContent></Card></div>}
          </>
        )}

        {!loading && tab === "today" && (!selectedPlan ? <Card><CardContent className="p-8 text-center">Create a farm plan before recording work.</CardContent></Card> : <div className="grid gap-5 lg:grid-cols-2"><Card><CardHeader><CardTitle>Record today’s work</CardTitle><CardDescription>Worker cost is calculated automatically: workers × daily rate.</CardDescription></CardHeader><CardContent><form onSubmit={saveActivity} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><div><Label>Activity</Label><select value={activity.category} onChange={(e) => setActivity({ ...activity, category: e.target.value })} className="h-10 w-full rounded-md border bg-background px-3">{activityOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div><Label>Date</Label><Input type="date" value={activity.date} onChange={(e) => setActivity({ ...activity, date: e.target.value })} /></div><div><Label>Number of workers</Label><Input type="number" min="0" inputMode="numeric" value={activity.workers} onChange={(e) => setActivity({ ...activity, workers: e.target.value })} /></div><div><Label>Pay per worker (RWF)</Label><Input type="number" min="0" inputMode="numeric" value={activity.workerRate} onChange={(e) => setActivity({ ...activity, workerRate: e.target.value })} /></div><div><Label>Area completed (ha)</Label><Input type="number" min="0" step="0.01" inputMode="decimal" value={activity.area} onChange={(e) => setActivity({ ...activity, area: e.target.value })} /></div><div><Label>Seed used (kg)</Label><Input type="number" min="0" step="0.01" value={activity.seed} onChange={(e) => setActivity({ ...activity, seed: e.target.value })} /></div><div><Label>Fertilizer used (kg)</Label><Input type="number" min="0" step="0.01" value={activity.fertilizer} onChange={(e) => setActivity({ ...activity, fertilizer: e.target.value })} /></div><div><Label>Manure used (kg)</Label><Input type="number" min="0" step="0.01" value={activity.manure} onChange={(e) => setActivity({ ...activity, manure: e.target.value })} /></div><div><Label>Materials cost (RWF)</Label><Input type="number" min="0" value={activity.materialCost} onChange={(e) => setActivity({ ...activity, materialCost: e.target.value })} /></div><div><Label>Other cost (RWF)</Label><Input type="number" min="0" value={activity.otherCost} onChange={(e) => setActivity({ ...activity, otherCost: e.target.value })} /></div></div><div className="rounded-xl bg-muted p-3 text-sm"><span className="text-muted-foreground">Today’s calculated cost</span><strong className="float-right">{formatMoney(Number(activity.workers) * Number(activity.workerRate) + Number(activity.materialCost) + Number(activity.otherCost))}</strong></div><div><Label>Notes (optional)</Label><Textarea value={activity.notes} onChange={(e) => setActivity({ ...activity, notes: e.target.value })} /></div><Button className="w-full" size="lg" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save today’s work</Button></form></CardContent></Card><Card><CardHeader><CardTitle>Record harvest and sales</CardTitle><CardDescription>Revenue is calculated from quantity sold × selling price.</CardDescription></CardHeader><CardContent><form onSubmit={saveHarvest} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><div><Label>Date</Label><Input type="date" value={harvest.date} onChange={(e) => setHarvest({ ...harvest, date: e.target.value })} /></div><div><Label>Unit</Label><select value={harvest.unit} onChange={(e) => setHarvest({ ...harvest, unit: e.target.value })} className="h-10 w-full rounded-md border bg-background px-3"><option value="kg">Kilograms</option><option value="tonnes">Tonnes</option><option value="bags">Bags</option></select></div><div><Label>Quantity harvested</Label><Input required type="number" min="0.01" step="0.01" value={harvest.harvested} onChange={(e) => setHarvest({ ...harvest, harvested: e.target.value })} /></div><div><Label>Quantity sold</Label><Input type="number" min="0" step="0.01" value={harvest.sold} onChange={(e) => setHarvest({ ...harvest, sold: e.target.value })} /></div><div><Label>Quantity kept</Label><Input type="number" min="0" step="0.01" value={harvest.kept} onChange={(e) => setHarvest({ ...harvest, kept: e.target.value })} /></div><div><Label>Quantity lost</Label><Input type="number" min="0" step="0.01" value={harvest.lost} onChange={(e) => setHarvest({ ...harvest, lost: e.target.value })} /></div><div><Label>Price per {harvest.unit}</Label><Input type="number" min="0" value={harvest.price} onChange={(e) => setHarvest({ ...harvest, price: e.target.value })} /></div><div><Label>Buyer (optional)</Label><Input value={harvest.buyer} onChange={(e) => setHarvest({ ...harvest, buyer: e.target.value })} /></div></div><div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"><span>Sales revenue</span><strong className="float-right">{formatMoney(Number(harvest.sold) * Number(harvest.price))}</strong></div><Button className="w-full" size="lg" disabled={saving}>Save harvest and sale</Button></form></CardContent></Card></div>)}

        {!loading && tab === "records" && <Card><CardHeader><CardTitle>Farm records</CardTitle><CardDescription>Every saved activity, expense, harvest, and sale for this plan.</CardDescription></CardHeader><CardContent>{!selectedPlan ? <p className="text-muted-foreground">Choose or create a farm plan.</p> : <div className="space-y-6"><section><h3 className="mb-3 font-bold">Daily work</h3><div className="space-y-2">{management?.activities.map((item) => <div key={item.id} className="rounded-xl border p-3"><div className="flex justify-between gap-3"><div><p className="font-semibold">{item.title}</p><p className="text-xs text-muted-foreground">{formatDate(item.activityDate)} · {item.workerCount} workers · {item.areaWorked} ha</p></div><strong>{formatMoney(item.cost)}</strong></div><p className="mt-2 text-xs text-muted-foreground">Seed {item.seedQuantity} kg · Fertilizer {item.fertilizerQuantity} kg · Manure {item.manureQuantity} kg</p></div>)}{!management?.activities.length && <p className="text-sm text-muted-foreground">No daily work recorded yet.</p>}</div></section><section><h3 className="mb-3 font-bold">Harvests and sales</h3><div className="space-y-2">{management?.harvests.map((item) => <div key={item.id} className="flex justify-between gap-3 rounded-xl border p-3"><div><p className="font-semibold">{item.quantityHarvested} {item.unit} harvested</p><p className="text-xs text-muted-foreground">{formatDate(item.harvestDate)} · {item.quantitySold} sold{item.buyer ? ` to ${item.buyer}` : ""}</p></div><strong className="text-emerald-700">{formatMoney(item.revenue)}</strong></div>)}{!management?.harvests.length && <p className="text-sm text-muted-foreground">No harvest recorded yet.</p>}</div></section>{Boolean(management?.expenses.length) && <section><h3 className="mb-3 font-bold">Other expenses</h3>{management?.expenses.map((item) => <div key={item.id} className="flex justify-between rounded-xl border p-3"><span>{item.itemName}</span><strong>{formatMoney(item.totalCost)}</strong></div>)}</section>}</div>}</CardContent></Card>}

        {!loading && tab === "results" && <div className="space-y-5">{!selectedPlan ? <Card><CardContent className="p-8 text-center">Create a farm plan to see results.</CardContent></Card> : <><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Actual income" value={formatMoney(management?.summary.actualRevenue ?? 0)} icon={Coins} /><StatCard label="Actual expenses" value={formatMoney(management?.summary.actualExpenses ?? 0)} hint={`Plan: ${formatMoney(selectedPlan.estimatedCost)}`} icon={WalletCards} /><StatCard label="Net profit" value={formatMoney(management?.summary.actualProfit ?? 0)} hint="Income minus all recorded costs" icon={TrendingUp} /><StatCard label="Harvested" value={`${formatNumber(management?.summary.totalHarvested ?? 0)} kg`} hint={`Expected: ${formatNumber(selectedPlan.expectedYield)} kg`} icon={Wheat} /></div><Card><CardHeader><CardTitle>Production progress</CardTitle><CardDescription>Compare your real records with the original plan.</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-3"><div className="rounded-xl bg-muted p-4"><Leaf className="h-5 w-5 text-emerald-600" /><p className="mt-2 text-sm text-muted-foreground">Seed used</p><p className="text-2xl font-bold">{formatNumber(management?.summary.totalSeedUsed ?? 0)} kg</p></div><div className="rounded-xl bg-muted p-4"><Sprout className="h-5 w-5 text-emerald-600" /><p className="mt-2 text-sm text-muted-foreground">Fertilizer used</p><p className="text-2xl font-bold">{formatNumber(management?.summary.totalFertilizerUsed ?? 0)} kg</p></div><div className="rounded-xl bg-muted p-4"><Users className="h-5 w-5 text-emerald-600" /><p className="mt-2 text-sm text-muted-foreground">Manure used</p><p className="text-2xl font-bold">{formatNumber(management?.summary.totalManureUsed ?? 0)} kg</p></div></CardContent></Card><Card className={(management?.summary.actualProfit ?? 0) >= 0 ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20" : "border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/20"}><CardContent className="p-6"><h3 className="text-xl font-bold">Season financial result</h3><p className="mt-2 text-muted-foreground">Your net result is based on recorded sales revenue minus daily labour, materials, and other expenses. Keep recording every activity for an accurate result.</p></CardContent></Card></>}</div>}
      </div>
    </div>
  )
}
