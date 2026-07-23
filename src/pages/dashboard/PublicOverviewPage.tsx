import { type FormEvent, useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "next-themes"
import {
  AlertTriangle,
  ArrowRight,
  Bug,
  CloudSun,
  Droplets,
  Menu,
  Moon,
  Search,
  Sprout,
  Sun,
  Thermometer,
  Wind,
  X,
} from "lucide-react"

import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { NotificationsBell } from "@/components/NotificationsBell"
import { CommandCenterSidebar } from "@/components/CommandCenterSidebar"
import { CommandCenterMobileNav } from "@/components/CommandCenterMobileNav"
import { useCurrentWeather } from "@/hooks/useWeather"
import { getIntlLocale } from "@/lib/dateLocale"
import { cn } from "@/lib/utils"

const actions = [
  {
    key: "cropAdvisory",
    href: "/dashboard/crops",
    icon: Sprout,
    label: "Crop advisory",
    eyebrow: "Crop recommendation",
    description: "Review crop guidance and recommendations for your current field conditions.",
  },
  {
    key: "diseaseDetection",
    href: "/dashboard/disease",
    icon: Bug,
    label: "Disease detection",
    eyebrow: "Pest detection",
    description: "Scan a crop image to identify possible disease or pest pressure.",
  },
  {
    key: "weatherIntelligence",
    href: "/dashboard/weather",
    icon: CloudSun,
    label: "Weather intelligence",
    eyebrow: "Weather advisory",
    description: "Check the latest forecast before planning your next field activity.",
  },
] as const

export default function PublicOverviewPage() {
  const { t, i18n } = useTranslation()
  const { resolvedTheme, setTheme } = useTheme()
  const navigate = useNavigate()
  const location = localStorage.getItem("imara_weather_location") || "Musanze"
  const latitude = localStorage.getItem("imara_weather_lat")
  const longitude = localStorage.getItem("imara_weather_lon")
  const weatherQuery = latitude && longitude
    ? { location, lat: Number(latitude), lon: Number(longitude) }
    : location
  const { data: weather } = useCurrentWeather(weatherQuery)
  const [query, setQuery] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [themeMounted, setThemeMounted] = useState(false)

  useEffect(() => setThemeMounted(true), [])

  const visibleActions = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return actions
    return actions.filter((action) => {
      const translated = t(`home.fieldActions.${action.key}.title`, { defaultValue: action.label })
      return `${translated} ${action.label} ${action.eyebrow}`.toLowerCase().includes(term)
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
  const mapLatitude = latitude ? Number(latitude) : weather?.latitude ?? -1.4997
  const mapLongitude = longitude ? Number(longitude) : weather?.longitude ?? 29.634
  const liveMapUrl = `https://maps.google.com/maps?q=${mapLatitude},${mapLongitude}&z=15&t=k&output=embed`

  return (
    <div className="imara-command-shell h-screen overflow-hidden bg-[#edf8f1] font-sans text-[#131b16]">
      <style>{`
        .imara-command-shell {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #edf8f1;
          color: #131b16;
        }
        .imara-command-sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 50;
          display: flex;
          width: 280px;
          flex-direction: column;
          background: #2e4d3d;
          color: #fff;
          transform: translateX(0);
        }
        .imara-command-content {
          display: flex;
          height: 100%;
          min-width: 0;
          margin-left: 280px;
          flex-direction: column;
        }
        .imara-command-main {
          min-height: 0;
          flex: 1 1 auto;
          overflow-y: auto;
        }
        .imara-command-grid {
          display: grid;
          width: 100%;
          max-width: 1010px;
          margin: 0 auto;
          grid-template-columns: minmax(0, 650px) minmax(240px, 280px);
          align-items: start;
          justify-content: center;
          gap: 20px;
        }
        .imara-map-column,
        .imara-actions-column {
          min-width: 0;
        }
        .imara-map-frame {
          position: relative;
          height: min(54vh, 500px);
          min-height: 360px;
          overflow: hidden;
        }
        .imara-telemetry-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }
        .command-mobile-overlay,
        .command-menu-button,
        .command-mobile-close {
          display: none;
        }
        .imara-command-header {
          background: rgba(255,255,255,.78);
          border-color: #dce9df;
        }
        .imara-surface {
          background: #fff;
          border-color: #dce9df;
        }
        .imara-alert-panel { background: #f5fbf7; }
        .imara-header-icon {
          display: grid;
          width: 36px;
          height: 36px;
          flex: 0 0 36px;
          place-items: center;
          border-radius: 50%;
          color: #5d6b62;
          transition: background-color 160ms ease, color 160ms ease;
        }
        .imara-header-icon:hover {
          background: #e8f3ea;
          color: #20372a;
        }
        .dark .imara-command-shell {
          background: #101a14;
          color: #eef6f0;
        }
        .dark .imara-command-sidebar { background: #152a20; }
        .dark .imara-command-header {
          background: rgba(16,26,20,.92);
          border-color: #294033;
          color: #eef6f0;
        }
        .dark .imara-command-main { background: #101a14; }
        .dark .imara-surface {
          background: #18271f !important;
          border-color: #2b4235 !important;
          color: #edf5ef;
        }
        .dark .imara-alert-panel { background: #132219 !important; }
        .dark .imara-surface h2,
        .dark .imara-surface h3,
        .dark .imara-telemetry-card p,
        .dark .imara-stream-panel span {
          color: #edf5ef !important;
        }
        .dark .imara-surface p,
        .dark .imara-stream-panel > div span:first-child {
          color: #a4b4aa !important;
        }
        .dark .imara-action-card { background: #1b2c22 !important; }
        .dark .imara-header-icon {
          color: #b9c8be;
        }
        .dark .imara-header-icon:hover {
          background: #24382c;
          color: #fff;
        }
        @media (max-width: 1199px) {
          .imara-command-sidebar { width: 220px; }
          .imara-command-content { margin-left: 220px; }
          .imara-command-grid {
            grid-template-columns: minmax(0, 1.7fr) minmax(220px, .75fr);
          }
        }
        @media (max-width: 767px) {
          .imara-command-sidebar {
            width: 280px;
            transform: translateX(-100%);
            transition: transform 250ms ease;
          }
          .imara-command-sidebar.command-sidebar-open { transform: translateX(0); }
          .imara-command-content { margin-left: 0; }
          .imara-command-grid { grid-template-columns: minmax(0, 1fr); }
          .imara-map-frame {
            height: 190px;
            min-height: 0;
          }
          .imara-telemetry-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
          .command-mobile-overlay {
            position: fixed;
            inset: 0;
            z-index: 40;
            display: block;
            background: rgba(0,0,0,.5);
          }
          .command-menu-button {
            display: grid;
            flex: 0 0 36px;
            place-items: center;
          }
          .command-mobile-close {
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 60;
            display: grid;
            place-items: center;
            color: #fff;
          }
        }
        @media (min-width: 768px) and (max-width: 900px) {
          .imara-command-main { padding-left: 12px !important; padding-right: 12px !important; }
          .imara-command-grid {
            grid-template-columns: minmax(0, 1fr) 205px;
            gap: 12px;
          }
        }
      `}</style>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="command-mobile-overlay fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <CommandCenterSidebar
        active="dashboard"
        open={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
        className="imara-command-sidebar"
      />

      <div className="imara-command-content flex h-full flex-col">
        <header className="imara-command-header flex h-[45px] shrink-0 items-center border-b border-[#dce9df] bg-white/75 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="command-menu-button mr-3 text-[#294a3b] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-bold"><span className="hidden sm:inline">Agri-Precision Command</span><span className="sm:hidden">IMARA</span></h1>
          </div>
          <span className="mr-5 hidden text-[9px] font-medium text-[#68766d] xl:block">Good morning, Imara</span>
          <form onSubmit={submitSearch} className="relative hidden h-full w-[260px] border-x border-[#e0ebe2] md:block">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#748078]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search sectors..."
              className="h-full w-full bg-transparent pl-9 pr-3 text-[10px] outline-none placeholder:text-[#7d8981]"
            />
          </form>
          <button
            type="button"
            className="imara-header-icon ml-1"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
          >
            {themeMounted && resolvedTheme === "dark"
              ? <Sun className="h-4 w-4" />
              : <Moon className="h-4 w-4" />}
          </button>
          <div className="imara-header-notifications">
            <NotificationsBell />
          </div>
          <div className="ml-2 hidden items-center sm:flex">
            <LanguageSwitcher />
          </div>
        </header>

        <main className="imara-command-main min-h-0 flex-1 overflow-y-auto px-3 pb-20 pt-3 sm:px-5 sm:py-5 md:pb-5 lg:px-8 lg:py-7">
          <div className="imara-command-grid mx-auto grid max-w-[1010px] items-start gap-5 lg:grid-cols-[minmax(0,1.75fr)_minmax(220px,0.75fr)] xl:grid-cols-[minmax(0,650px)_280px]">
            <div className="imara-map-column min-w-0 space-y-4">
              <section className="imara-surface overflow-hidden rounded-[5px] border border-[#dce9df] bg-white shadow-[0_10px_35px_rgba(47,84,61,0.04)]">
                <div className="flex h-[62px] items-center justify-between px-5">
                  <div>
                    <h2 className="text-[15px] font-medium">Sector Topography</h2>
                    <p className="mt-0.5 text-[9px] text-[#849188]">{today} · {weather?.location || location}</p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-[#e8f4e9] px-3 py-1 text-[8px] font-bold text-[#31553f]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8bea2c]" /> Live Sync
                  </span>
                </div>

                <div className="imara-map-frame relative h-[330px] overflow-hidden border-y border-[#e1eae3] bg-[#708367] sm:h-[400px] lg:h-[min(54vh,500px)] lg:min-h-[360px]">
                  <iframe
                    title={`Live satellite map of ${weather?.location || location}`}
                    src={liveMapUrl}
                    className="h-full w-full border-0 saturate-[0.82]"
                    loading="eager"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[#d8e5cf]/5 mix-blend-screen" />
                  <MapMarker className="left-[31%] top-[13%]" />
                  <MapMarker className="right-[30%] top-[47%]" />
                  <MapMarker alert className="bottom-[22%] left-[26%]" />

                  <div className="pointer-events-none absolute left-3 top-3 bg-white/90 px-2 py-1 text-[8px] text-[#5e6b62] shadow-sm backdrop-blur-sm">
                    {weather?.location || location} sector
                  </div>
                </div>
              </section>

              <section className="imara-telemetry-grid grid grid-cols-3 gap-2 sm:gap-4">
                <TelemetryCard
                  icon={Thermometer}
                  label="Avg temp"
                  value={`${Math.round(weather?.temperature ?? 22)}°C`}
                  note={weather?.condition || "Optimal range"}
                />
                <TelemetryCard
                  icon={Droplets}
                  label="Rain chance"
                  value={`${weather?.rainChance ?? 0}%`}
                  note="Today's forecast"
                />
                <TelemetryCard
                  icon={Wind}
                  label="Wind speed"
                  value={`${weather?.windSpeed ?? 0} km/h`}
                  note="Field conditions"
                  critical={(weather?.windSpeed ?? 0) > 30}
                />
              </section>
            </div>

            <aside className="imara-actions-column space-y-5">
              <section className="imara-alert-panel rounded-[5px] bg-[#f5fbf7] p-4 shadow-[0_8px_30px_rgba(47,84,61,0.035)]">
                <div className="mb-4 flex items-center justify-between text-[#a4000d]">
                  <h2 className="flex items-center gap-2 text-[16px] font-medium">
                    <AlertTriangle className="h-4 w-4 fill-current" /> Action Required
                  </h2>
                  <span className="bg-[#b20b18] px-1.5 py-0.5 text-[9px] font-bold text-white">{actions.length}</span>
                </div>

                <div className="space-y-2.5">
                  {(query.trim() ? visibleActions : actions).map((action, index) => (
                    <ActionCard
                      key={action.key}
                      action={action}
                      title={t(`home.fieldActions.${action.key}.title`, { defaultValue: action.label })}
                      urgent={index === 0}
                    />
                  ))}
                  {query.trim() && visibleActions.length === 0 && (
                    <div className="border border-dashed border-[#ccd9cf] bg-white p-5 text-center text-[10px] text-[#68766d]">
                      No matching service found.
                    </div>
                  )}
                </div>
              </section>

              <section className="imara-surface imara-stream-panel rounded-[5px] border border-[#dce9df] bg-white p-5 shadow-[0_8px_30px_rgba(47,84,61,0.035)]">
                <h2 className="text-[16px] font-medium">Telemetry Stream</h2>
                <div className="mt-5 space-y-5 text-[10px]">
                  <StatusRow label="Weather feed status" value="Live / Active" active />
                  <StatusRow label="Field network" value="Standby" />
                  <StatusRow label="Location confidence" value="98.2%" />
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="command-mobile-close fixed right-4 top-4 z-[60] text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      <CommandCenterMobileNav active="dashboard" />
    </div>
  )
}

function MapMarker({ alert = false, className }: { alert?: boolean; className: string }) {
  return (
    <span className={cn(
      "pointer-events-none absolute h-3 w-3 rounded-full border-2 border-white shadow-[0_1px_4px_rgba(0,0,0,.45)]",
      alert ? "bg-[#e41f2b]" : "bg-[#8df22b]",
      className
    )} />
  )
}

function ActionCard({
  action,
  title,
  urgent,
}: {
  action: (typeof actions)[number]
  title: string
  urgent: boolean
}) {
  return (
    <div className={cn("imara-surface imara-action-card border bg-white p-3 shadow-sm", urgent ? "border-[#f0c3c5] border-l-2 border-l-[#eb2634]" : "border-[#dce5de] border-l-2 border-l-[#2e4d3d]")}>
      <div className="flex items-center justify-between gap-2">
        <span className={cn("text-[8px] font-bold uppercase tracking-wide", urgent ? "text-[#c41622]" : "text-[#263a2e]")}>{action.eyebrow}</span>
        <span className="shrink-0 text-[7px] text-[#647169]">{urgent ? "10m ago" : "Available"}</span>
      </div>
      <h3 className="mt-2 text-[11px] font-semibold text-[#17241c]">{title}</h3>
      <p className="mt-1 text-[9px] leading-[1.45] text-[#36443b]">{action.description}</p>
      <Link
        to={action.href}
        className={cn(
          "mt-3 inline-flex h-6 items-center gap-1 px-2 text-[8px] font-semibold transition-colors",
          urgent ? "bg-[#173b24] text-[#9bf52e] hover:bg-[#245333]" : "border border-[#aebbb2] text-[#21352a] hover:bg-[#f0f6f1]"
        )}
      >
        Open service <ArrowRight className="h-2.5 w-2.5" />
      </Link>
    </div>
  )
}

function TelemetryCard({
  icon: Icon,
  label,
  value,
  note,
  critical = false,
}: {
  icon: typeof Thermometer
  label: string
  value: string
  note: string
  critical?: boolean
}) {
  return (
    <div className="imara-surface imara-telemetry-card min-h-[108px] border border-[#e1ebe3] bg-white p-3 shadow-[0_6px_20px_rgba(47,84,61,0.035)] sm:min-h-[116px] sm:p-4">
      <div className={cn("flex items-center justify-between", critical ? "text-[#d31f2e]" : "text-[#68756c]")}>
        <span className="text-[8px] font-bold uppercase tracking-[0.1em]">{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <p className={cn("mt-4 text-[11px] font-medium sm:mt-5", critical ? "text-[#d31f2e]" : "text-[#18251d]")}>{value}</p>
      <p className={cn("mt-1 text-[8px] sm:text-[9px]", critical ? "text-[#d31f2e]" : "text-[#5f6c63]")}>{note}</p>
    </div>
  )
}

function StatusRow({ label, value, active = false }: { label: string; value: string; active?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#647168]">{label}</span>
      <span className="flex min-w-0 items-center gap-1.5 font-semibold text-[#1c2a21]">
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", active ? "bg-[#8ff02f]" : "bg-[#7d8981]")} />
        <span className="truncate">{value}</span>
      </span>
    </div>
  )
}
