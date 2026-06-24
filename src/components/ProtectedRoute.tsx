// NOTE: Role is read from localStorage, which users can edit in browser devtools.
// This guard is UX-only. Real access control must be enforced by the backend per endpoint.
import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/auth'

export type AppRole = 'farmer' | 'agronomist' | 'admin' | 'cooperative'

const roleHome: Record<AppRole, string> = {
  farmer: '/dashboard',
  agronomist: '/agronomist',
  admin: '/admin',
  cooperative: '/cooperative',
}

function roleToHome(role: string): string {
  return roleHome[role as AppRole] ?? '/dashboard'
}

interface ProtectedRouteProps {
  allowedRoles?: AppRole[]
}

function DeniedRedirect({ to }: { to: string }) {
  const { t } = useTranslation()
  useEffect(() => {
    toast.error(t('common.toast.accessDenied'))
  }, [t])
  return <Navigate to={to} replace />
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const user = authService.getCurrentUser()

  if (!user || !authService.isAuthenticated()) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role as AppRole)) {
    return <DeniedRedirect to={roleToHome(user.role)} />
  }

  return <Outlet />
}
