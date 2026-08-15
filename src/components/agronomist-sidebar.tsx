import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Map,
  BrainCircuit,
  MessageSquare,
  FlaskConical,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sprout,
  User,
  Users2,
  ClipboardList,
  Lightbulb,
  HelpCircle,
  BookOpen,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/auth"

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
}

type NavItem = { name: string; href: string; icon: typeof LayoutDashboard }

// Icons are matched to each page's own dominant header/card icon where doing so
// doesn't collide with another entry (Farm Visits keeps ClipboardList rather than
// the Map it uses on-page, since GIS already owns Map; Advice keeps Lightbulb
// rather than the MessageSquare it uses on-page, since Comms Studio already owns
// MessageSquare — same collision-avoidance standard used throughout this project).
const sections: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { name: "Overview", href: "/agronomist", icon: LayoutDashboard },
      { name: "Profile", href: "/agronomist/profile", icon: User },
    ],
  },
  {
    label: "Farmer Management",
    items: [
      { name: "Farmers", href: "/agronomist/farmers", icon: Users2 },
      { name: "Farm Visits", href: "/agronomist/farm-visits", icon: ClipboardList },
      { name: "Advice", href: "/agronomist/advice", icon: Lightbulb },
      { name: "Questions", href: "/agronomist/questions", icon: HelpCircle },
      { name: "Training Materials", href: "/agronomist/training-materials", icon: BookOpen },
    ],
  },
  {
    label: "Field Intelligence",
    items: [
      { name: "GIS & Field Scouting", href: "/agronomist/gis", icon: Map },
      { name: "AI Validation Engine", href: "/agronomist/ai-validation", icon: BrainCircuit },
      { name: "Pathology Lab", href: "/agronomist/pathology", icon: FlaskConical },
      { name: "Comms Studio", href: "/agronomist/comms", icon: MessageSquare },
      { name: "Analytics", href: "/agronomist/analytics", icon: BarChart3 },
    ],
  },
]

export function AgronomistSidebar() {
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

  const isActive = (href: string) => {
    if (href === "/agronomist") return pathname === "/agronomist"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const initials = currentUser ? getInitials(currentUser.name) : "IM"

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        className="fixed top-4 left-4 z-[60] lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — same slide-in/overlay mechanics as the farmer CommandCenterSidebar,
          sky/slate accent instead of lime/forest-green so the two portals read as
          distinct at a glance while sharing the same structural pattern. */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 text-white transition-transform duration-200",
        "lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="shrink-0 border-b border-white/10 px-6 pb-5 pt-7">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-[5px] bg-sky-400 text-slate-900">
              <Sprout className="h-4 w-4" />
            </span>
            <span className="text-lg font-black tracking-[0.08em]">IMARA</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-sky-400">Field Advisory</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/35">Agronomist Portal</p>
            </div>
            <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_0_3px_rgba(56,189,248,.12)] animate-pulse" />
              Live
            </span>
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto py-3 [scrollbar-color:rgba(56,189,248,.35)_transparent] [scrollbar-width:thin]">
          {sections.map((section) => (
            <div key={section.label} className="pb-3">
              <p className="px-6 pb-1.5 pt-2 text-[8px] font-black uppercase tracking-[0.18em] text-white/30">
                {section.label}
              </p>
              {section.items.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center gap-3 border-r-2 px-6 text-[11px] font-semibold transition-colors",
                      active
                        ? "border-sky-400 bg-slate-800 text-sky-400"
                        : "border-transparent text-white/55 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="shrink-0 space-y-1 border-t border-white/10 px-5 pb-5 pt-3">
          <Link
            to="/agronomist/settings"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex h-9 items-center gap-3 border-r-2 px-2 text-[10px] transition",
              pathname === "/agronomist/settings"
                ? "border-sky-400 text-sky-400"
                : "border-transparent text-white/55 hover:text-white"
            )}
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex h-9 w-full items-center gap-3 px-2 text-[10px] text-white/55 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
          <div className="flex items-center gap-3 border-t border-white/10 pt-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-100 text-[9px] font-bold text-slate-800">
              {initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[10px] font-semibold text-white">
                {currentUser?.name ?? 'Unknown'}
              </span>
              <span className="block truncate text-[9px] capitalize text-white/45">
                {[currentUser?.role, currentUser?.location].filter(Boolean).join(' · ')}
              </span>
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}
