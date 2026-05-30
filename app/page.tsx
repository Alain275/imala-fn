"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Leaf, 
  Sprout, 
  Bug, 
  CloudSun, 
  Mountain, 
  TrendingUp,
  BookOpen,
  Users,
  Smartphone,
  Globe,
  CheckCircle,
  ArrowRight,
  Play,
  Star
} from "lucide-react"

const features = [
  {
    icon: Sprout,
    title: "Crop Advisory",
    description: "AI-powered recommendations for optimal crop selection based on your soil and climate conditions.",
    gradient: "from-emerald-500 to-green-600"
  },
  {
    icon: Bug,
    title: "Disease Detection",
    description: "Upload photos of your crops to instantly identify diseases and get treatment recommendations.",
    gradient: "from-amber-600 to-orange-700"
  },
  {
    icon: CloudSun,
    title: "Weather Intelligence",
    description: "Accurate weather forecasts with farming-specific alerts to protect your crops.",
    gradient: "from-sky-500 to-blue-600"
  },
  {
    icon: Mountain,
    title: "Soil Analysis",
    description: "Comprehensive soil health assessments with fertilizer and amendment recommendations.",
    gradient: "from-amber-700 to-yellow-800"
  },
  {
    icon: TrendingUp,
    title: "Market Prices",
    description: "Real-time crop prices and market trends to help you sell at the best time.",
    gradient: "from-emerald-600 to-teal-700"
  },
  {
    icon: BookOpen,
    title: "Training & Education",
    description: "Video tutorials and courses in local languages to improve your farming skills.",
    gradient: "from-violet-500 to-purple-600"
  },
]

const stats = [
  { value: "50,000+", label: "Active Farmers" },
  { value: "30", label: "Districts Covered" },
  { value: "85%", label: "Yield Improvement" },
  { value: "200+", label: "Expert Agronomists" },
]

