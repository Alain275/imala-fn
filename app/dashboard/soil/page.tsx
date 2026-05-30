"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Mountain, 
  Droplets, 
  Thermometer,
  Leaf,
  FlaskConical,
  MapPin,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react"
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from "recharts"

// Dummy soil data
const soilAnalysis = {
  location: "Kigali, Gasabo District",
  lastUpdated: "March 15, 2024",
  overallHealth: 78,
  ph: 6.2,
  nitrogen: 45,
  phosphorus: 38,
  potassium: 62,
  organicMatter: 4.2,
  moisture: 35,
  texture: "Clay Loam"
}

const soilRadarData = [
  { subject: 'pH Balance', A: 75, fullMark: 100 },
  { subject: 'Nitrogen', A: 45, fullMark: 100 },
  { subject: 'Phosphorus', A: 38, fullMark: 100 },
  { subject: 'Potassium', A: 62, fullMark: 100 },
  { subject: 'Organic Matter', A: 70, fullMark: 100 },
  { subject: 'Moisture', A: 55, fullMark: 100 },
]

const cropSuitability = [
  { crop: "Maize", suitability: 92, status: "excellent" },
  { crop: "Beans", suitability: 88, status: "excellent" },
  { crop: "Irish Potatoes", suitability: 75, status: "good" },
  { crop: "Tomatoes", suitability: 70, status: "good" },
  { crop: "Rice", suitability: 45, status: "fair" },
  { crop: "Wheat", suitability: 35, status: "poor" },
]

const soilRecommendations = [
  {
    type: "action",
    title: "Add Nitrogen Fertilizer",
    description: "Your soil nitrogen levels are below optimal. Apply 50kg/ha of urea during planting.",
    priority: "high"
  },
  {
    type: "action",
    title: "Increase Phosphorus",
    description: "Apply DAP fertilizer at 40kg/ha to improve phosphorus levels.",
    priority: "high"
  },
  {
    type: "info",
    title: "pH Level Optimal",
    description: "Your soil pH of 6.2 is ideal for most crops. No lime application needed.",
    priority: "low"
  },
  {
    type: "action",
    title: "Add Organic Matter",
    description: "Consider adding compost or manure to improve soil structure and water retention.",
    priority: "medium"
  },
]

const historicalData = [
  { parameter: "pH", jan: 6.0, apr: 6.1, jul: 6.2, oct: 6.2, change: "+0.2" },
  { parameter: "Nitrogen (mg/kg)", jan: 42, apr: 40, jul: 43, oct: 45, change: "+3" },
  { parameter: "Phosphorus (mg/kg)", jan: 35, apr: 36, jul: 37, oct: 38, change: "+3" },
  { parameter: "Potassium (mg/kg)", jan: 58, apr: 60, jul: 61, oct: 62, change: "+4" },
  { parameter: "Organic Matter (%)", jan: 3.8, apr: 4.0, jul: 4.1, oct: 4.2, change: "+0.4" },
]

export default function SoilPage() {
  return (
    <div className="min-h-screen">
      <Header 
        title="Soil Analysis" 
        subtitle="Comprehensive soil health assessment and crop suitability recommendations"
      />
      
      <div className="p-6 space-y-6">
        {/* Soil Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Soil Health Card */}
          <Card className="lg:col-span-2 border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon3D gradient="earth" size="md">
                    <Mountain className="w-6 h-6" />
                  </Icon3D>
                  <div>
                    <CardTitle>Soil Health Score</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {soilAnalysis.location}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-primary">{soilAnalysis.overallHealth}</p>
                  <p className="text-sm text-muted-foreground">out of 100</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FlaskConical className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">pH Level</span>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">{soilAnalysis.ph}</p>
                  <p className="text-xs text-emerald-600">Optimal</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-muted-foreground">Nitrogen</span>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">{soilAnalysis.nitrogen}%</p>
                  <p className="text-xs text-amber-600">Low</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Moisture</span>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">{soilAnalysis.moisture}%</p>
                  <p className="text-xs text-emerald-600">Good</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">Texture</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{soilAnalysis.texture}</p>
                  <p className="text-xs text-emerald-600">Good drainage</p>
                </div>
              </div>
              
              <Button className="w-full">
                Request New Soil Test
              </Button>
            </CardContent>
          </Card>

          {/* Soil Radar Chart */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-0">
              <CardTitle className="text-base">Nutrient Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={soilRadarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar 
                      name="Soil Health" 
                      dataKey="A" 
                      stroke="#22c55e" 
                      fill="#22c55e" 
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Crop Suitability */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Icon3D gradient="green" size="sm">
                <Leaf className="w-4 h-4" />
              </Icon3D>
              <span>Crop Suitability Analysis</span>
            </CardTitle>
            <CardDescription>Based on your soil composition and local climate conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cropSuitability.map((crop) => (
                <div 
                  key={crop.crop}
                  className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-foreground">{crop.crop}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      crop.status === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                      crop.status === 'good' ? 'bg-blue-100 text-blue-700' :
                      crop.status === 'fair' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {crop.status}
                    </span>
                  </div>
                  <Progress value={crop.suitability} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Suitability</span>
                    <span className="font-medium text-foreground">{crop.suitability}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations & History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommendations */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Icon3D gradient="gold" size="sm">
                  <CheckCircle className="w-4 h-4" />
                </Icon3D>
                <span>Recommendations</span>
              </CardTitle>
              <CardDescription>Actions to improve your soil health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {soilRecommendations.map((rec, i) => (
                  <div 
                    key={i}
                    className={`p-4 rounded-xl ${
                      rec.priority === 'high' ? 'bg-red-50 border border-red-200' :
                      rec.priority === 'medium' ? 'bg-amber-50 border border-amber-200' :
                      'bg-emerald-50 border border-emerald-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {rec.type === 'action' ? (
                        <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                          rec.priority === 'high' ? 'text-red-500' : 'text-amber-500'
                        }`} />
                      ) : (
                        <Info className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      )}
                      <div>
                        <h4 className="font-medium text-foreground">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Historical Data */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Icon3D gradient="sky" size="sm">
                    <FlaskConical className="w-4 h-4" />
                  </Icon3D>
                  <span>Historical Trends</span>
                </CardTitle>
                <Button variant="ghost" className="text-primary text-sm">
                  View Full Report <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Parameter</th>
                      <th className="text-center py-3 text-sm font-medium text-muted-foreground">Jan</th>
                      <th className="text-center py-3 text-sm font-medium text-muted-foreground">Apr</th>
                      <th className="text-center py-3 text-sm font-medium text-muted-foreground">Jul</th>
                      <th className="text-center py-3 text-sm font-medium text-muted-foreground">Oct</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalData.map((row, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="py-3 text-sm font-medium text-foreground">{row.parameter}</td>
                        <td className="py-3 text-sm text-center text-muted-foreground">{row.jan}</td>
                        <td className="py-3 text-sm text-center text-muted-foreground">{row.apr}</td>
                        <td className="py-3 text-sm text-center text-muted-foreground">{row.jul}</td>
                        <td className="py-3 text-sm text-center text-muted-foreground">{row.oct}</td>
                        <td className="py-3 text-sm text-right text-emerald-600 font-medium">{row.change}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Last updated: {soilAnalysis.lastUpdated}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
