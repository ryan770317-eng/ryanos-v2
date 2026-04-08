import { Brain, Briefcase, User, HeartPulse } from 'lucide-react'
import type { CategoryId } from '@/types'

const ICONS: Record<CategoryId, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  knowledge: Brain,
  work: Briefcase,
  personal: User,
  health: HeartPulse,
}

interface CategoryHeaderProps {
  id: CategoryId
  name: string
}

export function CategoryHeader({ id, name }: CategoryHeaderProps) {
  const Icon = ICONS[id]

  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={16} style={{ color: 'var(--text-secondary)' }} />
      <h2
        className="text-sm font-semibold uppercase tracking-widest"
        style={{ color: 'var(--text-secondary)' }}
      >
        {name}
      </h2>
    </div>
  )
}
