import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Map,
  BrainCircuit,
  MessageSquare,
  FlaskConical,
  BarChart3,
  Users2,
  Settings,
  LogOut,
  Menu,
  X,
  Sprout,
  Users,
  CalendarCheck,
  BookOpen,
  HelpCircle,
  GraduationCap,  // ← ADDED
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/auth"

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
}

const navigation = [
  { name: "Overview", href: "/agronomist", icon: LayoutDashboard },
  { name: "GIS & Field Scouting", href: "/agronomist/gis", icon: Map },
  { name: "AI Validation Engine", href: "/agronomist/ai-validation", icon: BrainCircuit },
  { name: "Comms Studio", href: "/agronomist/comms", icon: MessageSquare },
  { name: "Pathology Lab", href: "/agronomist/pathology", icon: FlaskConical },
  { name: "Advisory Hub", href: "/agronomist/advisory", icon: BarChart3 },
  { name: "Workforce Desk", href: "/agronomist/workforce", icon: Users2 },
  { name: "Farmers", href: "/agronomist/farmers", icon: Users },
  { name: "Farm Visits", href: "/agronomist/farm-visits", icon: CalendarCheck },
  { name: "Advice", href: "/agronomist/advice", icon: BookOpen },
  { name: "Questions", href: "/agronomist/questions", icon: HelpCircle },
  { name: "Training Materials", href: "/agronomist/training-materials", icon: GraduationCap },  // ← ADDED
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
    return pathname.startsWith(href)
  }

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
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-600 shadow-lg">
              <Sprout className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">IMARA</h1>
              <p className="text-xs text-sidebar-foreground/70">Agronomist Command</p>
            </div>
          </div>

          {/* Portal indicator */}
          <div className="px-6 py-3 border-b border-sidebar-border bg-sidebar-accent/20">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-xs text-sidebar-foreground/80 font-medium">Agronomist Portal</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    "hover:bg-sidebar-accent",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                      : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 flex-shrink-0",
                    active && "drop-shadow-md"
                  )} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Bottom section */}
          <div className="px-4 py-4 border-t border-sidebar-border space-y-1">
            <Link
              to="/agronomist/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>

          {/* User info */}
          <div className="px-4 py-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
                {currentUser ? getInitials(currentUser.name) : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser?.name ?? 'Unknown'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate capitalize">
                  {[currentUser?.role, currentUser?.location].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}