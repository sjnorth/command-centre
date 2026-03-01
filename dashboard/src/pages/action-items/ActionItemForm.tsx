import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { projectsApi } from '@/lib/api'
import { keys } from '@/lib/queryKeys'
import type { ActionItemCreate } from '@/types'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.string().optional(),
  project_id: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface ActionItemFormProps {
  onSubmit: (data: ActionItemCreate) => void
  loading?: boolean
  onCancel: () => void
}

export default function ActionItemForm({ onSubmit, loading, onCancel }: ActionItemFormProps) {
  const { data: projects } = useQuery({ queryKey: keys.projects.all, queryFn: projectsApi.list })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium' },
  })

  const handleSubmit = (values: FormValues) => {
    const data: ActionItemCreate = {
      title: values.title,
      ...(values.description && { description: values.description }),
      priority: values.priority,
      ...(values.due_date && { due_date: values.due_date }),
      ...(values.project_id && values.project_id !== 'none' && { project_id: values.project_id }),
    }
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-300">Title</FormLabel>
            <FormControl>
              <Input placeholder="What needs to be done?" className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-500" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-300">Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Optional details…" className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-500 resize-none" rows={2} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="priority" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-zinc-700 border-zinc-600 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-zinc-700 border-zinc-600">
                  <SelectItem value="low" className="text-zinc-100">Low</SelectItem>
                  <SelectItem value="medium" className="text-zinc-100">Medium</SelectItem>
                  <SelectItem value="high" className="text-zinc-100">High</SelectItem>
                  <SelectItem value="urgent" className="text-zinc-100">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="due_date" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">Due date</FormLabel>
              <FormControl>
                <Input type="date" className="bg-zinc-700 border-zinc-600 text-zinc-100" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        {projects && projects.length > 0 && (
          <FormField control={form.control} name="project_id" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">Project</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-zinc-700 border-zinc-600 text-zinc-100">
                    <SelectValue placeholder="Link to a project (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-zinc-700 border-zinc-600">
                  <SelectItem value="none" className="text-zinc-100">No project</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-zinc-100">{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel} className="text-zinc-400 hover:text-zinc-100">Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
        </div>
      </form>
    </Form>
  )
}
