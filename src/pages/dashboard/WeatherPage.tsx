import { type FormEvent, useEffect, useMemo, useState } from "react"
import { useTheme } from "next-themes"
import {
  AlertTriangle,
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  LocateFixed,
  MapPin,
  Menu,
  Moon,
  Search,
  Sun,
  Thermometer,
  Wind,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { NotificationsBell } from "@/components/NotificationsBell"
import { CommandCenterSidebar } from "@/components/CommandCenterSidebar"
import { CommandCenterMobileNav } from "@/components/CommandCenterMobileNav"
import {
  useCurrentWeather,
  useDailyForecast,
  useFarmingAlerts,
  useHourlyForecast,
} from "@/hooks/useWeather"
import type { DailyForecast } from "@/services/weather"

const FALLBACK_LOCATION = "Musanze"
const CURRENT_LOCATION = "Current location"

type WeatherLayer = "rain" | "wind" | "temp"

function WeatherIcon({ condition, className = "h-6 w-6" }: { condition: string; className?: string }) {
  if (condition === "sunny") return <Sun className={`${className} text-amber-500`} />
  if (condition === "rainy") return <CloudRain className={`${className} text-sky-500`} />
  if (condition === "cloudy") return <Cloud className={`${className} text-slate-400`} />
  return <CloudSun className={`${className} text-amber-400`} />
}

export default function WeatherPage() {
  const { resolvedTheme, setTheme } = useTheme()
  const [themeMounted, setThemeMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(() => {
    const lat = localStorage.getItem("imara_weather_lat")
    const lon = localStorage.getItem("imara_weather_lon")
    return lat && lon ? { lat: Number(lat), lon: Number(lon) } : null
  })
  const [activeLocation, setActiveLocation] = useState(localStorage.getItem("imara_weather_location") || FALLBACK_LOCATION)
  const [locationInput, setLocationInput] = useState("")
  const [locationStatus, setLocationStatus] = useState("Live feed connected")
  const [layer, setLayer] = useState<WeatherLayer>("rain")

  useEffect(() => setThemeMounted(true), [])

  const weatherQuery = useMemo(
    () => coords ? { lat: coords.lat, lon: coords.lon, location: CURRENT_LOCATION } : activeLocation,
    [activeLocation, coords]
  )
  const { data: current, loading: currentLoading } = useCurrentWeather(weatherQuery)
  const { data: daily, loading: dailyLoading } = useDailyForecast(weatherQuery, 7)
  const { data: hourly } = useHourlyForecast(weatherQuery, 12)
  const { data: alerts } = useFarmingAlerts(weatherQuery)

  const mapLatitude = coords?.lat ?? current?.latitude ?? -1.4997
  const mapLongitude = coords?.lon ?? current?.longitude ?? 29.634
  const windyLayer = layer === "rain" ? "rain" : layer === "wind" ? "wind" : "temp"
  const weatherMapUrl = `https://embed.windy.com/embed2.html?lat=${mapLatitude}&lon=${mapLongitude}&width=900&height=600&zoom=7&level=surface&overlay=${windyLayer}&product=ecmwf&menu=false&message=false&marker=false&pressure=false&type=map&location=coordinates&detail=false&metricWind=km%2Fh&metricTemp=%C2%B0C`

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Location unavailable · Using Musanze")
      return
    }
    setLocationStatus("Requesting current location…")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = { lat: position.coords.latitude, lon: position.coords.longitude }
        localStorage.setItem("imara_weather_location", CURRENT_LOCATION)
        localStorage.setItem("imara_weather_lat", String(next.lat))
        localStorage.setItem("imara_weather_lon", String(next.lon))
        window.dispatchEvent(new Event("imara-location-updated"))
        setCoords(next)
        setActiveLocation(CURRENT_LOCATION)
        setLocationStatus("Current location · Live feed connected")
      },
      () => setLocationStatus("Permission denied · Using saved location"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10 * 60 * 1000 }
    )
  }

  const submitLocation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = locationInput.trim()
    if (!next) return
    localStorage.removeItem("imara_weather_lat")
    localStorage.removeItem("imara_weather_lon")
    localStorage.setItem("imara_weather_location", next)
    window.dispatchEvent(new Event("imara-location-updated"))
    setCoords(null)
    setActiveLocation(next)
    setLocationStatus(`${next} · Forecast synchronized`)
    setLocationInput("")
  }

  const currentAlert = alerts?.[0]

  return (
    <div className="weather-shell h-screen overflow-hidden bg-[#eef8f1] text-[#17231b] dark:bg-[#101a14] dark:text-[#edf5ef]">
      <style>{`
        .weather-shell { position: relative; width: 100%; height: 100vh; overflow: hidden; }
        .weather-sidebar {
          position: fixed; inset: 0 auto 0 0; z-index: 50; display: flex; width: 280px;
          flex-direction: column; background: #2e4d3d; color: white; transform: translateX(0);
        }
        .weather-content { display: flex; height: 100%; min-width: 0; margin-left: 280px; flex-direction: column; }
        .weather-header {
          display: flex; height: 48px; flex: 0 0 48px; align-items: center;
          border-bottom: 1px solid #dce9df; background: rgba(255,255,255,.82); padding: 0 28px;
        }
        .weather-layout {
          display: grid; width: 100%; max-width: 1180px; margin: 0 auto;
          grid-template-columns: minmax(0, 1fr) 280px; align-items: start; gap: 20px;
        }
        .dark .weather-sidebar { background: #152a20; }
        .dark .weather-header { border-color: #294033; background: rgba(16,26,20,.94); }
        .weather-mobile-overlay, .weather-menu-button, .weather-mobile-close { display: none; }
        @media (max-width: 1199px) {
          .weather-sidebar { width: 230px; }
          .weather-content { margin-left: 230px; }
          .weather-layout { grid-template-columns: minmax(0, 1fr) 250px; }
        }
        @media (max-width: 900px) {
          .weather-layout { grid-template-columns: minmax(0, 1fr); }
        }
        @media (max-width: 767px) {
          .weather-sidebar { width: 280px; transform: translateX(-100%); transition: transform 250ms ease; }
          .weather-sidebar.is-open { transform: translateX(0); }
          .weather-content { margin-left: 0; }
          .weather-header { padding: 0 14px; }
          .weather-mobile-overlay { position: fixed; inset: 0; z-index: 40; display: block; background: rgba(0,0,0,.5); }
          .weather-menu-button { display: grid; width: 36px; height: 36px; place-items: center; }
          .weather-mobile-close { position: fixed; right: 16px; top: 16px; z-index: 60; display: grid; color: white; }
          .weather-primary { display: flex; flex-direction: column; }
          .weather-primary-heading { order: 0; }
          .weather-forecast { order: 1; margin: 0 0 12px !important; }
          .weather-map-panel { order: 2; }
          .weather-map-panel > div:last-child { height: 260px; min-height: 260px; }
          .weather-forecast-grid { grid-template-columns: minmax(0, 1fr) !important; gap: 4px; }
          .weather-forecast-card {
            display: grid; min-height: 42px; grid-template-columns: 54px 28px minmax(0,1fr) 38px;
            align-items: center; padding: 6px 10px; text-align: left;
          }
          .weather-forecast-card > div { margin: 0; justify-content: center; }
          .weather-forecast-card > p { margin: 0; }
        }
      `}</style>

      {mobileOpen && <button className="weather-mobile-overlay" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <CommandCenterSidebar
        active="weatherIntelligence"
        open={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
        className="weather-sidebar"
      />

      <div className="weather-content">
        <header className="weather-header">
          <button className="weather-menu-button mr-2" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-[15px] font-bold"><span className="hidden sm:inline">Agri-Precision Command</span><span className="sm:hidden">IMARA</span></h1>
          <form onSubmit={submitLocation} className="mr-2 hidden h-full w-[260px] items-center border-x border-[#dce9df] px-3 md:flex dark:border-[#294033]">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={locationInput}
              onChange={(event) => setLocationInput(event.target.value)}
              placeholder="Search sectors, locations…"
              className="h-full min-w-0 flex-1 bg-transparent pl-2 text-[10px] outline-none"
            />
          </form>
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {themeMounted && resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <NotificationsBell />
          <div className="hidden sm:block"><LanguageSwitcher /></div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-3 pb-20 pt-3 sm:p-5 md:pb-5">
          <div className="weather-layout">
            <div className="weather-primary min-w-0">
              <div className="weather-primary-heading mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-medium">Meteorological Sector Data</h2>
                  <p className="mt-1 text-[9px] text-muted-foreground">Real-time agricultural weather intelligence and forecasting</p>
                </div>
                <div className="flex items-center gap-2 text-[8px] text-[#5e8a41]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#91ed2c]" />
                  Live feed · {locationStatus}
                </div>
              </div>

              <section className="weather-map-panel overflow-hidden rounded-[5px] border border-[#d7e5da] bg-white shadow-[0_8px_30px_rgba(35,72,50,.045)] dark:border-[#2b4235] dark:bg-[#17271e]">
                <div className="flex min-h-[56px] flex-wrap items-center gap-3 border-b border-[#dfe9e1] px-4 py-3 dark:border-[#2b4235]">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-medium">
                      <CloudRain className="h-4 w-4 text-[#4b7556]" />
                      {layer === "rain" ? "Live Precipitation Radar" : layer === "wind" ? "Live Wind Map" : "Live Temperature Map"}
                    </h3>
                    <p className="mt-0.5 text-[8px] text-muted-foreground">{current?.location || activeLocation}</p>
                  </div>
                  <div className="ml-auto flex gap-1">
                    {(["rain", "wind", "temp"] as WeatherLayer[]).map((item) => (
                      <button
                        key={item}
                        onClick={() => setLayer(item)}
                        className={`h-7 border px-3 text-[8px] font-semibold uppercase ${layer === item ? "border-[#86bd4a] bg-[#edf7e8] text-[#365b3e] dark:bg-[#294132] dark:text-[#a8dc8c]" : "border-[#dce7df] text-muted-foreground dark:border-[#30473a]"}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <button onClick={requestLocation} className="grid h-7 w-7 place-items-center border border-[#dce7df] text-muted-foreground dark:border-[#30473a]" aria-label="Use current location">
                    <LocateFixed className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="relative h-[min(51vh,500px)] min-h-[370px] overflow-hidden bg-[#cad8cd]">
                  <iframe
                    key={`${mapLatitude}:${mapLongitude}:${layer}`}
                    title={`Live ${layer} map for ${current?.location || activeLocation}`}
                    src={weatherMapUrl}
                    className="h-full w-full border-0"
                    loading="eager"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <span className="pointer-events-none absolute bottom-3 left-3 bg-[#254433]/90 px-2 py-1 text-[8px] text-white">
                    {current?.location || activeLocation} · {layer.toUpperCase()} layer
                  </span>
                </div>
              </section>

              <section className="weather-forecast mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-[9px] font-bold uppercase tracking-[.12em] text-muted-foreground">7-day precision outlook</h3>
                  <span className="text-[8px] text-muted-foreground">ECMWF synchronized</span>
                </div>
                <div className="weather-forecast-grid grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {dailyLoading
                    ? Array.from({ length: 7 }).map((_, index) => <div key={index} className="h-[104px] animate-pulse border border-[#dce7df] bg-white/60 dark:border-[#30473a] dark:bg-[#17271e]" />)
                    : (daily ?? []).slice(0, 7).map((day, index) => <ForecastCard key={day.date} day={day} active={index === 0} />)
                  }
                </div>
              </section>
            </div>

            <aside className="weather-conditions min-w-0 space-y-4">
              <section className="rounded-[5px] border border-[#d7e5da] bg-white p-5 shadow-[0_8px_30px_rgba(35,72,50,.045)] dark:border-[#2b4235] dark:bg-[#17271e]">
                <p className="text-[8px] font-bold uppercase tracking-[.12em] text-muted-foreground">Current conditions</p>
                <div className="mt-3 flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{current?.location || activeLocation}</h2>
                    <p className="mt-1 text-[9px] capitalize text-muted-foreground">{current?.condition || "Synchronizing"}</p>
                  </div>
                  <WeatherIcon condition={current?.conditionCode || "partly_cloudy"} />
                </div>
                <div className="mt-5 flex items-start">
                  <span className="text-5xl font-light tracking-tight">{currentLoading ? "—" : Math.round(current?.temperature ?? 22)}°</span>
                  <span className="mt-2 text-xs text-muted-foreground">C</span>
                </div>
                <div className="mt-5 space-y-4 border-t border-[#e2ebe4] pt-4 text-[9px] dark:border-[#2b4235]">
                  <ConditionRow icon={Droplets} label="Humidity" value={`${current?.humidity ?? 0}%`} />
                  <ConditionRow icon={Wind} label="Wind" value={`${current?.windSpeed ?? 0} km/h`} />
                  <ConditionRow icon={Thermometer} label="Feels like" value={`${Math.round(current?.feelsLike ?? current?.temperature ?? 22)}°C`} />
                  <ConditionRow icon={CloudRain} label="Rain chance" value={`${current?.rainChance ?? 0}%`} />
                </div>
              </section>

              <section className="rounded-[5px] border border-[#d7e5da] bg-white p-5 shadow-[0_8px_30px_rgba(35,72,50,.045)] dark:border-[#2b4235] dark:bg-[#17271e]">
                <p className="text-[8px] font-bold uppercase tracking-[.12em] text-muted-foreground">Agronomic telemetry</p>
                <div className="mt-4 space-y-4">
                  <TelemetryRow label="Solar radiation" value={`${Math.max(0, Math.round((current?.uvIndex ?? 0) * 105))} W/m²`} tone="text-[#66991f]" />
                  <TelemetryRow label="Pressure" value={`${current?.pressure ?? 0} hPa`} />
                  <TelemetryRow label="Visibility" value={`${current?.visibility ?? 0} km`} />
                </div>
                {currentAlert && (
                  <div className="mt-5 border-l-2 border-[#e02c38] bg-[#fff3f3] p-3 dark:bg-[#421d20]">
                    <p className="flex items-center gap-1.5 text-[8px] font-bold uppercase text-[#c71f2b] dark:text-[#ff9ca3]"><AlertTriangle className="h-3 w-3" /> {currentAlert.title}</p>
                    <p className="mt-1 line-clamp-3 text-[9px] leading-4 text-[#67474a] dark:text-[#e0b6b9]">{currentAlert.message}</p>
                  </div>
                )}
              </section>

              {hourly?.[0] && (
                <section className="rounded-[5px] border border-[#d7e5da] bg-white p-4 text-[9px] shadow-[0_8px_30px_rgba(35,72,50,.045)] dark:border-[#2b4235] dark:bg-[#17271e]">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Next hour</span>
                    <span className="font-semibold">{hourly[0].temperature}° · {hourly[0].rainChance}% rain</span>
                  </div>
                </section>
              )}
            </aside>
          </div>
        </main>
      </div>

      {mobileOpen && <button className="weather-mobile-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>}
      <CommandCenterMobileNav active="weatherIntelligence" />
    </div>
  )
}

function ConditionRow({ icon: Icon, label, value }: { icon: typeof Wind; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function TelemetryRow({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#edf2ee] pb-3 text-[9px] last:border-0 last:pb-0 dark:border-[#293e32]">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${tone}`}>{value}</span>
    </div>
  )
}

function ForecastCard({ day, active }: { day: DailyForecast; active: boolean }) {
  return (
    <div className={`weather-forecast-card min-w-0 border p-3 text-center ${active ? "border-[#9bdd4f] bg-[#f2faeb] dark:bg-[#263d2e]" : "border-[#dce7df] bg-white dark:border-[#30473a] dark:bg-[#17271e]"}`}>
      <p className="truncate text-[8px] font-bold uppercase text-muted-foreground">{active ? "Today" : day.day}</p>
      <div className="my-2 flex justify-center"><WeatherIcon condition={day.condition} className="h-5 w-5" /></div>
      <p className="text-xs font-semibold">{day.tempHigh}° <span className="text-[9px] font-normal text-muted-foreground">{day.tempLow}°</span></p>
      <p className="mt-1 text-[8px] text-sky-600">{day.rainChance}%</p>
    </div>
  )
}
