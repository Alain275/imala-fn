import { useTranslation } from "react-i18next"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import {
  Sprout,
  Calendar,
  Droplets,
  Sun,
  Thermometer,
  Clock,
  ChevronRight,
  Leaf,
  Wheat,
  Apple
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

// Dummy crop data
const recommendedCrops = [
  {
    id: 1,
    name: "Maize",
    cropKey: "maize",
    suitability: 92,
    plantingWindow: "Mar - Apr",
    harvestTime: "90-120 days",
    waterNeedKey: "medium",
    tipsKey: "maize",
  },
  {
    id: 2,
    name: "Beans",
    cropKey: "beans",
    suitability: 88,
    plantingWindow: "Feb - Mar",
    harvestTime: "60-90 days",
    waterNeedKey: "lowMedium",
    tipsKey: "beans",
  },
  {
    id: 3,
    name: "Irish Potatoes",
    cropKey: "irishPotatoes",
    suitability: 85,
    plantingWindow: "Sep - Oct",
    harvestTime: "90-120 days",
    waterNeedKey: "mediumHigh",
    tipsKey: "irishPotatoes",
  },
  {
    id: 4,
    name: "Tomatoes",
    cropKey: "tomatoes",
    suitability: 78,
    plantingWindow: "Year-round",
    harvestTime: "70-80 days",
    waterNeedKey: "high",
    tipsKey: "tomatoes",
  },
]

const plantingCalendar = [
  { cropKey: "maize", jan: false, feb: false, mar: true, apr: true, may: false, jun: false, jul: false, aug: false, sep: true, oct: true, nov: false, dec: false },
  { cropKey: "beans", jan: false, feb: true, mar: true, apr: false, may: false, jun: false, jul: false, aug: false, sep: true, oct: true, nov: false, dec: false },
  { cropKey: "rice", jan: false, feb: false, mar: true, apr: true, may: true, jun: false, jul: false, aug: false, sep: false, oct: false, nov: false, dec: false },
  { cropKey: "sorghum", jan: false, feb: true, mar: true, apr: false, may: false, jun: false, jul: false, aug: true, sep: true, oct: false, nov: false, dec: false },
  { cropKey: "cassava", jan: true, feb: true, mar: true, apr: true, may: false, jun: false, jul: false, aug: false, sep: true, oct: true, nov: true, dec: true },
]

const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
const monthLabels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]

const fertilizerRecommendations = [
  { cropKey: "maize", nitrogen: "120 kg/ha", phosphorus: "60 kg/ha", potassium: "40 kg/ha", timing: "At planting + 4 weeks" },
  { cropKey: "beans", nitrogen: "20 kg/ha", phosphorus: "40 kg/ha", potassium: "20 kg/ha", timing: "At planting only" },
  { cropKey: "rice", nitrogen: "100 kg/ha", phosphorus: "50 kg/ha", potassium: "50 kg/ha", timing: "Split in 3 applications" },
]

