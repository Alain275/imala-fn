import { Link, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  BadgeCheck,
  BookOpen,
  Bug,
  ClipboardList,
  CloudSun,
  Grid2X2,
  Leaf,
  LogIn,
  LogOut,
  MessageSquare,
  Mountain,
  Package,
  Settings,
  Sprout,
  Stethoscope,
  Store,
  TrendingUp,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { authService } from "@/services/auth"
import { cn } from "@/lib/utils"

type NavItem = {
  key: string
  href: string
  icon: typeof Grid2X2
  fallback: string
}

const overviewItems: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: Grid2X2, fallback: "Dashboard" },
  { key: "cropAdvisory", href: "/dashboard/crops", icon: Sprout, fallback: "Crop advisory" },
  { key: "diseaseDetection", href: "/dashboard/disease", icon: Bug, fallback: "Disease detection" },
  { key: "weatherIntelligence", href: "/dashboard/weather", icon: CloudSun, fallback: "Weather intelligence" },
]

const farmerItems: NavItem[] = [
  { key: "farmerProfile", href: "/dashboard/farmer-profile", icon: UserRound, fallback: "Farmer profile" },
  { key: "farmPlan", href: "/dashboard/farm-plan", icon: ClipboardList, fallback: "Farm plan" },
  { key: "dealerMarketplace", href: "/dashboard/dealer-marketplace", icon: Store, fallback: "Marketplace" },
  { key: "agronomists", href: "/dashboard/agronomists", icon: Stethoscope, fallback: "Agronomists" },
  { key: "dealerMessages", href: "/dashboard/dealer-messages", icon: MessageSquare, fallback: "Messages" },
]

const dealerItems: NavItem[] = [
  { key: "dealerProfile", href: "/dashboard/dealer-profile", icon: BadgeCheck, fallback: "Dealer profile" },
  { key: "dealerProducts", href: "/dashboard/dealer-products", icon: Package, fallback: "My products" },
  { key: "dealerMessages", href: "/dashboard/dealer-messages", icon: MessageSquare, fallback: "Messages" },
]

const intelligenceItems: NavItem[] = [
  { key: "soilAnalysis", href: "/dashboard/soil", icon: Mountain, fallback: "Soil analysis" },
  { key: "marketPrices", href: "/dashboard/market", icon: TrendingUp, fallback: "Market prices" },
  { key: "training", href: "/dashboard/training", icon: BookOpen, fallback: "Training" },
]

export function CommandCenterSidebar({
  active,
  open = false,
  onNavigate,
  className,
}: {
  active?: string
  open?: boolean
  onNavigate?: () => void
  className?: string
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = authService.getCurrentUser()
  const isAuthenticated = authService.isAuthenticated()
  const initials =
    user?.name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "IM"

  const roleItems =
    user?.role === "farmer" ? farmerItems : user?.role === "agro-dealer" ? dealerItems : []
  const sections = [
    { label: t("dashboard.sidebar.sections.overview"), items: overviewItems },
    ...(isAuthenticated && roleItems.length
      ? [{ label: t("dashboard.sidebar.sections.workspace"), items: roleItems }]
      : []),
    ...(isAuthenticated
      ? [{ label: t("dashboard.sidebar.sections.intelligence"), items: intelligenceItems }]
      : []),
  ]

  const signOut = () => {
    authService.logout()
    navigate("/sign-in")
  }

  const isSelected = (item: NavItem) => {
    if (active) return item.key === active
    return item.href === "/dashboard"
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`)
  }

  return (
    <aside className={cn(className, open && "is-open command-sidebar-open")}>
      <div className="shrink-0 border-b border-white/10 px-6 pb-5 pt-7">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-[5px] bg-[#9df22d] text-[#193126]">
            <Leaf className="h-4 w-4 fill-current" />
          </span>
          <span className="text-lg font-black tracking-[0.08em]">IMARA</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#9df22d]">{t("dashboard.sidebar.tagline")}</p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/35">
              {isAuthenticated
                ? user?.role === "agro-dealer"
                  ? t("dashboard.sidebar.portalLabelAgroDealer")
                  : t("dashboard.sidebar.portalLabel")
                : "Command Center v2.4"}
            </p>
          </div>
          {isAuthenticated && (
            <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-[#9df22d] shadow-[0_0_0_3px_rgba(157,242,45,.12)]" />
              Live
            </span>
          )}
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto py-3 [scrollbar-color:rgba(157,242,45,.35)_transparent] [scrollbar-width:thin]">
        {sections.map((section) => (
          <div key={section.label} className="pb-3">
            <p className="px-6 pb-1.5 pt-2 text-[8px] font-black uppercase tracking-[0.18em] text-white/30">
              {section.label}
            </p>
            {section.items.map((item) => {
              const selected = isSelected(item)
              return (
                <Link
                  key={item.key}
                  to={item.href}
                  onClick={onNavigate}
                  aria-current={selected ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center gap-3 border-r-2 px-6 text-[11px] font-semibold transition-colors",
                    selected
                      ? "border-[#9df22d] bg-[#355744] text-[#9df22d]"
                      : "border-transparent text-white/55 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", selected && item.key === "dashboard" && "fill-current")} />
                  <span className="truncate">
                    {t(`dashboard.sidebar.nav.${item.key}`, { defaultValue: item.fallback })}
                  </span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-1 border-t border-white/10 px-5 pb-5 pt-3">
        {user ? (
          <>
            <Link
              to="/dashboard/settings"
              onClick={onNavigate}
              className={cn(
                "flex h-9 items-center gap-3 border-r-2 px-2 text-[10px] transition",
                pathname === "/dashboard/settings"
                  ? "border-[#9df22d] text-[#9df22d]"
                  : "border-transparent text-white/55 hover:text-white"
              )}
            >
              <Settings className="h-4 w-4" /> {t("dashboard.sidebar.settings")}
            </Link>
            <button type="button" onClick={signOut} className="flex h-9 w-full items-center gap-3 px-2 text-[10px] text-white/55 hover:text-white">
              <LogOut className="h-4 w-4" /> {t("dashboard.sidebar.signOut")}
            </button>
            <Link to={user.role === "farmer" ? "/dashboard/farmer-profile" : "/dashboard/dealer-profile"} onClick={onNavigate} className="flex items-center gap-3 border-t border-white/10 pt-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#d8e4da] text-[9px] font-bold text-[#294a3a]">{initials}</span>
              <span className="min-w-0">
                <span className="block truncate text-[10px] font-semibold text-white">{user.name}</span>
                <span className="block truncate text-[9px] capitalize text-white/45">
                  {t(`common.role.${user.role}`, { defaultValue: user.role })}
                </span>
              </span>
            </Link>
          </>
        ) : (
          <>
            <Button asChild className="h-10 w-full rounded-[4px] bg-[#9df22d] text-[10px] font-extrabold uppercase text-[#193126] hover:bg-[#b0ff42]">
              <Link to="/sign-in" onClick={onNavigate}>
                <LogIn className="mr-2 h-4 w-4" /> {t("dashboard.sidebar.nav.signIn")}
              </Link>
            </Button>
            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-white/45">
              <Settings className="h-4 w-4" />
              <span className="text-[9px] uppercase tracking-[0.16em]">IMARA v2.4</span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#d8e4da] text-[9px] font-bold text-[#294a3a]">IM</span>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
