import { cn } from '@/lib/utils'

function getSentimentColour(sentiment: string): string {
  const s = sentiment.toLowerCase()
  if (s.includes('positive') || s.includes('optimistic') || s.includes('good') || s.includes('great'))
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
  if (s.includes('frustrated') || s.includes('negative') || s.includes('bad') || s.includes('poor'))
    return 'bg-red-500/15 text-red-400 border-red-500/20'
  if (s.includes('neutral'))
    return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20'
  return 'bg-amber-500/15 text-amber-400 border-amber-500/20'
}

export function SentimentBadge({ sentiment }: { sentiment: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
        getSentimentColour(sentiment),
      )}
    >
      {sentiment}
    </span>
  )
}
