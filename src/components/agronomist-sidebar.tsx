import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
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
  ChevronRight,
  LayoutDashboard,
  ArrowLeft,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const agronomistNav = [
  {
    name: "Overview",
    href: "/agronomist",
    icon: LayoutDashboard,
    description: "System overview",
  },
  {
    name: "GIS & Field Scouting",
    href: "/agronomist/gis",
    icon: Map,
    description: "Spatial analytics",
    badge: "3",
    badgeColor: "emerald",
  },
  {
    name: "AI Validation Engine",
    href: "/agronomist/ai-validation",
    icon: BrainCircuit,
    description: "70/30 hybrid loop",
    badge: "12",
    badgeColor: "amber",
  },
  {
    name: "Comms Studio",
    href: "/agronomist/comms",
    icon: MessageSquare,
    description: "Bulk messaging",
    badge: "5",
    badgeColor: "sky",
  },
  {
    name: "Pathology Lab",
    href: "/agronomist/pathology",
    icon: FlaskConical,
    description: "Disease diagnostics",
  },
  {
    name: "Advisory Hub",
    href: "/agronomist/advisory",
    icon: BarChart3,
    description: "NPK & market data",
  },
  {
    name: "Workforce Desk",
    href: "/agronomist/workforce",
    icon: Users2,
    description: "Field operations",
  },
]

export function AgronomistSidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const [mobileOpen, setMobileOpen] = useState(false)

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
        className="fixed top-4 left-4 z-50 lg:hidden bg-slate-800 text-white hover:bg-slate-700"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 flex flex-col",
          "bg-slate-950 border-r border-slate-800",
          "transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-600 shadow-lg shadow-sky-900/40">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">IMARA</h1>
            <p className="text-[11px] text-sky-400 font-medium uppercase tracking-widest">Agronomist Portal</p>
          </div>
        </div>

        {/* Role badge + back link */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-xs text-slate-400">Agronomist Dashboard</span>
            </div>
            <Link
              to="/dashboard"
              className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-medium border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full transition-colors"
            >
              <ArrowLeft className="w-2.5 h-2.5" /> Farmer View
            </Link>
          </div>
        </div>

        {/* System status bar */}
        <div className="px-5 py-2 border-b border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">RW-AGR-001</span>
            <span className="text-slate-500">Kigali Province</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Core Modules
          </p>
          {agronomistNav.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative border",
                  active
                    ? "bg-sky-600/20 text-sky-400 border-sky-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-sky-500 rounded-r-full" />
                )}
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all",
                  active
                    ? "bg-sky-600/30 text-sky-400"
                    : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200"
                )}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium truncate", active ? "text-sky-300" : "")}>
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{item.description}</p>
                </div>
                {item.badge && (
                  <span className={cn(
                    "flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    item.badgeColor === "amber"
                      ? "bg-amber-500/20 text-amber-400"
                      : item.badgeColor === "sky"
                      ? "bg-sky-500/20 text-sky-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  )}>
                    {item.badge}
                  </span>
                )}
                {active && <ChevronRight className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-3 border-t border-slate-800 space-y-0.5">
          <Link
            to="/agronomist/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all duration-200 border border-transparent"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Settings</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 border border-transparent">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-t border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
              JM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Jean Mugabo</p>
              <p className="text-[11px] text-sky-400 truncate font-medium">Sr. Agronomist · Kigali</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0" />
          </div>
        </div>
      </aside>
    </>
  )
}
