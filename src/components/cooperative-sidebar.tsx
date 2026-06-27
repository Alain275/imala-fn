import { Link, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Menu,
  X,
  Settings,
  LogOut,
  AlertTriangle,
  Store,
  MapPin,
  UserCog,
  Lightbulb,
  Sprout,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/auth"

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
}

const platformNav = [
  { key: "overview",    href: "/cooperative",               icon: LayoutDashboard, exact: true },
  { key: "myFarms",     href: "/cooperative/farms",         icon: MapPin },
  { key: "members",     href: "/cooperative/members",       icon: Users },
  { key: "market",      href: "/cooperative/market",        icon: Store },
]

const aiNav = [
  { key: "aiInsights",    href: "/cooperative/ai-insights",    icon: Lightbulb },
  { key: "cropAdvisory",  href: "/cooperative/crop-advisory",  icon: Sprout },
  { key: "diseaseAlerts", href: "/cooperative/disease-alerts", icon: AlertTriangle },
]

export function CooperativeSidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const pathname = location.pathname
  const [mobileOpen, setMobileOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser())
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setCurrentUser(authService.getCurrentUser())
    window.addEventListener('user-updated', handler)
    return () => window.removeEventListener('user-updated', handler)
  }, [])

  const handleSignOut = () => {
    authService.logout()
    navigate('/sign-in')
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const navLink = (item: { key: string; href: string; icon: React.ElementType; exact?: boolean }) => {
    const active = isActive(item.href, item.exact)
    return (
      <Link
        key={item.key}
        to={item.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
          active
            ? "bg-green-500 text-black font-semibold shadow-md"
            : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        )}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium">{t(`cooperative.sidebar.nav.${item.key}`)}</span>
      </Link>
    )
  }

  return (
    <>
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-sidebar text-sidebar-foreground",
        "transform transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">

          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">IMARA</h1>
              <p className="text-xs text-sidebar-foreground/70">{t("cooperative.sidebar.tagline")}</p>
            </div>
          </div>

          {/* Portal badge */}
          <div className="px-6 py-3 border-b border-sidebar-border bg-sidebar-accent/20">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-sidebar-foreground/80 font-medium">
                {t("cooperative.sidebar.portalLabel")}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <p className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest px-4 pb-1 pt-2">
              {t("cooperative.sidebar.platformSection")}
            </p>
            {platformNav.map(navLink)}

            <div className="pt-3">
              <p className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest px-4 pb-1">
                {t("cooperative.sidebar.aiSection")}
              </p>
              {aiNav.map(navLink)}
            </div>
          </nav>

          {/* Bottom links */}
          <div className="px-4 py-4 border-t border-sidebar-border space-y-1">
            <Link
              to="/cooperative/settings"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                "hover:bg-sidebar-accent",
                isActive('/cooperative/settings')
                  ? "bg-green-500 text-black font-semibold shadow-md"
                  : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
              )}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">{t("cooperative.sidebar.settings")}</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t("cooperative.sidebar.signOut")}</span>
            </button>
          </div>

          {/* User chip */}
          <div className="px-4 py-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {currentUser ? getInitials(currentUser.name) : 'AU'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser?.name ?? t("cooperative.sidebar.leaderFallback")}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {t("cooperative.sidebar.leaderRole")}
                </p>
              </div>
              <UserCog className="w-4 h-4 text-sidebar-foreground/40 flex-shrink-0" />
            </div>
          </div>

        </div>
      </aside>
    </>
  )
}
