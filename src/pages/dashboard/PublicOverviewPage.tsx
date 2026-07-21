import { type FormEvent, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  ArrowRight,
  Bug,
  CloudRain,
  CloudSun,
  Droplets,
  Search,
  Sprout,
  Wind,
} from "lucide-react"

import { Header } from "@/components/header"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useCurrentWeather } from "@/hooks/useWeather"
import { getIntlLocale } from "@/lib/dateLocale"

const actions = [
  { key: "cropAdvisory", href: "/dashboard/crops", icon: Sprout, label: "Crop advisory" },
  { key: "diseaseDetection", href: "/dashboard/disease", icon: Bug, label: "Disease detection" },
  { key: "weatherIntelligence", href: "/dashboard/weather", icon: CloudSun, label: "Weather intelligence" },
] as const

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

  const visibleActions = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return actions
    return actions.filter((action) => {
      const translated = t(`home.fieldActions.${action.key}.title`, { defaultValue: action.label })
      return `${translated} ${action.label}`.toLowerCase().includes(term)
    })
  }, [query, t])

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (visibleActions[0]) navigate(visibleActions[0].href)
  }

  const today = new Intl.DateTimeFormat(getIntlLocale(i18n.language), {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date())

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Header
        title="Good morning, Imara"
        subtitle={`${today} · ${weather?.location || location}`}
        actions={<LanguageSwitcher />}
      />

      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col justify-center gap-4 overflow-hidden p-3 sm:p-6">
        <section className="grid min-h-0 gap-4 lg:grid-cols-[1.55fr_1fr]">
          <Link
            to="/dashboard/weather"
            className="relative flex min-h-[230px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 to-green-600 p-6 text-white shadow-md sm:p-8"
          >
            <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">Today</p>
                <p className="mt-1 text-sm text-emerald-50">{weather?.location || location}</p>
              </div>
              <Sprout className="h-14 w-14 text-lime-300" />
            </div>

            {loading ? (
              <Skeleton className="h-14 w-32 bg-white/20" />
            ) : (
              <div className="relative">
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-semibold tracking-tight">{Math.round(weather?.temperature ?? 22)}°</span>
                  <span className="pb-2 text-sm capitalize text-emerald-50">{weather?.condition || "Partly cloudy"}</span>
                </div>
                <div className="mt-4 flex gap-5 text-xs text-emerald-50 sm:text-sm">
                  <span className="flex items-center gap-1.5"><Droplets className="h-4 w-4" />{weather?.rainChance ?? 0}% rain</span>
                  <span className="flex items-center gap-1.5"><Wind className="h-4 w-4" />{weather?.windSpeed ?? 0} km/h</span>
                  <span className="hidden items-center gap-1.5 sm:flex"><CloudRain className="h-4 w-4" />Farming weather</span>
                </div>
              </div>
            )}
          </Link>

          <div className="grid gap-3">
            {actions.map((action) => (
              <Link
                key={action.key}
                to={action.href}
                className="group flex items-center justify-between rounded-2xl border bg-card px-5 py-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
              >
                <span className="flex min-w-0 items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
                    <action.icon className="h-5 w-5" />
                  </span>
                  <span className="truncate text-sm font-semibold text-foreground">
                    {t(`home.fieldActions.${action.key}.title`, { defaultValue: action.label })}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-emerald-600" />
              </Link>
            ))}
          </div>
        </section>

        <form onSubmit={submitSearch} className="relative shrink-0">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search IMARA services..."
            className="h-12 rounded-xl bg-card pl-11 pr-28 shadow-sm"
          />
          <Button type="submit" size="sm" className="absolute right-2 top-2 h-8 rounded-lg" disabled={!visibleActions.length}>
            Search
          </Button>
        </form>
      </main>
    </div>
  )
}
