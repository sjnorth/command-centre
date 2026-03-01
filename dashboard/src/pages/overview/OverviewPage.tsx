import { useQuery } from '@tanstack/react-query'
import { Briefcase, CheckSquare, Plane } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { SentimentBadge } from '@/components/shared/SentimentBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { actionItemsApi, projectsApi, reflectionsApi, travelApi } from '@/lib/api'
import { keys } from '@/lib/queryKeys'
import { formatDate, timeAgo } from '@/lib/utils'

function StatsCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ElementType
  label: string
  value: number
  loading: boolean
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-zinc-800">
            <Icon className="h-5 w-5 text-zinc-400" />
          </div>
          <div>
            {loading ? (
              <Skeleton className="h-7 w-8 mb-1 bg-zinc-800" />
            ) : (
              <p className="text-2xl font-semibold text-zinc-100">{value}</p>
            )}
            <p className="text-xs text-zinc-500">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function OverviewPage() {
  const today = new Date().toISOString().split('T')[0]!

  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: keys.projects.all,
    queryFn: projectsApi.list,
  })
  const { data: actionItems, isLoading: loadingItems } = useQuery({
    queryKey: keys.actionItems.all,
    queryFn: () => actionItemsApi.list(),
  })
  const { data: travel, isLoading: loadingTravel } = useQuery({
    queryKey: keys.travel.all,
    queryFn: travelApi.list,
  })
  const { data: recentReflections, isLoading: loadingReflections } = useQuery({
    queryKey: keys.reflections.filtered({ limit: 5 }),
    queryFn: () => reflectionsApi.list({ limit: 5 }),
  })

  const activeProjects = projects?.filter((p) => p.status === 'active').length ?? 0
  const openItems =
    actionItems?.filter((i) => i.status !== 'completed' && i.status !== 'cancelled').length ?? 0
  const upcomingTravel = travel?.filter((t) => t.start_date && t.start_date >= today).length ?? 0

  const pendingHighPriority =
    actionItems
      ?.filter(
        (i) =>
          (i.status === 'pending' || i.status === 'in_progress') &&
          (i.priority === 'high' || i.priority === 'urgent'),
      )
      .slice(0, 5) ?? []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-100">Overview</h1>
        <p className="text-sm text-zinc-500 mt-1">{new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatsCard icon={Briefcase} label="Active projects" value={activeProjects} loading={loadingProjects} />
        <StatsCard icon={CheckSquare} label="Open action items" value={openItems} loading={loadingItems} />
        <StatsCard icon={Plane} label="Upcoming trips" value={upcomingTravel} loading={loadingTravel} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Reflections */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center justify-between">
              Recent reflections
              <Link to="/reflections" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                View all →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingReflections ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 bg-zinc-800" />)}
              </div>
            ) : recentReflections?.length === 0 ? (
              <p className="text-zinc-500 text-sm py-4 text-center">No reflections yet</p>
            ) : (
              <div className="space-y-3">
                {recentReflections?.map((r) => (
                  <div key={r.id} className="border-b border-zinc-800 pb-3 last:border-0 last:pb-0">
                    <p className="text-zinc-300 text-sm line-clamp-2">{r.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-zinc-600 text-xs">{timeAgo(r.created_at)}</span>
                      {r.sentiment && <SentimentBadge sentiment={r.sentiment} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Action Items */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center justify-between">
              High priority items
              <Link to="/action-items" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                View all →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingItems ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 bg-zinc-800" />)}
              </div>
            ) : pendingHighPriority.length === 0 ? (
              <p className="text-zinc-500 text-sm py-4 text-center">No high priority items</p>
            ) : (
              <div className="space-y-2">
                {pendingHighPriority.map((item) => (
                  <div key={item.id} className="flex items-start gap-2 border-b border-zinc-800 pb-2 last:border-0 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-300 text-sm truncate">{item.title}</p>
                      {item.due_date && (
                        <p className="text-zinc-600 text-xs mt-0.5">Due {formatDate(item.due_date)}</p>
                      )}
                    </div>
                    <PriorityBadge priority={item.priority} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
