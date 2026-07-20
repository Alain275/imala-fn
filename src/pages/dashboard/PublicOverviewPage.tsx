import { type FormEvent, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  ArrowRight,
  Camera,
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  Search,
  Sprout,
  Sun,
  Wind,
} from "lucide-react"

import { Header } from "@/components/header"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useCurrentWeather } from "@/hooks/useWeather"
import { getIntlLocale } from "@/lib/dateLocale"

const services = [
  { key: "cropAdvisory", href: "/dashboard/crops", icon: Sprout, color: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300", search: "crop plant seed advisory" },
  { key: "diseaseDetection", href: "/dashboard/disease", icon: Camera, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300", search: "disease photo camera detect pest" },
  { key: "weatherIntelligence", href: "/dashboard/weather", icon: CloudSun, color: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300", search: "weather rain forecast temperature" },
] as const

function WeatherIcon({ condition }: { condition?: string }) {
  if (condition === "sunny") return <Sun className="h-12 w-12 text-amber-300 sm:h-14 sm:w-14" />
  if (condition === "rainy") return <CloudRain className="h-12 w-12 text-sky-100 sm:h-14 sm:w-14" />
  if (condition === "cloudy") return <Cloud className="h-12 w-12 text-slate-100 sm:h-14 sm:w-14" />
  return <CloudSun className="h-12 w-12 text-amber-200 sm:h-14 sm:w-14" />
}

export default function PublicOverviewPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = localStorage.getItem("imara_weather_location") || "Musanze"
  const latitude = localStorage.getItem("imara_weather_lat")
  const longitude = localStorage.getItem("imara_weather_lon")
  const weatherQuery = latitude && longitude
    ? { location, lat: Number(latitude), lon: Number(longitude) }
    : location
  const { data: weather, loading } = useCurrentWeather(weatherQuery)
  const [query, setQuery] = useState("")

  const visibleServices = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return services
    return services.filter((service) => {
      const title = t(`home.fieldActions.${service.key}.title`).toLowerCase()
      return `${title} ${service.search}`.includes(term)
    })
  }, [query, t])

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (visibleServices[0]) navigate(visibleServices[0].href)
  }

  const today = new Intl.DateTimeFormat(getIntlLocale(i18n.language), {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(new Date())

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Header
        title="IMARA"
        subtitle={t("home.overview.pageSubtitle")}
        actions={<LanguageSwitcher />}
      />

      <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-3 overflow-hidden p-3 sm:gap-4 sm:p-5">
        <Link
          to="/dashboard/weather"
          className="relative flex min-h-0 flex-1 items-center justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-600 p-5 text-white shadow-lg sm:p-7"
        >
          <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="relative min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-100">Today · {today}</p>
            <p className="mt-1 truncate text-sm text-emerald-50">{weather?.location || location}</p>
            {loading ? (
              <Skeleton className="mt-3 h-10 w-28 bg-white/20" />
            ) : (
              <div className="mt-2 flex items-end gap-3">
                <span className="text-4xl font-bold sm:text-5xl">{Math.round(weather?.temperature ?? 0)}°</span>
                <span className="pb-1 text-sm capitalize text-emerald-50">{weather?.condition || "Weather available"}</span>
              </div>
            )}
            <div className="mt-3 flex gap-4 text-xs text-emerald-50 sm:text-sm">
              <span className="flex items-center gap-1"><Droplets className="h-3.5 w-3.5" />{weather?.rainChance ?? 0}% rain</span>
              <span className="flex items-center gap-1"><Wind className="h-3.5 w-3.5" />{weather?.windSpeed ?? 0} km/h</span>
            </div>
          </div>
          <div className="relative shrink-0 pl-3"><WeatherIcon condition={weather?.conditionCode} /></div>
        </Link>

        <form onSubmit={submitSearch} className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="What service do you need?"
            className="h-11 rounded-2xl bg-card pl-10 pr-24 shadow-sm"
          />
          <Button type="submit" size="sm" className="absolute right-1.5 top-1.5 h-8 rounded-xl" disabled={!visibleServices.length}>
            Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </form>

        <section className="shrink-0">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Choose a service</h2>
            <Link to="/sign-in" className="text-xs font-medium text-primary hover:underline">Sign in for the full app</Link>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {services.map((service) => {
              const isMatch = visibleServices.includes(service)
              return (
                <Link
                  key={service.key}
                  to={service.href}
                  className={`flex min-w-0 flex-col items-center rounded-2xl border bg-card p-2.5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:p-4 sm:text-left ${isMatch ? "opacity-100" : "opacity-35"}`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${service.color}`}>
                    <service.icon className="h-5 w-5" />
                  </span>
                  <span className="mt-1.5 line-clamp-2 text-[11px] font-semibold leading-tight text-foreground sm:ml-3 sm:mt-0 sm:text-sm">
                    {t(`home.fieldActions.${service.key}.title`)}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
