import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ActionItem, Project } from '@/types'

const projectColours: Record<Project['status'], string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15',
  on_hold: 'bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/15',
  completed: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/15',
  archived: 'bg-zinc-700/15 text-zinc-500 border-zinc-700/20 hover:bg-zinc-700/15',
}

const actionItemColours: Record<ActionItem['status'], string> = {
  pending: 'bg-blue-500/15 text-blue-400 border-blue-500/20 hover:bg-blue-500/15',
  in_progress: 'bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/15',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15',
  cancelled: 'bg-zinc-700/15 text-zinc-500 border-zinc-700/20 hover:bg-zinc-700/15',
}

const labels: Record<string, string> = {
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  archived: 'Archived',
  pending: 'Pending',
  in_progress: 'In Progress',
  cancelled: 'Cancelled',
}

interface StatusBadgeProps {
  status: Project['status'] | ActionItem['status']
  variant?: 'project' | 'action'
}

export function StatusBadge({ status, variant = 'action' }: StatusBadgeProps) {
  const colours = variant === 'project' ? projectColours : actionItemColours
  const colour = (colours as Record<string, string>)[status] ?? ''
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', colour)}>
      {labels[status] ?? status}
    </Badge>
  )
}