const testimonials = [
  {
    name: "Emmanuel Habimana",
    role: "Maize Farmer, Eastern Province",
    content: "IMARA helped me double my maize yield in just one season. The crop advisory recommendations were exactly what I needed.",
    rating: 5
  },
  {
    name: "Marie Claire Uwimana",
    role: "Vegetable Farmer, Kigali",
    content: "The disease detection feature saved my entire tomato crop. I was able to identify and treat the blight before it spread.",
    rating: 5
  },
  {
    name: "Jean Baptiste Nsengiyumva",
    role: "Cooperative Leader, Northern Province",
    content: "Our cooperative now uses IMARA for all our farming decisions. The market price alerts have improved our profits by 40%.",
    rating: 5
  },
]

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)

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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md shadow-sm transition-colors ${
          isScrolled ? "bg-primary text-primary-foreground" : "bg-background/80"
        }`}
      >
        <nav className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between pb-4 h-16 ${isScrolled ? "hidden" : ""}`}>
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span
                className={`text-xl font-bold ${
                  isScrolled ? "text-primary-foreground" : "text-foreground"
                }`}
              >
                IMARA
              </span>
            </Link>
            
            <div className="hidden lg:flex flex-1 items-center justify-center px-6">
              <Input
                placeholder="Search..."
                className={
                  isScrolled
                    ? "max-w-md bg-white/10 text-primary-foreground placeholder:text-primary-foreground/70 border-primary-foreground/30 focus-visible:ring-primary-foreground rounded-full border-1 focus-visible:ring-primary"
                    : "max-w-lg rounded-full border-1 focus-visible:ring-primary"
                }
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className={isScrolled ? "text-primary-foreground" : undefined}
                asChild
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button className={isScrolled ? "text-primary-foreground" : undefined} asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </div>
          </div>

          <div className="">
            <div className="flex items-center justify-center gap-8 py-2 text-sm font-medium">
              {isScrolled && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-primary-foreground">IMARA</span>
                </div>
              )}
              <Link
                href="#features"
                className={`transition-colors ${
                  isScrolled
                    ? "text-primary-foreground/90 hover:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Crop Advisory
              </Link>
              <Link
                href="#how-it-works"
                className={`transition-colors ${
                  isScrolled
                    ? "text-primary-foreground/90 hover:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Disease Detection
              </Link>
              <Link
                href="#testimonials"
                className={`transition-colors ${
                  isScrolled
                    ? "text-primary-foreground/90 hover:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Weather Intelligence
              </Link>
              <Link
                href="#contact"
                className={`transition-colors ${
                  isScrolled
                    ? "text-primary-foreground/90 hover:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Soil Analysis
              </Link>
               <Link
                href="#contact"
                className={`transition-colors ${
                  isScrolled
                    ? "text-primary-foreground/90 hover:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Market Prices
              </Link>
              <Link
                href="#contact"
                className={`transition-colors ${
                  isScrolled
                    ? "text-primary-foreground/90 hover:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Training & Education
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-amber-50" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Smart Farming for a{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">
                  Better Harvest
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg text-pretty">
                IMARA is Rwanda&apos;s leading AI-powered agricultural platform, helping farmers increase yields, 
                detect diseases early, and connect with markets - all from your phone.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2 text-base" asChild>
                  <Link href="/dashboard">
                    Start Farming Smarter
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-base">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </Button>
              </div>
              
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 border-2 border-background flex items-center justify-center text-white text-xs font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Trusted by 50,000+ farmers
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Sprout className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Crop Recommendation</p>
                      <p className="text-sm text-muted-foreground">Based on your soil analysis</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {["Maize - 92% suitability", "Beans - 88% suitability", "Irish Potatoes - 85% suitability"].map((crop, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-foreground">{crop}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl z-20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10  flex items-center justify-center">
                    
                    <img
                      src="https://png.pngtree.com/png-clipart/20250427/original/pngtree-a-vibrant-illustration-depicting-sun-behind-clouds-rain-and-lightning-bolt-png-image_20853346.png"
                      alt="Weather icon"
                      className="w-20 h-10 opacity-50"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Weather Alert</p>
                    <p className="text-xs text-muted-foreground">Rain expected tomorrow</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl z-20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10  flex items-center justify-center">
                    <img
                      src="https://png.pngtree.com/png-clipart/20250715/original/pngtree-gold-and-silver-bar-graph-showing-financial-growth-png-image_21223836.png"
                      alt="Price increase"
                      className="w-20 h-10"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Maize Price</p>
                    <p className="text-xs text-emerald-600 font-medium">+5.2% this week</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-primary-foreground">{stat.value}</p>
                <p className="text-primary-foreground/80 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
              Everything You Need to Farm Smarter
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              IMARA combines AI technology with agricultural expertise to provide you with 
              actionable insights for every aspect of your farming journey.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="border-0 shadow-lg card-hover overflow-hidden group">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
              How IMARA Works
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Get started in minutes and transform your farming practices
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Your Profile", description: "Tell us about your farm location, size, and the crops you grow.", icon: Users },
              { step: "02", title: "Get Recommendations", description: "Our AI analyzes your data and provides personalized farming advice.", icon: Smartphone },
              { step: "03", title: "Grow & Succeed", description: "Follow the recommendations, track your progress, and increase your yields.", icon: Globe },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-primary/10 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative bg-card rounded-2xl p-8 shadow-lg">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
              Trusted by Farmers Across Rwanda
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              See how IMARA is transforming agriculture for thousands of farmers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">&ldquo;{testimonial.content}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-emerald-600 to-green-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-balance">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto text-pretty">
            Join 50,000+ farmers already using IMARA to grow better crops and increase their income.
            It&apos;s free to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="gap-2 text-base" asChild>
              <Link href="/dashboard">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-base bg-transparent text-white border-white hover:bg-white/10">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">IMARA</span>
              </div>
              <p className="text-background/70">
                Empowering Rwandan farmers with smart agricultural technology.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-background/70">
                <li><Link href="/dashboard/crops" className="hover:text-background transition-colors">Crop Advisory</Link></li>
                <li><Link href="/dashboard/disease" className="hover:text-background transition-colors">Disease Detection</Link></li>
                <li><Link href="/dashboard/weather" className="hover:text-background transition-colors">Weather Intelligence</Link></li>
                <li><Link href="/dashboard/market" className="hover:text-background transition-colors">Market Prices</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-background/70">
                <li><a href="#" className="hover:text-background transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Partners</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-background/70">
                <li>Kigali, Rwanda</li>
                <li>+250 788 000 000</li>
                <li>info@imara.rw</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-background/20 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-sm">
              &copy; 2024 IMARA. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-background/60">
              <a href="#" className="hover:text-background transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-background transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
