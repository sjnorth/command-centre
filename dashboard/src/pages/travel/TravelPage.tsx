import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { travelApi } from '@/lib/api'
import { keys } from '@/lib/queryKeys'
import { formatDate, isUpcoming } from '@/lib/utils'
import type { TravelPlan, TravelPlanCreate } from '@/types'
import TravelForm from './TravelForm'

export default function TravelPage() {
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editPlan, setEditPlan] = useState<TravelPlan | null>(null)
  const [deletePlan, setDeletePlan] = useState<TravelPlan | null>(null)

  const { data: plans, isLoading } = useQuery({
    queryKey: keys.travel.all,
    queryFn: travelApi.list,
  })

  const createMutation = useMutation({
    mutationFn: (data: TravelPlanCreate) => travelApi.create(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.travel.all })
      setCreateOpen(false)
      toast.success('Travel plan created')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TravelPlanCreate> }) =>
      travelApi.update(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.travel.all })
      setEditPlan(null)
      toast.success('Travel plan updated')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => travelApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.travel.all })
      setDeletePlan(null)
      toast.success('Deleted')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div>
      <PageHeader
        title="Travel"
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New trip
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 bg-zinc-800 rounded-lg" />)}
        </div>
      ) : plans?.length === 0 ? (
        <EmptyState
          message="No travel plans yet."
          action={<Button size="sm" onClick={() => setCreateOpen(true)}>Add a trip</Button>}
        />
      ) : (
        <div className="space-y-3">
          {plans?.map((plan) => {
            const upcoming = isUpcoming(plan.start_date)
            return (
              <Card key={plan.id} className={`bg-zinc-800/80 border-zinc-700 hover:border-zinc-700 transition-colors ${upcoming ? 'border-l-2 border-l-emerald-500' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-zinc-500 shrink-0" />
                      <CardTitle className="text-base text-zinc-100">{plan.destination}</CardTitle>
                      {upcoming && (
                        <span className="text-xs text-emerald-500 font-medium">Upcoming</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setEditPlan(plan)} className="p-1 text-zinc-600 hover:text-zinc-400 transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeletePlan(plan)} className="p-1 text-zinc-600 hover:text-red-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
                    <CalendarDays className="h-3 w-3" />
                    {plan.start_date || plan.end_date ? (
                      <span>{formatDate(plan.start_date)} — {formatDate(plan.end_date)}</span>
                    ) : (
                      <span>Dates TBD</span>
                    )}
                  </div>
                  {plan.purpose && <p className="text-zinc-400 text-sm">{plan.purpose}</p>}
                  {plan.notes && <p className="text-zinc-600 text-xs mt-1 line-clamp-2">{plan.notes}</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-zinc-800/80 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">New trip</DialogTitle>
          </DialogHeader>
          <TravelForm
            onSubmit={(data) => createMutation.mutate(data)}
            loading={createMutation.isPending}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editPlan} onOpenChange={(open) => !open && setEditPlan(null)}>
        <DialogContent className="bg-zinc-800/80 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Edit trip</DialogTitle>
          </DialogHeader>
          {editPlan && (
            <TravelForm
              defaultValues={editPlan}
              onSubmit={(data) => editMutation.mutate({ id: editPlan.id, data })}
              loading={editMutation.isPending}
              onCancel={() => setEditPlan(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletePlan}
        onOpenChange={(open) => !open && setDeletePlan(null)}
        title="Delete trip"
        description={`Delete the trip to "${deletePlan?.destination}"?`}
        onConfirm={() => deletePlan && deleteMutation.mutate(deletePlan.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
