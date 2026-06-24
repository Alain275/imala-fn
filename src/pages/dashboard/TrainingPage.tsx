import { useTranslation } from "react-i18next"
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
    key: "modernMaizeFarming",
    duration: "2.5 hours",
    lessons: 12,
    enrolled: 1456,
    rating: 4.8,
    progress: 0,
    image: "maize",
    categoryKey: "crops",
    levelKey: "beginner"
  },
  {
    id: 2,
    key: "integratedPestManagement",
    duration: "3 hours",
    lessons: 15,
    enrolled: 892,
    rating: 4.7,
    progress: 45,
    image: "pest",
    categoryKey: "plantHealth",
    levelKey: "intermediate"
  },
  {
    id: 3,
    key: "soilHealthFertility",
    duration: "2 hours",
    lessons: 10,
    enrolled: 1203,
    rating: 4.9,
    progress: 100,
    image: "soil",
    categoryKey: "soil",
    levelKey: "beginner"
  },
]

const allCourses = [
  { id: 4, key: "waterManagement", categoryKey: "irrigation", duration: "1.5 hours", lessons: 8, levelKey: "beginner" },
  { id: 5, key: "postHarvestHandling", categoryKey: "storage", duration: "2 hours", lessons: 10, levelKey: "intermediate" },
  { id: 6, key: "organicFarmingPractices", categoryKey: "organic", duration: "3 hours", lessons: 14, levelKey: "advanced" },
  { id: 7, key: "climateSmartAgriculture", categoryKey: "climate", duration: "2.5 hours", lessons: 12, levelKey: "intermediate" },
  { id: 8, key: "livestockIntegration", categoryKey: "livestock", duration: "2 hours", lessons: 9, levelKey: "beginner" },
  { id: 9, key: "farmBusinessManagement", categoryKey: "business", duration: "3.5 hours", lessons: 16, levelKey: "advanced" },
]

const categories = [
  { key: "all", count: 24 },
  { key: "crops", count: 8 },
  { key: "plantHealth", count: 5 },
  { key: "soil", count: 4 },
  { key: "irrigation", count: 3 },
  { key: "business", count: 4 },
]

const achievements = [
  { key: "firstCourse", earned: true, icon: Award },
  { key: "quickLearner", earned: true, icon: Star },
  { key: "expertFarmer", earned: false, icon: Award },
  { key: "communityHelper", earned: false, icon: Users },
]

export default function TrainingPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen">
      <Header
        title={t("dashboard.training.pageTitle")}
        subtitle={t("dashboard.training.pageSubtitle")}
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
                  <p className="text-sm text-muted-foreground">{t("dashboard.training.stats.inProgress")}</p>
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
                  <p className="text-sm text-muted-foreground">{t("dashboard.training.stats.completed")}</p>
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
                  <p className="text-sm text-muted-foreground">{t("dashboard.training.stats.totalTime")}</p>
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
                  <p className="text-sm text-muted-foreground">{t("dashboard.training.stats.certificates")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Courses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">{t("dashboard.training.learningPath")}</h2>
            <Button variant="ghost" className="text-primary">
              {t("common.actions.viewAll")} <ChevronRight className="w-4 h-4 ml-1" />
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
                      {t(`dashboard.training.category.${course.categoryKey}`)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {t(`dashboard.training.level.${course.levelKey}`)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                    {t(`dashboard.training.courses.${course.key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {t(`dashboard.training.courses.${course.key}.description`)}
                  </p>

                  {course.progress > 0 && course.progress < 100 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{t("dashboard.training.progress")}</span>
                        <span className="font-medium text-foreground">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  )}

                  {course.progress === 100 && (
                    <div className="flex items-center gap-2 text-emerald-600 mb-3">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">{t("dashboard.training.completed")}</span>
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
                        {t("dashboard.training.startCourse")}
                      </>
                    ) : course.progress === 100 ? (
                      <>
                        <Download className="w-4 h-4" />
                        {t("dashboard.training.getCertificate")}
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        {t("dashboard.training.continueCourse")}
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
                  <span>{t("dashboard.training.courseLibrary")}</span>
                </CardTitle>
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
              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      cat.key === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {t(`dashboard.training.category.${cat.key}`)} ({cat.count})
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
                      <h3 className="font-medium text-foreground">
                        {t(`dashboard.training.courses.${course.key}.title`)}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{t(`dashboard.training.category.${course.categoryKey}`)}</span>
                        <span>{course.duration}</span>
                        <span>{t("dashboard.training.lessonsCount", { count: course.lessons })}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      course.levelKey === 'beginner' ? 'bg-emerald-100 text-emerald-700' :
                      course.levelKey === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {t(`dashboard.training.level.${course.levelKey}`)}
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
                <span>{t("dashboard.training.achievementsTitle")}</span>
              </CardTitle>
              <CardDescription>{t("dashboard.training.achievementsSubtitle")}</CardDescription>
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
                        {t(`dashboard.training.achievementsList.${achievement.key}.title`)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t(`dashboard.training.achievementsList.${achievement.key}.description`)}
                      </p>
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
