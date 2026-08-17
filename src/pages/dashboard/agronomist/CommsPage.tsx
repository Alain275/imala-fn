import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  MessageSquare, Send, Users, ChevronDown, Filter,
  AlertCircle, Globe2, Search, FileText, Tag, X,
  Radio, UserSearch, ArrowRight,
} from "lucide-react"
import { toast } from "sonner"
import {
  agronomistCommsService, type MessagingFilterOptions, type BulkMessageResult,
} from "@/services/agronomistComms.service"
import { agronomistFarmersService, type FarmerListEntry } from "@/services/agronomistFarmers.service"

type SendMode = "all" | "specific"

export default function CommsPage() {
  const [message, setMessage] = useState("")
  const [sendMode, setSendMode] = useState<SendMode>("all")

  // Audience filters
  const [filterOptions, setFilterOptions] = useState<MessagingFilterOptions | null>(null)
  const [district, setDistrict] = useState("")
  const [sector, setSector] = useState("")
  const [cropType, setCropType] = useState("")
  const [audienceCount, setAudienceCount] = useState<number | null>(null)
  const [audienceLoading, setAudienceLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [bulkResult, setBulkResult] = useState<BulkMessageResult | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Specific-farmer picker — sends via farmerId, bypassing filters entirely
  const [farmerSearch, setFarmerSearch] = useState("")
  const [farmerResults, setFarmerResults] = useState<FarmerListEntry[]>([])
  const [farmerSearchLoading, setFarmerSearchLoading] = useState(false)
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerListEntry | null>(null)

  // Open Tickets KPI tile — lightweight count only, full ticket management lives on its own page now
  const [openTicketCount, setOpenTicketCount] = useState<number | null>(null)

  useEffect(() => {
    agronomistCommsService.getFilterOptions()
      .then(setFilterOptions)
      .catch(() => toast.error("Failed to load audience filter options"))
  }, [])

  useEffect(() => {
    Promise.all([
      agronomistCommsService.getSupportTickets({ status: 'open', limit: 1 }),
      agronomistCommsService.getSupportTickets({ status: 'in_progress', limit: 1 }),
    ])
      .then(([open, inProgress]) => setOpenTicketCount(open.pagination.total + inProgress.pagination.total))
      .catch(() => setOpenTicketCount(null))
  }, [])

  // Audience count refetches whenever filters change
  useEffect(() => {
    setAudienceLoading(true)
    agronomistCommsService.getAudienceCount({
      district: district || undefined, sector: sector || undefined, cropType: cropType || undefined,
    })
      .then(setAudienceCount)
      .catch(() => toast.error("Failed to load matched farmer count"))
      .finally(() => setAudienceLoading(false))
  }, [district, sector, cropType])

  // Debounced farmer search for the "Specific Farmer" picker
  useEffect(() => {
    if (sendMode !== "specific" || !farmerSearch.trim()) { setFarmerResults([]); return }
    setFarmerSearchLoading(true)
    const t = setTimeout(() => {
      agronomistFarmersService.getFarmers({ search: farmerSearch, limit: 10 })
        .then(({ farmers }) => setFarmerResults(farmers))
        .catch(() => toast.error("Failed to search farmers"))
        .finally(() => setFarmerSearchLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [farmerSearch, sendMode])

  const smsCount = message.length
  const smsSegments = Math.ceil(smsCount / 160) || 1

  const handleSend = async () => {
    setConfirmOpen(false)
    setSending(true)
    setBulkResult(null)
    try {
      const result = sendMode === "specific" && selectedFarmer
        ? await agronomistCommsService.sendBulkMessage(message, { farmerId: selectedFarmer.id })
        : await agronomistCommsService.sendBulkMessage(message, {
            district: district || undefined, sector: sector || undefined, cropType: cropType || undefined,
          })
      setBulkResult(result)
      toast.success(
        sendMode === "specific"
          ? `Delivered to ${selectedFarmer?.name}`
          : `Delivered to ${result.recipientCount} of ${result.matchedCount} matched farmers`
      )
    } catch (err) {
      // Surfaces the backend's real message, e.g. "farmerId does not resolve to
      // a real, active farmer" — a clean 400, not a crash.
      toast.error(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        title="Comms Studio"
        subtitle="Bulk messaging to farmer segments"
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-4 px-3 sm:px-6 pt-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <Icon3D gradient="sky" size="md">
              <Users className="w-5 h-5" />
            </Icon3D>
            <div>
              <p className="text-2xl font-black text-foreground">{audienceLoading || audienceCount === null ? "…" : audienceCount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Matched Farmers</p>
            </div>
          </CardContent>
        </Card>
        <Link to="/agronomist/support-tickets">
          <Card className="border-0 shadow-md card-hover h-full hover:border-primary/30 transition-colors">
            <CardContent className="p-4 flex items-center gap-4">
              <Icon3D gradient="gold" size="md">
                <AlertCircle className="w-5 h-5" />
              </Icon3D>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-black text-foreground">{openTicketCount === null ? "…" : openTicketCount}</p>
                <p className="text-xs text-muted-foreground">Open Tickets</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mx-3 sm:mx-6 mt-6 mb-6 space-y-6">

        {/* Audience Filter — own full-width row */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="flex items-center gap-3 text-base">
              <Icon3D gradient="earth" size="sm">
                <Filter className="w-4 h-4" />
              </Icon3D>
              Audience Filter
              <span className="text-sm font-normal text-muted-foreground">— who "All Farmers" sends to below</span>
              {(district || sector || cropType) && (
                <button className="ml-auto text-[10px] text-muted-foreground hover:text-foreground" onClick={() => { setDistrict(""); setSector(""); setCropType("") }}>Reset</button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-3 text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{audienceLoading || audienceCount === null ? "…" : audienceCount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-0.5">Matched farmers</p>
              </div>

              {!filterOptions ? (
                <div className="flex gap-3 flex-1">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 flex-1 max-w-56" />)}
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 flex-1">
                  {[
                    { label: "District", icon: Globe2, options: filterOptions.districts, value: district, setter: setDistrict },
                    { label: "Sector", icon: Tag, options: filterOptions.sectors, value: sector, setter: setSector },
                    { label: "Crop Type", icon: Filter, options: filterOptions.cropTypes, value: cropType, setter: setCropType },
                  ].map(f => (
                    <div key={f.label} className="min-w-48 flex-1 max-w-64">
                      <label className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                        <f.icon className="w-3 h-3" />{f.label}
                      </label>
                      <div className="relative">
                        <select value={f.value} onChange={e => f.setter(e.target.value)}
                          className="w-full bg-muted border border-border text-foreground text-xs rounded-lg px-2.5 py-2 appearance-none cursor-pointer focus:outline-none">
                          <option value="">All {f.label}s</option>
                          {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mr-1">Active Filters:</p>
              {[district, sector, cropType].filter(Boolean).map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
                  {tag} <X className="w-2.5 h-2.5 cursor-pointer" />
                </span>
              ))}
              {![district, sector, cropType].some(Boolean) && (
                <span className="text-xs text-muted-foreground">No active filters — matches every farmer</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compose Message — own full-width row */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="flex items-center gap-3 text-base">
              <Icon3D gradient="sky" size="sm">
                <MessageSquare className="w-4 h-4" />
              </Icon3D>
              Compose Message
            </CardTitle>
            <CardDescription>Send a message to farmers via in-app notification</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Send mode toggle */}
            <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1">
              <button onClick={() => setSendMode("all")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  sendMode === "all" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                <Radio className="w-3.5 h-3.5" /> All Farmers
              </button>
              <button onClick={() => setSendMode("specific")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  sendMode === "specific" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                <UserSearch className="w-3.5 h-3.5" /> Specific Farmer
              </button>
            </div>

            {sendMode === "specific" && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input value={farmerSearch} onChange={e => { setFarmerSearch(e.target.value); setSelectedFarmer(null) }}
                    placeholder="Search farmers by name..."
                    className="w-full bg-muted border border-border text-foreground text-xs pl-8 pr-3 py-2 rounded-lg focus:outline-none" />
                </div>
                {selectedFarmer ? (
                  <div className="flex items-center justify-between bg-sky-500/10 border border-sky-500/20 rounded-lg px-3 py-2">
                    <span className="text-xs font-semibold text-sky-700 dark:text-sky-400">{selectedFarmer.name}</span>
                    <button onClick={() => { setSelectedFarmer(null); setFarmerSearch("") }} className="text-muted-foreground hover:text-foreground">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : farmerSearch.trim() && (
                  <div className="border border-border rounded-lg divide-y divide-border max-h-40 overflow-y-auto">
                    {farmerSearchLoading ? (
                      <div className="p-2 space-y-1.5">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
                    ) : farmerResults.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-2.5">No farmers found.</p>
                    ) : farmerResults.map(f => (
                      <button key={f.id} onClick={() => { setSelectedFarmer(f); setFarmerResults([]) }}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-foreground hover:bg-muted/60 transition-colors">
                        {f.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">Message Body</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className={`font-medium ${smsCount > 160 ? "text-amber-600" : "text-muted-foreground"}`}>{smsCount} chars</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{smsSegments} segment{smsSegments > 1 ? "s" : ""}</span>
                </div>
              </div>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
                className="w-full bg-transparent text-foreground text-sm px-4 py-3 resize-none focus:outline-none placeholder:text-muted-foreground/50"
                placeholder="Type your message..." />
            </div>

            {sendMode === "all" ? (
              <button onClick={() => setConfirmOpen(true)} disabled={sending || audienceLoading || !audienceCount || !message.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 font-semibold hover:bg-sky-500/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <Send className="w-4 h-4" /> {sending ? "Sending…" : `Send to ${audienceCount ?? 0} Farmers`}
              </button>
            ) : (
              <button onClick={() => setConfirmOpen(true)} disabled={sending || !selectedFarmer || !message.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 font-semibold hover:bg-sky-500/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <Send className="w-4 h-4" /> {sending ? "Sending…" : selectedFarmer ? `Send to ${selectedFarmer.name}` : "Select a farmer first"}
              </button>
            )}

            {bulkResult && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                  {sendMode === "specific"
                    ? `Delivered to ${selectedFarmer?.name}`
                    : <>Delivered to {bulkResult.recipientCount} of {bulkResult.matchedCount} matched farmers{bulkResult.failedCount > 0 && ` · ${bulkResult.failedCount} failed`}</>}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Send confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {sendMode === "specific" ? `Send to ${selectedFarmer?.name}?` : `Send to ${audienceCount ?? 0} matched farmers?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {sendMode === "specific"
                ? "This delivers the message immediately via in-app notification to this farmer only. This cannot be undone."
                : "This delivers the message immediately via in-app notification to every farmer matching the current audience filter. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend}>Send</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
