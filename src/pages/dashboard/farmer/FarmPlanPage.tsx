import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { farmPlanService, type EditableFarmInput, type FarmManagement, type FarmPlan, type FarmPlanTask } from "@/services/farmPlan";
import { authService } from "@/services/auth";
import {
  CalendarDays,
  CloudRain,
  CheckCircle2,
  ClipboardList,
  Coins,
  Loader2,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Sprout,
  TrendingUp,
  Trash2,
  Wheat,
  LayoutGrid,
  ArrowRight,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const todayIso = () => new Date().toISOString().slice(0, 10);

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  const apiMessage = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  return typeof apiMessage === "string" && apiMessage ? apiMessage : fallback;
}

type RwandaSeasonId = "A" | "B" | "C";

const RWANDA_SEASONS: Array<{
  id: RwandaSeasonId;
  name: string;
  localName: string;
  months: string;
  planting: string;
  rainfall: string;
  harvest: string;
  plantingMonth: number;
  plantingEndMonth: number;
  plantingEndDay: number;
}> = [
  {
    id: "A",
    name: "Season A",
    localName: "Umuhindo",
    months: "September – February",
    planting: "September – October",
    rainfall: "September – December",
    harvest: "January – February",
    plantingMonth: 9,
    plantingEndMonth: 10,
    plantingEndDay: 31,
  },
  {
    id: "B",
    name: "Season B",
    localName: "Itumba",
    months: "March – June",
    planting: "March",
    rainfall: "March – May",
    harvest: "May – June",
    plantingMonth: 3,
    plantingEndMonth: 3,
    plantingEndDay: 31,
  },
  {
    id: "C",
    name: "Season C",
    localName: "Impeshyi",
    months: "July – September",
    planting: "July",
    rainfall: "Low rainfall; irrigation is often needed",
    harvest: "August – September",
    plantingMonth: 7,
    plantingEndMonth: 7,
    plantingEndDay: 31,
  },
];

const isoDate = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const seasonLabel = (season: (typeof RWANDA_SEASONS)[number], year: number) =>
  `${season.name} — ${season.localName} ${year}`;

function seasonDates(season: (typeof RWANDA_SEASONS)[number], year: number) {
  return {
    plantingStartDate: isoDate(year, season.plantingMonth, 1),
    plantingEndDate: isoDate(year, season.plantingEndMonth, season.plantingEndDay),
  };
}

const currentYear = new Date().getFullYear();
const defaultSeason = RWANDA_SEASONS[0];
const defaultSeasonDates = seasonDates(defaultSeason, currentYear);

const initialForm = {
  cropName: "Maize",
  seasonId: defaultSeason.id as RwandaSeasonId,
  seasonYear: String(currentYear),
  season: seasonLabel(defaultSeason, currentYear),
  locationName: "",
  farmSize: "1",
  soilType: "",
  plantingStartDate: defaultSeasonDates.plantingStartDate || todayIso(),
  plantingEndDate: defaultSeasonDates.plantingEndDate,
  notes: "",
};

