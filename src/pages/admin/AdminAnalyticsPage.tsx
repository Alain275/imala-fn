import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartCard } from "@/components/ChartCard"
import {
  Wheat, CloudRain, DollarSign, Leaf,
  TrendingUp, Activity, DropletIcon, ShieldCheck,
} from "lucide-react"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area, LineChart, Line, Cell,
} from "recharts"
import { adminAnalyticsService } from "@/services/adminAnalyticsMock"
import type {
  CropYieldData, DetectionTrendPoint, ClimatePoint,
  SoilMetricData, CostBreakdownData, RevenueByCropData,
  MarketPricePoint, CarbonFootprintPoint, SustainabilityScore,
} from "@/services/adminAnalyticsMock"

const TOOLTIP_STYLE = {
  backgroundColor: 'oklch(var(--card))',
  border: '1px solid oklch(var(--border))',
  borderRadius: '8px',
  color: 'oklch(var(--foreground))',
}

function KpiCard({ label, value, sub, gradient, icon: Icon }: {
  label: string; value: string | number; sub?: string
  gradient: 'green' | 'gold' | 'sky' | 'earth' | 'leaf'
  icon: React.ElementType
}) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-4 flex items-center gap-4">
        <Icon3D gradient={gradient} size="md"><Icon className="w-5 h-5" /></Icon3D>
        <div>
          <p className="text-2xl font-black text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {sub && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Tab 1: Crop Performance ───────────────────────────────────────────────────

function CropPerformanceTab() {
  const [yield_, setYield] = useState<CropYieldData[]>([])
  const [trends, setTrends] = useState<DetectionTrendPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminAnalyticsService.getCropYield(), adminAnalyticsService.getDetectionTrends()])
      .then(([y, t]) => { setYield(y); setTrends(t) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Yield (tons)" value="37.2" sub="6 tracked crops" gradient="green" icon={Wheat} />
        <KpiCard label="Avg Detection Rate" value="16.8%" sub="disease scans" gradient="gold" icon={Activity} />
        <KpiCard label="Most Affected" value="Maize" sub="Leaf Blight — 167 cases" gradient="earth" icon={Wheat} />
        <KpiCard label="Best Yield Rate" value="Beans" sub="+5% above target" gradient="leaf" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Crop Yield vs Target" description="Tons per crop this season" icon={Wheat} iconColor="text-emerald-500" loading={loading} height={240}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yield_} layout="vertical" margin={{ left: 70 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
              <XAxis type="number" className="fill-muted-foreground" fontSize={11} tickLine={false} />
              <YAxis type="category" dataKey="crop" className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} width={70} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="yieldTons" fill="#10b981" radius={[0, 4, 4, 0]} name="Actual (t)" />
              <Bar dataKey="targetTons" fill="#d1fae5" radius={[0, 4, 4, 0]} name="Target (t)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Disease Detection Trends" description="Monthly AI detections by disease type" icon={Activity} iconColor="text-rose-500" loading={loading} height={240}
          legend={
            <div className="flex flex-wrap gap-4">
              {[['#ef4444', 'Blight'], ['#f59e0b', 'Rust'], ['#8b5cf6', 'Mosaic'], ['#0ea5e9', 'Blast']].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded" style={{ background: c }} /><span className="text-xs text-muted-foreground">{l}</span></div>
              ))}
            </div>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis dataKey="month" className="fill-muted-foreground" fontSize={11} tickLine={false} />
              <YAxis className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="blight" stroke="#ef4444" strokeWidth={2} dot={false} name="Blight" />
              <Line type="monotone" dataKey="rust" stroke="#f59e0b" strokeWidth={2} dot={false} name="Rust" />
              <Line type="monotone" dataKey="mosaic" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Mosaic" />
              <Line type="monotone" dataKey="blast" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Blast" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

// ── Tab 2: Soil & Environmental ───────────────────────────────────────────────

