import { Search, Sun, Moon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { useTheme } from "next-themes"
import { authService } from "@/services/auth"
import { NotificationsBell } from "@/components/NotificationsBell"
import type { ReactNode } from "react"

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
}

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

const PUBLIC_NOTIFICATION_FREE_PATHS = new Set([
  '/',
  '/sign-in',
  '/register',
  '/dashboard',
  '/dashboard/crops',
  '/dashboard/ai',
  '/dashboard/disease',
  '/dashboard/weather',
])

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser())

  useEffect(() => {
    setMounted(true)
    const handler = () => setCurrentUser(authService.getCurrentUser())
    window.addEventListener('user-updated', handler)
    return () => window.removeEventListener('user-updated', handler)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const showAccountControls =
    !!currentUser &&
    authService.isAuthenticated() &&
    !PUBLIC_NOTIFICATION_FREE_PATHS.has(location.pathname)

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex min-w-0 items-center justify-between gap-2 px-3 py-3 sm:px-6 sm:py-4">
        <div className="min-w-0 pl-11 lg:pl-0">
          <h1 className="truncate text-lg font-bold text-foreground sm:text-2xl">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          {actions}

          {/* Search */}
          <div className="relative hidden xl:flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('dashboard.header.searchPlaceholder')}
              className="pl-10 w-64 bg-muted/50 border-0 focus-visible:ring-primary"
            />
          </div>

          {/* Theme toggle — hidden until mounted to avoid hydration flash */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
          >
            {mounted && resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Notifications */}
          <NotificationsBell />

          {/* User avatar - mobile */}
          {showAccountControls && (
            <div className="lg:hidden w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-semibold text-sm">
              {getInitials(currentUser.name)}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
