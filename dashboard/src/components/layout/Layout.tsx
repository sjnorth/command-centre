import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
      <Toaster theme="dark" />
    </div>
  )
}
