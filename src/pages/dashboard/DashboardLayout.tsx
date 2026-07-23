import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/sidebar'
import { authService } from '@/services/auth'
import { farmerProfileService } from '@/services/farmerProfile'

export default function DashboardLayout() {
  const location = useLocation()
  const user = authService.getCurrentUser()
  const isFarmer = user?.role === 'farmer' && authService.isAuthenticated()
  const cachedCompletion = farmerProfileService.getCachedCompletion(user?.id)
  const [profileComplete, setProfileComplete] = useState<boolean | null>(
    isFarmer ? cachedCompletion : true
  )

  useEffect(() => {
    if (!isFarmer || !user?.id) {
      setProfileComplete(true)
      return
    }

    let cancelled = false
    farmerProfileService.get({ name: user.name, phone: user.phone })
      .then(({ completed }) => {
        if (cancelled) return
        farmerProfileService.setCachedCompletion(user.id, completed)
        setProfileComplete(completed)
      })
      .catch(() => {
        if (!cancelled) setProfileComplete(cachedCompletion ?? false)
      })

    return () => { cancelled = true }
  }, [cachedCompletion, isFarmer, user?.id, user?.name, user?.phone])

  const needsFarmerProfile =
    isFarmer &&
    profileComplete === false &&
    location.pathname !== '/dashboard/farmer-profile'
  const compactPublicPaths = new Set(['/dashboard', '/dashboard/crops', '/dashboard/ai', '/dashboard/disease', '/dashboard/weather'])
  const isCompactPublicHome = !authService.isAuthenticated() && compactPublicPaths.has(location.pathname)
  const isPublicHomepage = !authService.isAuthenticated() && location.pathname === '/dashboard'
  const usesCommandCenterChrome =
    isPublicHomepage ||
    location.pathname === '/dashboard/disease' ||
    location.pathname === '/dashboard/crops' ||
    location.pathname === '/dashboard/ai' ||
    location.pathname === '/dashboard/weather'

  if (isFarmer && profileComplete === null && location.pathname !== '/dashboard/farmer-profile') {
    return <div className="min-h-screen bg-background" />
  }

  if (needsFarmerProfile) {
    return <Navigate to="/dashboard/farmer-profile" replace />
  }

  return (
    <div className={isCompactPublicHome ? "h-dvh overflow-hidden bg-background" : "min-h-screen bg-background"}>
      {!usesCommandCenterChrome && <Sidebar />}
      <main className={
        usesCommandCenterChrome
          ? "h-dvh overflow-hidden"
          : isCompactPublicHome
            ? "h-dvh overflow-hidden pb-20 lg:pl-72 lg:pb-0"
            : "min-h-screen pb-24 lg:pl-72 lg:pb-0"
      }>
        <Outlet />
      </main>
    </div>
  )
}
