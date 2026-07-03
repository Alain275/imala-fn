import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { ChatWidget } from "@/components/ChatWidget"
import {
  Leaf,
  Sprout,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  Menu,
  X
} from "lucide-react"

const featureKeys = [
  {
    icon: "/crop advisory.png",
    key: "cropAdvisory",
  },
  {
    icon: "/Disease Detection.png",
    key: "diseaseDetection",
  },
  {
    icon: "/Weather Intelligence.png",
    key: "weatherIntelligence",
  },
] as const

const statKeys = [
  { value: "50,000+", key: "activeFarmers" },
  { value: "30", key: "districtsCovered" },
  { value: "85%", key: "yieldImprovement" },
  { value: "200+", key: "expertAgronomists" },
] as const

const testimonialNames = [
  "Emmanuel Habimana",
  "Marie Claire Uwimana",
  "Jean Baptiste Nsengiyumva",
]

const howItWorksStepKeys = [
  {
    step: "01",
    key: "createProfile",
    icon: "/Create.png",
    accent: "from-emerald-500 to-green-500",
    lineColor: "bg-emerald-500",
    borderColor: "border-emerald-500",
    innerTint: "from-emerald-500/15 to-transparent",
  },
  {
    step: "02",
    key: "getRecommendations",
    icon: "/Recommendations.png",
    accent: "from-blue-500 to-indigo-500",
    lineColor: "bg-blue-500",
    borderColor: "border-blue-500",
    innerTint: "from-blue-500/15 to-transparent",
  },
  {
    step: "03",
    key: "growSucceed",
    icon: "/Grow.png",
    accent: "from-fuchsia-500 to-pink-500",
    lineColor: "bg-fuchsia-500",
    borderColor: "border-fuchsia-500",
    innerTint: "from-fuchsia-500/15 to-transparent",
  },
] as const

