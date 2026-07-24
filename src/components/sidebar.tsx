import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { ClipboardList, Grid2X2, Menu, Settings, Sprout, UserRound, X } from "lucide-react"
import { useTranslation } from "react-i18next"

import { CommandCenterSidebar } from "@/components/CommandCenterSidebar"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/auth"
import { cn } from "@/lib/utils"

const farmerMobileItems = [
  { key: "dashboard", href: "/dashboard", icon: Grid2X2 },
  { key: "cropAdvisory", href: "/dashboard/crops", icon: Sprout },
  { key: "farmPlan", href: "/dashboard/farm-plan", icon: ClipboardList },
  { key: "farmerProfile", href: "/dashboard/farmer-profile", icon: UserRound },
  { key: "settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = authService.getCurrentUser()

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        className="fixed left-4 top-4 z-[60] rounded-[5px] border border-[#d7e5da] bg-white/90 text-[#294a3a] shadow-sm backdrop-blur lg:hidden"
        onClick={() => setMobileOpen((value) => !value)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <CommandCenterSidebar
        open={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#2e4d3d] text-white transition-transform duration-200",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      />

      {user?.role === "farmer" && (
        <nav className="fixed inset-x-3 bottom-3 z-40 border border-[#d3e2d6] bg-white/95 shadow-[0_10px_30px_rgba(26,58,38,.15)] backdrop-blur lg:hidden">
          <div className="grid h-16 grid-cols-5 px-1">
            {farmerMobileItems.map((item) => {
              const selected =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)
              const label =
                item.key === "settings"
                  ? t("dashboard.sidebar.settings")
                  : t(`dashboard.sidebar.nav.${item.key}`)
              return (
                <Link
                  key={item.key}
                  to={item.href}
                  className={cn(
                    "relative flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-[9px] font-bold transition",
                    selected ? "text-[#315900]" : "text-[#718176]"
                  )}
                >
                  {selected && <span className="absolute inset-x-3 top-0 h-0.5 bg-[#8fe82e]" />}
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="max-w-full truncate leading-none">{label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </>
  )
}
