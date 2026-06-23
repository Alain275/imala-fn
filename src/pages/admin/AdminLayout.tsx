import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/admin-sidebar'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="lg:pl-72 min-h-screen flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
