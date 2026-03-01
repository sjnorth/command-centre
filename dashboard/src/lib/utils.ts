import { type ClassValue, clsx } from 'clsx'
import { format, formatDistanceToNow, isAfter } from 'date-fns'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return format(new Date(dateStr), 'd MMM yyyy')
}

export function timeAgo(isoStr: string): string {
  return formatDistanceToNow(new Date(isoStr), { addSuffix: true })
}

export function isUpcoming(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  return isAfter(new Date(dateStr), new Date())
}

export function nextStatus(
  current: 'pending' | 'in_progress' | 'completed' | 'cancelled',
): 'pending' | 'in_progress' | 'completed' | 'cancelled' {
  const cycle: Record<string, 'pending' | 'in_progress' | 'completed' | 'cancelled'> = {
    pending: 'in_progress',
    in_progress: 'completed',
    completed: 'pending',
    cancelled: 'pending',
  }
  return cycle[current] ?? 'pending'
}
