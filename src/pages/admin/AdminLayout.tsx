import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/admin-sidebar'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="min-h-screen min-w-0 flex-1 overflow-x-hidden pb-20 lg:pl-72 lg:pb-0">
        <Outlet />
      </main>
    </div>
  )
}