function SoilEnvironmentalTab() {
  const [climate, setClimate] = useState<ClimatePoint[]>([])
  const [soil, setSoil] = useState<SoilMetricData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminAnalyticsService.getClimateData(), adminAnalyticsService.getSoilMetrics()])
      .then(([c, s]) => { setClimate(c); setSoil(s) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Avg Rainfall (mm)" value="88.2" sub="monthly avg 2026" gradient="sky" icon={CloudRain} />
        <KpiCard label="Avg Temperature (°C)" value="21.1" sub="across all zones" gradient="gold" icon={Activity} />
        <KpiCard label="Avg Soil pH" value="6.2" sub="within optimal range" gradient="earth" icon={Leaf} />
        <KpiCard label="Low-Nitrogen Zones" value="2" sub="need intervention" gradient="leaf" icon={DropletIcon} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Climate Trends (12-Month)" description="Rainfall (mm) and temperature (°C)" icon={CloudRain} iconColor="text-sky-500" loading={loading} height={240}
          legend={
            <div className="flex gap-6">
              <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-sky-500 rounded" /><span className="text-xs text-muted-foreground">Rainfall (mm)</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-500 rounded" /><span className="text-xs text-muted-foreground">Temp (°C)</span></div>
            </div>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={climate}>
              <defs>
                <linearGradient id="gRain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis dataKey="month" className="fill-muted-foreground" fontSize={11} tickLine={false} />
              <YAxis yAxisId="rain" className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis yAxisId="temp" orientation="right" domain={[15, 25]} className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area yAxisId="rain" type="monotone" dataKey="rainfall" stroke="#0ea5e9" fill="url(#gRain)" name="Rainfall (mm)" />
              <Line yAxisId="temp" type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} dot={false} name="Temp (°C)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Soil Nutrients by Zone" description="Nitrogen / Phosphorus / Potassium index (0–100)" icon={Leaf} iconColor="text-emerald-500" loading={loading} height={240}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={soil} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis dataKey="zone" className="fill-muted-foreground" fontSize={10} tickLine={false} />
              <YAxis domain={[0, 100]} className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="nitrogen" fill="#10b981" radius={[3, 3, 0, 0]} name="Nitrogen" />
              <Bar dataKey="phosphorus" fill="#f59e0b" radius={[3, 3, 0, 0]} name="Phosphorus" />
              <Bar dataKey="potassium" fill="#0ea5e9" radius={[3, 3, 0, 0]} name="Potassium" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

// ── Tab 3: Financial & Resource ───────────────────────────────────────────────

function FinancialResourceTab() {
  const [revenue, setRevenue] = useState<RevenueByCropData[]>([])
  const [costs, setCosts] = useState<CostBreakdownData[]>([])
  const [prices, setPrices] = useState<MarketPricePoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminAnalyticsService.getRevenueByCrop(),
      adminAnalyticsService.getCostBreakdown(),
      adminAnalyticsService.getMarketPrices(),
    ])
      .then(([r, c, p]) => { setRevenue(r); setCosts(c); setPrices(p) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue (M RWF)" value="895.9" sub="all crops 2026" gradient="gold" icon={DollarSign} />
        <KpiCard label="Top Earner" value="Coffee" sub="RWF 284.6M" gradient="green" icon={TrendingUp} />
        <KpiCard label="Avg Cost / Ha (K RWF)" value="40.6" sub="seeds + inputs + labor" gradient="earth" icon={Activity} />
        <KpiCard label="Revenue Growth" value="+11.2%" sub="vs same period 2025" gradient="leaf" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue by Crop" description="Million RWF, all seasons to date" icon={DollarSign} iconColor="text-amber-500" loading={loading} height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenue} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
              <XAxis type="number" className="fill-muted-foreground" fontSize={11} tickLine={false} />
              <YAxis type="category" dataKey="crop" className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} width={60} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v.toFixed(1)}M RWF`]} />
              <Bar dataKey="revenueM" radius={[0, 4, 4, 0]} name="Revenue" >
                {revenue.map((_, i) => (
                  <Cell key={i} fill={['#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#ec4899'][i % 8]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Input Cost Breakdown" description="RWF millions per cost category by season" icon={Activity} iconColor="text-rose-500" loading={loading} height={260}
          legend={
            <div className="flex flex-wrap gap-4">
              {[['#10b981', 'Seeds'], ['#0ea5e9', 'Fertilizer'], ['#f59e0b', 'Pesticide'], ['#8b5cf6', 'Labor']].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} /><span className="text-xs text-muted-foreground">{l}</span></div>
              ))}
            </div>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costs} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis dataKey="season" className="fill-muted-foreground" fontSize={11} tickLine={false} />
              <YAxis className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v.toFixed(1)}M RWF`]} />
              <Bar dataKey="seeds" stackId="a" fill="#10b981" name="Seeds" />
              <Bar dataKey="fertilizer" stackId="a" fill="#0ea5e9" name="Fertilizer" />
              <Bar dataKey="pesticide" stackId="a" fill="#f59e0b" name="Pesticide" />
              <Bar dataKey="labor" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Labor" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Market Price Trends" description="RWF per kg — Maize, Beans, Coffee (÷10 for scale)" icon={TrendingUp} iconColor="text-emerald-500" loading={loading} height={200}
        legend={
          <div className="flex gap-6">
            {[['#f59e0b', 'Maize'], ['#10b981', 'Beans'], ['#8b5cf6', 'Coffee (÷10)']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1.5"><span className="w-4 h-0.5 rounded" style={{ background: c }} /><span className="text-xs text-muted-foreground">{l}</span></div>
            ))}
          </div>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={prices}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
            <XAxis dataKey="month" className="fill-muted-foreground" fontSize={11} tickLine={false} />
            <YAxis className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`RWF ${v}`]} />
            <Line type="monotone" dataKey="maize" stroke="#f59e0b" strokeWidth={2} dot={false} name="Maize" />
            <Line type="monotone" dataKey="beans" stroke="#10b981" strokeWidth={2} dot={false} name="Beans" />
            <Line type="monotone" dataKey="coffee" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Coffee" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

