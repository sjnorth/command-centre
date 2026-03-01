import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Mail, Pencil, Phone, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { clientsApi } from '@/lib/api'
import { keys } from '@/lib/queryKeys'
import type { Client, ClientCreate } from '@/types'
import ClientForm from './ClientForm'

export default function ClientsPage() {
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [deleteClient, setDeleteClient] = useState<Client | null>(null)

  const { data: clients, isLoading } = useQuery({
    queryKey: keys.clients.all,
    queryFn: clientsApi.list,
  })

  const createMutation = useMutation({
    mutationFn: (data: ClientCreate) => clientsApi.create(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.clients.all })
      setCreateOpen(false)
      toast.success('Client created')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientCreate> }) =>
      clientsApi.update(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.clients.all })
      setEditClient(null)
      toast.success('Client updated')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientsApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.clients.all })
      setDeleteClient(null)
      toast.success('Client deleted')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div>
      <PageHeader
        title="Clients"
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New client
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 bg-zinc-800 rounded-lg" />)}
        </div>
      ) : clients?.length === 0 ? (
        <EmptyState
          message="No clients yet."
          action={<Button size="sm" onClick={() => setCreateOpen(true)}>Add your first client</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {clients?.map((client) => (
            <Card key={client.id} className="bg-zinc-800/80 border-zinc-700 hover:border-zinc-700 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base text-zinc-100 truncate">{client.name}</CardTitle>
                    {client.company && (
                      <p className="text-zinc-500 text-xs mt-0.5">{client.company}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setEditClient(client)} className="p-1 text-zinc-600 hover:text-zinc-400 transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleteClient(client)} className="p-1 text-zinc-600 hover:text-red-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {client.email && (
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                      <Mail className="h-3 w-3" /> {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                      <Phone className="h-3 w-3" /> {client.phone}
                    </div>
                  )}
                  {client.notes && (
                    <p className="text-zinc-600 text-xs line-clamp-2 mt-2">{client.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-zinc-800/80 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">New client</DialogTitle>
          </DialogHeader>
          <ClientForm
            onSubmit={(data) => createMutation.mutate(data)}
            loading={createMutation.isPending}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editClient} onOpenChange={(open) => !open && setEditClient(null)}>
        <DialogContent className="bg-zinc-800/80 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Edit client</DialogTitle>
          </DialogHeader>
          {editClient && (
            <ClientForm
              defaultValues={editClient}
              onSubmit={(data) => editMutation.mutate({ id: editClient.id, data })}
              loading={editMutation.isPending}
              onCancel={() => setEditClient(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteClient}
        onOpenChange={(open) => !open && setDeleteClient(null)}
        title="Delete client"
        description={`Delete "${deleteClient?.name}"?`}
        onConfirm={() => deleteClient && deleteMutation.mutate(deleteClient.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
