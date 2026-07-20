import { Link, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Sprout,
  Bug,
  CloudSun,
  Mountain,
  TrendingUp,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Leaf,
  Store,
  Package,
  MessageSquare,
  BadgeCheck,
  Stethoscope,
  UserRound,
  ClipboardList,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/auth"

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
}

const navigation = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "cropAdvisory", href: "/dashboard/crops", icon: Sprout },
  { key: "diseaseDetection", href: "/dashboard/disease", icon: Bug },
  { key: "weatherIntelligence", href: "/dashboard/weather", icon: CloudSun },
]

// Keep unavailable features together at the end of the sidebar.
const underDevelopmentNavigation = [
  { key: "soilAnalysis", href: "/dashboard/soil", icon: Mountain },
  { key: "marketPrices", href: "/dashboard/market", icon: TrendingUp },
  { key: "training", href: "/dashboard/training", icon: BookOpen },
]

const agroDealerNavigation = [
  { key: "dealerProfile", href: "/dashboard/dealer-profile", icon: BadgeCheck, label: "Dealer Profile" },
  { key: "dealerProducts", href: "/dashboard/dealer-products", icon: Package, label: "My Products" },
  { key: "dealerMessages", href: "/dashboard/dealer-messages", icon: MessageSquare, label: "Messages" },
]

const farmerMarketplaceNavigation = [
  { key: "farmerProfile", href: "/dashboard/farmer-profile", icon: UserRound, label: "Farmer Profile" },
  { key: "farmPlan", href: "/dashboard/farm-plan", icon: ClipboardList, label: "Farm Plan" },
  { key: "dealerMarketplace", href: "/dashboard/dealer-marketplace", icon: Store, label: "Dealer Marketplace" },
  { key: "agronomists", href: "/dashboard/agronomists", icon: Stethoscope, label: "Agronomists Nearby" },
  { key: "dealerMessages", href: "/dashboard/dealer-messages", icon: MessageSquare, label: "Dealer Messages" },
]

export function Sidebar() {
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

  const portalLabel =
    currentUser?.role === 'agro-dealer'
      ? t('dashboard.sidebar.portalLabelAgroDealer')
      : t('dashboard.sidebar.portalLabel')
  const roleNavigation =
    currentUser?.role === 'agro-dealer'
      ? agroDealerNavigation
      : currentUser?.role === 'farmer'
        ? farmerMarketplaceNavigation
        : []
  const publicNavigation = navigation
  const fullNavigation = currentUser
    ? [...navigation, ...roleNavigation, ...underDevelopmentNavigation]
    : publicNavigation
  const mobileNavigation = (currentUser?.role === 'agro-dealer'
    ? [
        agroDealerNavigation[0],
        agroDealerNavigation[1],
        agroDealerNavigation[2],
        { key: "marketPrices", href: "/dashboard/market", icon: TrendingUp },
        { key: "settings", href: "/dashboard/settings", icon: Settings },
      ]
    : currentUser?.role === 'farmer'
      ? [
          navigation[0],
          navigation[1],
          farmerMarketplaceNavigation[1],
          navigation[2],
          farmerMarketplaceNavigation[0],
          { key: "settings", href: "/dashboard/settings", icon: Settings },
        ]
      : [
          navigation[0],
          navigation[1],
          navigation[2],
          navigation[3],
          { key: "signIn", href: "/sign-in", icon: Settings, label: "Account" },
        ]
  ).filter(Boolean)
  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-sidebar text-sidebar-foreground",
        "transform transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">IMARA</h1>
              <p className="text-xs text-sidebar-foreground/70">{t('dashboard.sidebar.tagline')}</p>
            </div>
          </div>

          {/* Portal indicator is only relevant after login. */}
          {currentUser && (
            <div className="px-6 py-3 border-b border-sidebar-border bg-sidebar-accent/20">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-sidebar-foreground/80 font-medium">{portalLabel}</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {fullNavigation.map((item) => {
              const isActive = pathname === item.href
              const label = t(
                `dashboard.sidebar.nav.${item.key}`,
                { defaultValue: 'label' in item && typeof item.label === 'string' ? item.label : item.key }
              )
              return (
                <Link
                  key={item.key}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    "hover:bg-sidebar-accent",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                      : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive && "drop-shadow-md"
                  )} />
                  <span className="font-medium">
                    {label}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* Bottom section */}
          <div className="px-4 py-4 border-t border-sidebar-border space-y-1">
            {currentUser ? (
              <>
            <Link
              to="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">{t('dashboard.sidebar.settings')}</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t('dashboard.sidebar.signOut')}</span>
            </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-2">
                <Button variant="secondary" size="sm" asChild>
                  <Link to="/sign-in">Login</Link>
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>

          {/* User info */}
          {currentUser && (
          <div className="px-4 py-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-semibold">
                {currentUser ? getInitials(currentUser.name) : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser?.name ?? 'Unknown'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {[
                    currentUser?.role ? t(`common.role.${currentUser.role}`, { defaultValue: currentUser.role }) : null,
                    currentUser?.location,
                  ].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
          </div>
          )}
        </div>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-border/80 bg-background/95 shadow-lg shadow-black/15 backdrop-blur lg:hidden">
        <div className="grid h-16 grid-cols-5 px-1">
          {mobileNavigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            const label = item.key === 'settings'
              ? t('dashboard.sidebar.settings')
              : t(
                  `dashboard.sidebar.nav.${item.key}`,
                  { defaultValue: 'label' in item && typeof item.label === 'string' ? item.label : item.key }
                )

            return (
              <Link
                key={item.key}
                to={item.href}
                className={cn(
                  "flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition-colors",
                  isActive ? "text-emerald-600" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="max-w-full truncate leading-none">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
