// NOTE: Role is read from localStorage, which users can edit in browser devtools.
// This guard is UX-only. Real access control must be enforced by the backend per endpoint.
import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '@/services/auth'

type AppRole = 'farmer' | 'agronomist'

interface ProtectedRouteProps {
  allowedRoles?: AppRole[]
}

function DeniedRedirect({ to }: { to: string }) {
  useEffect(() => {
    toast.error("You don't have access to that section.")
  }, [])
  return <Navigate to={to} replace />
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const user = authService.getCurrentUser()

  if (!user || !authService.isAuthenticated()) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  const role = user.role as AppRole
  if (allowedRoles && !allowedRoles.includes(role)) {
    const home = role === 'agronomist' ? '/agronomist' : '/dashboard'
    return <DeniedRedirect to={home} />
  }

  return <Outlet />
}
