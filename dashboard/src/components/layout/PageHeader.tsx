import { Separator } from '@/components/ui/separator'

interface PageHeaderProps {
  title: string
  action?: React.ReactNode
}

export default function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-zinc-100">{title}</h1>
        {action && <div>{action}</div>}
      </div>
      <Separator className="bg-zinc-800" />
    </div>
  )
}
