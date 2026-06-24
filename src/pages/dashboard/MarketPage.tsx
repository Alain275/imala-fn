import { useTranslation } from "react-i18next"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Calendar,
  Search,
  Filter,
  ShoppingCart,
  Users,
  Phone,
  ChevronRight
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts"

// Dummy market data
const commodityPrices = [
  { cropKey: "maize", price: 450, unit: "RWF/kg", change: 5.2, trend: "up", volume: "2,500 tons" },
  { cropKey: "beans", price: 800, unit: "RWF/kg", change: -2.1, trend: "down", volume: "1,800 tons" },
  { cropKey: "rice", price: 1200, unit: "RWF/kg", change: 3.8, trend: "up", volume: "3,200 tons" },
  { cropKey: "irishPotatoes", price: 350, unit: "RWF/kg", change: 8.5, trend: "up", volume: "4,100 tons" },
  { cropKey: "tomatoes", price: 600, unit: "RWF/kg", change: -4.3, trend: "down", volume: "1,200 tons" },
  { cropKey: "cassava", price: 200, unit: "RWF/kg", change: 1.2, trend: "up", volume: "5,500 tons" },
]

const priceHistory = [
  { week: "W1", maize: 420, beans: 820, rice: 1150 },
  { week: "W2", maize: 430, beans: 810, rice: 1160 },
  { week: "W3", maize: 425, beans: 830, rice: 1180 },
  { week: "W4", maize: 440, beans: 815, rice: 1190 },
  { week: "W5", maize: 445, beans: 805, rice: 1185 },
  { week: "W6", maize: 450, beans: 800, rice: 1200 },
]

const marketDemand = [
  { cropKey: "maize", demand: 85 },
  { cropKey: "beans", demand: 72 },
  { cropKey: "rice", demand: 90 },
  { cropKey: "irishPotatoes", demand: 78 },
  { cropKey: "tomatoes", demand: 65 },
  { cropKey: "cassava", demand: 55 },
]

const buyers = [
  {
    id: 1,
    name: "Rwanda Food Processing Ltd",
    typeKey: "processor",
    location: "Kigali",
    cropKeys: ["maize", "beans", "rice"],
    rating: 4.8,
    verified: true
  },
  {
    id: 2,
    name: "Eastern Grains Cooperative",
    typeKey: "cooperative",
    location: "Rwamagana",
    cropKeys: ["maize", "sorghum"],
    rating: 4.5,
    verified: true
  },
  {
    id: 3,
    name: "Kigali Fresh Market",
    typeKey: "retailer",
    location: "Kigali",
    cropKeys: ["tomatoes", "irishPotatoes", "onions"],
    rating: 4.2,
    verified: true
  },
  {
    id: 4,
    name: "Export Agri Solutions",
    typeKey: "exporter",
    location: "Kigali",
    cropKeys: ["coffee", "tea", "beans"],
    rating: 4.9,
    verified: true
  },
]

const marketInsights = [
  { key: "peakSellingSeason" },
  { key: "bestMarkets" },
  { key: "exportOpportunity" },
]