function taskStatusColor(status: FarmPlanTask["status"]) {
  if (status === "completed") return "bg-emerald-100 text-emerald-700";
  if (status === "missed") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

export default function FarmPlanPage() {
  const currentUser = authService.getCurrentUser();
  const [plans, setPlans] = useState<FarmPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [editableInputs, setEditableInputs] = useState<EditableFarmInput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [management, setManagement] = useState<FarmManagement | null>(null);
  const [recording, setRecording] = useState(false);
  const [activityForm, setActivityForm] = useState({ title: "", category: "other", activityDate: todayIso(), notes: "", cost: "0" });
  const [expenseForm, setExpenseForm] = useState({ itemName: "", category: "other", quantity: "1", unit: "kg", unitCost: "0", expenseDate: todayIso(), supplier: "", notes: "" });
  const [activeView, setActiveView] = useState<"overview" | "create">("overview");
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FarmPlan | null>(null);
  const [deleting, setDeleting] = useState(false);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[0] ?? null,
    [plans, selectedPlanId]
  );
  const selectedSeason = RWANDA_SEASONS.find((season) => season.id === form.seasonId) ?? RWANDA_SEASONS[0];
  const plannedInputCost = editableInputs.reduce(
    (total, input) => total + (Number(input.quantity) || 0) * (Number(input.unitCost) || 0),
    0
  );

  async function generateRecommendedInputs() {
    const farmSize = Number(form.farmSize);
    if (!form.cropName.trim() || !Number.isFinite(farmSize) || farmSize <= 0) {
      setError("Enter a crop and valid farm size before generating inputs.");
      return;
    }
    setEstimating(true);
    setError(null);
    try {
      const estimate = await farmPlanService.estimateInputs(form.cropName.trim(), farmSize);
      setEditableInputs(estimate.inputEstimates);
      toast.success("Recommended inputs generated. You can change them before saving.");
    } catch (err) {
      setError(errorMessage(err, "Failed to generate recommended inputs"));
    } finally {
      setEstimating(false);
    }
  }

  function updateInput(index: number, field: keyof EditableFarmInput, value: string | number) {
    setEditableInputs((current) => current.map((input, itemIndex) =>
      itemIndex === index ? { ...input, [field]: value } : input
    ));
  }

  function addInput() {
    setEditableInputs((current) => [...current, {
      inputName: "",
      inputType: "other",
      quantity: 1,
      unit: "unit",
      unitCost: 0,
      recommendedTiming: "During the season",
    }]);
  }

  function chooseSeason(season: (typeof RWANDA_SEASONS)[number], year = Number(form.seasonYear)) {
    const dates = seasonDates(season, year);
    setForm((current) => ({
      ...current,
      seasonId: season.id,
      seasonYear: String(year),
      season: seasonLabel(season, year),
      ...dates,
    }));
  }

  function changeSeasonYear(value: string) {
    const year = Number(value);
    setForm((current) => ({ ...current, seasonYear: value }));
    if (Number.isInteger(year) && year >= 2020 && year <= 2100) chooseSeason(selectedSeason, year);
  }

  function startCreatePlan() {
    setEditingPlanId(null);
    setForm((current) => ({ ...initialForm, locationName: current.locationName }));
    setEditableInputs([]);
    setError(null);
    setActiveView("create");
  }

  function startEditingPlan(plan: FarmPlan) {
    const seasonId = (plan.season.match(/Season\s+([ABC])/i)?.[1]?.toUpperCase() || "A") as RwandaSeasonId;
    const seasonYear = String(new Date(plan.plantingStartDate).getFullYear());
    setEditingPlanId(plan.id);
    setSelectedPlanId(plan.id);
    setForm({
      cropName: plan.cropName,
      seasonId,
      seasonYear,
      season: plan.season,
      locationName: plan.locationName,
      farmSize: String(plan.farmSize),
      soilType: plan.soilType || "",
      plantingStartDate: plan.plantingStartDate.slice(0, 10),
      plantingEndDate: plan.plantingEndDate.slice(0, 10),
      notes: plan.notes || "",
    });
    setEditableInputs((plan.inputEstimates || []).map((input) => ({
      inputName: input.inputName,
      inputType: input.inputType,
      quantity: Number(input.quantity),
      unit: input.unit,
      unitCost: Number(input.unitCost),
      recommendedTiming: input.recommendedTiming || "During the season",
      notes: input.notes || undefined,
    })));
    setError(null);
    setActiveView("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deletePlan() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await farmPlanService.delete(deleteTarget.id);
      const remaining = plans.filter((plan) => plan.id !== deleteTarget.id);
      setPlans(remaining);
      if (selectedPlanId === deleteTarget.id) setSelectedPlanId(remaining[0]?.id ?? null);
      if (editingPlanId === deleteTarget.id) {
        setEditingPlanId(null);
        setActiveView("overview");
      }
      toast.success(`${deleteTarget.cropName} plan deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete farm plan"));
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    farmPlanService
      .list()
      .then((data) => {
        if (cancelled) return;
        setPlans(data);
        setSelectedPlanId(data[0]?.id ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load farm plans");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedPlan?.id) { setManagement(null); return; }
    let cancelled = false;
    farmPlanService.getManagement(selectedPlan.id)
      .then((data) => { if (!cancelled) setManagement(data); })
      .catch((err) => { if (!cancelled) toast.error(errorMessage(err, "Failed to load farm records")); });
    return () => { cancelled = true; };
  }, [selectedPlan?.id]);

  async function recordActivity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPlan) return;
    setRecording(true);
    try {
      await farmPlanService.addActivity(selectedPlan.id, {
        ...activityForm, cost: Number(activityForm.cost), activityDate: activityForm.activityDate,
      });
      setManagement(await farmPlanService.getManagement(selectedPlan.id));
      setActivityForm({ title: "", category: "other", activityDate: todayIso(), notes: "", cost: "0" });
      toast.success("Farm activity recorded");
    } catch (err) { toast.error(errorMessage(err, "Failed to record activity")); }
    finally { setRecording(false); }
  }

  async function recordExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPlan) return;
    setRecording(true);
    try {
      await farmPlanService.addExpense(selectedPlan.id, {
        ...expenseForm, quantity: Number(expenseForm.quantity), unitCost: Number(expenseForm.unitCost), expenseDate: expenseForm.expenseDate,
      });
      setManagement(await farmPlanService.getManagement(selectedPlan.id));
      setExpenseForm({ itemName: "", category: "other", quantity: "1", unit: "kg", unitCost: "0", expenseDate: todayIso(), supplier: "", notes: "" });
      toast.success("Farm expense recorded");
    } catch (err) { toast.error(errorMessage(err, "Failed to record expense")); }
    finally { setRecording(false); }
  }

  async function createPlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const farmSize = Number(form.farmSize);
    if (!form.locationName.trim()) {
      setError("Enter the farmer location name, for example Musanze or Nyamagabe.");
      return;
    }
    if (!Number.isFinite(farmSize) || farmSize <= 0) {
      setError("Farm size must be greater than 0.");
      return;
    }
    if (!editableInputs.length) {
      setError("Generate recommended inputs, then review the budget before creating the plan.");
      return;
    }
    const incompleteInput = editableInputs.find((input) =>
      !input.inputName.trim() || !input.unit.trim() ||
      !Number.isFinite(Number(input.quantity)) || Number(input.quantity) < 0 ||
      !Number.isFinite(Number(input.unitCost)) || Number(input.unitCost) < 0
    );
    if (incompleteInput) {
      setError("Complete the name, quantity, unit, and price for every input, or remove the unfinished input.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        cropName: form.cropName.trim(),
        season: form.season.trim(),
        locationName: form.locationName.trim(),
        farmSize,
        soilType: form.soilType.trim() || undefined,
        plantingStartDate: form.plantingStartDate,
        plantingEndDate: form.plantingEndDate || undefined,
        notes: form.notes.trim() || undefined,
        inputEstimates: editableInputs,
      };
      const saved = editingPlanId
        ? await farmPlanService.update(editingPlanId, payload)
        : await farmPlanService.create(payload);
      setPlans((current) => editingPlanId
        ? current.map((plan) => plan.id === saved.id ? saved : plan)
        : [saved, ...current]
      );
      setSelectedPlanId(saved.id);
      setForm({ ...initialForm, locationName: form.locationName });
      setEditableInputs([]);
      setEditingPlanId(null);
      setActiveView("overview");
      toast.success(editingPlanId ? "Farm plan updated" : "Farm plan created");
    } catch (err) {
      const message = errorMessage(err, "Failed to create farm plan");
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task: FarmPlanTask) {
    if (!selectedPlan || updatingTaskId) return;
    const nextStatus = task.status === "completed" ? "pending" : "completed";

    setUpdatingTaskId(task.id);
    try {
      const updatedTask = await farmPlanService.updateTask(selectedPlan.id, task.id, nextStatus);
      setPlans((current) =>
        current.map((plan) =>
          plan.id === selectedPlan.id
            ? {
                ...plan,
                tasks: plan.tasks?.map((item) => (item.id === task.id ? updatedTask : item)),
              }
            : plan
        )
      );
      toast.success(nextStatus === "completed" ? `${task.title} completed` : `${task.title} marked pending`);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update task"));
    } finally {
      setUpdatingTaskId(null);
    }
  }

  if (currentUser?.role !== "farmer") {
    return <div className="p-6">Farm planning is available for farmer accounts.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <Header
        title="My Farm"
        subtitle="Plan the season, follow your tasks, and keep farm costs in one clear place."
      />

      <div className="mx-auto max-w-[1480px] space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-900 px-6 py-8 text-white shadow-xl shadow-emerald-900/10 sm:px-10 sm:py-10 dark:border-emerald-600/40">
          <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-amber-300/15 blur-3xl" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                <Sprout className="h-4 w-4" />
                {plans.length ? `${plans.length} saved farm ${plans.length === 1 ? "plan" : "plans"}` : "Your farming workspace"}
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {selectedPlan ? `${selectedPlan.cropName} in ${selectedPlan.locationName}` : "Turn your next season into a clear plan."}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/90 sm:text-base">
                {selectedPlan
                  ? `${selectedPlan.season} · ${selectedPlan.farmSize} hectares. See what is next, track spending, and keep every farm activity organized.`
                  : "Create your first plan to receive a schedule, input budget, and expected results for your crop."}
              </p>
            </div>
            <Button
              type="button"
              size="lg"
              onClick={startCreatePlan}
              className="w-full gap-2 rounded-full bg-white text-emerald-900 shadow-lg hover:bg-emerald-50 lg:w-auto"
            >
              <Plus className="h-5 w-5" /> Create a new plan
            </Button>
          </div>
        </section>

        <div className="flex justify-center">
          <div className="inline-flex rounded-full border border-border/70 bg-card/80 p-1.5 shadow-sm backdrop-blur">
            <button
              type="button"
              onClick={() => setActiveView("overview")}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${activeView === "overview" ? "bg-foreground text-background shadow" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="h-4 w-4" /> My farm
            </button>
            <button
              type="button"
              onClick={startCreatePlan}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${activeView === "create" ? "bg-foreground text-background shadow" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Plus className="h-4 w-4" /> Create plan
            </button>
          </div>
        </div>

        {activeView === "create" ? (
        <Card className="mx-auto max-w-5xl rounded-[2rem] border border-border/70 bg-card/90 shadow-xl shadow-black/5 backdrop-blur">
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-2xl">{editingPlanId ? "Update farm plan" : "Create a farm plan"}</CardTitle>
              {editingPlanId ? (
                <Button type="button" variant="ghost" onClick={startCreatePlan}>Cancel editing</Button>
              ) : null}
            </div>
            <CardDescription>
              Follow the steps below. Start with your farm, choose a season, then review the recommended inputs and budget.
            </CardDescription>
            <div className="grid grid-cols-3 gap-2 pt-4 text-center text-xs font-semibold sm:text-sm">
              <div className="rounded-xl bg-emerald-100 px-2 py-3 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">1. Farm details</div>
              <div className="rounded-xl bg-amber-100 px-2 py-3 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">2. Season</div>
              <div className="rounded-xl bg-sky-100 px-2 py-3 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300">3. Inputs & budget</div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={createPlan}>
              <div className="grid gap-2">
                <Label htmlFor="locationName">Farmer location name</Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="locationName"
                    value={form.locationName}
                    onChange={(event) => setForm((current) => ({ ...current, locationName: event.target.value }))}
                    placeholder="e.g. Musanze, Nyamagabe"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="cropName">Crop</Label>
                  <Input
                    id="cropName"
                    value={form.cropName}
                    onChange={(event) => setForm((current) => ({ ...current, cropName: event.target.value }))}
                    placeholder="Maize"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="farmSize">Farm size (ha)</Label>
                  <Input
                    id="farmSize"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.farmSize}
                    onChange={(event) => setForm((current) => ({ ...current, farmSize: event.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <Label>Choose Rwanda farming season</Label>
                    <p className="mt-1 text-xs text-muted-foreground">Dates are filled automatically and can still be adjusted.</p>
                  </div>
                  <div className="w-28">
                    <Label htmlFor="seasonYear" className="text-xs">Year</Label>
                    <Input
                      id="seasonYear"
                      type="number"
                      min="2020"
                      max="2100"
                      value={form.seasonYear}
                      onChange={(event) => changeSeasonYear(event.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  {RWANDA_SEASONS.map((season) => {
                    const active = form.seasonId === season.id;
                    return (
                      <button
                        key={season.id}
                        type="button"
                        onClick={() => chooseSeason(season)}
                        className={`rounded-xl border p-3 text-left transition ${
                          active ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500" : "hover:border-emerald-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold">{season.name} — {season.localName}</span>
                          {active ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : null}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{season.months}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50 p-4 text-sm">
                <p className="font-semibold text-emerald-900">{selectedSeason.name} — {selectedSeason.localName}</p>
                <div className="mt-3 grid gap-2 text-emerald-900">
                  <p className="flex items-center gap-2"><Sprout className="h-4 w-4" /> Planting: {selectedSeason.planting}</p>
                  <p className="flex items-center gap-2"><CloudRain className="h-4 w-4" /> Rainfall: {selectedSeason.rainfall}</p>
                  <p className="flex items-center gap-2"><Wheat className="h-4 w-4" /> Harvesting: {selectedSeason.harvest}</p>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">Inputs & budget</p>
                    <p className="text-xs text-muted-foreground">Start with IMARA recommendations, then change them to match your farm.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={generateRecommendedInputs} disabled={estimating}>
                    {estimating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    {editableInputs.length ? "Regenerate" : "Generate inputs"}
                  </Button>
                </div>

                {editableInputs.length ? (
                  <div className="space-y-3">
                    {editableInputs.map((input, index) => (
                      <div key={`${input.inputName}-${index}`} className="rounded-lg bg-muted/50 p-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="grid gap-1">
                            <Label htmlFor={`input-name-${index}`} className="text-xs">Input name</Label>
                            <Input
                              id={`input-name-${index}`}
                              value={input.inputName}
                              onChange={(event) => updateInput(index, "inputName", event.target.value)}
                              placeholder="e.g. Maize seed"
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label htmlFor={`input-type-${index}`} className="text-xs">Type</Label>
                            <select
                              id={`input-type-${index}`}
                              value={input.inputType}
                              onChange={(event) => updateInput(index, "inputType", event.target.value)}
                              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            >
                              <option value="seed">Seed</option>
                              <option value="fertilizer">Fertilizer</option>
                              <option value="pesticide">Crop protection</option>
                              <option value="labor">Labour</option>
                              <option value="transport">Transport</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="grid gap-1">
                            <Label htmlFor={`quantity-${index}`} className="text-xs">Quantity</Label>
                            <Input id={`quantity-${index}`} type="number" min="0" step="0.01" value={input.quantity}
                              onChange={(event) => updateInput(index, "quantity", Number(event.target.value))} />
                          </div>
                          <div className="grid gap-1">
                            <Label htmlFor={`unit-${index}`} className="text-xs">Unit</Label>
                            <Input id={`unit-${index}`} value={input.unit}
                              onChange={(event) => updateInput(index, "unit", event.target.value)} placeholder="kg, bag, day" />
                          </div>
                          <div className="grid gap-1">
                            <Label htmlFor={`price-${index}`} className="text-xs">Price per unit (RWF)</Label>
                            <Input id={`price-${index}`} type="number" min="0" step="1" value={input.unitCost}
                              onChange={(event) => updateInput(index, "unitCost", Number(event.target.value))} />
                          </div>
                          <div className="flex items-end justify-between gap-2 pb-1">
                            <div>
                              <p className="text-xs text-muted-foreground">Total</p>
                              <p className="font-semibold">{formatCurrency(Number(input.quantity) * Number(input.unitCost))}</p>
                            </div>
                            <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${input.inputName || "input"}`}
                              onClick={() => setEditableInputs((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-between gap-3 border-t pt-3">
                      <Button type="button" variant="outline" size="sm" onClick={addInput}>
                        <Plus className="mr-2 h-4 w-4" /> Add another input
                      </Button>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Planned input cost</p>
                        <p className="text-xl font-bold text-emerald-700">{formatCurrency(plannedInputCost)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                    Enter the crop and farm size, then select “Generate inputs”.
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="soilType">Soil type</Label>
                <Input
                  id="soilType"
                  value={form.soilType}
                  onChange={(event) => setForm((current) => ({ ...current, soilType: event.target.value }))}
                  placeholder="Optional"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="plantingStartDate">Planting start</Label>
                  <Input
                    id="plantingStartDate"
                    type="date"
                    value={form.plantingStartDate}
                    onChange={(event) => setForm((current) => ({ ...current, plantingStartDate: event.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="plantingEndDate">Planting end</Label>
                  <Input
                    id="plantingEndDate"
                    type="date"
                    value={form.plantingEndDate}
                    onChange={(event) => setForm((current) => ({ ...current, plantingEndDate: event.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  placeholder="Optional details about water, seed variety, or farmer goals"
                  rows={3}
                />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Button type="submit" className="w-full gap-2" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
                {saving ? (editingPlanId ? "Updating plan..." : "Creating plan...") : (editingPlanId ? "Save changes" : "Generate farm plan")}
              </Button>
            </form>
          </CardContent>
        </Card>
        ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-[1.75rem] border border-border/60 bg-card/85 shadow-sm backdrop-blur">
              <CardContent className="flex items-center gap-3 p-4">
                <Sprout className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Active plans</p>
                  <p className="text-2xl font-bold">{plans.filter((plan) => plan.status === "active").length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-[1.75rem] border border-border/60 bg-card/85 shadow-sm backdrop-blur">
              <CardContent className="flex items-center gap-3 p-4">
                <Coins className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Expected profit</p>
                  <p className="text-2xl font-bold">{formatCurrency(selectedPlan?.expectedProfit ?? 0)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-[1.75rem] border border-border/60 bg-card/85 shadow-sm backdrop-blur">
              <CardContent className="flex items-center gap-3 p-4">
                <Package className="h-8 w-8 text-sky-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Input cost</p>
                  <p className="text-2xl font-bold">{formatCurrency(selectedPlan?.estimatedCost ?? 0)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-[2rem] border border-border/60 bg-card/85 shadow-lg shadow-black/5 backdrop-blur">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl">My plans</CardTitle>
                  <CardDescription className="mt-1">Choose a farm plan to see its schedule, budget, and records.</CardDescription>
                </div>
                <Button type="button" variant="outline" className="rounded-full" onClick={startCreatePlan}>
                  <Plus className="mr-2 h-4 w-4" /> New plan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading farm plans...
                </div>
              ) : plans.length === 0 ? (
                <p className="text-sm text-muted-foreground">No farm plans yet. Create the first plan from the form.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`group rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md ${
                        selectedPlan?.id === plan.id ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : "bg-background/70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{plan.cropName}</p>
                          <p className="text-sm text-muted-foreground">{plan.locationName}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(event) => { event.stopPropagation(); startEditingPlan(plan); }}
                            className="rounded-full p-2 text-muted-foreground transition hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-300"
                            aria-label={`Edit ${plan.cropName} plan`}
                            title="Edit plan"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => { event.stopPropagation(); setDeleteTarget(plan); }}
                            className="rounded-full p-2 text-muted-foreground transition hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-500/15 dark:hover:text-red-300"
                            aria-label={`Delete ${plan.cropName} plan`}
                            title="Delete plan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <Badge variant="secondary">{plan.status}</Badge>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">{plan.farmSize} ha</span>
                        <span className="flex items-center justify-end gap-1 text-right font-medium text-emerald-700 dark:text-emerald-300">{formatCurrency(plan.expectedProfit)} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedPlan ? (
            <div className="space-y-6">
              <Card className="rounded-[2rem] border border-border/60 bg-card/85 shadow-lg shadow-black/5 backdrop-blur">
                <CardHeader>
                  <CardTitle>Manage your farm</CardTitle>
                  <CardDescription>Record completed work and real expenses for {selectedPlan.cropName}, {selectedPlan.season}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-muted p-4"><p className="text-xs text-muted-foreground">Planned budget</p><p className="text-xl font-bold">{formatCurrency(management?.summary.plannedCost ?? selectedPlan.estimatedCost)}</p></div>
                    <div className="rounded-xl bg-muted p-4"><p className="text-xs text-muted-foreground">Actual expenses</p><p className="text-xl font-bold">{formatCurrency(management?.summary.actualExpenses ?? 0)}</p></div>
                    <div className="rounded-xl bg-muted p-4"><p className="text-xs text-muted-foreground">Budget remaining</p><p className={`text-xl font-bold ${(management?.summary.budgetRemaining ?? 0) < 0 ? "text-red-600" : "text-emerald-600"}`}>{formatCurrency(management?.summary.budgetRemaining ?? selectedPlan.estimatedCost)}</p></div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <form onSubmit={recordActivity} className="space-y-3 rounded-xl border p-4">
                      <h3 className="font-semibold">Record farm activity</h3>
                      <div className="grid gap-1"><Label htmlFor="activityTitle">What did you do?</Label><Input id="activityTitle" required value={activityForm.title} onChange={(e) => setActivityForm((v) => ({ ...v, title: e.target.value }))} placeholder="e.g. Applied fertilizer" /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1"><Label htmlFor="activityCategory">Category</Label><select id="activityCategory" className="h-9 rounded-md border bg-background px-3 text-sm" value={activityForm.category} onChange={(e) => setActivityForm((v) => ({ ...v, category: e.target.value }))}><option value="land_preparation">Land preparation</option><option value="planting">Planting</option><option value="fertilizer">Fertilizer</option><option value="weeding">Weeding</option><option value="spraying">Spraying</option><option value="irrigation">Irrigation</option><option value="harvest">Harvest</option><option value="other">Other</option></select></div>
                        <div className="grid gap-1"><Label htmlFor="activityDate">Date</Label><Input id="activityDate" required type="date" value={activityForm.activityDate} onChange={(e) => setActivityForm((v) => ({ ...v, activityDate: e.target.value }))} /></div>
                      </div>
                      <div className="grid gap-1"><Label htmlFor="activityCost">Related cost (RWF)</Label><Input id="activityCost" type="number" min="0" value={activityForm.cost} onChange={(e) => setActivityForm((v) => ({ ...v, cost: e.target.value }))} /></div>
                      <div className="grid gap-1"><Label htmlFor="activityNotes">Notes</Label><Textarea id="activityNotes" rows={2} value={activityForm.notes} onChange={(e) => setActivityForm((v) => ({ ...v, notes: e.target.value }))} placeholder="Optional details" /></div>
                      <Button disabled={recording} className="w-full">{recording ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Save activity</Button>
                    </form>

                    <form onSubmit={recordExpense} className="space-y-3 rounded-xl border p-4">
                      <h3 className="font-semibold">Add actual expense</h3>
                      <div className="grid gap-1"><Label htmlFor="expenseItem">Item</Label><Input id="expenseItem" required value={expenseForm.itemName} onChange={(e) => setExpenseForm((v) => ({ ...v, itemName: e.target.value }))} placeholder="e.g. DAP fertilizer" /></div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="grid gap-1"><Label htmlFor="expenseQty">Quantity</Label><Input id="expenseQty" required type="number" min="0.01" step="0.01" value={expenseForm.quantity} onChange={(e) => setExpenseForm((v) => ({ ...v, quantity: e.target.value }))} /></div>
                        <div className="grid gap-1"><Label htmlFor="expenseUnit">Unit</Label><Input id="expenseUnit" required value={expenseForm.unit} onChange={(e) => setExpenseForm((v) => ({ ...v, unit: e.target.value }))} /></div>
                        <div className="grid gap-1"><Label htmlFor="expensePrice">Price/unit</Label><Input id="expensePrice" required type="number" min="0" value={expenseForm.unitCost} onChange={(e) => setExpenseForm((v) => ({ ...v, unitCost: e.target.value }))} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3"><div className="grid gap-1"><Label htmlFor="expenseDate">Date</Label><Input id="expenseDate" required type="date" value={expenseForm.expenseDate} onChange={(e) => setExpenseForm((v) => ({ ...v, expenseDate: e.target.value }))} /></div><div className="grid gap-1"><Label htmlFor="expenseSupplier">Supplier</Label><Input id="expenseSupplier" value={expenseForm.supplier} onChange={(e) => setExpenseForm((v) => ({ ...v, supplier: e.target.value }))} placeholder="Optional" /></div></div>
                      <p className="rounded-lg bg-muted p-2 text-right text-sm">Total: <strong>{formatCurrency(Number(expenseForm.quantity) * Number(expenseForm.unitCost))}</strong></p>
                      <Button disabled={recording} className="w-full">{recording ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Save expense</Button>
                    </form>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div><h3 className="mb-2 font-semibold">Recent activities</h3><div className="space-y-2">{management?.activities.slice(0, 5).map((item) => <div key={item.id} className="flex justify-between rounded-lg bg-muted/50 p-3 text-sm"><div><p className="font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{formatDate(item.activityDate)} · {item.category.replace(/_/g, " ")}</p></div>{Number(item.cost) > 0 ? <span>{formatCurrency(item.cost)}</span> : null}</div>)}{management && !management.activities.length ? <p className="text-sm text-muted-foreground">No activities recorded yet.</p> : null}</div></div>
                    <div><h3 className="mb-2 font-semibold">Recent expenses</h3><div className="space-y-2">{management?.expenses.slice(0, 5).map((item) => <div key={item.id} className="flex justify-between rounded-lg bg-muted/50 p-3 text-sm"><div><p className="font-medium">{item.itemName}</p><p className="text-xs text-muted-foreground">{item.quantity} {item.unit} · {formatDate(item.expenseDate)}</p></div><span className="font-medium">{formatCurrency(item.totalCost)}</span></div>)}{management && !management.expenses.length ? <p className="text-sm text-muted-foreground">No expenses recorded yet.</p> : null}</div></div>
                  </div>
                </CardContent>
              </Card>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="rounded-[2rem] border border-border/60 bg-card/85 shadow-lg shadow-black/5 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-emerald-600" />
                    Season schedule
                  </CardTitle>
                  <CardDescription>
                    {selectedPlan.cropName} in {selectedPlan.locationName}, {selectedPlan.season}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedPlan.tasks?.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 rounded-lg border p-3">
                      <button
                        type="button"
                        onClick={() => toggleTask(task)}
                        disabled={updatingTaskId !== null}
                        className="mt-0.5 text-emerald-600"
                        aria-label={task.status === "completed" ? `Mark ${task.title} pending` : `Mark ${task.title} completed`}
                      >
                        <CheckCircle2 className={`h-5 w-5 ${task.status === "completed" ? "fill-emerald-100" : ""}`} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{task.title}</p>
                          <button
                            type="button"
                            onClick={() => toggleTask(task)}
                            disabled={updatingTaskId !== null}
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition hover:ring-2 hover:ring-emerald-400 disabled:cursor-wait disabled:opacity-60 ${taskStatusColor(task.status)}`}
                            title={task.status === "completed" ? "Click to mark pending" : "Click when this task is finished"}
                          >
                            {updatingTaskId === task.id ? (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : null}
                            {task.status === "completed" ? "Completed" : "Pending — mark done"}
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Due {formatDate(task.dueDate)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border border-border/60 bg-card/85 shadow-lg shadow-black/5 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Inputs and results
                  </CardTitle>
                  <CardDescription>
                    Estimated yield {Number(selectedPlan.expectedYield).toLocaleString()} kg and revenue {formatCurrency(selectedPlan.expectedRevenue)}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-muted-foreground">Planting</p>
                      <p className="font-semibold">{formatDate(selectedPlan.plantingStartDate)}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-muted-foreground">Harvest window</p>
                      <p className="font-semibold">{formatDate(selectedPlan.expectedHarvestStartDate)}</p>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted text-left">
                        <tr>
                          <th className="px-3 py-2 font-medium">Input</th>
                          <th className="px-3 py-2 font-medium">Qty</th>
                          <th className="px-3 py-2 text-right font-medium">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPlan.inputEstimates?.map((input) => (
                          <tr key={input.id} className="border-t">
                            <td className="px-3 py-2">
                              <p className="font-medium">{input.inputName}</p>
                              <p className="text-xs text-muted-foreground">{input.recommendedTiming}</p>
                            </td>
                            <td className="px-3 py-2">
                              {Number(input.quantity).toLocaleString()} {input.unit}
                            </td>
                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(input.totalCost)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          ) : null}
        </div>
        )}
      </div>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this farm plan?</AlertDialogTitle>
            <AlertDialogDescription>
              The {deleteTarget?.cropName} plan for {deleteTarget?.locationName}, including its schedule and input estimates, will be permanently deleted. Farm activity and expense records linked to it will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Keep plan</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => { event.preventDefault(); void deletePlan(); }}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {deleting ? "Deleting..." : "Delete plan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
