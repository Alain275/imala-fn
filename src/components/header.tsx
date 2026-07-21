import { LogIn, Moon, Search, Sun, UserPlus, UserRound } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "next-themes"
import { authService } from "@/services/auth"
import { NotificationsBell } from "@/components/NotificationsBell"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ReactNode } from "react"

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
}

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { t } = useTranslation()
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

  const isAuthenticated = !!currentUser && authService.isAuthenticated()

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
          <div className="relative hidden items-center md:flex">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('dashboard.header.searchPlaceholder')}
              className="w-40 border-0 bg-muted/50 pl-10 focus-visible:ring-primary lg:w-64"
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

          {/* Account access. Anonymous actions live inside the profile icon. */}
          {isAuthenticated ? (
            <div className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-500 text-sm font-semibold text-white">
              {getInitials(currentUser.name)}
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-muted-foreground hover:text-foreground"
                  aria-label="Open profile menu"
                >
                  <UserRound className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-52">
                <DropdownMenuLabel>
                  <span className="block text-sm">Welcome to IMARA</span>
                  <span className="block text-xs font-normal text-muted-foreground">Sign in to save your farm data</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/sign-in">
                    <LogIn />
                    Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer text-emerald-700 focus:text-emerald-700 dark:text-emerald-400 dark:focus:text-emerald-400">
                  <Link to="/register">
                    <UserPlus />
                    Register
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
