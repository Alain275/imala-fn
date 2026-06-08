import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import {
  MessageSquare, Send, Users, ChevronDown, Filter,
  Phone, Clock, CheckCircle2, AlertCircle,
  Hash, Globe2, Search, Plus, ArrowRight, Mic,
  FileText, Languages, BarChart3, RefreshCw, Tag, X
} from "lucide-react"

interface Ticket {
  id: number
  farmer: string
  channel: "USSD" | "SMS" | "Voice"
  district: string
  issue: string
  time: string
  priority: "high" | "medium" | "low"
  status: "open" | "in_progress" | "resolved"
  crop: string
}

const tickets: Ticket[] = [
  { id: 1, farmer: "Uwimana E.", channel: "Voice", district: "Bugesera", issue: "Crop leaves turning yellow — urgent inspection requested before harvest in 3 weeks", time: "09:14 AM", priority: "high", status: "open", crop: "Maize" },
  { id: 2, farmer: "Habimana P.", channel: "USSD", district: "Gasabo", issue: "Received wrong fertilizer recommendation — pH level mismatch with local soil", time: "08:47 AM", priority: "high", status: "in_progress", crop: "Irish Potato" },
  { id: 3, farmer: "Kagabo R.", channel: "SMS", district: "Ngoma", issue: "Market price for sorghum dropped 20% — when is best time to sell?", time: "08:02 AM", priority: "medium", status: "open", crop: "Sorghum" },
  { id: 4, farmer: "Mukamana F.", channel: "USSD", district: "Kicukiro", issue: "Pest infestation in bean crop — caterpillars seen on multiple plants", time: "Yesterday", priority: "medium", status: "open", crop: "Beans" },
  { id: 5, farmer: "Bizimana C.", channel: "SMS", district: "Kirehe", issue: "Need guidance on water management — rice paddy flooding issue", time: "Yesterday", priority: "low", status: "resolved", crop: "Rice" },
  { id: 6, farmer: "Niyonzima J.", channel: "Voice", district: "Gatsibo", issue: "Fungal lesions reported — needs immediate chemical treatment prescription", time: "2 days ago", priority: "high", status: "resolved", crop: "Sorghum" },
]

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

const COOPERATIVE_OPTIONS = ["All Cooperatives", "KOABANU", "COOPAC", "KILIMA", "COOPABU", "PROFEMOR"]
const DISTRICT_OPTIONS = ["All Districts", "Gasabo", "Kicukiro", "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma"]
const SECTOR_OPTIONS = ["All Sectors", "Remera", "Niboye", "Nyamata", "Kabarore", "Ruramira", "Mahama", "Zaza"]
const CROP_OPTIONS = ["All Crops", "Maize", "Beans", "Rice", "Irish Potato", "Sorghum", "Cassava", "Wheat"]
const SOIL_TIERS = ["All Tiers", "Tier A (Excellent)", "Tier B (Good)", "Tier C (Fair)", "Tier D (Poor)"]

