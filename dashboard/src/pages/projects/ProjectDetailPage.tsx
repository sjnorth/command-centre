import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { actionItemsApi, clientsApi, projectsApi } from '@/lib/api'
import { keys } from '@/lib/queryKeys'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [selectedClientId, setSelectedClientId] = useState('')

  const { data: project, isLoading } = useQuery({
    queryKey: keys.projects.detail(id!),
    queryFn: () => projectsApi.get(id!),
    enabled: !!id,
  })

  const { data: linkedClients } = useQuery({
    queryKey: keys.projects.clients(id!),
    queryFn: () => projectsApi.listClients(id!),
    enabled: !!id,
  })

  const { data: allClients } = useQuery({
    queryKey: keys.clients.all,
    queryFn: clientsApi.list,
  })

  const { data: projectItems } = useQuery({
    queryKey: keys.actionItems.filtered({ project_id: id }),
    queryFn: () => actionItemsApi.list({ project_id: id }),
    enabled: !!id,
  })

  const linkMutation = useMutation({
    mutationFn: (clientId: string) => projectsApi.linkClient(id!, clientId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.projects.clients(id!) })
      setSelectedClientId('')
      toast.success('Client linked')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const unlinkMutation = useMutation({
    mutationFn: (clientId: string) => projectsApi.unlinkClient(id!, clientId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.projects.clients(id!) })
      toast.success('Client unlinked')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const linkedIds = new Set(linkedClients?.map((c) => c.id) ?? [])
  const availableClients = allClients?.filter((c) => !linkedIds.has(c.id)) ?? []

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-48 mb-4 bg-zinc-800" />
        <Skeleton className="h-32 bg-zinc-800 rounded-lg" />
      </div>
    )
  }

  if (!project) return <p className="text-zinc-500">Project not found.</p>

  return (
    <div>
      <Link to="/projects" className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-300 text-sm mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>

      {/* Project info */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold text-zinc-100">{project.name}</h1>
          <StatusBadge status={project.status} variant="project" />
        </div>
        {project.description && (
          <p className="text-zinc-400 text-sm">{project.description}</p>
        )}
      </div>

      <Separator className="bg-zinc-800 mb-6" />

      <div className="grid grid-cols-2 gap-6">
        {/* Linked clients */}
        <Card className="bg-zinc-700/60 border-zinc-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400">Linked clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-3">
              {linkedClients?.length === 0 && (
                <p className="text-zinc-600 text-sm">No clients linked yet</p>
              )}
              {linkedClients?.map((client) => (
                <span
                  key={client.id}
                  className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-full"
                >
                  {client.name}
                  {client.company && <span className="text-zinc-500">· {client.company}</span>}
                  <button
                    onClick={() => unlinkMutation.mutate(client.id)}
                    className="ml-1 text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            {availableClients.length > 0 && (
              <div className="flex gap-2">
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="bg-zinc-700 border-zinc-600 text-zinc-100 text-xs h-8 flex-1">
                    <SelectValue placeholder="Add a client…" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-700 border-zinc-600">
                    {availableClients.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-zinc-100 text-xs">
                        {c.name}{c.company ? ` (${c.company})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => selectedClientId && linkMutation.mutate(selectedClientId)}
                  disabled={!selectedClientId || linkMutation.isPending}
                  className="h-8 text-xs"
                >
                  Link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action items */}
        <Card className="bg-zinc-700/60 border-zinc-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center justify-between">
              Action items
              <Link to={`/action-items`} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                View all →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectItems?.length === 0 ? (
              <p className="text-zinc-600 text-sm">No action items for this project</p>
            ) : (
              <div className="space-y-2">
                {projectItems?.slice(0, 6).map((item) => (
                  <div key={item.id} className="flex items-center gap-2 border-b border-zinc-800 pb-2 last:border-0 last:pb-0">
                    <StatusBadge status={item.status} variant="action" />
                    <span className="text-zinc-300 text-sm flex-1 truncate">{item.title}</span>
                    <PriorityBadge priority={item.priority} />
                  </div>
                ))}
                {(projectItems?.length ?? 0) > 6 && (
                  <p className="text-zinc-600 text-xs text-center pt-1">+{(projectItems?.length ?? 0) - 6} more</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
