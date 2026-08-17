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
  LifeBuoy, Send, AlertCircle, Phone, CheckCircle2,
  Hash, Search, Plus, Mic, MessageSquare,
} from "lucide-react"
import { toast } from "sonner"
import { authService } from "@/services/auth"
import {
  agronomistCommsService, type SupportTicket, type TicketChannel, type TicketPriority, type TicketStatus,
} from "@/services/agronomistComms.service"
import { agronomistFarmersService, type FarmerListEntry } from "@/services/agronomistFarmers.service"

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

export default function AgronomistSupportTicketsPage() {
  const currentUserId = authService.getCurrentUser()?.id

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

  useEffect(() => {
    agronomistFarmersService.getFarmers({ limit: 200 })
      .then(({ farmers }) => setFarmers(farmers))
      .catch(() => toast.error("Failed to load farmers list"))
  }, [])

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

  const filteredTickets = tickets.filter(t =>
    t.farmerName.toLowerCase().includes(ticketSearch.toLowerCase()) ||
    t.district.toLowerCase().includes(ticketSearch.toLowerCase()) ||
    t.issue.toLowerCase().includes(ticketSearch.toLowerCase())
  )

  const openCreateTicket = () => {
    setTicketForm(EMPTY_TICKET_FORM)
    setCreateTicketOpen(true)
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        title="Support Tickets"
        subtitle="Voice, USSD, SMS & in-app escalations — shared across the whole team"
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-4 px-3 sm:px-6 pt-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <Icon3D gradient="gold" size="md">
              <AlertCircle className="w-5 h-5" />
            </Icon3D>
            <div>
              <p className="text-2xl font-black text-foreground">{ticketsLoading ? "…" : tickets.filter(t => t.status !== "resolved").length}</p>
              <p className="text-xs text-muted-foreground">Open Tickets</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <Icon3D gradient="sky" size="md">
              <LifeBuoy className="w-5 h-5" />
            </Icon3D>
            <div>
              <p className="text-2xl font-black text-foreground">{ticketsLoading ? "…" : ticketsTotal}</p>
              <p className="text-xs text-muted-foreground">Total Tickets</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-1 overflow-hidden mt-6 mx-3 sm:mx-6 mb-6 gap-6 flex-col lg:flex-row">
        <Card className="lg:w-80 flex-shrink-0 border-0 shadow-md flex flex-col overflow-hidden">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Icon3D gradient="earth" size="sm">
                <LifeBuoy className="w-4 h-4" />
              </Icon3D>
              Tickets
              {!ticketsLoading && <span className="ml-auto text-xs font-normal text-muted-foreground">({ticketsTotal})</span>}
            </CardTitle>
          </CardHeader>
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
                    <span className="text-xs font-semibold text-foreground">{t.farmerName}</span>
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
        </Card>

        {/* Ticket detail */}
        <Card className="flex-1 border-0 shadow-md flex flex-col overflow-hidden">
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
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                      {activeTicket.farmerName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{activeTicket.farmerName}</p>
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
