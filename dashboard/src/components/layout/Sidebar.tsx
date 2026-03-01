import {
  BookOpen,
  Briefcase,
  CheckSquare,
  LayoutDashboard,
  Plane,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: Briefcase },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/travel', label: 'Travel', icon: Plane },
  { to: '/reflections', label: 'Reflections', icon: BookOpen },
  { to: '/action-items', label: 'Action Items', icon: CheckSquare },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col py-6">
      <div className="px-5 mb-8">
        <span className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
          Command Centre
        </span>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
