import { Outlet } from 'react-router-dom'
import { CooperativeSidebar } from '@/components/cooperative-sidebar'

export default function CooperativeLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      <CooperativeSidebar />
      <main className="min-h-screen min-w-0 flex-1 overflow-x-hidden pb-20 lg:pl-72 lg:pb-0">
        <Outlet />
      </main>
    </div>
  )
}
