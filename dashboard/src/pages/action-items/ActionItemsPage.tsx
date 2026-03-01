import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { actionItemsApi } from '@/lib/api'
import { keys } from '@/lib/queryKeys'
import { formatDate, nextStatus } from '@/lib/utils'
import type { ActionItem, ActionItemCreate } from '@/types'
import ActionItemForm from './ActionItemForm'

type StatusFilter = 'all' | ActionItem['status']

export default function ActionItemsPage() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<ActionItem['priority'] | 'all'>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<ActionItem | null>(null)

  const params = {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
  }

  const { data: items, isLoading } = useQuery({
    queryKey: keys.actionItems.filtered(params),
    queryFn: () => actionItemsApi.list(params),
  })

  const createMutation = useMutation({
    mutationFn: (data: ActionItemCreate) => actionItemsApi.create(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.actionItems.all })
      setCreateOpen(false)
      toast.success('Action item created')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ActionItem['status'] }) =>
      actionItemsApi.update(id, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: keys.actionItems.filtered(params) })
      const previous = qc.getQueryData(keys.actionItems.filtered(params))
      qc.setQueryData(keys.actionItems.filtered(params), (old: ActionItem[] | undefined) =>
        old?.map((item) => (item.id === id ? { ...item, status } : item)),
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(keys.actionItems.filtered(params), ctx.previous)
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: keys.actionItems.all })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => actionItemsApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.actionItems.all })
      setDeleteItem(null)
      toast.success('Deleted')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div>
      <PageHeader
        title="Action Items"
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New item
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="all" className="data-[state=active]:bg-zinc-800 text-xs">All</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-zinc-800 text-xs">Pending</TabsTrigger>
            <TabsTrigger value="in_progress" className="data-[state=active]:bg-zinc-800 text-xs">In Progress</TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-zinc-800 text-xs">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as ActionItem['priority'] | 'all')}>
          <SelectTrigger className="w-36 bg-zinc-900 border-zinc-800 text-zinc-300 text-xs h-9">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="all" className="text-zinc-300 text-xs">All priorities</SelectItem>
            <SelectItem value="urgent" className="text-zinc-300 text-xs">Urgent</SelectItem>
            <SelectItem value="high" className="text-zinc-300 text-xs">High</SelectItem>
            <SelectItem value="medium" className="text-zinc-300 text-xs">Medium</SelectItem>
            <SelectItem value="low" className="text-zinc-300 text-xs">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 bg-zinc-900 rounded-lg" />)}
        </div>
      ) : items?.length === 0 ? (
        <EmptyState message="No action items match your filters." />
      ) : (
        <div className="space-y-1">
          {items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 hover:border-zinc-700 transition-colors"
            >
              <button
                onClick={() => statusMutation.mutate({ id: item.id, status: nextStatus(item.status) })}
                className="shrink-0"
                title="Click to advance status"
              >
                <StatusBadge status={item.status} variant="action" />
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${item.status === 'completed' ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-zinc-500 text-xs truncate mt-0.5">{item.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.due_date && (
                  <span className="text-zinc-600 text-xs">{formatDate(item.due_date)}</span>
                )}
                <PriorityBadge priority={item.priority} />
                {item.source === 'ai_generated' && (
                  <span className="text-zinc-600 text-xs">AI</span>
                )}
                <button
                  onClick={() => setDeleteItem(item)}
                  className="text-zinc-700 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">New action item</DialogTitle>
          </DialogHeader>
          <ActionItemForm
            onSubmit={(data) => createMutation.mutate(data)}
            loading={createMutation.isPending}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        title="Delete action item"
        description={`Delete "${deleteItem?.title}"?`}
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
