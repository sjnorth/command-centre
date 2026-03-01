import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ActionItem } from '@/types'

const colours: Record<ActionItem['priority'], string> = {
  low: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/15',
  medium: 'bg-blue-500/15 text-blue-400 border-blue-500/20 hover:bg-blue-500/15',
  high: 'bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/15',
  urgent: 'bg-red-500/15 text-red-400 border-red-500/20 hover:bg-red-500/15',
}

const labels: Record<ActionItem['priority'], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export function PriorityBadge({ priority }: { priority: ActionItem['priority'] }) {
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', colours[priority])}>
      {labels[priority]}
    </Badge>
  )
}
