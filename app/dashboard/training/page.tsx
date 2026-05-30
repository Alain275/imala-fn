"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, 
  Play,
  Clock,
  Award,
  ChevronRight,
  Star,
  Users,
  Download,
  Filter,
  Search,
  CheckCircle
} from "lucide-react"

// Dummy training data
const featuredCourses = [
  {
    id: 1,
    title: "Modern Maize Farming Techniques",
    description: "Learn the latest methods for maximizing maize yield in Rwandan conditions",
    duration: "2.5 hours",
    lessons: 12,
    enrolled: 1456,
    rating: 4.8,
    progress: 0,
    image: "maize",
    category: "Crops",
    level: "Beginner"
  },
  {
    id: 2,
    title: "Integrated Pest Management",
    description: "Sustainable approaches to controlling pests without harmful chemicals",
    duration: "3 hours",
    lessons: 15,
    enrolled: 892,
    rating: 4.7,
    progress: 45,
    image: "pest",
    category: "Plant Health",
    level: "Intermediate"
  },
  {
    id: 3,
    title: "Soil Health & Fertility",
    description: "Understanding and improving your soil for better crop production",
    duration: "2 hours",
    lessons: 10,
    enrolled: 1203,
    rating: 4.9,
    progress: 100,
    image: "soil",
    category: "Soil",
    level: "Beginner"
  },
]

const allCourses = [
  { id: 4, title: "Water Management for Farmers", category: "Irrigation", duration: "1.5 hours", lessons: 8, level: "Beginner" },
  { id: 5, title: "Post-Harvest Handling", category: "Storage", duration: "2 hours", lessons: 10, level: "Intermediate" },
  { id: 6, title: "Organic Farming Practices", category: "Organic", duration: "3 hours", lessons: 14, level: "Advanced" },
  { id: 7, title: "Climate-Smart Agriculture", category: "Climate", duration: "2.5 hours", lessons: 12, level: "Intermediate" },
  { id: 8, title: "Livestock Integration", category: "Livestock", duration: "2 hours", lessons: 9, level: "Beginner" },
  { id: 9, title: "Farm Business Management", category: "Business", duration: "3.5 hours", lessons: 16, level: "Advanced" },
]

const categories = [
  { name: "All", count: 24 },
  { name: "Crops", count: 8 },
  { name: "Plant Health", count: 5 },
  { name: "Soil", count: 4 },
  { name: "Irrigation", count: 3 },
  { name: "Business", count: 4 },
]

const achievements = [
  { title: "First Course", description: "Complete your first course", earned: true, icon: Award },
  { title: "Quick Learner", description: "Complete 5 courses", earned: true, icon: Star },
  { title: "Expert Farmer", description: "Complete 10 courses", earned: false, icon: Award },
  { title: "Community Helper", description: "Help 5 other farmers", earned: false, icon: Users },
]

export default function TrainingPage() {
  return (
    <div className="min-h-screen">
      <Header 
        title="Training & Education" 
        subtitle="Learn farming best practices through videos and tutorials in local languages"
      />
      
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Icon3D gradient="green" size="md">
                  <BookOpen className="w-5 h-5" />
                </Icon3D>
                <div>
                  <p className="text-2xl font-bold text-foreground">3</p>
                  <p className="text-sm text-muted-foreground">Courses In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Icon3D gradient="gold" size="md">
                  <CheckCircle className="w-5 h-5" />
                </Icon3D>
                <div>
                  <p className="text-2xl font-bold text-foreground">7</p>
                  <p className="text-sm text-muted-foreground">Completed Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Icon3D gradient="sky" size="md">
                  <Clock className="w-5 h-5" />
                </Icon3D>
                <div>
                  <p className="text-2xl font-bold text-foreground">18h</p>
                  <p className="text-sm text-muted-foreground">Total Learning Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Icon3D gradient="earth" size="md">
                  <Award className="w-5 h-5" />
                </Icon3D>
                <div>
                  <p className="text-2xl font-bold text-foreground">2</p>
                  <p className="text-sm text-muted-foreground">Certificates Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Courses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Your Learning Path</h2>
            <Button variant="ghost" className="text-primary">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredCourses.map((course) => (
              <Card key={course.id} className="card-hover border-0 shadow-md overflow-hidden">
                <div className={`h-32 flex items-center justify-center ${
                  course.image === 'maize' ? 'bg-gradient-to-br from-emerald-100 to-green-50' :
                  course.image === 'pest' ? 'bg-gradient-to-br from-amber-100 to-orange-50' :
                  'bg-gradient-to-br from-amber-100 to-yellow-50'
                }`}>
                  <Icon3D 
                    gradient={course.image === 'maize' ? 'green' : course.image === 'pest' ? 'earth' : 'gold'} 
                    size="xl"
                  >
                    <BookOpen className="w-10 h-10" />
                  </Icon3D>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {course.category}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {course.level}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                  
                  {course.progress > 0 && course.progress < 100 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  )}
                  
                  {course.progress === 100 && (
                    <div className="flex items-center gap-2 text-emerald-600 mb-3">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.enrolled}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full gap-2">
                    {course.progress === 0 ? (
                      <>
                        <Play className="w-4 h-4" />
                        Start Course
                      </>
                    ) : course.progress === 100 ? (
                      <>
                        <Download className="w-4 h-4" />
                        Get Certificate
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Continue
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Browse Courses & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Library */}
          <Card className="lg:col-span-2 border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Icon3D gradient="green" size="sm">
                    <BookOpen className="w-4 h-4" />
                  </Icon3D>
                  <span>Course Library</span>
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Search className="w-4 h-4" />
                    Search
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      cat.name === 'All' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {cat.name} ({cat.count})
                  </button>
                ))}
              </div>
              
              {/* Course List */}
              <div className="space-y-3">
                {allCourses.map((course) => (
                  <div 
                    key={course.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{course.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{course.category}</span>
                        <span>{course.duration}</span>
                        <span>{course.lessons} lessons</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      course.level === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
                      course.level === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {course.level}
                    </span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Icon3D gradient="gold" size="sm">
                  <Award className="w-4 h-4" />
                </Icon3D>
                <span>Achievements</span>
              </CardTitle>
              <CardDescription>Track your learning milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement, i) => (
                  <div 
                    key={i}
                    className={`flex items-center gap-4 p-4 rounded-xl ${
                      achievement.earned 
                        ? 'bg-amber-50 border border-amber-200' 
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      achievement.earned
                        ? 'bg-gradient-to-br from-amber-400 to-yellow-500'
                        : 'bg-muted'
                    }`}>
                      <achievement.icon className={`w-6 h-6 ${
                        achievement.earned ? 'text-white' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        achievement.earned ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    {achievement.earned && (
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
