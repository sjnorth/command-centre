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

const ACCENT = '#05f7a4'

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
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: ACCENT }}>
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
                  ? 'font-medium'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200',
              )
            }
            style={({ isActive }) =>
              isActive
                ? { color: ACCENT, backgroundColor: 'rgba(5, 247, 164, 0.08)' }
                : {}
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
