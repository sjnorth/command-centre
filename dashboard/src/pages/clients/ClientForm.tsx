import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Client, ClientCreate } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface ClientFormProps {
  defaultValues?: Partial<Client>
  onSubmit: (data: ClientCreate) => void
  loading?: boolean
  onCancel: () => void
}

export default function ClientForm({ defaultValues, onSubmit, loading, onCancel }: ClientFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      company: defaultValues?.company ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      notes: defaultValues?.notes ?? '',
    },
  })

  const handleSubmit = (values: FormValues) => {
    const data: ClientCreate = {
      name: values.name,
      ...(values.company && { company: values.company }),
      ...(values.email && { email: values.email }),
      ...(values.phone && { phone: values.phone }),
      ...(values.notes && { notes: values.notes }),
    }
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-300">Name</FormLabel>
            <FormControl>
              <Input placeholder="Client name" className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-500" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="company" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-300">Company</FormLabel>
            <FormControl>
              <Input placeholder="Company name" className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-500" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">Phone</FormLabel>
              <FormControl>
                <Input placeholder="+61 4xx xxx xxx" className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-300">Notes</FormLabel>
            <FormControl>
              <Textarea placeholder="Any notes about this client…" className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-500 resize-none" rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel} className="text-zinc-400 hover:text-zinc-100">Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
        </div>
      </form>
    </Form>
  )
}
