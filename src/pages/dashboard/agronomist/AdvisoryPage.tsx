import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import {
  BarChart3, Calculator, TrendingUp,
  Minus, ArrowUpRight, ArrowDownRight,
  Sliders, CheckCircle2, MapPin,
  ChevronDown, Clock, Truck, Info
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts"

const marketData = [
  { month: "Jan", kigali: 380, musanze: 340, rubavu: 360, karongi: 320 },
  { month: "Feb", kigali: 400, musanze: 355, rubavu: 375, karongi: 330 },
  { month: "Mar", kigali: 420, musanze: 370, rubavu: 390, karongi: 345 },
  { month: "Apr", kigali: 390, musanze: 360, rubavu: 380, karongi: 335 },
  { month: "May", kigali: 460, musanze: 410, rubavu: 425, karongi: 365 },
  { month: "Jun", kigali: 480, musanze: 425, rubavu: 440, karongi: 375 },
]

const yieldProjection = [
  { risk: "Conservative", yield: 1800, revenue: 864000, color: "#22c55e" },
  { risk: "Moderate", yield: 2400, revenue: 1152000, color: "#f59e0b" },
  { risk: "Aggressive", yield: 3100, revenue: 1488000, color: "#ef4444" },
]

const marketArbitrage = [
  {
    crop: "Maize", unit: "kg",
    markets: [
      { hub: "Kigali", price: 480, trend: "up", change: 4.2, delivery: "0.5h", demand: "high" },
      { hub: "Musanze", price: 425, trend: "up", change: 2.1, delivery: "2.5h", demand: "medium" },
      { hub: "Rubavu", price: 440, trend: "down", change: -1.5, delivery: "3h", demand: "medium" },
      { hub: "Karongi", price: 375, trend: "down", change: -3.2, delivery: "2h", demand: "low" },
    ]
  },
  {
    crop: "Irish Potato", unit: "kg",
    markets: [
      { hub: "Kigali", price: 320, trend: "up", change: 8.4, delivery: "0.5h", demand: "high" },
      { hub: "Musanze", price: 295, trend: "up", change: 5.2, delivery: "2.5h", demand: "high" },
      { hub: "Rubavu", price: 280, trend: "flat", change: 0.5, delivery: "3h", demand: "medium" },
      { hub: "Karongi", price: 260, trend: "down", change: -2.1, delivery: "2h", demand: "low" },
    ]
  },
  {
    crop: "Beans", unit: "kg",
    markets: [
      { hub: "Kigali", price: 700, trend: "up", change: 12.3, delivery: "0.5h", demand: "high" },
      { hub: "Musanze", price: 640, trend: "up", change: 7.1, delivery: "2.5h", demand: "medium" },
      { hub: "Rubavu", price: 680, trend: "up", change: 9.5, delivery: "3h", demand: "medium" },
      { hub: "Karongi", price: 610, trend: "flat", change: 0.2, delivery: "2h", demand: "medium" },
    ]
  },
  {
    crop: "Sorghum", unit: "kg",
    markets: [
      { hub: "Kigali", price: 290, trend: "down", change: -4.8, delivery: "0.5h", demand: "low" },
      { hub: "Musanze", price: 310, trend: "up", change: 2.3, delivery: "2.5h", demand: "medium" },
      { hub: "Rubavu", price: 285, trend: "down", change: -6.1, delivery: "3h", demand: "low" },
      { hub: "Karongi", price: 330, trend: "up", change: 5.8, delivery: "2h", demand: "high" },
    ]
  },
]

interface NPKResult {
  n: number; p: number; k: number; totalKgHa: number; estimatedCost: number; recommendation: string
}

function calculateNPK(soilN: number, soilP: number, soilK: number, targetCrop: string, areaHa: number): NPKResult {
  const cropDemand: Record<string, { n: number; p: number; k: number }> = {
    "Maize": { n: 120, p: 60, k: 80 },
    "Irish Potato": { n: 100, p: 80, k: 120 },
    "Beans": { n: 20, p: 60, k: 40 },
    "Sorghum": { n: 80, p: 40, k: 60 },
    "Rice": { n: 100, p: 50, k: 60 },
    "Cassava": { n: 60, p: 30, k: 80 },
  }
  const demand = cropDemand[targetCrop] ?? { n: 80, p: 50, k: 60 }
  const n = Math.max(0, demand.n - soilN * 4)
  const p = Math.max(0, demand.p - soilP * 2)
  const k = Math.max(0, demand.k - soilK * 2.5)
  const totalKgHa = n + p + k
  const estimatedCost = Math.round(totalKgHa * areaHa * 2.8)
  const recommendation = n > p && n > k ? "Nitrogen-dominant blend (e.g., 25-10-10)" :
    p > n && p > k ? "Phosphorus-dominant blend (e.g., 10-25-10)" :
    "Balanced potassium blend (e.g., 10-10-20)"
  return { n: Math.round(n), p: Math.round(p), k: Math.round(k), totalKgHa: Math.round(totalKgHa), estimatedCost, recommendation }
}

export default function AdvisoryPage() {
  const [soilN, setSoilN] = useState(45)
  const [soilP, setSoilP] = useState(20)
  const [soilK, setSoilK] = useState(65)
  const [targetCrop, setTargetCrop] = useState("Maize")
  const [areaHa, setAreaHa] = useState(2.5)
  const [riskLevel, setRiskLevel] = useState(50)
  const [selectedCropRow, setSelectedCropRow] = useState("Maize")
  const [selectedHub, setSelectedHub] = useState<string | null>(null)

  const npk = calculateNPK(soilN, soilP, soilK, targetCrop, areaHa)
  const riskProfile = riskLevel < 35 ? yieldProjection[0] : riskLevel < 65 ? yieldProjection[1] : yieldProjection[2]
  const selectedCropMarkets = marketArbitrage.find(m => m.crop === selectedCropRow)?.markets ?? []
  const bestHub = selectedCropMarkets.reduce((best, m) => m.price > (best?.price ?? 0) ? m : best, selectedCropMarkets[0])

  const trendIcon = (t: string) => {
    if (t === "up") return <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
    if (t === "down") return <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
    return <Minus className="w-3.5 h-3.5 text-muted-foreground" />
  }

  const demandBadge = (d: string) => {
    if (d === "high") return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
    if (d === "medium") return "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
    return "bg-muted border-border text-muted-foreground"
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Input & Market Advisory"
        subtitle="NPK Calculator · Risk Profiler · Regional Market Arbitrage"
      />

      <div className="p-6 space-y-6">

        {/* Row 1: NPK Calculator + Risk Profiler */}
        <div className="grid grid-cols-3 gap-6">

          {/* NPK Calculator */}
          <Card className="col-span-2 border-0 shadow-md">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="flex items-center gap-3 text-base">
                <Icon3D gradient="gold" size="sm">
                  <Calculator className="w-4 h-4" />
                </Icon3D>
                Custom NPK Formulation Calculator
                <span className="ml-auto text-xs text-muted-foreground font-normal">Based on soil test results</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-6">
                {/* Soil Inputs */}
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Soil Test Results (ppm)</p>
                  {[
                    { label: "Nitrogen (N)", val: soilN, setter: setSoilN, color: "emerald", min: 0, max: 120 },
                    { label: "Phosphorus (P)", val: soilP, setter: setSoilP, color: "sky", min: 0, max: 80 },
                    { label: "Potassium (K)", val: soilK, setter: setSoilK, color: "violet", min: 0, max: 150 },
                  ].map(input => (
                    <div key={input.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs text-muted-foreground">{input.label}</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number" value={input.val}
                            onChange={e => input.setter(Number(e.target.value))}
                            className="w-14 text-center bg-muted border border-border text-foreground text-xs px-1.5 py-1 rounded-lg focus:outline-none"
                          />
                          <span className="text-[10px] text-muted-foreground">ppm</span>
                        </div>
                      </div>
                      <input
                        type="range" min={input.min} max={input.max} value={input.val}
                        onChange={e => input.setter(Number(e.target.value))}
                        className={`w-full h-1.5 accent-${input.color}-500`}
                      />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-1">Target Crop</label>
                      <div className="relative">
                        <select value={targetCrop} onChange={e => setTargetCrop(e.target.value)}
                          className="w-full bg-muted border border-border text-foreground text-xs px-2 py-2 rounded-lg appearance-none focus:outline-none">
                          {["Maize", "Irish Potato", "Beans", "Sorghum", "Rice", "Cassava"].map(c => <option key={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-1">Area (ha)</label>
                      <input type="number" value={areaHa} min={0.1} max={50} step={0.1}
                        onChange={e => setAreaHa(Number(e.target.value))}
                        className="w-full bg-muted border border-border text-foreground text-xs px-2 py-2 rounded-lg focus:outline-none" />
                    </div>
                  </div>
                </div>

                {/* NPK Output */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Computed Application Rate</p>
                  <div className="space-y-3 mb-4">
                    {[
                      { label: "Nitrogen (N)", val: npk.n, colorClass: "bg-emerald-500", textClass: "text-emerald-600 dark:text-emerald-400", max: 150 },
                      { label: "Phosphorus (P)", val: npk.p, colorClass: "bg-sky-500", textClass: "text-sky-600 dark:text-sky-400", max: 100 },
                      { label: "Potassium (K)", val: npk.k, colorClass: "bg-violet-500", textClass: "text-violet-600 dark:text-violet-400", max: 130 },
                    ].map(r => (
                      <div key={r.label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">{r.label}</span>
                          <span className={`text-sm font-black ${r.textClass}`}>{r.val} kg/ha</span>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${r.colorClass} rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min((r.val / r.max) * 100, 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-muted/50 border border-border rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground">Total Rate</p>
                      <p className="text-xl font-black text-foreground">{npk.totalKgHa}</p>
                      <p className="text-[10px] text-muted-foreground">kg / ha</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground">Est. Input Cost</p>
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400">${npk.estimatedCost}</p>
                      <p className="text-[10px] text-muted-foreground">for {areaHa} ha</p>
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Recommended Blend</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{npk.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk-Yield Profiler */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="flex items-center gap-3 text-base">
                <Icon3D gradient="leaf" size="sm">
                  <Sliders className="w-4 h-4" />
                </Icon3D>
                Risk-Yield Profiler
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Risk Tolerance</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                    riskLevel < 35 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                    riskLevel < 65 ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" :
                    "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                  }`}>
                    {riskLevel < 35 ? "Conservative" : riskLevel < 65 ? "Moderate" : "Aggressive"}
                  </span>
                </div>
                <div className="relative">
                  <div className="h-3 rounded-full" style={{ background: "linear-gradient(to right, #22c55e, #f59e0b, #ef4444)" }} />
                  <input type="range" min={0} max={100} value={riskLevel}
                    onChange={e => setRiskLevel(Number(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-3" />
                  <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-border pointer-events-none"
                    style={{ left: `calc(${riskLevel}% - 10px)` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Low Risk</span><span>High Yield</span>
                </div>
              </div>

              {yieldProjection.map(p => (
                <div key={p.risk} className={`p-3 rounded-xl border transition-all ${
                  riskProfile.risk === p.risk ? "bg-muted border-muted-foreground/30" : "bg-muted/40 border-border"
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{p.risk}</span>
                    {riskProfile.risk === p.risk && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: p.color }} />}
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <p className="text-xl font-black" style={{ color: p.color }}>{p.yield.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">kg / ha projected</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">RWF {(p.revenue / 1000).toFixed(0)}K</p>
                      <p className="text-[10px] text-muted-foreground">Est. revenue</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-muted/50 border border-border rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Risk profile influences fertilizer rate, planting density, and irrigation frequency. Conservative profiles use 70% of calculated input rates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Arbitrage */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-base">
                <Icon3D gradient="green" size="sm">
                  <TrendingUp className="w-4 h-4" />
                </Icon3D>
                Regional Market Arbitrage
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">Live · RWF/kg</span>
              </CardTitle>
              <div className="flex gap-2">
                {marketArbitrage.map(m => (
                  <button key={m.crop} onClick={() => setSelectedCropRow(m.crop)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border transition-colors ${
                      selectedCropRow === m.crop
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "border-border text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
                    }`}>
                    {m.crop}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            {bestHub && (
              <div className="mb-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Best market for <span className="text-foreground font-semibold">{selectedCropRow}</span> today</p>
                    <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{bestHub.hub} Market Hub — RWF {bestHub.price}/kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">vs. lowest market</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      +RWF {bestHub.price - Math.min(...selectedCropMarkets.map(m => m.price))}/kg arbitrage
                    </p>
                  </div>
                  <button className="flex items-center gap-1.5 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-2 rounded-lg hover:bg-emerald-500/20 transition-colors font-medium">
                    <Truck className="w-3.5 h-3.5" /> Advise Cooperative
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Market Hub", "Price (RWF/kg)", "Trend", "Change", "Demand", "Delivery", "Signal"].map(h => (
                      <th key={h} className="text-left pb-3 pr-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedCropMarkets.map(m => (
                    <tr key={m.hub} onClick={() => setSelectedHub(selectedHub === m.hub ? null : m.hub)}
                      className={`cursor-pointer transition-colors ${
                        m.hub === bestHub?.hub ? "bg-emerald-500/5" :
                        selectedHub === m.hub ? "bg-muted/50" : "hover:bg-muted/30"
                      }`}>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-3.5 h-3.5 ${m.hub === bestHub?.hub ? "text-emerald-500" : "text-muted-foreground"}`} />
                          <span className="font-semibold text-foreground">{m.hub}</span>
                          {m.hub === bestHub?.hub && (
                            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">BEST</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4"><span className="text-lg font-black text-foreground">{m.price}</span></td>
                      <td className="py-3 pr-4">{trendIcon(m.trend)}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-sm font-bold ${m.change > 0 ? "text-emerald-500" : m.change < 0 ? "text-rose-500" : "text-muted-foreground"}`}>
                          {m.change > 0 ? "+" : ""}{m.change}%
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${demandBadge(m.demand)}`}>{m.demand}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" /> {m.delivery}
                        </div>
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">
                        {m.demand === "high" && m.trend === "up" ? "🟢 Sell now" :
                         m.demand === "low" && m.trend === "down" ? "🔴 Hold stock" : "🟡 Monitor"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 bg-muted/40 rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-foreground">6-Month Price Trend · All Hubs · {selectedCropRow} (RWF/kg)</p>
                <div className="flex items-center gap-3">
                  {[{ label: "Kigali", color: "#22c55e" }, { label: "Musanze", color: "#f59e0b" }, { label: "Rubavu", color: "#38bdf8" }, { label: "Karongi", color: "#a78bfa" }].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                      <span className="text-[10px] text-muted-foreground">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={marketData}>
                    <defs>
                      {[{ id: "kg", color: "#22c55e" }, { id: "mu", color: "#f59e0b" }, { id: "ru", color: "#38bdf8" }, { id: "ka", color: "#a78bfa" }].map(g => (
                        <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={g.color} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="kigali" stroke="#22c55e" fill="url(#kg)" name="Kigali" strokeWidth={2} />
                    <Area type="monotone" dataKey="musanze" stroke="#f59e0b" fill="url(#mu)" name="Musanze" strokeWidth={2} />
                    <Area type="monotone" dataKey="rubavu" stroke="#38bdf8" fill="url(#ru)" name="Rubavu" strokeWidth={2} />
                    <Area type="monotone" dataKey="karongi" stroke="#a78bfa" fill="url(#ka)" name="Karongi" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
