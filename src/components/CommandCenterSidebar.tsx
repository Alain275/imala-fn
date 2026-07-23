import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Bug, CloudSun, Grid2X2, Leaf, LogIn, LogOut, Settings, Sprout } from "lucide-react"

import { Button } from "@/components/ui/button"
import { authService } from "@/services/auth"
import { cn } from "@/lib/utils"

const items = [
  { key: "dashboard", href: "/dashboard", icon: Grid2X2, fallback: "Dashboard" },
  { key: "cropAdvisory", href: "/dashboard/crops", icon: Sprout, fallback: "Crop advisory" },
  { key: "diseaseDetection", href: "/dashboard/disease", icon: Bug, fallback: "Disease detection" },
  { key: "weatherIntelligence", href: "/dashboard/weather", icon: CloudSun, fallback: "Weather intelligence" },
] as const

type ActiveItem = (typeof items)[number]["key"]

export function CommandCenterSidebar({
  active,
  open = false,
  onNavigate,
  className,
}: {
  active: ActiveItem
  open?: boolean
  onNavigate?: () => void
  className?: string
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = authService.getCurrentUser()
  const initials = user?.name.split(" ").map((part) => part[0]).filter(Boolean).join("").slice(0, 2).toUpperCase() || "IM"

  const signOut = () => {
    authService.logout()
    navigate("/sign-in")
  }

  return (
    <aside className={cn(className, open && "is-open command-sidebar-open")}>
      <div className="border-b border-white/10 px-6 pb-6 pt-8">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-sm bg-[#9df22d] text-[#193126]">
            <Leaf className="h-4 w-4 fill-current" />
          </span>
          <span className="text-lg font-bold tracking-tight">IMARA</span>
        </div>
        <p className="mt-4 text-sm font-semibold text-[#9df22d]">Agri-Intelligence</p>
        <p className="mt-1 text-[10px] text-white/50">Command Center v2.4</p>
      </div>

      <nav className="flex-1 py-4">
        {items.map((item) => {
          const selected = item.key === active
          return (
            <Link
              key={item.key}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "flex h-12 items-center gap-3 border-r-2 px-6 text-xs font-medium transition-colors",
                selected
                  ? "border-[#9df22d] bg-[#355744] text-[#9df22d]"
                  : "border-transparent text-white/55 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("h-4 w-4", selected && item.key === "dashboard" && "fill-current")} />
              {t(`dashboard.sidebar.nav.${item.key}`, { defaultValue: item.fallback })}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-3 px-5 pb-6">
        {user ? (
          <>
            <Link to="/dashboard/settings" onClick={onNavigate} className="flex h-9 items-center gap-3 px-2 text-[10px] text-white/55 hover:text-white">
              <Settings className="h-4 w-4" /> {t("dashboard.sidebar.settings")}
            </Link>
            <button type="button" onClick={signOut} className="flex h-9 w-full items-center gap-3 px-2 text-[10px] text-white/55 hover:text-white">
              <LogOut className="h-4 w-4" /> {t("dashboard.sidebar.signOut")}
            </button>
            <div className="flex items-center gap-3 border-t border-white/10 pt-4">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#d8e4da] text-[9px] font-bold text-[#294a3a]">{initials}</span>
              <span className="min-w-0">
                <span className="block truncate text-[10px] font-semibold text-white">{user.name}</span>
                <span className="block truncate text-[9px] capitalize text-white/45">{user.role}</span>
              </span>
            </div>
          </>
        ) : (
          <>
            <Button asChild className="h-10 w-full rounded-sm bg-[#9df22d] text-[10px] font-extrabold uppercase text-[#193126] hover:bg-[#b0ff42]">
              <Link to="/sign-in" onClick={onNavigate}><LogIn className="mr-2 h-4 w-4" /> Sign in</Link>
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
