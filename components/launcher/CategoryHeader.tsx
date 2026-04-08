import { Brain, Briefcase, User, HeartPulse } from 'lucide-react'
import type { CategoryId } from '@/types'

const ICONS: Record<CategoryId, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  knowledge: Brain,
  work: Briefcase,
  personal: User,
  health: HeartPulse,
}

const CATEGORY_COLORS: Record<CategoryId, string> = {
  knowledge: 'var(--cat-knowledge)',
  work: 'var(--cat-work)',
  personal: 'var(--cat-personal)',
  health: 'var(--cat-health)',
}

interface CategoryHeaderProps {
  id: CategoryId
  name: string
}

export function CategoryHeader({ id, name }: CategoryHeaderProps) {
  const Icon = ICONS[id]
  const color = CATEGORY_COLORS[id]

  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
      >
        <Icon size={14} style={{ color }} />
      </div>
      <h2
        className="text-sm font-bold tracking-wide"
        style={{ color: 'var(--text-primary)' }}
      >
        {name}
      </h2>
    </div>
  )
}
