import { Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarDays,
  Camera,
  CloudSun,
  Home,
  Leaf,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sprout,
  ThermometerSun,
  Upload,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { ChatWidget } from "@/components/ChatWidget"
import { useCurrentWeather } from "@/hooks/useWeather"

const fieldActions = [
  {
    key: "diseaseDetection",
    icon: Camera,
    href: "/dashboard/disease",
    tone: "bg-emerald-500",
  },
  {
    key: "cropAdvisory",
    icon: Bot,
    href: "/dashboard/crops",
    tone: "bg-lime-500",
  },
  {
    key: "weatherIntelligence",
    icon: CloudSun,
    href: "/dashboard/weather",
    tone: "bg-sky-500",
  },
]

const cropCards = [
  { key: "maize", match: "92%" },
  { key: "beans", match: "88%" },
  { key: "irishPotato", match: "85%" },
]

const alerts = [
  { key: "sprayingWindow", icon: ShieldCheck, color: "text-emerald-600" },
  { key: "diseaseRisk", icon: AlertTriangle, color: "text-amber-600" },
  { key: "plantingAdvice", icon: CalendarDays, color: "text-sky-600" },
]

const homeMobileNav = [
  { key: "home", href: "/", icon: Home, active: true },
  { key: "advisory", href: "/dashboard/crops", icon: Bot },
  { key: "scan", href: "/dashboard/disease", icon: Camera },
  { key: "weather", href: "/dashboard/weather", icon: CloudSun },
  { key: "account", href: "/sign-in", icon: UserRound },
]

export default function HomePage() {
  const { t } = useTranslation()
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
  const weatherQuery = useMemo(
    () => coords ? { lat: coords.lat, lon: coords.lon, location: t("home.weather.currentLocation") } : "Musanze",
    [coords, t]
  )
  const { data: currentWeather } = useCurrentWeather(weatherQuery)

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10 * 60 * 1000 }
    )
  }, [])

  return (
    <div className="min-h-screen bg-[#f5f7f2] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Leaf className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold leading-none">IMARA</p>
              <p className="hidden text-xs text-slate-500 sm:block">{t("home.header.subtitle")}</p>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center px-4 md:flex">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-10 rounded-full border-slate-200 bg-slate-50 pl-10"
                placeholder={t("home.header.searchPlaceholder")}
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher triggerClassName="h-10" contentClassName="light" />
            <Button variant="ghost" className="hidden sm:inline-flex" asChild>
              <Link to="/sign-in">{t("common.signIn")}</Link>
            </Button>
            <Button className="hidden bg-emerald-700 hover:bg-emerald-800 sm:inline-flex" asChild>
              <Link to="/register">{t("auth.register.title")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-8">
        <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="overflow-hidden rounded-lg bg-emerald-800 text-white shadow-sm">
            <div className="grid min-h-[420px] gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_0.85fr] lg:p-8">
              <div className="flex flex-col justify-between gap-8">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-sm text-emerald-50">
                    <MapPin className="h-4 w-4" />
                    {t("home.hero.location")}
                  </div>
                  <div className="space-y-3">
                    <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                      {t("home.hero.title")}
                    </h1>
                    <p className="max-w-xl text-base leading-7 text-emerald-50/85">
                      {t("home.hero.subtitle")}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {fieldActions.map((action) => (
                    <Link
                      key={action.key}
                      to={action.href}
                      className="group rounded-lg bg-white p-4 text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${action.tone} text-white`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <p className="font-semibold">{t(`home.fieldActions.${action.key}.title`)}</p>
                      <p className="mt-1 text-sm leading-5 text-slate-600">{t(`home.fieldActions.${action.key}.description`)}</p>
                      <ArrowRight className="mt-4 h-4 w-4 text-emerald-700 transition group-hover:translate-x-1" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex min-h-[320px] flex-col rounded-lg bg-white p-4 text-slate-950">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{t("home.scan.eyebrow")}</p>
                    <p className="font-semibold">{t("home.scan.title")}</p>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {t("home.scan.badge")}
                  </div>
                </div>

                <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-emerald-300 bg-emerald-50/70 p-5 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
                    <Upload className="h-7 w-7" />
                  </div>
                  <p className="mt-4 text-lg font-semibold">{t("home.scan.uploadTitle")}</p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">
                    {t("home.scan.description")}
                  </p>
                  <Button className="mt-5 bg-emerald-700 hover:bg-emerald-800" asChild>
                    <Link to="/dashboard/disease">{t("home.scan.button")}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <aside className="grid gap-5">
            <Card className="rounded-lg border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ThermometerSun className="h-5 w-5 text-amber-500" />
                  {t("home.weather.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-bold">{currentWeather?.temperature ?? 24}°C</p>
                    <p className="text-sm text-slate-500">{currentWeather?.condition ?? t("home.weather.loading")}</p>
                  </div>
                  <CloudSun className="h-14 w-14 text-sky-500" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="font-semibold">{currentWeather?.rainChance ?? 0}%</p>
                    <p className="text-slate-500">{t("home.weather.rain")}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="font-semibold">{currentWeather?.humidity ?? 0}%</p>
                    <p className="text-slate-500">{t("home.weather.humidity")}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="font-semibold">{currentWeather?.windSpeed ?? 0}</p>
                    <p className="text-slate-500">{t("home.weather.wind")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t("home.otherUsers.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-6 text-slate-600">
                  {t("home.otherUsers.description")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" asChild>
                    <Link to="/sign-in">{t("common.signIn")}</Link>
                  </Button>
                  <Button className="bg-emerald-700 hover:bg-emerald-800" asChild>
                    <Link to="/register">{t("auth.register.title")}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-lg border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-emerald-600" />
                {t("home.cropAdvisory.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cropCards.map((crop) => (
                <div key={crop.key} className="grid gap-3 rounded-lg border border-slate-100 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{t(`home.cropAdvisory.items.${crop.key}.crop`)}</p>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        {t("home.cropAdvisory.match", { value: crop.match })}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {t(`home.cropAdvisory.items.${crop.key}.stage`)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{t(`home.cropAdvisory.items.${crop.key}.action`)}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/dashboard/crops">{t("home.cropAdvisory.open")}</Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-lg border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-600" />
                {t("home.fieldAlerts.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {alerts.map((alert) => (
                <div key={alert.key} className="rounded-lg bg-slate-50 p-4">
                  <alert.icon className={`h-6 w-6 ${alert.color}`} />
                  <p className="mt-4 font-semibold">{t(`home.fieldAlerts.items.${alert.key}.title`)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{t(`home.fieldAlerts.items.${alert.key}.body`)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-emerald-900/10 bg-white/95 shadow-lg shadow-emerald-950/15 backdrop-blur lg:hidden">
        <div className="grid h-16 grid-cols-5 px-1">
          {homeMobileNav.map((item) => (
            <Link
              key={item.key}
              to={item.href}
              aria-current={item.active ? "page" : undefined}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition-colors ${
                item.active ? "text-emerald-700" : "text-slate-500 hover:text-slate-950"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="max-w-full truncate leading-none">{t(`home.mobileNav.${item.key}`)}</span>
            </Link>
          ))}
        </div>
      </nav>

      <ChatWidget />
    </div>
  )
}
