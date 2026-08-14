import { useEffect, useState, useCallback } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  MessageSquare, Send, Users, ChevronDown, Filter,
  Phone, CheckCircle2, AlertCircle,
  Hash, Globe2, Search, Plus, ArrowRight, Mic,
  FileText, Languages, RefreshCw, Tag, X,
} from "lucide-react"
import { toast } from "sonner"
import { authService } from "@/services/auth"
import {
  agronomistCommsService, type MessagingFilterOptions, type BulkMessageResult,
  type SupportTicket, type TicketChannel, type TicketPriority, type TicketStatus,
} from "@/services/agronomistComms.service"
import { agronomistFarmersService, type FarmerListEntry } from "@/services/agronomistFarmers.service"

const rwandaTranslations: Record<string, string> = {
  "Apply": "Shyiraho",
  "fertilizer": "ifumbire",
  "kg per hectare": "kg ku hectari",
  "nitrogen": "azote",
  "phosphorus": "fosifor",
  "potassium": "potas",
  "Good morning farmer": "Muraho umuhinzi",
  "Your crop needs": "Ibimera byawe bikeneye",
  "Harvest time": "Igihe cyo gusarura",
}

const CHANNEL_OPTIONS: TicketChannel[] = ["USSD", "SMS", "Voice", "in-app"]
const PRIORITY_OPTIONS: TicketPriority[] = ["high", "medium", "low"]
const STATUS_FILTERS: Array<TicketStatus | 'all'> = ['all', 'open', 'in_progress', 'resolved']

const priorityStyle = (p: string) => {
  if (p === "high") return "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
  if (p === "medium") return "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
  return "bg-muted border-border text-muted-foreground"
}
const statusStyle = (s: string) => {
  if (s === "resolved") return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
  if (s === "in_progress") return "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400"
  return "bg-muted border-border text-muted-foreground"
}
const channelIcon = (c: string) => {
  if (c === "Voice") return <Mic className="w-3.5 h-3.5" />
  if (c === "USSD") return <Hash className="w-3.5 h-3.5" />
  return <MessageSquare className="w-3.5 h-3.5" />
}

interface CreateTicketForm {
  farmerId: string
  channel: TicketChannel
  district: string
  crop: string
  issue: string
  priority: TicketPriority
}

const EMPTY_TICKET_FORM: CreateTicketForm = { farmerId: "", channel: "in-app", district: "", crop: "", issue: "", priority: "medium" }

