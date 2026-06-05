import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/sidebar'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-72 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
