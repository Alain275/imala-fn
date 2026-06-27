import { Outlet } from 'react-router-dom'
import { CooperativeSidebar } from '@/components/cooperative-sidebar'

export default function CooperativeLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      <CooperativeSidebar />
      <main className="lg:pl-72 min-h-screen flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
