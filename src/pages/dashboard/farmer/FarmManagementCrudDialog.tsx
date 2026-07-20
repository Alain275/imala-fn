import { useState } from "react"
import { Pencil, Settings2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { farmPlanService, type FarmActivity, type FarmExpense, type FarmHarvest, type FarmManagement } from "@/services/farmPlan"

type RecordType = "activity" | "harvest" | "expense"
type EditableRecord = FarmActivity | FarmHarvest | FarmExpense

const dateValue = (value: string) => value?.slice(0, 10) || new Date().toISOString().slice(0, 10)
const errorMessage = (error: unknown) => error instanceof Error ? error.message : "The record could not be changed"

const activityCategories = ["land_preparation", "planting", "fertilizer", "weeding", "spraying", "irrigation", "harvest", "other"]
const expenseCategories = ["seed", "fertilizer", "pesticide", "labor", "transport", "equipment", "irrigation", "other"]

export function FarmManagementCrudDialog({
  planId,
  management,
  onChanged,
}: {
  planId: string
  management: FarmManagement | null
  onChanged: () => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<RecordType>("activity")
  const [editing, setEditing] = useState<{ type: RecordType; id: string } | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const records: EditableRecord[] = type === "activity"
    ? management?.activities ?? []
    : type === "harvest"
      ? management?.harvests ?? []
      : management?.expenses ?? []

  const beginEdit = (recordType: RecordType, record: EditableRecord) => {
    setEditing({ type: recordType, id: record.id })
    if (recordType === "activity") {
      const item = record as FarmActivity
      setForm({
        title: item.title, category: item.category, activityDate: dateValue(item.activityDate), notes: item.notes ?? "",
        workerCount: String(item.workerCount), workerDailyRate: String(item.workerDailyRate), areaWorked: String(item.areaWorked),
        seedQuantity: String(item.seedQuantity), fertilizerQuantity: String(item.fertilizerQuantity), manureQuantity: String(item.manureQuantity),
        materialCost: String(item.materialCost), otherCost: String(item.otherCost),
      })
    } else if (recordType === "harvest") {
      const item = record as FarmHarvest
      setForm({
        harvestDate: dateValue(item.harvestDate), quantityHarvested: String(item.quantityHarvested), quantitySold: String(item.quantitySold),
        quantityLost: String(item.quantityLost), quantityKept: String(item.quantityKept), unit: item.unit,
        saleUnitPrice: String(item.saleUnitPrice), buyer: item.buyer ?? "", notes: item.notes ?? "",
      })
    } else {
      const item = record as FarmExpense
      setForm({
        category: item.category, itemName: item.itemName, quantity: String(item.quantity), unit: item.unit,
        unitCost: String(item.unitCost), expenseDate: dateValue(item.expenseDate), supplier: item.supplier ?? "", notes: item.notes ?? "",
      })
    }
  }

  const field = (name: string, value: string) => setForm((current) => ({ ...current, [name]: value }))

  const beginNewExpense = () => {
    setEditing({ type: "expense", id: "new" })
    setForm({ category: "other", itemName: "", quantity: "1", unit: "item", unitCost: "0", expenseDate: new Date().toISOString().slice(0, 10), supplier: "", notes: "" })
  }

  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)
    try {
      if (editing.type === "activity") {
        await farmPlanService.updateActivity(planId, editing.id, {
          title: form.title, category: form.category, activityDate: form.activityDate, notes: form.notes || null,
          workerCount: Number(form.workerCount), workerDailyRate: Number(form.workerDailyRate), areaWorked: Number(form.areaWorked),
          seedQuantity: Number(form.seedQuantity), fertilizerQuantity: Number(form.fertilizerQuantity), manureQuantity: Number(form.manureQuantity),
          materialCost: Number(form.materialCost), otherCost: Number(form.otherCost),
        })
      } else if (editing.type === "harvest") {
        await farmPlanService.updateHarvest(planId, editing.id, {
          harvestDate: form.harvestDate, quantityHarvested: Number(form.quantityHarvested), quantitySold: Number(form.quantitySold),
          quantityLost: Number(form.quantityLost), quantityKept: Number(form.quantityKept), unit: form.unit,
          saleUnitPrice: Number(form.saleUnitPrice), buyer: form.buyer || null, notes: form.notes || null,
        })
      } else {
        const payload = {
          category: form.category, itemName: form.itemName, quantity: Number(form.quantity), unit: form.unit,
          unitCost: Number(form.unitCost), expenseDate: form.expenseDate, supplier: form.supplier || null, notes: form.notes || null,
        }
        if (editing.id === "new") await farmPlanService.addExpense(planId, payload)
        else await farmPlanService.updateExpense(planId, editing.id, payload)
      }
      await onChanged()
      setEditing(null)
      toast.success("Record updated")
    } catch (error) { toast.error(errorMessage(error)) }
    finally { setSaving(false) }
  }

  const remove = async (recordType: RecordType, id: string) => {
    if (!window.confirm("Delete this record? This cannot be undone.")) return
    setSaving(true)
    try {
      if (recordType === "activity") await farmPlanService.deleteActivity(planId, id)
      else if (recordType === "harvest") await farmPlanService.deleteHarvest(planId, id)
      else await farmPlanService.deleteExpense(planId, id)
      await onChanged()
      if (editing?.id === id) setEditing(null)
      toast.success("Record deleted")
    } catch (error) { toast.error(errorMessage(error)) }
    finally { setSaving(false) }
  }

  const numberInput = (name: string, label: string) => <div><Label>{label}</Label><Input type="number" min="0" step="0.01" value={form[name] ?? "0"} onChange={(event) => field(name, event.target.value)} /></div>

  return (
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) setEditing(null) }}>
      <DialogTrigger asChild><Button variant="outline" className="w-full sm:w-auto"><Settings2 className="mr-2 h-4 w-4" />Edit or delete records</Button></DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader><DialogTitle>Manage farm records</DialogTitle><DialogDescription>Correct or remove saved work, harvest, and expense records.</DialogDescription></DialogHeader>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
          {(["activity", "harvest", "expense"] as RecordType[]).map((item) => <button key={item} type="button" onClick={() => { setType(item); setEditing(null) }} className={`rounded-lg px-2 py-2 text-sm font-semibold capitalize ${type === item ? "bg-background shadow" : "text-muted-foreground"}`}>{item === "activity" ? "Daily work" : item === "harvest" ? "Harvests" : "Expenses"}</button>)}
        </div>

        {!editing && type === "expense" && <Button className="w-full" onClick={beginNewExpense}>Add another expense</Button>}
        {editing ? <div className="space-y-4 rounded-2xl border p-4">
          <div className="flex items-center justify-between"><h3 className="font-bold">Edit {editing.type}</h3><Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancel</Button></div>
          {editing.type === "activity" && <><div className="grid gap-3 sm:grid-cols-2"><div><Label>Activity</Label><Input value={form.title ?? ""} onChange={(e) => field("title", e.target.value)} /></div><div><Label>Category</Label><select className="h-10 w-full rounded-md border bg-background px-3" value={form.category} onChange={(e) => field("category", e.target.value)}>{activityCategories.map((item) => <option key={item} value={item}>{item.replace(/_/g, " ")}</option>)}</select></div><div><Label>Date</Label><Input type="date" value={form.activityDate} onChange={(e) => field("activityDate", e.target.value)} /></div>{numberInput("workerCount", "Workers")}{numberInput("workerDailyRate", "Pay per worker")}{numberInput("areaWorked", "Area worked (ha)")}{numberInput("seedQuantity", "Seed used (kg)")}{numberInput("fertilizerQuantity", "Fertilizer used (kg)")}{numberInput("manureQuantity", "Manure used (kg)")}{numberInput("materialCost", "Material cost")}{numberInput("otherCost", "Other cost")}</div></>}
          {editing.type === "harvest" && <div className="grid gap-3 sm:grid-cols-2"><div><Label>Date</Label><Input type="date" value={form.harvestDate} onChange={(e) => field("harvestDate", e.target.value)} /></div><div><Label>Unit</Label><Input value={form.unit} onChange={(e) => field("unit", e.target.value)} /></div>{numberInput("quantityHarvested", "Harvested")}{numberInput("quantitySold", "Sold")}{numberInput("quantityKept", "Kept")}{numberInput("quantityLost", "Lost")}{numberInput("saleUnitPrice", "Sale price per unit")}<div><Label>Buyer</Label><Input value={form.buyer ?? ""} onChange={(e) => field("buyer", e.target.value)} /></div></div>}
          {editing.type === "expense" && <div className="grid gap-3 sm:grid-cols-2"><div><Label>Item</Label><Input value={form.itemName ?? ""} onChange={(e) => field("itemName", e.target.value)} /></div><div><Label>Category</Label><select className="h-10 w-full rounded-md border bg-background px-3" value={form.category} onChange={(e) => field("category", e.target.value)}>{expenseCategories.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>{numberInput("quantity", "Quantity")}<div><Label>Unit</Label><Input value={form.unit ?? ""} onChange={(e) => field("unit", e.target.value)} /></div>{numberInput("unitCost", "Price per unit")}<div><Label>Date</Label><Input type="date" value={form.expenseDate} onChange={(e) => field("expenseDate", e.target.value)} /></div><div><Label>Supplier</Label><Input value={form.supplier ?? ""} onChange={(e) => field("supplier", e.target.value)} /></div></div>}
          <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={(e) => field("notes", e.target.value)} /></div>
          <Button className="w-full" disabled={saving} onClick={saveEdit}>Save changes</Button>
        </div> : <div className="space-y-2">
          {records.map((record) => {
            const title = type === "activity" ? (record as FarmActivity).title : type === "harvest" ? `${(record as FarmHarvest).quantityHarvested} ${(record as FarmHarvest).unit} harvested` : (record as FarmExpense).itemName
            const amount = type === "activity" ? (record as FarmActivity).cost : type === "harvest" ? (record as FarmHarvest).revenue : (record as FarmExpense).totalCost
            return <div key={record.id} className="flex items-center gap-2 rounded-xl border p-3"><div className="min-w-0 flex-1"><p className="truncate font-semibold">{title}</p><p className="text-xs text-muted-foreground">RWF {Number(amount).toLocaleString()}</p></div><Button variant="outline" size="icon" onClick={() => beginEdit(type, record)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button><Button variant="outline" size="icon" className="text-red-600" disabled={saving} onClick={() => remove(type, record.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button></div>
          })}
          {!records.length && <p className="py-8 text-center text-sm text-muted-foreground">No records in this section.</p>}
        </div>}
      </DialogContent>
    </Dialog>
  )
}