export default function CommsPage() {
  const currentUserId = authService.getCurrentUser()?.id

  const [message, setMessage] = useState("Dear {farmer_name}, our agronomists have reviewed your soil data for {crop_type}. We recommend applying {npk_formula} at a rate of {rate}kg/ha. Contact us for more details.")
  const [activeTab, setActiveTab] = useState<"compose" | "tickets">("compose")

  // Audience filters
  const [filterOptions, setFilterOptions] = useState<MessagingFilterOptions | null>(null)
  const [district, setDistrict] = useState("")
  const [sector, setSector] = useState("")
  const [cropType, setCropType] = useState("")
  const [audienceCount, setAudienceCount] = useState<number | null>(null)
  const [audienceLoading, setAudienceLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [bulkResult, setBulkResult] = useState<BulkMessageResult | null>(null)

  // Tickets
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [ticketsTotal, setTicketsTotal] = useState(0)
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [ticketStatusFilter, setTicketStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [myTicketsOnly, setMyTicketsOnly] = useState(false)
  const [ticketSearch, setTicketSearch] = useState("")
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null)
  const [ticketReply, setTicketReply] = useState("")
  const [replying, setReplying] = useState(false)
  const [resolving, setResolving] = useState(false)

  const [farmers, setFarmers] = useState<FarmerListEntry[]>([])
  const [createTicketOpen, setCreateTicketOpen] = useState(false)
  const [ticketForm, setTicketForm] = useState<CreateTicketForm>(EMPTY_TICKET_FORM)
  const [creatingTicket, setCreatingTicket] = useState(false)

  const farmerName = (farmerId: string) => farmers.find(f => f.id === farmerId)?.name || farmerId

  // Load filter options + farmers once
  useEffect(() => {
    agronomistCommsService.getFilterOptions()
      .then(setFilterOptions)
      .catch(() => toast.error("Failed to load audience filter options"))
    agronomistFarmersService.getFarmers({ limit: 200 })
      .then(({ farmers }) => setFarmers(farmers))
      .catch(() => toast.error("Failed to load farmers list"))
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

  const loadTickets = useCallback(() => {
    setTicketsLoading(true)
    agronomistCommsService.getSupportTickets({
      status: ticketStatusFilter === 'all' ? undefined : ticketStatusFilter,
      agronomistId: myTicketsOnly ? currentUserId : undefined,
      limit: 100,
    })
      .then(({ tickets, pagination }) => { setTickets(tickets); setTicketsTotal(pagination.total) })
      .catch(() => toast.error("Failed to load support tickets"))
      .finally(() => setTicketsLoading(false))
  }, [ticketStatusFilter, myTicketsOnly, currentUserId])

  useEffect(() => { loadTickets() }, [loadTickets])

  const smsCount = message.length
  const smsSegments = Math.ceil(smsCount / 160) || 1
  const filteredTickets = tickets.filter(t =>
    farmerName(t.farmerId).toLowerCase().includes(ticketSearch.toLowerCase()) ||
    t.district.toLowerCase().includes(ticketSearch.toLowerCase()) ||
    t.issue.toLowerCase().includes(ticketSearch.toLowerCase())
  )

  const handleSendBulk = async () => {
    if (!message.trim()) { toast.error("Message cannot be empty"); return }
    setSending(true)
    setBulkResult(null)
    try {
      const result = await agronomistCommsService.sendBulkMessage(message, {
        district: district || undefined, sector: sector || undefined, cropType: cropType || undefined,
      })
      setBulkResult(result)
      toast.success(`Delivered to ${result.recipientCount} of ${result.matchedCount} matched farmers`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const handleCreateTicket = async () => {
    if (!ticketForm.farmerId || !ticketForm.district || !ticketForm.crop || !ticketForm.issue) {
      toast.error("Farmer, district, crop, and issue are required")
      return
    }
    setCreatingTicket(true)
    try {
      await agronomistCommsService.createSupportTicket(ticketForm)
      toast.success("Support ticket logged")
      setCreateTicketOpen(false)
      setTicketForm(EMPTY_TICKET_FORM)
      loadTickets()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to log support ticket")
    } finally {
      setCreatingTicket(false)
    }
  }

  const handleReply = async () => {
    if (!activeTicket || !ticketReply.trim()) { toast.error("Write a reply before sending"); return }
    setReplying(true)
    try {
      const updated = await agronomistCommsService.replyToTicket(activeTicket.id, ticketReply.trim())
      toast.success("Reply sent")
      setActiveTicket(updated)
      setTicketReply("")
      loadTickets()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reply")
    } finally {
      setReplying(false)
    }
  }

  const handleResolve = async () => {
    if (!activeTicket) return
    setResolving(true)
    try {
      const updated = await agronomistCommsService.resolveTicket(activeTicket.id)
      toast.success("Ticket marked resolved")
      setActiveTicket(updated)
      loadTickets()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resolve ticket")
    } finally {
      setResolving(false)
    }
  }

  const openCreateTicket = () => {
    setTicketForm(EMPTY_TICKET_FORM)
    setCreateTicketOpen(true)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        title="Extension Communications"
        subtitle="Bulk Messaging · Kinyarwanda Translation · Farmer Support Tickets"
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-4 px-6 pt-6">
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
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <Icon3D gradient="gold" size="md">
              <AlertCircle className="w-5 h-5" />
            </Icon3D>
            <div>
              <p className="text-2xl font-black text-foreground">{ticketsLoading ? "…" : tickets.filter(t => t.status !== "resolved").length}</p>
              <p className="text-xs text-muted-foreground">Open Tickets ({ticketsTotal} total)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-1 overflow-hidden mt-6 mx-6 mb-6 gap-6 flex-col lg:flex-row">

        {/* LEFT — Audience Filter */}
        <Card className="lg:w-56 flex-shrink-0 border-0 shadow-md flex flex-col overflow-hidden">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Icon3D gradient="earth" size="sm">
                <Filter className="w-4 h-4" />
              </Icon3D>
              Audience Filter
              {(district || sector || cropType) && (
                <button className="ml-auto text-[10px] text-muted-foreground hover:text-foreground" onClick={() => { setDistrict(""); setSector(""); setCropType("") }}>Reset</button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{audienceLoading || audienceCount === null ? "…" : audienceCount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-0.5">Matched farmers</p>
            </div>

            {!filterOptions ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : (
              [
                { label: "District", icon: Globe2, options: filterOptions.districts, value: district, setter: setDistrict },
                { label: "Sector", icon: Tag, options: filterOptions.sectors, value: sector, setter: setSector },
                { label: "Crop Type", icon: Filter, options: filterOptions.cropTypes, value: cropType, setter: setCropType },
              ].map(f => (
                <div key={f.label}>
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
              ))
            )}

            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Active Filters</p>
              <div className="flex flex-wrap gap-1.5">
                {[district, sector, cropType].filter(Boolean).map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
                    {tag} <X className="w-2.5 h-2.5 cursor-pointer" />
                  </span>
                ))}
                {![district, sector, cropType].some(Boolean) && (
                  <span className="text-xs text-muted-foreground">No active filters</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CENTER — Composer / Tickets */}
        <Card className="flex-1 border-0 shadow-md flex flex-col overflow-hidden">
          <div className="flex border-b border-border">
            <button onClick={() => setActiveTab("compose")}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "compose" ? "border-sky-500 text-sky-600 dark:text-sky-400" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <MessageSquare className="w-4 h-4" /> Compose Message
            </button>
            <button onClick={() => setActiveTab("tickets")}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "tickets" ? "border-amber-500 text-amber-600 dark:text-amber-400" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <Phone className="w-4 h-4" /> Support Tickets
              <span className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {tickets.filter(t => t.status !== "resolved").length}
              </span>
            </button>
          </div>

          {activeTab === "compose" && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
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
                  placeholder="Type your message. Use {farmer_name}, {crop_type}, {npk_formula} as dynamic variables..." />
                <div className="px-4 py-2.5 border-t border-border bg-muted/20 flex flex-wrap gap-1.5">
                  <p className="text-[10px] text-muted-foreground self-center mr-1">Variables:</p>
                  {["{farmer_name}", "{crop_type}", "{npk_formula}", "{rate}", "{district}", "{date}"].map(v => (
                    <button key={v} onClick={() => setMessage(m => m + v)} className="text-[10px] bg-muted border border-border text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded hover:bg-muted/80 transition-colors font-mono">{v}</button>
                  ))}
                </div>
              </div>

              <button onClick={handleSendBulk} disabled={sending || audienceLoading || !audienceCount}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 font-semibold hover:bg-sky-500/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <Send className="w-4 h-4" /> {sending ? "Sending…" : `Send to ${audienceCount ?? 0} Farmers`}
              </button>

              {bulkResult && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                    Delivered to {bulkResult.recipientCount} of {bulkResult.matchedCount} matched farmers
                    {bulkResult.failedCount > 0 && ` · ${bulkResult.failedCount} failed`}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "tickets" && (
            <div className="flex flex-1 overflow-hidden">
              {/* Ticket list */}
              <div className="w-72 border-r border-border flex flex-col overflow-hidden">
                <div className="p-3 border-b border-border space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input value={ticketSearch} onChange={e => setTicketSearch(e.target.value)}
                      placeholder="Search tickets..."
                      className="w-full bg-muted border border-border text-foreground text-xs pl-8 pr-3 py-2 rounded-lg focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {STATUS_FILTERS.map(s => (
                      <button key={s} onClick={() => setTicketStatusFilter(s)}
                        className={`text-[10px] px-2 py-1 rounded-lg border font-medium capitalize transition-colors ${
                          ticketStatusFilter === s ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:text-foreground"
                        }`}>
                        {s === 'all' ? 'All' : s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
                      <input type="checkbox" checked={myTicketsOnly} onChange={e => setMyTicketsOnly(e.target.checked)} className="accent-primary" />
                      My tickets only
                    </label>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={openCreateTicket}>
                      <Plus className="w-3 h-3" /> Log Ticket
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {ticketsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
                  ) : filteredTickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                      <Phone className="w-8 h-8 text-muted-foreground mb-2 opacity-40" />
                      <p className="text-xs text-muted-foreground">No support tickets found.</p>
                    </div>
                  ) : filteredTickets.map(t => (
                    <button key={t.id} onClick={() => { setActiveTicket(t); setTicketReply("") }}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        activeTicket?.id === t.id ? "bg-muted border-muted-foreground/30" : "bg-muted/40 border-border hover:bg-muted hover:border-muted-foreground/20"
                      }`}>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          {channelIcon(t.channel)}
                          <span className="text-xs font-semibold text-foreground">{farmerName(t.farmerId)}</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium flex-shrink-0 ${priorityStyle(t.priority)}`}>{t.priority}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">{t.issue}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{t.district} · {t.crop}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${statusStyle(t.status)}`}>{t.status.replace("_", " ")}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticket detail */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {!activeTicket ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
                      <Phone className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-bold">Select a ticket to respond</p>
                    <p className="text-xs text-muted-foreground mt-1">Voice, USSD, SMS & in-app escalations from farmers — shared across the whole team</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <div className="bg-muted/40 rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                            {farmerName(activeTicket.farmerId)[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{farmerName(activeTicket.farmerId)}</p>
                            <p className="text-xs text-muted-foreground">{activeTicket.district} · {activeTicket.crop} · via {activeTicket.channel}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className={`text-xs px-2 py-1 rounded border font-medium ${priorityStyle(activeTicket.priority)}`}>{activeTicket.priority} priority</span>
                          <span className={`text-xs px-2 py-1 rounded border font-medium ${statusStyle(activeTicket.status)}`}>{activeTicket.status.replace("_", " ")}</span>
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 border border-border">
                        <div className="flex items-center gap-1.5 mb-2">
                          {channelIcon(activeTicket.channel)}
                          <span className="text-xs text-muted-foreground font-medium">{activeTicket.channel} · {new Date(activeTicket.time).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">"{activeTicket.issue}"</p>
                      </div>
                    </div>

                    {activeTicket.lastReply && (
                      <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-4">
                        <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 mb-1">
                          Current reply {activeTicket.lastRepliedAt && `· ${new Date(activeTicket.lastRepliedAt).toLocaleString()}`}
                        </p>
                        <p className="text-sm text-foreground">{activeTicket.lastReply}</p>
                        <p className="text-[10px] text-muted-foreground mt-1.5">This is the only reply stored — sending a new one replaces it, there is no thread history.</p>
                      </div>
                    )}

                    <div className="bg-muted/40 rounded-xl border border-border p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-sky-500" />
                        <h4 className="text-sm font-semibold text-foreground">Reply to Farmer</h4>
                      </div>
                      <textarea value={ticketReply} onChange={e => setTicketReply(e.target.value)} rows={4}
                        placeholder="Type your response to the farmer..."
                        className="w-full bg-muted border border-border text-foreground text-sm px-3 py-2.5 rounded-lg resize-none focus:outline-none placeholder:text-muted-foreground/50 mb-3" />
                      <div className="flex gap-2">
                        <button onClick={handleReply} disabled={replying}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 font-medium text-sm hover:bg-sky-500/20 transition-colors disabled:opacity-50">
                          <Send className="w-4 h-4" /> {replying ? "Sending…" : "Send Reply"}
                        </button>
                        {activeTicket.status !== "resolved" && (
                          <button onClick={handleResolve} disabled={resolving}
                            className="px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium text-sm hover:bg-emerald-500/20 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> {resolving ? "…" : "Resolve"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* RIGHT — Translation Matrix (reference content, no backend endpoint) */}
        <Card className="lg:w-64 flex-shrink-0 border-0 shadow-md flex flex-col overflow-hidden">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Icon3D gradient="sky" size="sm">
                <Languages className="w-4 h-4" />
              </Icon3D>
              Kinyarwanda
            </CardTitle>
          </CardHeader>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Globe2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Preview</span>
                <button className="ml-auto"><RefreshCw className="w-3 h-3 text-muted-foreground hover:text-foreground" /></button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Muramukana {"{"}umucuruzi{"}"}, inzobere zacu z'ubuhinzi basuzumye amakuru y'ubutaka bwanyu...
              </p>
            </div>

            <div className="bg-muted/40 border border-border rounded-xl p-3 space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Message Metrics</p>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Characters</span>
                  <span className={`font-bold ${smsCount > 320 ? "text-rose-500" : smsCount > 160 ? "text-amber-500" : "text-emerald-500"}`}>{smsCount}/160</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${smsCount > 320 ? "bg-rose-500" : smsCount > 160 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.min((smsCount / 320) * 100, 100)}%` }} />
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Segments</span>
                <span className="text-foreground font-medium">{smsSegments}</span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Agro Glossary</p>
              <div className="space-y-1.5">
                {Object.entries(rwandaTranslations).slice(0, 6).map(([en, rw]) => (
                  <div key={en} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground flex-1 truncate">{en}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-primary flex-1 truncate text-right font-medium">{rw}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Create ticket dialog */}
      <Dialog open={createTicketOpen} onOpenChange={setCreateTicketOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">Farmer</label>
                <select value={ticketForm.farmerId} onChange={e => setTicketForm(prev => ({ ...prev, farmerId: e.target.value }))}
                  className="w-full bg-muted border border-border text-foreground text-xs px-2.5 py-2 rounded-lg focus:outline-none">
                  <option value="">Select a farmer…</option>
                  {farmers.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">Channel</label>
                <select value={ticketForm.channel} onChange={e => setTicketForm(prev => ({ ...prev, channel: e.target.value as TicketChannel }))}
                  className="w-full bg-muted border border-border text-foreground text-xs px-2.5 py-2 rounded-lg focus:outline-none">
                  {CHANNEL_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">District</label>
                <input value={ticketForm.district} onChange={e => setTicketForm(prev => ({ ...prev, district: e.target.value }))}
                  className="w-full bg-muted border border-border text-foreground text-xs px-2.5 py-2 rounded-lg focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">Crop</label>
                <input value={ticketForm.crop} onChange={e => setTicketForm(prev => ({ ...prev, crop: e.target.value }))}
                  className="w-full bg-muted border border-border text-foreground text-xs px-2.5 py-2 rounded-lg focus:outline-none" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">Priority</label>
                <select value={ticketForm.priority} onChange={e => setTicketForm(prev => ({ ...prev, priority: e.target.value as TicketPriority }))}
                  className="w-full bg-muted border border-border text-foreground text-xs px-2.5 py-2 rounded-lg focus:outline-none capitalize">
                  {PRIORITY_OPTIONS.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">Issue</label>
              <textarea value={ticketForm.issue} onChange={e => setTicketForm(prev => ({ ...prev, issue: e.target.value }))} rows={3}
                className="w-full bg-muted border border-border text-foreground text-xs px-2.5 py-2 rounded-lg resize-none focus:outline-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTicketOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTicket} disabled={creatingTicket}>{creatingTicket ? "Logging…" : "Log ticket"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
