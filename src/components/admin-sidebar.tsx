import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Brain,
  Database,
  PlayCircle,
  Package,
  ClipboardCheck,
  Activity,
  Bell,
  Wheat,
  Lightbulb,
  UserCog,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/auth"

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
}

const platformNav = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Cooperatives", href: "/admin/cooperatives", icon: Building2 },
  { name: "Crops", href: "/admin/crops", icon: Wheat },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
]

const aiNav = [
  { name: "AI Overview", href: "/admin/ai", icon: Brain, exact: true },
  { name: "Datasets", href: "/admin/ai/datasets", icon: Database },
  { name: "Training Jobs", href: "/admin/ai/training", icon: PlayCircle },
  { name: "Model Registry", href: "/admin/ai/models", icon: Package },
  { name: "Review Queue", href: "/admin/ai/review", icon: ClipboardCheck },
  { name: "Performance", href: "/admin/ai/performance", icon: Activity },
  { name: "Optimization", href: "/admin/ai/optimization", icon: Lightbulb },
]

export function AdminSidebar() {
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

  const navLink = (item: { name: string; href: string; icon: React.ElementType; exact?: boolean }) => {
    const active = isActive(item.href, item.exact)
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
        <item.icon className={cn("w-5 h-5 flex-shrink-0", active && "drop-shadow-md")} />
        <span className="font-medium">{item.name}</span>
      </Link>
    )
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
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">IMARA</h1>
              <p className="text-xs text-sidebar-foreground/70">Admin Console</p>
            </div>
          </div>

          {/* Portal indicator */}
          <div className="px-6 py-3 border-b border-sidebar-border bg-sidebar-accent/20">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs text-sidebar-foreground/80 font-medium">Admin Portal</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {/* Platform section */}
            <p className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest px-4 pb-1 pt-2">
              Platform
            </p>
            {platformNav.map(navLink)}

            {/* AI Management section */}
            <div className="pt-3">
              <p className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest px-4 pb-1">
                AI Management
              </p>
              {aiNav.map(navLink)}
            </div>
          </nav>

          {/* Bottom section */}
          <div className="px-4 py-4 border-t border-sidebar-border space-y-1">
            <Link
              to="/admin/profile"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                "hover:bg-sidebar-accent",
                isActive('/admin/profile')
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
              )}
            >
              <UserCog className="w-5 h-5" />
              <span className="font-medium">My Profile</span>
            </Link>
            <Link
              to="/admin/settings"
              onClick={() => setMobileOpen(false)}
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

          {/* User info — clickable, links to profile */}
          <div className="px-4 py-4 border-t border-sidebar-border">
            <Link
              to="/admin/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-2 rounded-xl hover:bg-sidebar-accent/50 transition-colors py-2 -mx-2"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {currentUser ? getInitials(currentUser.name) : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser?.name ?? 'Admin'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate capitalize">
                  {[currentUser?.role, currentUser?.location].filter(Boolean).join(' · ')}
                </p>
              </div>
              <UserCog className="w-4 h-4 text-sidebar-foreground/40 flex-shrink-0" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