export default function HomePage() {
  const { t } = useTranslation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop =
        document.scrollingElement?.scrollTop ??
        window.scrollY ??
        document.documentElement.scrollTop ??
        document.body.scrollTop ??
        0
      setIsScrolled(scrollTop > 0)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    document.addEventListener("scroll", onScroll, { passive: true, capture: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("scroll", onScroll, true)
    }
  }, [])

  const features = featureKeys.map((feature) => ({
    icon: feature.icon,
    title: t(`landing.features.${feature.key}.title`),
    description: t(`landing.features.${feature.key}.description`),
    details: t(`landing.features.${feature.key}.details`, { returnObjects: true }) as string[],
  }))

  const stats = statKeys.map((stat) => ({
    value: stat.value,
    label: t(`landing.stats.${stat.key}`),
  }))

  const testimonialItems = t("landing.testimonials.items", { returnObjects: true }) as {
    role: string
    content: string
  }[]
  const testimonials = testimonialNames.map((name, i) => ({
    name,
    role: testimonialItems[i].role,
    content: testimonialItems[i].content,
    rating: 5,
  }))

  const howItWorksSteps = howItWorksStepKeys.map((step) => ({
    ...step,
    title: t(`landing.howItWorks.${step.key}.title`),
    description: t(`landing.howItWorks.${step.key}.description`),
  }))

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md shadow-sm transition-colors ${
          isScrolled ? "bg-primary text-primary-foreground" : "bg-background/80"
        }`}
      >
        <nav className="container mx-auto px-4 py-2 sm:py-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between h-14 sm:h-16 ${isScrolled ? "pb-0" : "pb-2 sm:pb-4"}`}>
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span
                className={`text-lg sm:text-xl font-bold ${
                  isScrolled ? "text-primary-foreground" : "text-foreground"
                }`}
              >
                IMARA
              </span>
            </Link>

            <div className="hidden xl:flex flex-1 items-center justify-center px-6">
              <Input
                placeholder={t("common.search")}
                className={
                  isScrolled
                    ? "max-w-md h-10 sm:h-11 rounded-full border border-primary-foreground/20 bg-white/10 dark:bg-white/10 px-4 text-sm text-primary-foreground placeholder:text-primary-foreground/70 shadow-sm backdrop-blur-md focus-visible:border-primary-foreground focus-visible:ring-0"
                    : "max-w-lg h-10 sm:h-11 rounded-full border border-input bg-white/90 px-4 text-sm shadow-sm focus-visible:border-primary focus-visible:ring-0"
                }
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className={`lg:hidden ${isScrolled ? "text-primary-foreground hover:bg-white/10" : ""}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <LanguageSwitcher
                triggerClassName={
                  isScrolled
                    ? "border-primary-foreground/20 bg-white/10 text-primary-foreground hover:bg-white/20 h-9 sm:h-10"
                    : "h-9 sm:h-10"
                }
                contentClassName="light"
              />
              <Button
                variant="ghost"
                size="sm"
                className={`text-xs sm:text-sm hidden sm:flex ${isScrolled ? "text-primary-foreground" : ""}`}
                asChild
              >
                <Link to="/sign-in">{t("common.signIn")}</Link>
              </Button>
              <Button 
                size="sm" 
                className={`text-xs sm:text-sm hidden sm:flex ${isScrolled ? "bg-white/20 text-primary-foreground hover:bg-white/30" : ""}`} 
                asChild
              >
                <Link to="/register">{t("common.getStarted")}</Link>
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-border/20 py-4 space-y-4">
              <div className="flex flex-col gap-2">
                <a
                  href="#features"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isScrolled
                      ? "text-primary-foreground/90 hover:bg-white/10"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("common.nav.cropAdvisory")}
                </a>
                <a
                  href="#how-it-works"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isScrolled
                      ? "text-primary-foreground/90 hover:bg-white/10"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("common.nav.diseaseDetection")}
                </a>
                <a
                  href="#testimonials"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isScrolled
                      ? "text-primary-foreground/90 hover:bg-white/10"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("common.nav.weatherIntelligence")}
                </a>
                <a
                  href="#contact"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isScrolled
                      ? "text-primary-foreground/90 hover:bg-white/10"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("common.nav.soilAnalysis")}
                </a>
                <a
                  href="#contact"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isScrolled
                      ? "text-primary-foreground/90 hover:bg-white/10"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("common.nav.marketPrices")}
                </a>
                <a
                  href="#contact"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isScrolled
                      ? "text-primary-foreground/90 hover:bg-white/10"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("common.nav.trainingEducation")}
                </a>
              </div>
              
              {/* Mobile auth buttons */}
              <div className="flex flex-col gap-2 pt-4 border-t border-border/20">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-center ${isScrolled ? "text-primary-foreground" : ""}`}
                  asChild
                >
                  <Link to="/sign-in">{t("common.signIn")}</Link>
                </Button>
                <Button 
                  size="sm" 
                  className={`w-full justify-center ${isScrolled ? "bg-white/20 text-primary-foreground hover:bg-white/30" : ""}`} 
                  asChild
                >
                  <Link to="/register">{t("common.getStarted")}</Link>
                </Button>
              </div>
            </div>
          )}

          <div className="hidden lg:block">
            <div className="flex items-center justify-center gap-4 xl:gap-8 py-2 text-xs xl:text-sm font-medium overflow-x-auto">
              {isScrolled && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-primary-foreground whitespace-nowrap">IMARA</span>
                </div>
              )}
              <a
                href="#features"
                className={`transition-colors whitespace-nowrap ${
                  isScrolled
                    ? "text-primary-foreground/90 hover:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("common.nav.cropAdvisory")}
              </a>
              <a
                href="#how-it-works"
                className={`transition-colors whitespace-nowrap ${
                  isScrolled
                    ? "text-primary-foreground/90 hover:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("common.nav.diseaseDetection")}
              </a>
              <a
                href="#testimonials"
                className={`transition-colors whitespace-nowrap ${
                  isScrolled
                    ? "text-primary-foreground/90 hover:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("common.nav.weatherIntelligence")}
              </a>
              <a
                href="#contact"
                className={`transition-colors whitespace-nowrap ${
                  isScrolled
                    ? "text-primary-foreground/90 hover:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("common.nav.soilAnalysis")}
              </a>
               <a
                href="#contact"
                className={`transition-colors whitespace-nowrap ${
                  isScrolled
                    ? "text-primary-foreground/90 hover:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("common.nav.marketPrices")}
              </a>
              <a
                href="#contact"
                className={`transition-colors whitespace-nowrap ${
                  isScrolled
                    ? "text-primary-foreground/90 hover:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("common.nav.trainingEducation")}
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-amber-50" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 xl:py-32">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                {t("landing.hero.titlePrefix")}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">
                  {t("landing.hero.titleHighlight")}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-lg text-pretty">
                {t("landing.hero.subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button size="lg" className="gap-2 text-sm sm:text-base w-full sm:w-auto" asChild>
                  <Link to="/register">
                    {t("landing.hero.ctaPrimary")}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-sm sm:text-base w-full sm:w-auto dark:bg-background">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t("landing.hero.ctaSecondary")}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 border-2 border-background flex items-center justify-center text-white text-xs font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t("landing.hero.trustedBy", { count: "50,000+" })}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0">
              <div className="relative z-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl transform hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-foreground">{t("landing.hero.cardTitle")}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{t("landing.hero.cardSubtitle")}</p>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {[
                      t("landing.hero.maizeSuitability"),
                      t("landing.hero.beansSuitability"),
                      t("landing.hero.potatoSuitability"),
                    ].map((crop, i) => (
                      <div key={i} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-emerald-50">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-foreground">{crop}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weather Alert Card - Hidden on very small screens, repositioned on larger */}
              <div className="hidden sm:block absolute -bottom-4 lg:-bottom-6 left-2 lg:-left-6 bg-white rounded-xl lg:rounded-2xl p-3 lg:p-4 shadow-xl z-20 max-w-[180px] lg:max-w-none">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://png.pngtree.com/png-clipart/20250427/original/pngtree-a-vibrant-illustration-depicting-sun-behind-clouds-rain-and-lightning-bolt-png-image_20853346.png"
                      alt="Weather icon"
                      className="w-12 h-6 lg:w-20 lg:h-10 opacity-50"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm font-medium text-foreground truncate">{t("landing.hero.weatherAlertTitle")}</p>
                    <p className="text-[10px] lg:text-xs text-muted-foreground truncate">{t("landing.hero.weatherAlertSubtitle")}</p>
                  </div>
                </div>
              </div>

              {/* Price Alert Card - Hidden on very small screens, repositioned on larger */}
              <div className="hidden sm:block absolute -top-4 lg:-top-6 right-2 lg:-right-6 bg-white rounded-xl lg:rounded-2xl p-3 lg:p-4 shadow-xl z-20 max-w-[180px] lg:max-w-none">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://png.pngtree.com/png-clipart/20250715/original/pngtree-gold-and-silver-bar-graph-showing-financial-growth-png-image_21223836.png"
                      alt="Price increase"
                      className="w-12 h-6 lg:w-20 lg:h-10"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm font-medium text-foreground truncate">{t("landing.hero.maizePriceTitle")}</p>
                    <p className="text-[10px] lg:text-xs text-emerald-600 font-medium truncate">{t("landing.hero.maizePriceChange")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground">{stat.value}</p>
                <p className="text-sm sm:text-base text-primary-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 lg:mb-16">
            <h4 className="text-base sm:text-lg lg:text-xl font-semibold text-emerald-500 uppercase tracking-wider">
              {t("landing.features.eyebrow")}
            </h4>
            <h2 className="text-2xl sm:text-3xl mt-2 lg:text-4xl font-bold text-foreground text-gray-700 mb-4 text-balance">
              {t("landing.features.title")}
            </h2>

          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="h-[24rem] sm:h-[28rem] lg:h-[30rem] cursor-pointer perspective"
                style={{
                  perspective: '1000px',
                  transitionDelay: `${i * 100}ms`
                }}
              >
                <div
                  className="group relative w-full h-full transition-transform duration-700 ease-out"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'rotateY(0deg)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'rotateY(180deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'rotateY(0deg)';
                  }}
                >
                  {/* Front of card */}
                  <div
                    className="absolute w-full h-full bg-white rounded-sm px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center justify-center text-center"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  >
                    <div className="mb-4 sm:mb-6 flex h-40 sm:h-48 lg:h-56 w-full items-center justify-center">
                      <img
                        src={feature.icon}
                        alt={feature.title}
                        loading="eager"
                        decoding="sync"
                        width="200"
                        height="200"
                        className="object-contain drop-shadow-xl max-h-full w-auto"
                      />
                    </div>
                    <h3 className="w-full text-xl sm:text-2xl lg:text-[2rem] font-bold text-emerald-950">
                      {feature.title}
                    </h3>
                  </div>

                  {/* Back of card */}
                  <div
                    className="absolute w-full h-full bg-primary rounded-sm px-6 py-8 flex flex-col items-center justify-center text-center"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <div className="mb-6 flex justify-center">
                      <img
                        src={feature.icon}
                        alt={feature.title}
                        loading="eager"
                        decoding="sync"
                        width="96"
                        height="96"
                        className="h-24 w-24 object-contain"
                      />
                    </div>

                    <div className="divide-y divide-primary-foreground/30 space-y-3 w-full">
                      {feature.details.map((detail) => (
                        <div
                          key={detail}
                          className="py-3 text-center text-sm font-medium text-primary-foreground md:text-base"
                        >
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-12 lg:py-12 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-gray-800 mb-4 text-balance">
              {t("landing.howItWorks.title")}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground text-pretty">
              {t("landing.howItWorks.subtitle")}
            </p>
          </div>

          <div className="relative mx-auto max-w-5xl">
            <div className="relative z-10 grid grid-cols-1 gap-8 sm:gap-12 md:grid-cols-3 md:gap-8">
              {howItWorksSteps.map((step, idx) => (
                <div
                  key={step.step}
                  className="flex flex-col items-center"
                  style={{ transitionDelay: `${idx * 150}ms` }}
                >
                  <div className="relative mb-6 sm:mb-10 w-full rounded-xl sm:rounded-2xl border border-white/70 bg-white p-4 sm:p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                    <h3 className="mb-2 text-base sm:text-lg font-bold text-slate-900">{step.title}</h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-500">{step.description}</p>

                    <div className="absolute -bottom-3 left-1/2 hidden h-6 w-6 -translate-x-1/2 rotate-45 border-r border-b border-white/70 bg-white md:block" />
                  </div>

                  <div className="relative mb-6 sm:mb-10 flex w-full items-center justify-center">
                    <div className={`absolute left-0 right-0 top-1/2 z-0 h-0.5 -translate-y-1/2 ${step.lineColor}`} />
                    <div className={`absolute left-0 top-1/2 z-10 h-4 w-4 -translate-y-1/2 rounded-full border-2 bg-white ${step.borderColor}`} />
                    <div className={`relative z-20 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r ${step.accent} text-sm font-bold text-white shadow-lg`}>
                      {step.step}
                    </div>
                    <div className={`absolute right-0 top-1/2 z-10 h-4 w-4 -translate-y-1/2 rounded-full border-2 bg-white ${step.borderColor}`} />
                    <div className={`absolute top-full left-1/2 z-0 h-10 w-0.5 -translate-x-1/2 ${step.lineColor}`} />
                  </div>

                  <div className="group relative mt-2 flex h-32 w-32 sm:h-36 sm:w-36 lg:h-40 lg:w-40 cursor-pointer items-center justify-center transition-transform duration-500 hover:scale-[1.03]">
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-b ${step.accent} p-[10px] sm:p-[12px] lg:p-[14px] shadow-[0_15px_30px_rgba(0,0,0,0.15)] transition-transform duration-500 group-hover:scale-105`}>
                      <div className="h-full w-full rounded-full bg-gradient-to-t from-black/20 to-transparent p-1">
                        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white shadow-inner">
                          <div className={`absolute inset-0 bg-gradient-to-b ${step.innerTint} opacity-[0.14]`} />
                          <img
                            src={step.icon}
                            alt={step.title}
                            loading="eager"
                            decoding="sync"
                            width="64"
                            height="64"
                            className="relative z-10 h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 object-contain transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              {t("landing.testimonials.title")}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground text-pretty">
              {t("landing.testimonials.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-1 mb-3 sm:mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">&ldquo;{testimonial.content}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-emerald-600 to-green-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 text-balance">
            {t("landing.cta.title")}
          </h2>
          <p className="text-base sm:text-lg text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto text-pretty">
            {t("landing.cta.description", { count: "50,000+" })}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button size="lg" variant="secondary" className="gap-2 text-sm sm:text-base w-full sm:w-auto" asChild>
              <Link to="/register">
                {t("landing.cta.primaryButton")}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-sm sm:text-base bg-transparent text-white border-white hover:bg-white/10 w-full sm:w-auto dark:bg-transparent dark:border-white dark:hover:bg-white/10">
              {t("landing.cta.secondaryButton")}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-foreground text-background py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">IMARA</span>
              </div>
              <p className="text-sm text-background/70">
                {t("landing.footer.tagline")}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{t("landing.footer.featuresHeading")}</h4>
              <ul className="space-y-2 text-background/70 text-sm">
                <li><Link to="/dashboard/crops" className="hover:text-background transition-colors">{t("common.nav.cropAdvisory")}</Link></li>
                <li><Link to="/dashboard/disease" className="hover:text-background transition-colors">{t("common.nav.diseaseDetection")}</Link></li>
                <li><Link to="/dashboard/weather" className="hover:text-background transition-colors">{t("common.nav.weatherIntelligence")}</Link></li>
                <li><Link to="/dashboard/market" className="hover:text-background transition-colors">{t("common.nav.marketPrices")}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{t("landing.footer.companyHeading")}</h4>
              <ul className="space-y-2 text-background/70 text-sm">
                <li><a href="#" className="hover:text-background transition-colors">{t("landing.footer.companyLinks.aboutUs")}</a></li>
                <li><a href="#" className="hover:text-background transition-colors">{t("landing.footer.companyLinks.careers")}</a></li>
                <li><a href="#" className="hover:text-background transition-colors">{t("landing.footer.companyLinks.partners")}</a></li>
                <li><a href="#" className="hover:text-background transition-colors">{t("landing.footer.companyLinks.contact")}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{t("landing.footer.contactHeading")}</h4>
              <ul className="space-y-2 text-background/70 text-sm">
                <li>{t("landing.footer.address")}</li>
                <li>{t("landing.footer.phone")}</li>
                <li>{t("landing.footer.email")}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-background/20 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-xs sm:text-sm text-center sm:text-left">
              {t("landing.footer.copyright", { year: 2024, brand: "IMARA" })}
            </p>
            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-background/60">
              <a href="#" className="hover:text-background transition-colors">{t("landing.footer.privacyPolicy")}</a>
              <a href="#" className="hover:text-background transition-colors">{t("landing.footer.termsOfService")}</a>
            </div>
          </div>
        </div>
      </footer>

      <ChatWidget />
    </div>
  )
}