// ── Tab 4: Sustainability & Compliance ────────────────────────────────────────

function SustainabilityTab() {
  const [carbon, setCarbon] = useState<CarbonFootprintPoint[]>([])
  const [scores, setScores] = useState<SustainabilityScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminAnalyticsService.getCarbonFootprint(), adminAnalyticsService.getSustainabilityScores()])
      .then(([c, s]) => { setCarbon(c); setScores(s) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Carbon Score" value="48/100" sub="target: 60" gradient="earth" icon={Leaf} />
        <KpiCard label="Organic Coverage" value="62%" sub="target: 75%" gradient="green" icon={Wheat} />
        <KpiCard label="Pesticide Compliance" value="93%" sub="certified farms" gradient="sky" icon={ShieldCheck} />
        <KpiCard label="Water Efficiency" value="84%" sub="target: 90%" gradient="leaf" icon={DropletIcon} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Carbon Footprint Trend" description="Monthly CO₂e tonnes by source" icon={Leaf} iconColor="text-emerald-500" loading={loading} height={240}
          legend={
            <div className="flex flex-wrap gap-4">
              {[['#6b7280', 'Machinery'], ['#0ea5e9', 'Fertilizer'], ['#f59e0b', 'Transport']].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} /><span className="text-xs text-muted-foreground">{l}</span></div>
              ))}
            </div>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={carbon}>
              <defs>
                {[['machinery', '#6b7280'], ['fertilizer', '#0ea5e9'], ['transport', '#f59e0b']].map(([k, c]) => (
                  <linearGradient key={k} id={`g${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis dataKey="month" className="fill-muted-foreground" fontSize={11} tickLine={false} />
              <YAxis className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="machinery" stackId="c" stroke="#6b7280" fill="url(#gmachinery)" name="Machinery" />
              <Area type="monotone" dataKey="fertilizer" stackId="c" stroke="#0ea5e9" fill="url(#gfertilizer)" name="Fertilizer" />
              <Area type="monotone" dataKey="transport" stackId="c" stroke="#f59e0b" fill="url(#gtransport)" name="Transport" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Sustainability Scores" description="Current vs target across all indicators" icon={ShieldCheck} iconColor="text-violet-500" loading={loading} height={240}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scores} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
              <XAxis type="number" domain={[0, 100]} className="fill-muted-foreground" fontSize={11} tickLine={false} />
              <YAxis type="category" dataKey="indicator" className="fill-muted-foreground" fontSize={10} tickLine={false} axisLine={false} width={120} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="current" fill="#10b981" radius={[0, 4, 4, 0]} name="Current" />
              <Bar dataKey="target" fill="#d1fae5" radius={[0, 4, 4, 0]} name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Platform Analytics" subtitle="Crop performance, soil health, financials & sustainability" />

      <div className="p-6 space-y-6">
        <Tabs defaultValue="crop">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="crop" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Wheat className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Crop Performance</span>
              <span className="sm:hidden">Crops</span>
            </TabsTrigger>
            <TabsTrigger value="soil" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <CloudRain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Soil & Environmental</span>
              <span className="sm:hidden">Soil</span>
            </TabsTrigger>
            <TabsTrigger value="finance" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Financial & Resource</span>
              <span className="sm:hidden">Finance</span>
            </TabsTrigger>
            <TabsTrigger value="sustain" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Leaf className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sustainability</span>
              <span className="sm:hidden">Sustain</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crop" className="mt-6">
            <CropPerformanceTab />
          </TabsContent>
          <TabsContent value="soil" className="mt-6">
            <SoilEnvironmentalTab />
          </TabsContent>
          <TabsContent value="finance" className="mt-6">
            <FinancialResourceTab />
          </TabsContent>
          <TabsContent value="sustain" className="mt-6">
            <SustainabilityTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
