import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Check, Loader2, MapPin, Search, Sprout } from "lucide-react"
import { toast } from "sonner"
import {
  cooperativeApi,
  type AvailableFarm,
  type FarmerSearchResult,
} from "@/services/cooperative.service"

/**
 * The real Add Member flow:
 *
 *   search an existing farmer  →  confirm  →  their REAL farms load
 *   →  tick which to register  →  done
 *
 * Replaces the old form that collected a name/email and invented an account.
 * Nothing here creates a user: the farmer must already have signed up and
 * registered their farms through the ordinary flow, which this reads.
 */
export function AddMemberDialog({
  open,
  onOpenChange,
  onMemberAdded,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMemberAdded: () => void
}) {
  const { t } = useTranslation()

  const [query, setQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<FarmerSearchResult[] | null>(null)

  const [adding, setAdding] = useState(false)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [memberName, setMemberName] = useState("")

  const [farms, setFarms] = useState<AvailableFarm[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [linking, setLinking] = useState(false)

  const reset = () => {
    setQuery(""); setResults(null); setMemberId(null); setMemberName("")
    setFarms([]); setSelected(new Set())
  }

  const close = () => { onOpenChange(false); reset() }

  const search = async () => {
    if (query.trim().length < 3) return
    setSearching(true)
    try {
      setResults(await cooperativeApi.searchFarmers(query.trim()))
    } catch (error: any) {
      toast.error(error?.message || t("cooperative.members.addFlow.error"))
    } finally {
      setSearching(false)
    }
  }

  const addMember = async (farmer: FarmerSearchResult) => {
    setAdding(true)
    try {
      const member = await cooperativeApi.addMemberByFarmerId(farmer.id)
      setMemberId(member.id)
      setMemberName(farmer.name)
      toast.success(t("cooperative.members.addFlow.added"))
      onMemberAdded()
      // Step 2: their real farms, straight from the farms table.
      const available = await cooperativeApi.getAvailableFarms(member.id)
      setFarms(available)
      setSelected(new Set(available.filter(f => f.alreadyLinked).map(f => f.id)))
    } catch (error: any) {
      toast.error(error?.message || t("cooperative.members.addFlow.error"))
    } finally {
      setAdding(false)
    }
  }

  const linkFarms = async () => {
    if (!memberId) return
    const toLink = [...selected].filter(id => !farms.find(f => f.id === id)?.alreadyLinked)
    if (toLink.length === 0) { close(); return }
    setLinking(true)
    try {
      await cooperativeApi.linkFarms(memberId, toLink)
      toast.success(t("cooperative.members.addFlow.linkedToast"))
      onMemberAdded()
      close()
    } catch (error: any) {
      toast.error(error?.message || t("cooperative.members.addFlow.error"))
    } finally {
      setLinking(false)
    }
  }

  const toggle = (farmId: string) =>
    setSelected(current => {
      const next = new Set(current)
      if (next.has(farmId)) next.delete(farmId)
      else next.add(farmId)
      return next
    })

  return (
    <Dialog open={open} onOpenChange={value => (value ? onOpenChange(true) : close())}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {memberId
              ? t("cooperative.members.addFlow.selectFarmsTitle")
              : t("cooperative.members.addFlow.title")}
          </DialogTitle>
          <DialogDescription>
            {memberId
              ? t("cooperative.members.addFlow.selectFarmsText")
              : t("cooperative.members.addFlow.searchHint")}
          </DialogDescription>
        </DialogHeader>

        {!memberId ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="member-search">{t("cooperative.members.addFlow.searchLabel")}</Label>
              <div className="mt-1 flex gap-2">
                <Input
                  id="member-search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); void search() } }}
                  placeholder={t("cooperative.members.addFlow.searchPlaceholder")}
                />
                <Button onClick={search} disabled={searching || query.trim().length < 3}>
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {results && results.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("cooperative.members.addFlow.noResults")}
              </p>
            )}

            <div className="space-y-2">
              {results?.map(farmer => {
                const blocked = Boolean(farmer.membership)
                const reason = farmer.membership?.isMemberOfYourCooperative
                  ? t("cooperative.members.addFlow.alreadyMember")
                  : farmer.membership?.isMemberOfAnotherCooperative
                    ? t("cooperative.members.addFlow.otherCooperative")
                    : null
                return (
                  <div
                    key={farmer.id}
                    className="flex items-center justify-between gap-3 rounded-md border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{farmer.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{farmer.email}</p>
                      {farmer.phone && (
                        <p className="text-xs text-muted-foreground">{farmer.phone}</p>
                      )}
                      {reason && <p className="mt-1 text-xs text-amber-600">{reason}</p>}
                    </div>
                    <Button
                      size="sm"
                      disabled={blocked || adding}
                      onClick={() => addMember(farmer)}
                    >
                      {adding
                        ? t("cooperative.members.addFlow.adding")
                        : t("cooperative.members.addFlow.add")}
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-medium">{memberName}</p>

            {farms.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Sprout className="h-7 w-7 text-muted-foreground" />
                <p className="text-sm font-medium">{t("cooperative.members.addFlow.noFarms")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("cooperative.members.addFlow.noFarmsHint")}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {farms.map(farm => {
                  const checked = selected.has(farm.id)
                  return (
                    <label
                      key={farm.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                        checked ? "border-primary bg-primary/5" : "hover:border-muted-foreground/40"
                      } ${farm.alreadyLinked ? "opacity-70" : ""}`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        disabled={farm.alreadyLinked}
                        onChange={() => toggle(farm.id)}
                      />
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border ${
                          checked ? "border-primary bg-primary text-primary-foreground" : "border-input"
                        }`}
                      >
                        {checked && <Check className="h-3 w-3 stroke-[3]" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{farm.name}</span>
                          {farm.alreadyLinked && (
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase">
                              {t("cooperative.members.addFlow.linked")}
                            </span>
                          )}
                        </span>
                        <span className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span>
                            {t("cooperative.members.addFlow.farmSize")}: {farm.sizeHa}{" "}
                            {t("cooperative.members.addFlow.hectares")}
                          </span>
                          {farm.crop && (
                            <span>
                              {t("cooperative.members.addFlow.farmCrop")}: {farm.crop}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {farm.location}
                          </span>
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={close} disabled={linking}>
                {farms.length === 0
                  ? t("cooperative.members.addFlow.done")
                  : t("cooperative.members.addFlow.skip")}
              </Button>
              {farms.length > 0 && (
                <Button onClick={linkFarms} disabled={linking || selected.size === 0}>
                  {linking
                    ? t("cooperative.members.addFlow.linking")
                    : t("cooperative.members.addFlow.linkSelected")}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
