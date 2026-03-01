import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { SentimentBadge } from '@/components/shared/SentimentBadge'
import PageHeader from '@/components/layout/PageHeader'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { clientsApi, projectsApi, reflectionsApi } from '@/lib/api'
import { keys } from '@/lib/queryKeys'
import { timeAgo } from '@/lib/utils'
import type { ActionItem, AnalysisResponse, Reflection, ReflectionCreate } from '@/types'

function AnalysisResult({ result }: { result: AnalysisResponse }) {
  return (
    <div className="mt-3 pt-3 border-t border-zinc-800">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-3.5 w-3.5 text-zinc-500" />
        <span className="text-xs text-zinc-500 font-medium">Claude's analysis</span>
      </div>
      {result.reflection.summary && (
        <p className="text-zinc-300 text-sm mb-3">{result.reflection.summary}</p>
      )}
      {result.action_items.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 mb-2">Suggested action items:</p>
          <div className="space-y-1.5">
            {result.action_items.map((item: ActionItem) => (
              <div key={item.id} className="flex items-center gap-2 bg-zinc-800/50 rounded px-3 py-2">
                <span className="text-zinc-300 text-xs flex-1">{item.title}</span>
                <PriorityBadge priority={item.priority} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ReflectionCard({
  reflection,
  onDelete,
}: {
  reflection: Reflection
  onDelete: () => void
}) {
  const qc = useQueryClient()
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null)

  const analyseMutation = useMutation({
    mutationFn: () => reflectionsApi.analyze(reflection.id),
    onSuccess: (result) => {
      setAnalysisResult(result)
      qc.setQueryData(keys.reflections.all, (old: Reflection[] | undefined) =>
        old?.map((r) => (r.id === reflection.id ? result.reflection : r)),
      )
      void qc.invalidateQueries({ queryKey: keys.actionItems.all })
      toast.success('Analysis complete')
    },
    onError: (err: Error) => toast.error(`Analysis failed: ${err.message}`),
  })

  const currentSentiment = analysisResult?.reflection.sentiment ?? reflection.sentiment

  return (
    <Card className="bg-zinc-800/80 border-zinc-700 hover:border-zinc-700 transition-colors">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-zinc-200 text-sm leading-relaxed flex-1">{reflection.content}</p>
          <button
            onClick={onDelete}
            className="text-zinc-700 hover:text-red-400 transition-colors shrink-0 mt-0.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-zinc-600 text-xs">{timeAgo(reflection.created_at)}</span>
          {currentSentiment && <SentimentBadge sentiment={currentSentiment} />}
        </div>

        {reflection.summary && !analysisResult && (
          <p className="text-zinc-400 text-sm italic mb-3 border-l-2 border-zinc-700 pl-3">
            {reflection.summary}
          </p>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => analyseMutation.mutate()}
          disabled={analyseMutation.isPending}
          className="border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 text-xs h-7"
        >
          {analyseMutation.isPending ? (
            <>
              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              Analysing…
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3 mr-1.5" />
              Analyse
            </>
          )}
        </Button>

        {analysisResult && <AnalysisResult result={analysisResult} />}
      </CardContent>
    </Card>
  )
}

function NewReflectionForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [content, setContent] = useState('')
  const [projectId, setProjectId] = useState('')
  const [clientId, setClientId] = useState('')

  const { data: projects } = useQuery({ queryKey: keys.projects.all, queryFn: projectsApi.list })
  const { data: clients } = useQuery({ queryKey: keys.clients.all, queryFn: clientsApi.list })

  const createMutation = useMutation({
    mutationFn: (data: ReflectionCreate) => reflectionsApi.create(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.reflections.all })
      setContent('')
      setProjectId('')
      setClientId('')
      onClose()
      toast.success('Reflection saved')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleSubmit = () => {
    if (!content.trim()) return
    const data: ReflectionCreate = {
      content: content.trim(),
      ...(projectId && projectId !== 'none' && { project_id: projectId }),
      ...(clientId && clientId !== 'none' && { client_id: clientId }),
    }
    createMutation.mutate(data)
  }

  return (
    <Card className="bg-zinc-900 border-zinc-700 mb-6">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-zinc-300 font-medium">New reflection</span>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What happened today? How did it go?"
          className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 resize-none mb-3"
          rows={4}
          autoFocus
        />
        <div className="flex items-center gap-2 mb-3">
          {projects && projects.length > 0 && (
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-400 text-xs h-8 w-44">
                <SelectValue placeholder="Link project…" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="none" className="text-zinc-400 text-xs">No project</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-zinc-100 text-xs">{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {clients && clients.length > 0 && (
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-400 text-xs h-8 w-44">
                <SelectValue placeholder="Link client…" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="none" className="text-zinc-400 text-xs">No client</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-zinc-100 text-xs">{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? 'Saving…' : 'Save reflection'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ReflectionsPage() {
  const [showForm, setShowForm] = useState(false)
  const [deleteReflection, setDeleteReflection] = useState<Reflection | null>(null)
  const qc = useQueryClient()

  const { data: reflections, isLoading } = useQuery({
    queryKey: keys.reflections.all,
    queryFn: () => reflectionsApi.list(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reflectionsApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.reflections.all })
      setDeleteReflection(null)
      toast.success('Deleted')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div>
      <PageHeader
        title="Reflections"
        action={
          !showForm ? (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" /> New reflection
            </Button>
          ) : undefined
        }
      />

      {showForm && <NewReflectionForm onClose={() => setShowForm(false)} />}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 bg-zinc-900 rounded-lg" />)}
        </div>
      ) : reflections?.length === 0 && !showForm ? (
        <EmptyState
          message="No reflections yet. Add your first one after a client session."
          action={<Button size="sm" onClick={() => setShowForm(true)}>Add reflection</Button>}
        />
      ) : (
        <div className="space-y-3">
          {reflections?.map((r) => (
            <ReflectionCard
              key={r.id}
              reflection={r}
              onDelete={() => setDeleteReflection(r)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteReflection}
        onOpenChange={(open) => !open && setDeleteReflection(null)}
        title="Delete reflection"
        description="Are you sure? This cannot be undone."
        onConfirm={() => deleteReflection && deleteMutation.mutate(deleteReflection.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