export default function CommsPage() {
  const [message, setMessage] = useState("Dear {farmer_name}, our agronomists have reviewed your soil data for {crop_type}. We recommend applying {npk_formula} at a rate of {rate}kg/ha. Contact us at *321# for more details.")
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
  const [ticketReply, setTicketReply] = useState("")
  const [cooperative, setCooperative] = useState("All Cooperatives")
  const [district, setDistrict] = useState("All Districts")
  const [sector, setSector] = useState("All Sectors")
  const [crop, setCrop] = useState("All Crops")
  const [soilTier, setSoilTier] = useState("All Tiers")
  const [ticketSearch, setTicketSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"compose" | "tickets">("compose")

  const smsCount = message.length
  const smsSegments = Math.ceil(smsCount / 160)
  const estimatedRecipients = 2847
  const filteredTickets = tickets.filter(t =>
    t.farmer.toLowerCase().includes(ticketSearch.toLowerCase()) ||
    t.district.toLowerCase().includes(ticketSearch.toLowerCase()) ||
    t.issue.toLowerCase().includes(ticketSearch.toLowerCase())
  )

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        title="Extension Communications"
        subtitle="Bulk Messaging · Kinyarwanda Translation · Farmer Ticketing"
      />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 px-6 pt-6">
        {[
          { label: "Sent Today", val: "1,204", gradient: "green" as const, icon: Send },
          { label: "Delivery Rate", val: "98.2%", gradient: "sky" as const, icon: CheckCircle2 },
          { label: "Open Tickets", val: `${tickets.filter(t => t.status !== "resolved").length}`, gradient: "gold" as const, icon: AlertCircle },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <Icon3D gradient={s.gradient} size="md">
                <s.icon className="w-5 h-5" />
              </Icon3D>
              <div>
                <p className="text-2xl font-black text-foreground">{s.val}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden mt-6 mx-6 mb-6 gap-6">

        {/* LEFT — Audience Filter */}
        <Card className="w-56 flex-shrink-0 border-0 shadow-md flex flex-col overflow-hidden">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Icon3D gradient="earth" size="sm">
                <Filter className="w-4 h-4" />
              </Icon3D>
              Audience Filter
              <button className="ml-auto text-[10px] text-muted-foreground hover:text-foreground">Reset</button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{estimatedRecipients.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-0.5">Matched farmers</p>
            </div>

            {[
              { label: "Cooperative", icon: Users, options: COOPERATIVE_OPTIONS, value: cooperative, setter: setCooperative },
              { label: "District", icon: Globe2, options: DISTRICT_OPTIONS, value: district, setter: setDistrict },
              { label: "Sector", icon: Tag, options: SECTOR_OPTIONS, value: sector, setter: setSector },
              { label: "Crop Type", icon: Filter, options: CROP_OPTIONS, value: crop, setter: setCrop },
              { label: "Soil Tier", icon: BarChart3, options: SOIL_TIERS, value: soilTier, setter: setSoilTier },
            ].map(f => (
              <div key={f.label}>
                <label className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                  <f.icon className="w-3 h-3" />{f.label}
                </label>
                <div className="relative">
                  <select value={f.value} onChange={e => f.setter(e.target.value)}
                    className="w-full bg-muted border border-border text-foreground text-xs rounded-lg px-2.5 py-2 appearance-none cursor-pointer focus:outline-none">
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            ))}

            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Active Segments</p>
              <div className="flex flex-wrap gap-1.5">
                {[cooperative, district, crop].filter(v => !v.startsWith("All")).map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
                    {tag} <X className="w-2.5 h-2.5 cursor-pointer" />
                  </span>
                ))}
                {![cooperative, district, crop].some(v => !v.startsWith("All")) && (
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
              <Phone className="w-4 h-4" /> Escalation Tickets
              <span className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {tickets.filter(t => t.status !== "resolved").length}
              </span>
            </button>
          </div>

          {activeTab === "compose" && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                <p className="text-xs text-muted-foreground self-center mr-1">Templates:</p>
                {["NPK Advisory", "Disease Alert", "Market Price Update", "Planting Window Notice", "Weather Warning"].map(t => (
                  <button key={t} className="text-xs bg-muted hover:bg-muted/80 border border-border text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg transition-colors">{t}</button>
                ))}
              </div>

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

              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Recipients", val: estimatedRecipients.toLocaleString(), icon: Users, colorClass: "text-emerald-500" },
                  { label: "Est. SMS Cost", val: `~$${(estimatedRecipients * 0.008).toFixed(0)}`, icon: BarChart3, colorClass: "text-amber-500" },
                  { label: "Networks", val: "MTN · Airtel", icon: Hash, colorClass: "text-sky-500" },
                  { label: "Est. Delivery", val: "< 5 min", icon: Clock, colorClass: "text-violet-500" },
                ].map(s => (
                  <div key={s.label} className="bg-muted/40 border border-border rounded-xl p-3 text-center">
                    <s.icon className={`w-4 h-4 ${s.colorClass} mx-auto mb-1`} />
                    <p className={`text-sm font-bold ${s.colorClass}`}>{s.val}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 font-semibold hover:bg-sky-500/20 transition-all text-sm">
                  <Send className="w-4 h-4" /> Send to {estimatedRecipients.toLocaleString()} Farmers
                </button>
                <button className="px-4 py-3 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors text-sm">Schedule</button>
                <button className="px-4 py-3 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors text-sm">Preview</button>
              </div>
            </div>
          )}

          {activeTab === "tickets" && (
            <div className="flex flex-1 overflow-hidden">
              {/* Ticket list */}
              <div className="w-72 border-r border-border flex flex-col overflow-hidden">
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input value={ticketSearch} onChange={e => setTicketSearch(e.target.value)}
                      placeholder="Search tickets..."
                      className="w-full bg-muted border border-border text-foreground text-xs pl-8 pr-3 py-2 rounded-lg focus:outline-none" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {filteredTickets.map(t => (
                    <button key={t.id} onClick={() => setActiveTicket(t)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        activeTicket?.id === t.id ? "bg-muted border-muted-foreground/30" : "bg-muted/40 border-border hover:bg-muted hover:border-muted-foreground/20"
                      }`}>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          {channelIcon(t.channel)}
                          <span className="text-xs font-semibold text-foreground">{t.farmer}</span>
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
                    <p className="text-xs text-muted-foreground mt-1">Voice, USSD & SMS escalations from farmers requiring manual intervention</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <div className="bg-muted/40 rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                            {activeTicket.farmer.split(" ")[0][0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{activeTicket.farmer}</p>
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
                          {activeTicket.channel === "Voice" ? <Mic className="w-3.5 h-3.5 text-amber-500" /> : activeTicket.channel === "USSD" ? <Hash className="w-3.5 h-3.5 text-sky-500" /> : <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />}
                          <span className="text-xs text-muted-foreground font-medium">{activeTicket.channel} · {activeTicket.time}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">"{activeTicket.issue}"</p>
                      </div>
                    </div>

                    <div className="bg-muted/40 rounded-xl border border-border p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-sky-500" />
                        <h4 className="text-sm font-semibold text-foreground">Agronomist Response</h4>
                        <button className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Plus className="w-3 h-3" /> Quick Reply</button>
                      </div>
                      <textarea value={ticketReply} onChange={e => setTicketReply(e.target.value)} rows={4}
                        placeholder="Type your response to the farmer..."
                        className="w-full bg-muted border border-border text-foreground text-sm px-3 py-2.5 rounded-lg resize-none focus:outline-none placeholder:text-muted-foreground/50 mb-3" />
                      <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 font-medium text-sm hover:bg-sky-500/20 transition-colors">
                          <Send className="w-4 h-4" /> Send Response
                        </button>
                        <button className="px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium text-sm hover:bg-emerald-500/20 transition-colors">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button className="px-4 py-2.5 rounded-lg bg-muted border border-border text-muted-foreground font-medium text-sm hover:bg-muted/80 transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* RIGHT — Translation Matrix */}
        <Card className="w-64 flex-shrink-0 border-0 shadow-md flex flex-col overflow-hidden">
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
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">SMS Metrics</p>
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
              {[
                { label: "Segments", val: smsSegments },
                { label: "MTN Coverage", val: "94.2%" },
                { label: "Airtel Coverage", val: "87.5%" },
                { label: "Est. Delivery", val: "< 3 min" },
              ].map(m => (
                <div key={m.label} className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="text-foreground font-medium">{m.val}</span>
                </div>
              ))}
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
    </div>
  )
}
