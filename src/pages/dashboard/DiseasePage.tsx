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
    disease: "Maize Leaf Blight",
    crop: "Maize",
    confidence: 94,
    severity: "high",
    date: "2 days ago",
    treatment: "Apply fungicide (Mancozeb) at 2.5kg/ha. Remove and destroy infected leaves.",
    image: "/placeholder-disease-1.jpg"
  },
  {
    id: 2,
    disease: "Bean Rust",
    crop: "Beans",
    confidence: 87,
    severity: "medium",
    date: "5 days ago",
    treatment: "Apply sulfur-based fungicide. Ensure proper spacing for air circulation.",
    image: "/placeholder-disease-2.jpg"
  },
  {
    id: 3,
    disease: "Tomato Early Blight",
    crop: "Tomatoes",
    confidence: 91,
    severity: "medium",
    date: "1 week ago",
    treatment: "Remove affected leaves. Apply chlorothalonil fungicide every 7-10 days.",
    image: "/placeholder-disease-3.jpg"
  },
]

const commonDiseases = [
  { name: "Maize Streak Virus", crop: "Maize", symptoms: "Yellow streaks on leaves, stunted growth", prevention: "Use resistant varieties, control leafhoppers" },
  { name: "Cassava Mosaic", crop: "Cassava", symptoms: "Distorted leaves with mosaic pattern", prevention: "Plant clean cuttings, remove infected plants" },
  { name: "Banana Bacterial Wilt", crop: "Banana", symptoms: "Yellowing, wilting, premature ripening", prevention: "Use clean tools, remove male buds" },
  { name: "Coffee Berry Disease", crop: "Coffee", symptoms: "Dark sunken lesions on berries", prevention: "Spray copper fungicide, prune affected branches" },
  { name: "Rice Blast", crop: "Rice", symptoms: "Diamond-shaped lesions on leaves", prevention: "Use resistant varieties, balanced fertilization" },
]

export default function DiseasePage() {
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
        title="Disease Detection" 
        subtitle="Upload plant images for AI-powered disease diagnosis and treatment recommendations"
      />
      
      <div className="p-6 space-y-6">
        {/* Upload Section */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Icon3D gradient="earth" size="sm">
                <Camera className="w-4 h-4" />
              </Icon3D>
              <span>Scan Your Plant</span>
            </CardTitle>
            <CardDescription>
              Take a clear photo of the affected plant part for accurate diagnosis
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
                    Drag and drop an image here
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse from your device
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Camera className="w-4 h-4" />
                    Take Photo
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPG, PNG, WEBP (Max 10MB)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Detections */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Recent Detections</h2>
            <Button variant="ghost" className="text-primary">
              View History <ChevronRight className="w-4 h-4 ml-1" />
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
                      <h3 className="font-semibold text-foreground">{detection.disease}</h3>
                      <p className="text-sm text-muted-foreground">{detection.crop}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      detection.severity === 'high' 
                        ? 'bg-red-100 text-red-700' 
                        : detection.severity === 'medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {detection.severity}
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
                    {detection.treatment}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{detection.date}</span>
                    <Button size="sm" variant="outline">
                      View Details
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
                  <h3 className="font-semibold text-foreground mb-1">Early Detection</h3>
                  <p className="text-sm text-muted-foreground">
                    Check your crops daily. Early detection can prevent 80% of crop losses from diseases.
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
                  <h3 className="font-semibold text-foreground mb-1">Photo Tips</h3>
                  <p className="text-sm text-muted-foreground">
                    Take close-up photos in good light. Include both healthy and affected areas.
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
                  <h3 className="font-semibold text-foreground mb-1">Expert Help</h3>
                  <p className="text-sm text-muted-foreground">
                    Complex cases are reviewed by agronomists within 24 hours for accurate diagnosis.
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
                  <CardTitle>Disease Database</CardTitle>
                  <CardDescription>Browse common crop diseases in Rwanda</CardDescription>
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Search className="w-4 h-4" />
                Search
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
                      <h3 className="font-semibold text-foreground">{disease.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {disease.crop}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Symptoms:</strong> {disease.symptoms}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-emerald-600">
                      <Pill className="w-4 h-4" />
                      <span>{disease.prevention}</span>
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
