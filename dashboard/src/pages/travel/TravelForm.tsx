import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { TravelPlan, TravelPlanCreate } from '@/types'

const schema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  purpose: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface TravelFormProps {
  defaultValues?: Partial<TravelPlan>
  onSubmit: (data: TravelPlanCreate) => void
  loading?: boolean
  onCancel: () => void
}

export default function TravelForm({ defaultValues, onSubmit, loading, onCancel }: TravelFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      destination: defaultValues?.destination ?? '',
      start_date: defaultValues?.start_date ?? '',
      end_date: defaultValues?.end_date ?? '',
      purpose: defaultValues?.purpose ?? '',
      notes: defaultValues?.notes ?? '',
    },
  })

  const handleSubmit = (values: FormValues) => {
    const data: TravelPlanCreate = {
      destination: values.destination,
      ...(values.start_date && { start_date: values.start_date }),
      ...(values.end_date && { end_date: values.end_date }),
      ...(values.purpose && { purpose: values.purpose }),
      ...(values.notes && { notes: values.notes }),
    }
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField control={form.control} name="destination" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-300">Destination</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Tokyo, Japan" className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-500" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="start_date" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">Start date</FormLabel>
              <FormControl>
                <Input type="date" className="bg-zinc-700 border-zinc-600 text-zinc-100" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="end_date" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">End date</FormLabel>
              <FormControl>
                <Input type="date" className="bg-zinc-700 border-zinc-600 text-zinc-100" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="purpose" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-300">Purpose</FormLabel>
            <FormControl>
              <Input placeholder="Business, conference, holiday…" className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-500" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-300">Notes</FormLabel>
            <FormControl>
              <Textarea placeholder="Any additional notes…" className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-500 resize-none" rows={3} {...field} />
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
