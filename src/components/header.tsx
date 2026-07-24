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
    <header className="sticky top-0 z-30 border-b border-[#d7e5da] bg-white/85 backdrop-blur-md dark:border-[#294033] dark:bg-[#101a14]/90">
      <div className="flex min-h-[68px] min-w-0 items-center justify-between gap-2 px-3 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0 pl-11 lg:pl-0">
          <div className="mb-1 hidden items-center gap-2 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8fe82e]" />
            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-[#64806e]">Farmer workspace</span>
          </div>
          <h1 className="truncate text-base font-black tracking-[-0.02em] text-[#21392b] dark:text-[#edf5ef] sm:text-xl">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 hidden max-w-2xl truncate text-[11px] text-[#6a7e70] sm:block">{subtitle}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          {actions}

          {/* Search */}
          <div className="relative hidden items-center md:flex">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('dashboard.header.searchPlaceholder')}
              className="h-9 w-40 rounded-[5px] border-[#d7e5da] bg-[#f4f9f5] pl-10 text-xs shadow-none focus-visible:border-[#477326] focus-visible:ring-[#9bf52e]/20 lg:w-56"
            />
          </div>

          {/* Theme toggle — hidden until mounted to avoid hydration flash */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-[5px] text-[#64806e] hover:bg-[#eef6f0] hover:text-[#294a3a]"
          >
            {mounted && resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Notifications */}
          <NotificationsBell />

          {/* Account access. Anonymous actions live inside the profile icon. */}
          {isAuthenticated ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#315900] text-[10px] font-bold text-[#b5ff62] lg:hidden">
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