export default function MarketPage() {
  const { t } = useTranslation()
  const marketDemandData = marketDemand.map((d) => ({
    crop: t(`dashboard.shared.crops.${d.cropKey}`),
    demand: d.demand,
  }))

  return (
    <div className="min-h-screen">
      <Header
        title={t("dashboard.market.pageTitle")}
        subtitle={t("dashboard.market.pageSubtitle")}
      />

      <div className="p-6 space-y-6">
        {/* Market Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">{t("dashboard.market.totalVolumeLabel")}</p>
                  <p className="text-3xl font-bold mt-1">18,300</p>
                  <p className="text-white/70 text-sm mt-1">{t("dashboard.market.totalVolumeUnit")}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShoppingCart className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">{t("dashboard.market.activeBuyersLabel")}</p>
                  <p className="text-3xl font-bold mt-1">1,247</p>
                  <p className="text-white/70 text-sm mt-1">{t("dashboard.market.activeBuyersUnit")}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                  <Users className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-gradient-to-br from-sky-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">{t("dashboard.market.priceIndexLabel")}</p>
                  <p className="text-3xl font-bold mt-1">+3.2%</p>
                  <p className="text-white/70 text-sm mt-1">{t("dashboard.market.priceIndexUnit")}</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commodity Prices */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon3D gradient="gold" size="sm">
                  <TrendingUp className="w-4 h-4" />
                </Icon3D>
                <div>
                  <CardTitle>{t("dashboard.market.todaysPricesTitle")}</CardTitle>
                  <CardDescription>{t("dashboard.market.todaysPricesUpdated", { date: "March 15, 2024", time: "09:00 AM" })}</CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="w-4 h-4" />
                  {t("common.actions.filter")}
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Search className="w-4 h-4" />
                  {t("common.actions.search")}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {commodityPrices.map((commodity) => (
                <div
                  key={commodity.cropKey}
                  className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{t(`dashboard.shared.crops.${commodity.cropKey}`)}</h3>
                      <p className="text-xs text-muted-foreground">{t("dashboard.market.volumeLabel", { volume: commodity.volume })}</p>
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      commodity.trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {commodity.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {Math.abs(commodity.change)}%
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">{commodity.price}</span>
                    <span className="text-sm text-muted-foreground">{commodity.unit}</span>
                  </div>
                  <Button variant="ghost" className="w-full mt-3 text-primary" size="sm">
                    {t("common.actions.viewDetails")} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price Trends & Demand */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price History Chart */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <Icon3D gradient="green" size="sm">
                  <TrendingUp className="w-4 h-4" />
                </Icon3D>
                <span>{t("dashboard.market.priceTrendsTitle")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="maize" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name={t("dashboard.market.chartSeriesRwf", { crop: t("dashboard.shared.crops.maize") })} />
                    <Line type="monotone" dataKey="beans" stroke="#eab308" strokeWidth={2} dot={{ r: 4 }} name={t("dashboard.market.chartSeriesRwf", { crop: t("dashboard.shared.crops.beans") })} />
                    <Line type="monotone" dataKey="rice" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name={t("dashboard.market.chartSeriesRwf", { crop: t("dashboard.shared.crops.rice") })} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">{t("dashboard.shared.crops.maize")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-muted-foreground">{t("dashboard.shared.crops.beans")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">{t("dashboard.shared.crops.rice")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Demand */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <Icon3D gradient="sky" size="sm">
                  <ShoppingCart className="w-4 h-4" />
                </Icon3D>
                <span>{t("dashboard.market.demandIndexTitle")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marketDemandData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" fontSize={12} />
                    <YAxis dataKey="crop" type="category" stroke="#9ca3af" fontSize={12} width={70} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="demand" fill="#22c55e" radius={[0, 4, 4, 0]} name={t("dashboard.market.demandPercentSeries")} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Buyers & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Verified Buyers */}
          <Card className="lg:col-span-2 border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Icon3D gradient="earth" size="sm">
                    <Users className="w-4 h-4" />
                  </Icon3D>
                  <span>{t("dashboard.market.verifiedBuyersTitle")}</span>
                </CardTitle>
                <Button variant="ghost" className="text-primary">
                  {t("common.actions.viewAll")} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {buyers.map((buyer) => (
                  <div
                    key={buyer.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold">
                      {buyer.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate">{buyer.name}</h3>
                        {buyer.verified && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            {t("dashboard.market.verifiedBadge")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{t(`dashboard.market.buyerType.${buyer.typeKey}`)}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {buyer.location}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {buyer.cropKeys.map((cropKey) => (
                          <span
                            key={cropKey}
                            className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                          >
                            {t(`dashboard.shared.crops.${cropKey}`)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-500">
                        <span className="font-medium">{buyer.rating}</span>
                        <span className="text-xs">{t("dashboard.market.starsUnit")}</span>
                      </div>
                      <Button size="sm" variant="outline" className="mt-2 gap-1">
                        <Phone className="w-3 h-3" />
                        {t("common.actions.contact")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Insights */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Icon3D gradient="gold" size="sm">
                  <Calendar className="w-4 h-4" />
                </Icon3D>
                <span>{t("dashboard.market.insightsTitle")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketInsights.map((insight) => (
                  <div
                    key={insight.key}
                    className="p-4 rounded-xl bg-amber-50 border border-amber-200"
                  >
                    <h4 className="font-medium text-foreground mb-1">{t(`dashboard.market.insights.${insight.key}.title`)}</h4>
                    <p className="text-sm text-muted-foreground">{t(`dashboard.market.insights.${insight.key}.description`)}</p>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                {t("dashboard.market.personalizedInsightsButton")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
