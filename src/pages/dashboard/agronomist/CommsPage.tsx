import { useState } from "react"
import {
  MessageSquare, Send, Users, ChevronDown, Filter,
  Phone, Radio, Clock, CheckCircle2, AlertCircle,
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
  const [showTranslation, setShowTranslation] = useState(true)
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
    if (p === "high") return "bg-rose-500/10 border-rose-500/30 text-rose-400"
    if (p === "medium") return "bg-amber-500/10 border-amber-500/30 text-amber-400"
    return "bg-slate-700 border-slate-600 text-slate-400"
  }
  const statusStyle = (s: string) => {
    if (s === "resolved") return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
    if (s === "in_progress") return "bg-sky-500/10 border-sky-500/30 text-sky-400"
    return "bg-slate-700 border-slate-600 text-slate-400"
  }
  const channelIcon = (c: string) => {
    if (c === "Voice") return <Mic className="w-3.5 h-3.5" />
    if (c === "USSD") return <Hash className="w-3.5 h-3.5" />
    return <MessageSquare className="w-3.5 h-3.5" />
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-600/20 border border-sky-600/30 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Extension Communications Studio</h2>
            <p className="text-xs text-slate-400">Bulk Messaging · Kinyarwanda Translation · Farmer Ticketing</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {[
            { label: "Sent Today", val: "1,204", color: "text-emerald-400" },
            { label: "Delivered", val: "98.2%", color: "text-sky-400" },
            { label: "Open Tickets", val: "4", color: "text-amber-400" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
              <p className="text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — Audience Filter Sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-200">Audience Filter</h3>
            <button className="ml-auto text-[10px] text-slate-500 hover:text-slate-300">Reset</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Recipient count */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-emerald-400">{estimatedRecipients.toLocaleString()}</div>
              <p className="text-xs text-slate-400 mt-0.5">Matched farmers</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Based on current filters</p>
            </div>

            {/* Filter dropdowns */}
            {[
              { label: "Cooperative", icon: Users, options: COOPERATIVE_OPTIONS, value: cooperative, setter: setCooperative },
              { label: "District", icon: Globe2, options: DISTRICT_OPTIONS, value: district, setter: setDistrict },
              { label: "Sector", icon: Tag, options: SECTOR_OPTIONS, value: sector, setter: setSector },
              { label: "Crop Type", icon: Filter, options: CROP_OPTIONS, value: crop, setter: setCrop },
              { label: "Soil Suitability", icon: BarChart3, options: SOIL_TIERS, value: soilTier, setter: setSoilTier },
            ].map(f => (
              <div key={f.label}>
                <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  <f.icon className="w-3 h-3" />{f.label}
                </label>
                <div className="relative">
                  <select
                    value={f.value}
                    onChange={e => f.setter(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 appearance-none cursor-pointer hover:border-sky-500/40 focus:border-sky-500 focus:outline-none transition-colors"
                  >
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            ))}

            {/* Active tags */}
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Active Segments</p>
              <div className="flex flex-wrap gap-1.5">
                {[cooperative, district, crop].filter(v => !v.startsWith("All")).map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
                    {tag} <X className="w-2.5 h-2.5 cursor-pointer" />
                  </span>
                ))}
                {![cooperative, district, crop].some(v => !v.startsWith("All")) && (
                  <span className="text-xs text-slate-600">No active filters</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER — Message Composer or Tickets */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* Tab switch */}
          <div className="flex border-b border-slate-800 bg-slate-900">
            <button onClick={() => setActiveTab("compose")} className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "compose" ? "border-sky-500 text-sky-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
              <MessageSquare className="w-4 h-4" /> Compose Message
            </button>
            <button onClick={() => setActiveTab("tickets")} className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "tickets" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
              <Phone className="w-4 h-4" /> Escalation Tickets
              <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-rose-500/30">
                {tickets.filter(t => t.status !== "resolved").length}
              </span>
            </button>
          </div>

          {activeTab === "compose" && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Template chips */}
              <div className="flex flex-wrap gap-2">
                <p className="text-xs text-slate-500 self-center mr-1">Templates:</p>
                {["NPK Advisory", "Disease Alert", "Market Price Update", "Planting Window Notice", "Weather Warning"].map(t => (
                  <button key={t} className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-sky-500/40 text-slate-300 px-2.5 py-1 rounded-lg transition-colors">{t}</button>
                ))}
              </div>

              {/* Message composer */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-200">Message Body</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`font-medium ${smsCount > 160 ? "text-amber-400" : "text-slate-400"}`}>{smsCount} chars</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">{smsSegments} SMS segment{smsSegments > 1 ? "s" : ""}</span>
                  </div>
                </div>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={6}
                  className="w-full bg-transparent text-slate-200 text-sm px-4 py-3 resize-none focus:outline-none placeholder-slate-600"
                  placeholder="Type your message here. Use {farmer_name}, {crop_type}, {npk_formula} as dynamic variables..."
                />
                <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-900/60 flex flex-wrap gap-1.5">
                  <p className="text-[10px] text-slate-600 self-center mr-1">Variables:</p>
                  {["{farmer_name}", "{crop_type}", "{npk_formula}", "{rate}", "{district}", "{date}"].map(v => (
                    <button key={v} onClick={() => setMessage(m => m + v)} className="text-[10px] bg-slate-800 border border-slate-700 text-sky-400 px-2 py-0.5 rounded hover:bg-slate-700 transition-colors font-mono">{v}</button>
                  ))}
                </div>
              </div>

              {/* Delivery estimation */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Recipients", val: estimatedRecipients.toLocaleString(), icon: Users, color: "text-emerald-400" },
                  { label: "SMS Cost", val: `~$${(estimatedRecipients * 0.008).toFixed(0)}`, icon: BarChart3, color: "text-amber-400" },
                  { label: "Networks", val: "MTN · Airtel", icon: Radio, color: "text-sky-400" },
                  { label: "Est. Delivery", val: "< 5 min", icon: Clock, color: "text-violet-400" },
                ].map(s => (
                  <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                    <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
                    <p className={`text-sm font-bold ${s.color}`}>{s.val}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Send button */}
              <div className="flex items-center gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-600/20 border border-sky-600/30 text-sky-300 font-semibold hover:bg-sky-600/30 hover:border-sky-500/50 transition-all text-sm">
                  <Send className="w-4 h-4" /> Send to {estimatedRecipients.toLocaleString()} Farmers via SMS/USSD
                </button>
                <button className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors text-sm">
                  Schedule
                </button>
                <button className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors text-sm">
                  Preview
                </button>
              </div>
            </div>
          )}

          {activeTab === "tickets" && (
            <div className="flex flex-1 overflow-hidden">
              {/* Ticket list */}
              <div className="w-80 border-r border-slate-800 flex flex-col overflow-hidden">
                <div className="p-3 border-b border-slate-800">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      value={ticketSearch}
                      onChange={e => setTicketSearch(e.target.value)}
                      placeholder="Search tickets..."
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:border-amber-500/40 placeholder-slate-600"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {filteredTickets.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTicket(t)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        activeTicket?.id === t.id ? "bg-slate-700 border-amber-500/40" : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">{channelIcon(t.channel)}</span>
                          <span className="text-xs font-semibold text-slate-200">{t.farmer}</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium flex-shrink-0 ${priorityStyle(t.priority)}`}>{t.priority}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-1.5">{t.issue}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-600">{t.district} · {t.crop}</span>
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
                    <Phone className="w-10 h-10 text-slate-600 mb-3" />
                    <p className="text-slate-400 font-medium">Select a ticket to respond</p>
                    <p className="text-xs text-slate-600 mt-1">Voice, USSD & SMS escalations from farmers requiring manual intervention</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Ticket header */}
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                            {activeTicket.farmer.split(" ")[0][0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{activeTicket.farmer}</p>
                            <p className="text-xs text-slate-400">{activeTicket.district} · {activeTicket.crop} · via {activeTicket.channel}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className={`text-xs px-2 py-1 rounded border font-medium ${priorityStyle(activeTicket.priority)}`}>{activeTicket.priority} priority</span>
                          <span className={`text-xs px-2 py-1 rounded border font-medium ${statusStyle(activeTicket.status)}`}>{activeTicket.status.replace("_", " ")}</span>
                        </div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center gap-1.5 mb-2">
                          {activeTicket.channel === "Voice" ? <Mic className="w-3.5 h-3.5 text-amber-400" /> : activeTicket.channel === "USSD" ? <Hash className="w-3.5 h-3.5 text-sky-400" /> : <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
                          <span className="text-xs text-slate-500 font-medium">{activeTicket.channel} Transcription · {activeTicket.time}</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">"{activeTicket.issue}"</p>
                      </div>
                    </div>

                    {/* Reply box */}
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-sky-400" />
                        <h4 className="text-sm font-semibold text-slate-200">Agronomist Response</h4>
                        <button className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"><Plus className="w-3 h-3" /> Quick Reply</button>
                      </div>
                      <textarea
                        value={ticketReply}
                        onChange={e => setTicketReply(e.target.value)}
                        rows={4}
                        placeholder="Type your response to the farmer. This will be sent via SMS/USSD in Kinyarwanda..."
                        className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm px-3 py-2.5 rounded-lg resize-none focus:outline-none focus:border-sky-500/50 placeholder-slate-600 mb-3"
                      />
                      <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-sky-600/20 border border-sky-600/30 text-sky-300 font-medium text-sm hover:bg-sky-600/30 transition-colors">
                          <Send className="w-4 h-4" /> Send Response
                        </button>
                        <button className="px-4 py-2.5 rounded-lg bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 font-medium text-sm hover:bg-emerald-600/30 transition-colors">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button className="px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 font-medium text-sm hover:bg-slate-700 transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Translation Matrix */}
        <div className="w-72 flex-shrink-0 border-l border-slate-800 bg-slate-900 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <Languages className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-slate-200">Kinyarwanda Matrix</h3>
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="ml-auto text-xs text-slate-500 hover:text-violet-400 transition-colors"
            >
              {showTranslation ? "Hide" : "Show"}
            </button>
          </div>

          {showTranslation && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Translated preview */}
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Globe2 className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-xs font-semibold text-violet-300">Kinyarwanda Preview</span>
                  <button className="ml-auto"><RefreshCw className="w-3 h-3 text-slate-500 hover:text-violet-400" /></button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Muramukana {"{"}umucuruzi{"}"}, inzobere zacu z'ubuhinzi basuzumye amakuru y'ubutaka bwanyu bw'{"{"}{"{"}ubwoko bw'ibimera{"}"}{"}"}.
                  Turasaba gushyiraho {"{"}{"{"}ifumbire{"}"}{"}"}...
                </p>
              </div>

              {/* Char count visualization */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">SMS Delivery Metrics</p>
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Character count</span>
                      <span className={`font-bold ${smsCount > 320 ? "text-rose-400" : smsCount > 160 ? "text-amber-400" : "text-emerald-400"}`}>{smsCount}/160</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${smsCount > 320 ? "bg-rose-500" : smsCount > 160 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min((smsCount / 320) * 100, 100)}%` }} />
                    </div>
                  </div>
                  {[
                    { label: "SMS Segments", val: smsSegments },
                    { label: "Kinyarwanda Chars", val: Math.round(smsCount * 1.15) },
                    { label: "MTN Coverage", val: "94.2%" },
                    { label: "Airtel Coverage", val: "87.5%" },
                    { label: "Est. Delivery", val: "< 3 min" },
                  ].map(m => (
                    <div key={m.label} className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">{m.label}</span>
                      <span className="text-slate-200 font-medium">{m.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Translation glossary */}
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Agro Glossary</p>
                <div className="space-y-1.5">
                  {Object.entries(rwandaTranslations).slice(0, 6).map(([en, rw]) => (
                    <div key={en} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 flex-1 truncate">{en}</span>
                      <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                      <span className="text-violet-400 flex-1 truncate text-right font-medium">{rw}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Network status */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 space-y-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Network Status</p>
                {[
                  { name: "MTN Rwanda", coverage: 94, status: "operational" },
                  { name: "Airtel Rwanda", coverage: 87, status: "operational" },
                  { name: "RSSBSmart USSD", coverage: 78, status: "degraded" },
                ].map(n => (
                  <div key={n.name}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">{n.name}</span>
                      <span className={n.status === "operational" ? "text-emerald-400" : "text-amber-400"}>{n.coverage}%</span>
                    </div>
                    <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${n.status === "operational" ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${n.coverage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
