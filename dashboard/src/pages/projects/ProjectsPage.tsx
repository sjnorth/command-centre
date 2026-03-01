import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { projectsApi } from '@/lib/api'
import { keys } from '@/lib/queryKeys'
import { timeAgo } from '@/lib/utils'
import type { Project, ProjectCreate } from '@/types'
import ProjectForm from './ProjectForm'

export default function ProjectsPage() {
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)

  const { data: projects, isLoading } = useQuery({
    queryKey: keys.projects.all,
    queryFn: projectsApi.list,
  })

  const createMutation = useMutation({
    mutationFn: (data: ProjectCreate) => projectsApi.create(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.projects.all })
      setCreateOpen(false)
      toast.success('Project created')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectCreate> }) =>
      projectsApi.update(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.projects.all })
      setEditProject(null)
      toast.success('Project updated')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.projects.all })
      setDeleteProject(null)
      toast.success('Project deleted')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div>
      <PageHeader
        title="Projects"
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New project
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 bg-zinc-800 rounded-lg" />)}
        </div>
      ) : projects?.length === 0 ? (
        <EmptyState
          message="No projects yet."
          action={<Button size="sm" onClick={() => setCreateOpen(true)}>Create your first project</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {projects?.map((project) => (
            <Card key={project.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/projects/${project.id}`} className="flex-1 min-w-0">
                    <CardTitle className="text-base text-zinc-100 hover:text-white truncate">
                      {project.name}
                    </CardTitle>
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditProject(project)}
                      className="p-1 text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteProject(project)}
                      className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <StatusBadge status={project.status} variant="project" />
              </CardHeader>
              <CardContent>
                {project.description && (
                  <p className="text-zinc-400 text-sm line-clamp-2 mb-2">{project.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-zinc-600">
                  <Link to={`/projects/${project.id}`} className="flex items-center gap-1 hover:text-zinc-400 transition-colors">
                    <Users className="h-3 w-3" /> View clients
                  </Link>
                  <span>{timeAgo(project.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">New project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            onSubmit={(data) => createMutation.mutate(data)}
            loading={createMutation.isPending}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editProject} onOpenChange={(open) => !open && setEditProject(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Edit project</DialogTitle>
          </DialogHeader>
          {editProject && (
            <ProjectForm
              defaultValues={editProject}
              onSubmit={(data) => editMutation.mutate({ id: editProject.id, data })}
              loading={editMutation.isPending}
              onCancel={() => setEditProject(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteProject}
        onOpenChange={(open) => !open && setDeleteProject(null)}
        title="Delete project"
        description={`Are you sure you want to delete "${deleteProject?.name}"? This cannot be undone.`}
        onConfirm={() => deleteProject && deleteMutation.mutate(deleteProject.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
