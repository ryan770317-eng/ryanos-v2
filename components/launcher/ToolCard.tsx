'use client'

import Link from 'next/link'
import {
  PenLine, Mic, Clapperboard, ScrollText, MailSearch, Receipt,
  GraduationCap, MoonStar, Wind, HeartPulse, ExternalLink, Lock,
} from 'lucide-react'
import type { Tool } from '@/types'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>> = {
  'pen-line': PenLine,
  'mic': Mic,
  'clapperboard': Clapperboard,
  'scroll-text': ScrollText,
  'mail-search': MailSearch,
  'receipt': Receipt,
  'graduation-cap': GraduationCap,
  'moon-star': MoonStar,
  'wind': Wind,
  'heart-pulse': HeartPulse,
}

const CATEGORY_COLORS: Record<string, { bg: string; icon: string }> = {
  knowledge: { bg: 'var(--cat-knowledge-soft)', icon: 'var(--cat-knowledge)' },
  work: { bg: 'var(--cat-work-soft)', icon: 'var(--cat-work)' },
  personal: { bg: 'var(--cat-personal-soft)', icon: 'var(--cat-personal)' },
  health: { bg: 'var(--cat-health-soft)', icon: 'var(--cat-health)' },
}

interface ToolCardProps {
  tool: Tool
  missingKeys?: boolean
}

export function ToolCard({ tool, missingKeys = false }: ToolCardProps) {
  const Icon = ICON_MAP[tool.icon] ?? PenLine
  const isComingSoon = tool.status === 'coming-soon'
  const isExternal = tool.type === 'external'
  const catColor = CATEGORY_COLORS[tool.category] ?? CATEGORY_COLORS.work

  const cardContent = (
    <div
      className="relative flex flex-col gap-3.5 p-5 rounded-[var(--radius-card)] transition-all duration-200 group"
      style={{
        backgroundColor: 'var(--surface-raised)',
        opacity: isComingSoon ? 0.45 : 1,
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* External link indicator */}
      {isExternal && !isComingSoon && (
        <ExternalLink
          size={12}
          className="absolute top-3.5 right-3.5"
          style={{ color: 'var(--text-tertiary)' }}
        />
      )}

      {/* Lock indicator */}
      {missingKeys && !isComingSoon && (
        <Lock
          size={12}
          className="absolute top-3.5 right-3.5"
          style={{ color: 'var(--text-tertiary)' }}
        />
      )}

      {/* Coming Soon badge */}
      {isComingSoon && (
        <span
          className="absolute top-3.5 right-3.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: 'var(--border-light)', color: 'var(--text-tertiary)' }}
        >
          即將推出
        </span>
      )}

      {/* Icon with category color */}
      <div
        className="w-11 h-11 rounded-[var(--radius-btn)] flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
        style={{ backgroundColor: catColor.bg }}
      >
        <Icon
          size={20}
          strokeWidth={1.8}
          style={{ color: catColor.icon }}
        />
      </div>

      {/* Text */}
      <div>
        <p className="font-semibold text-[15px] leading-tight" style={{ color: 'var(--text-primary)' }}>
          {tool.name}
        </p>
        <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--text-secondary)' }}>
          {tool.subtitle}
        </p>
      </div>

      {/* Hover accent bottom line */}
      <div
        className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-[var(--accent)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"
      />
    </div>
  )

  if (isComingSoon) {
    return <div className="cursor-default">{cardContent}</div>
  }

  if (missingKeys) {
    return (
      <Link href="/settings" className="no-underline block">
        {cardContent}
      </Link>
    )
  }

  if (isExternal) {
    const url = tool.externalUrl
    if (!url) {
      return (
        <Link href="/settings" className="no-underline block">
          {cardContent}
        </Link>
      )
    }
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="no-underline block">
        {cardContent}
      </a>
    )
  }

  return (
    <Link href={tool.route!} className="no-underline block">
      {cardContent}
    </Link>
  )
}
