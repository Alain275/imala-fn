import { Outlet } from 'react-router-dom'
import { AgronomistSidebar } from '@/components/agronomist-sidebar'

export default function AgronomistLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      <AgronomistSidebar />
      <main className="lg:pl-72 min-h-screen flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
