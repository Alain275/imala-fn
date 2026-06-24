import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()
  const [yield_, setYield] = useState<CropYieldData[]>([])
  const [trends, setTrends] = useState<DetectionTrendPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminAnalyticsService.getCropYield(), adminAnalyticsService.getDetectionTrends()])
      .then(([y, trendData]) => { setYield(y); setTrends(trendData) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label={t('admin.analytics.crop.kpis.totalYield')} value="37.2" sub={t('admin.analytics.crop.kpis.trackedCrops', { count: 6 })} gradient="green" icon={Wheat} />
        <KpiCard label={t('admin.analytics.crop.kpis.avgDetectionRate')} value="16.8%" sub={t('admin.analytics.crop.kpis.diseaseScans')} gradient="gold" icon={Activity} />
        <KpiCard label={t('admin.analytics.crop.kpis.mostAffected')} value="Maize" sub={t('admin.analytics.crop.kpis.leafBlightCases', { count: 167 })} gradient="earth" icon={Wheat} />
        <KpiCard label={t('admin.analytics.crop.kpis.bestYieldRate')} value="Beans" sub={t('admin.analytics.crop.kpis.aboveTarget', { percent: 5 })} gradient="leaf" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t('admin.analytics.crop.yieldChart.title')} description={t('admin.analytics.crop.yieldChart.description')} icon={Wheat} iconColor="text-emerald-500" loading={loading} height={240}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yield_} layout="vertical" margin={{ left: 70 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
              <XAxis type="number" className="fill-muted-foreground" fontSize={11} tickLine={false} />
              <YAxis type="category" dataKey="crop" className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} width={70} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="yieldTons" fill="#10b981" radius={[0, 4, 4, 0]} name={t('admin.analytics.crop.yieldChart.actual')} />
              <Bar dataKey="targetTons" fill="#d1fae5" radius={[0, 4, 4, 0]} name={t('admin.analytics.crop.yieldChart.target')} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t('admin.analytics.crop.detectionChart.title')} description={t('admin.analytics.crop.detectionChart.description')} icon={Activity} iconColor="text-rose-500" loading={loading} height={240}
          legend={
            <div className="flex flex-wrap gap-4">
              {[['#ef4444', t('admin.analytics.crop.detectionChart.blight')], ['#f59e0b', t('admin.analytics.crop.detectionChart.rust')], ['#8b5cf6', t('admin.analytics.crop.detectionChart.mosaic')], ['#0ea5e9', t('admin.analytics.crop.detectionChart.blast')]].map(([c, l]) => (
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
              <Line type="monotone" dataKey="blight" stroke="#ef4444" strokeWidth={2} dot={false} name={t('admin.analytics.crop.detectionChart.blight')} />
              <Line type="monotone" dataKey="rust" stroke="#f59e0b" strokeWidth={2} dot={false} name={t('admin.analytics.crop.detectionChart.rust')} />
              <Line type="monotone" dataKey="mosaic" stroke="#8b5cf6" strokeWidth={2} dot={false} name={t('admin.analytics.crop.detectionChart.mosaic')} />
              <Line type="monotone" dataKey="blast" stroke="#0ea5e9" strokeWidth={2} dot={false} name={t('admin.analytics.crop.detectionChart.blast')} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

// ── Tab 2: Soil & Environmental ───────────────────────────────────────────────

function SoilEnvironmentalTab() {
  const { t } = useTranslation()
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
        <KpiCard label={t('admin.analytics.soil.kpis.avgRainfall')} value="88.2" sub={t('admin.analytics.soil.kpis.monthlyAvg', { year: 2026 })} gradient="sky" icon={CloudRain} />
        <KpiCard label={t('admin.analytics.soil.kpis.avgTemperature')} value="21.1" sub={t('admin.analytics.soil.kpis.acrossAllZones')} gradient="gold" icon={Activity} />
        <KpiCard label={t('admin.analytics.soil.kpis.avgSoilPh')} value="6.2" sub={t('admin.analytics.soil.kpis.withinOptimalRange')} gradient="earth" icon={Leaf} />
        <KpiCard label={t('admin.analytics.soil.kpis.lowNitrogenZones')} value="2" sub={t('admin.analytics.soil.kpis.needIntervention')} gradient="leaf" icon={DropletIcon} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t('admin.analytics.soil.climateChart.title')} description={t('admin.analytics.soil.climateChart.description')} icon={CloudRain} iconColor="text-sky-500" loading={loading} height={240}
          legend={
            <div className="flex gap-6">
              <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-sky-500 rounded" /><span className="text-xs text-muted-foreground">{t('admin.analytics.soil.climateChart.rainfall')}</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-500 rounded" /><span className="text-xs text-muted-foreground">{t('admin.analytics.soil.climateChart.temp')}</span></div>
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
              <Area yAxisId="rain" type="monotone" dataKey="rainfall" stroke="#0ea5e9" fill="url(#gRain)" name={t('admin.analytics.soil.climateChart.rainfall')} />
              <Line yAxisId="temp" type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} dot={false} name={t('admin.analytics.soil.climateChart.temp')} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t('admin.analytics.soil.nutrientsChart.title')} description={t('admin.analytics.soil.nutrientsChart.description')} icon={Leaf} iconColor="text-emerald-500" loading={loading} height={240}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={soil} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis dataKey="zone" className="fill-muted-foreground" fontSize={10} tickLine={false} />
              <YAxis domain={[0, 100]} className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="nitrogen" fill="#10b981" radius={[3, 3, 0, 0]} name={t('admin.analytics.soil.nutrientsChart.nitrogen')} />
              <Bar dataKey="phosphorus" fill="#f59e0b" radius={[3, 3, 0, 0]} name={t('admin.analytics.soil.nutrientsChart.phosphorus')} />
              <Bar dataKey="potassium" fill="#0ea5e9" radius={[3, 3, 0, 0]} name={t('admin.analytics.soil.nutrientsChart.potassium')} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

// ── Tab 3: Financial & Resource ───────────────────────────────────────────────

function FinancialResourceTab() {
  const { t } = useTranslation()
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
        <KpiCard label={t('admin.analytics.finance.kpis.totalRevenue')} value="895.9" sub={t('admin.analytics.finance.kpis.allCrops', { year: 2026 })} gradient="gold" icon={DollarSign} />
        <KpiCard label={t('admin.analytics.finance.kpis.topEarner')} value={t('dashboard.shared.crops.coffee')} sub="RWF 284.6M" gradient="green" icon={TrendingUp} />
        <KpiCard label={t('admin.analytics.finance.kpis.avgCostPerHa')} value="40.6" sub={t('admin.analytics.finance.kpis.seedsInputsLabor')} gradient="earth" icon={Activity} />
        <KpiCard label={t('admin.analytics.finance.kpis.revenueGrowth')} value="+11.2%" sub={t('admin.analytics.finance.kpis.vsSamePeriod', { year: 2025 })} gradient="leaf" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t('admin.analytics.finance.revenueChart.title')} description={t('admin.analytics.finance.revenueChart.description')} icon={DollarSign} iconColor="text-amber-500" loading={loading} height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenue} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
              <XAxis type="number" className="fill-muted-foreground" fontSize={11} tickLine={false} />
              <YAxis type="category" dataKey="crop" className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} width={60} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v.toFixed(1)}M RWF`]} />
              <Bar dataKey="revenueM" radius={[0, 4, 4, 0]} name={t('admin.analytics.finance.revenueChart.revenue')} >
                {revenue.map((_, i) => (
                  <Cell key={i} fill={['#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#ec4899'][i % 8]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t('admin.analytics.finance.costChart.title')} description={t('admin.analytics.finance.costChart.description')} icon={Activity} iconColor="text-rose-500" loading={loading} height={260}
          legend={
            <div className="flex flex-wrap gap-4">
              {[['#10b981', t('admin.analytics.finance.costChart.seeds')], ['#0ea5e9', t('admin.analytics.finance.costChart.fertilizer')], ['#f59e0b', t('admin.analytics.finance.costChart.pesticide')], ['#8b5cf6', t('admin.analytics.finance.costChart.labor')]].map(([c, l]) => (
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
              <Bar dataKey="seeds" stackId="a" fill="#10b981" name={t('admin.analytics.finance.costChart.seeds')} />
              <Bar dataKey="fertilizer" stackId="a" fill="#0ea5e9" name={t('admin.analytics.finance.costChart.fertilizer')} />
              <Bar dataKey="pesticide" stackId="a" fill="#f59e0b" name={t('admin.analytics.finance.costChart.pesticide')} />
              <Bar dataKey="labor" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} name={t('admin.analytics.finance.costChart.labor')} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title={t('admin.analytics.finance.priceChart.title')} description={t('admin.analytics.finance.priceChart.description')} icon={TrendingUp} iconColor="text-emerald-500" loading={loading} height={200}
        legend={
          <div className="flex gap-6">
            {[['#f59e0b', t('dashboard.shared.crops.maize')], ['#10b981', t('dashboard.shared.crops.beans')], ['#8b5cf6', t('admin.analytics.finance.priceChart.coffeeScaled')]].map(([c, l]) => (
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
            <Line type="monotone" dataKey="maize" stroke="#f59e0b" strokeWidth={2} dot={false} name={t('dashboard.shared.crops.maize')} />
            <Line type="monotone" dataKey="beans" stroke="#10b981" strokeWidth={2} dot={false} name={t('dashboard.shared.crops.beans')} />
            <Line type="monotone" dataKey="coffee" stroke="#8b5cf6" strokeWidth={2} dot={false} name={t('dashboard.shared.crops.coffee')} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

// ── Tab 4: Sustainability & Compliance ────────────────────────────────────────

function SustainabilityTab() {
  const { t } = useTranslation()
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
        <KpiCard label={t('admin.analytics.sustainability.kpis.carbonScore')} value="48/100" sub={t('admin.analytics.sustainability.kpis.target', { value: 60 })} gradient="earth" icon={Leaf} />
        <KpiCard label={t('admin.analytics.sustainability.kpis.organicCoverage')} value="62%" sub={t('admin.analytics.sustainability.kpis.targetPercent', { value: 75 })} gradient="green" icon={Wheat} />
        <KpiCard label={t('admin.analytics.sustainability.kpis.pesticideCompliance')} value="93%" sub={t('admin.analytics.sustainability.kpis.certifiedFarms')} gradient="sky" icon={ShieldCheck} />
        <KpiCard label={t('admin.analytics.sustainability.kpis.waterEfficiency')} value="84%" sub={t('admin.analytics.sustainability.kpis.targetPercent', { value: 90 })} gradient="leaf" icon={DropletIcon} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t('admin.analytics.sustainability.carbonChart.title')} description={t('admin.analytics.sustainability.carbonChart.description')} icon={Leaf} iconColor="text-emerald-500" loading={loading} height={240}
          legend={
            <div className="flex flex-wrap gap-4">
              {[['#6b7280', t('admin.analytics.sustainability.carbonChart.machinery')], ['#0ea5e9', t('admin.analytics.sustainability.carbonChart.fertilizer')], ['#f59e0b', t('admin.analytics.sustainability.carbonChart.transport')]].map(([c, l]) => (
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
              <Area type="monotone" dataKey="machinery" stackId="c" stroke="#6b7280" fill="url(#gmachinery)" name={t('admin.analytics.sustainability.carbonChart.machinery')} />
              <Area type="monotone" dataKey="fertilizer" stackId="c" stroke="#0ea5e9" fill="url(#gfertilizer)" name={t('admin.analytics.sustainability.carbonChart.fertilizer')} />
              <Area type="monotone" dataKey="transport" stackId="c" stroke="#f59e0b" fill="url(#gtransport)" name={t('admin.analytics.sustainability.carbonChart.transport')} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t('admin.analytics.sustainability.scoresChart.title')} description={t('admin.analytics.sustainability.scoresChart.description')} icon={ShieldCheck} iconColor="text-violet-500" loading={loading} height={240}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scores} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
              <XAxis type="number" domain={[0, 100]} className="fill-muted-foreground" fontSize={11} tickLine={false} />
              <YAxis type="category" dataKey="indicator" className="fill-muted-foreground" fontSize={10} tickLine={false} axisLine={false} width={120} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="current" fill="#10b981" radius={[0, 4, 4, 0]} name={t('admin.analytics.sustainability.scoresChart.current')} />
              <Bar dataKey="target" fill="#d1fae5" radius={[0, 4, 4, 0]} name={t('admin.analytics.sustainability.scoresChart.target')} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-background">
      <Header title={t('admin.analytics.title')} subtitle={t('admin.analytics.subtitle')} />

      <div className="p-6 space-y-6">
        <Tabs defaultValue="crop">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="crop" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Wheat className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('admin.analytics.tabs.cropPerformance')}</span>
              <span className="sm:hidden">{t('admin.analytics.tabs.cropPerformanceShort')}</span>
            </TabsTrigger>
            <TabsTrigger value="soil" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <CloudRain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('admin.analytics.tabs.soilEnvironmental')}</span>
              <span className="sm:hidden">{t('admin.analytics.tabs.soilEnvironmentalShort')}</span>
            </TabsTrigger>
            <TabsTrigger value="finance" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('admin.analytics.tabs.financialResource')}</span>
              <span className="sm:hidden">{t('admin.analytics.tabs.financialResourceShort')}</span>
            </TabsTrigger>
            <TabsTrigger value="sustain" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Leaf className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('admin.analytics.tabs.sustainability')}</span>
              <span className="sm:hidden">{t('admin.analytics.tabs.sustainabilityShort')}</span>
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
