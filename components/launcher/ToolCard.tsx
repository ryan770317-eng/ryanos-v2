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

interface ToolCardProps {
  tool: Tool
  missingKeys?: boolean
}

export function ToolCard({ tool, missingKeys = false }: ToolCardProps) {
  const Icon = ICON_MAP[tool.icon] ?? PenLine
  const isComingSoon = tool.status === 'coming-soon'
  const isExternal = tool.type === 'external'

  const cardContent = (
    <div
      className="relative flex flex-col gap-3 p-5 rounded-[var(--radius-card)] border transition-all duration-200 group"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        opacity: isComingSoon ? 0.5 : 1,
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* External link indicator */}
      {isExternal && !isComingSoon && (
        <ExternalLink
          size={12}
          className="absolute top-3 right-3"
          style={{ color: 'var(--text-secondary)' }}
        />
      )}

      {/* Lock indicator */}
      {missingKeys && !isComingSoon && (
        <Lock
          size={12}
          className="absolute top-3 right-3"
          style={{ color: 'var(--text-secondary)' }}
        />
      )}

      {/* Coming Soon badge */}
      {isComingSoon && (
        <span
          className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          即將推出
        </span>
      )}

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-[var(--radius-btn)] flex items-center justify-center transition-colors duration-200"
        style={{ backgroundColor: 'var(--bg)' }}
      >
        <Icon
          size={20}
          strokeWidth={1.5}
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* Text */}
      <div>
        <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>
          {tool.name}
        </p>
        <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-secondary)' }}>
          {tool.subtitle}
        </p>
      </div>

      {/* Hover accent border */}
      <div
        className="absolute inset-0 rounded-[var(--radius-card)] border-2 border-transparent transition-colors duration-200 group-hover:border-[var(--accent)] pointer-events-none"
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
