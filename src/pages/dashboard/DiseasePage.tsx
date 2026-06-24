import { useTranslation } from "react-i18next"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import {
  Bug,
  Upload,
  Camera,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronRight,
  Search,
  Leaf,
  Pill
} from "lucide-react"
import { useState } from "react"

// Dummy disease data
const recentDetections = [
  {
    id: 1,
    diseaseKey: "maizeLeafBlight",
    cropKey: "maize",
    confidence: 94,
    severity: "high",
    dateKey: "twoDaysAgo",
    treatmentKey: "maizeLeafBlight",
    image: "/placeholder-disease-1.jpg"
  },
  {
    id: 2,
    diseaseKey: "beanRust",
    cropKey: "beans",
    confidence: 87,
    severity: "medium",
    dateKey: "fiveDaysAgo",
    treatmentKey: "beanRust",
    image: "/placeholder-disease-2.jpg"
  },
  {
    id: 3,
    diseaseKey: "tomatoEarlyBlight",
    cropKey: "tomatoes",
    confidence: 91,
    severity: "medium",
    dateKey: "oneWeekAgo",
    treatmentKey: "tomatoEarlyBlight",
    image: "/placeholder-disease-3.jpg"
  },
]

const commonDiseases = [
  { key: "maizeStreakVirus", cropKey: "maize" },
  { key: "cassavaMosaic", cropKey: "cassava" },
  { key: "bananaBacterialWilt", cropKey: "banana" },
  { key: "coffeeBerryDisease", cropKey: "coffee" },
  { key: "riceBlast", cropKey: "rice" },
]

export default function DiseasePage() {
  const { t } = useTranslation()
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        title={t("dashboard.disease.pageTitle")}
        subtitle={t("dashboard.disease.pageSubtitle")}
      />

      <div className="p-6 space-y-6">
        {/* Upload Section */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Icon3D gradient="earth" size="sm">
                <Camera className="w-4 h-4" />
              </Icon3D>
              <span>{t("dashboard.disease.scanCardTitle")}</span>
            </CardTitle>
            <CardDescription>
              {t("dashboard.disease.scanCardDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => {
                e.preventDefault()
                setDragActive(false)
              }}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    {t("dashboard.disease.dragDropTitle")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("dashboard.disease.dragDropSubtitle")}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button className="gap-2">
                    <Upload className="w-4 h-4" />
                    {t("dashboard.disease.uploadImageButton")}
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Camera className="w-4 h-4" />
                    {t("dashboard.disease.takePhotoButton")}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.disease.supportedFormats")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Detections */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">{t("dashboard.disease.recentDetectionsTitle")}</h2>
            <Button variant="ghost" className="text-primary">
              {t("dashboard.disease.viewHistoryButton")} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentDetections.map((detection) => (
              <Card key={detection.id} className="card-hover border-0 shadow-md overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center">
                  <Icon3D gradient="earth" size="xl">
                    <Bug className="w-10 h-10" />
                  </Icon3D>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{t(`dashboard.disease.detections.${detection.diseaseKey}.name`)}</h3>
                      <p className="text-sm text-muted-foreground">{t(`dashboard.shared.crops.${detection.cropKey}`)}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      detection.severity === 'high'
                        ? 'bg-red-100 text-red-700'
                        : detection.severity === 'medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {t(`common.severity.${detection.severity}`)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${detection.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">{detection.confidence}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {t(`dashboard.disease.detections.${detection.treatmentKey}.treatment`)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{t(`dashboard.disease.relativeDates.${detection.dateKey}`)}</span>
                    <Button size="sm" variant="outline">
                      {t("common.actions.viewDetails")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Disease Tips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-md bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{t("dashboard.disease.tipEarlyDetectionTitle")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.disease.tipEarlyDetectionDescription")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{t("dashboard.disease.tipPhotoTipsTitle")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.disease.tipPhotoTipsDescription")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{t("dashboard.disease.tipExpertHelpTitle")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.disease.tipExpertHelpDescription")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Common Diseases Database */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon3D gradient="leaf" size="sm">
                  <Search className="w-4 h-4" />
                </Icon3D>
                <div>
                  <CardTitle>{t("dashboard.disease.databaseTitle")}</CardTitle>
                  <CardDescription>{t("dashboard.disease.databaseDescription")}</CardDescription>
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Search className="w-4 h-4" />
                {t("common.actions.search")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {commonDiseases.map((disease, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{t(`dashboard.disease.commonDiseases.${disease.key}.name`)}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {t(`dashboard.shared.crops.${disease.cropKey}`)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>{t("dashboard.disease.symptomsLabel")}</strong> {t(`dashboard.disease.commonDiseases.${disease.key}.symptoms`)}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-emerald-600">
                      <Pill className="w-4 h-4" />
                      <span>{t(`dashboard.disease.commonDiseases.${disease.key}.prevention`)}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