export default function CropsPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen">
      <Header
        title={t("dashboard.crops.pageTitle")}
        subtitle={t("dashboard.crops.pageSubtitle")}
      />

      <div className="p-6 space-y-6">
        {/* Current Conditions Banner */}
        <Card className="border-0 shadow-md bg-gradient-to-r from-emerald-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{t("dashboard.crops.conditionsBannerTitle")}</h3>
                <p className="text-white/80">{t("dashboard.crops.conditionsBannerSubtitle")}</p>
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5" />
                  <div>
                    <p className="text-sm text-white/70">{t("dashboard.crops.temperatureLabel")}</p>
                    <p className="font-semibold">24°C</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5" />
                  <div>
                    <p className="text-sm text-white/70">{t("dashboard.crops.humidityLabel")}</p>
                    <p className="font-semibold">68%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5" />
                  <div>
                    <p className="text-sm text-white/70">{t("dashboard.crops.seasonLabel")}</p>
                    <p className="font-semibold">{t("dashboard.crops.seasonValueRainyA")}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Crops */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">{t("dashboard.crops.recommendedTitle")}</h2>
            <Button variant="ghost" className="text-primary">
              {t("common.actions.viewAll")} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedCrops.map((crop) => {
              const tips = t(`dashboard.crops.tips.${crop.tipsKey}`, { returnObjects: true }) as string[]
              return (
                <Card key={crop.id} className="card-hover border-0 shadow-md overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-emerald-100 to-green-50 flex items-center justify-center">
                    <Icon3D gradient="green" size="xl">
                      {crop.name === "Maize" && <Wheat className="w-10 h-10" />}
                      {crop.name === "Beans" && <Leaf className="w-10 h-10" />}
                      {crop.name === "Irish Potatoes" && <Sprout className="w-10 h-10" />}
                      {crop.name === "Tomatoes" && <Apple className="w-10 h-10" />}
                    </Icon3D>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-foreground">{t(`dashboard.shared.crops.${crop.cropKey}`)}</h3>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        {t("dashboard.crops.matchPercent", { pct: crop.suitability })}
                      </span>
                    </div>
                    <Progress value={crop.suitability} className="h-2 mb-3" />
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{t("dashboard.crops.plantLabel", { window: crop.plantingWindow })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{t("dashboard.crops.harvestLabel", { time: crop.harvestTime })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4" />
                        <span>{t("dashboard.crops.waterLabel", { need: t(`dashboard.shared.waterNeed.${crop.waterNeedKey}`) })}</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline" title={tips.join(" • ")}>
                      {t("common.actions.viewDetails")}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Planting Calendar */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Icon3D gradient="gold" size="sm">
                <Calendar className="w-4 h-4" />
              </Icon3D>
              <span>{t("dashboard.crops.plantingCalendarTitle")}</span>
            </CardTitle>
            <CardDescription>{t("dashboard.crops.plantingCalendarDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t("dashboard.crops.cropHeader")}</th>
                    {monthLabels.map((month, i) => (
                      <th key={i} className="py-3 px-2 text-sm font-medium text-muted-foreground text-center">{month}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {plantingCalendar.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="py-3 px-4 font-medium text-foreground">{t(`dashboard.shared.crops.${row.cropKey}`)}</td>
                      {months.map((month) => (
                        <td key={month} className="py-3 px-2 text-center">
                          <div className={`w-6 h-6 mx-auto rounded-full ${
                            row[month as keyof typeof row]
                              ? 'bg-emerald-500'
                              : 'bg-muted'
                          }`} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500" />
                <span>{t("dashboard.crops.legendOptimal")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-muted" />
                <span>{t("dashboard.crops.legendNotRecommended")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fertilizer Recommendations */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Icon3D gradient="earth" size="sm">
                <Droplets className="w-4 h-4" />
              </Icon3D>
              <span>{t("dashboard.crops.fertilizerTitle")}</span>
            </CardTitle>
            <CardDescription>{t("dashboard.crops.fertilizerDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t("dashboard.crops.cropHeader")}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t("dashboard.crops.nitrogenHeader")}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t("dashboard.crops.phosphorusHeader")}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t("dashboard.crops.potassiumHeader")}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t("dashboard.crops.applicationTimingHeader")}</th>
                  </tr>
                </thead>
                <tbody>
                  {fertilizerRecommendations.map((rec, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-4 px-4 font-medium text-foreground">{t(`dashboard.shared.crops.${rec.cropKey}`)}</td>
                      <td className="py-4 px-4 text-muted-foreground">{rec.nitrogen}</td>
                      <td className="py-4 px-4 text-muted-foreground">{rec.phosphorus}</td>
                      <td className="py-4 px-4 text-muted-foreground">{rec.potassium}</td>
                      <td className="py-4 px-4 text-muted-foreground">{rec.timing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
