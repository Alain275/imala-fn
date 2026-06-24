import { Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="light bg-background text-foreground min-h-screen">
      <Outlet />
    </div>
  )
}
