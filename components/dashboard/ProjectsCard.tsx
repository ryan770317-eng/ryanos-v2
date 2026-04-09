'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Project {
  id: string
  name: string
  status: 'active' | 'completed'
  createdAt: string
}

const STORAGE_KEY = 'ryanos_projects'

function loadProjects(): Project[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch { return [] }
}

export function ProjectsCard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setProjects(loadProjects())
    setMounted(true)
  }, [])

  const active = projects.filter((p) => p.status === 'active')
  const completed = projects.filter((p) => p.status === 'completed')

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface-alt)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        padding: 'var(--card-padding)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
          手邊專案
        </span>
        <Link
          href="/projects"
          className="flex items-center gap-0.5 text-[10px] font-medium no-underline transition-colors"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          全部 <ChevronRight size={12} />
        </Link>
      </div>

      {/* KPI row */}
      <div className="flex gap-6 mb-3">
        <div>
          <div className="text-hero tabular-nums">{mounted ? active.length : '—'}</div>
          <div className="text-micro">進行中</div>
        </div>
        <div>
          <div className="text-hero tabular-nums" style={{ color: 'var(--color-success)' }}>
            {mounted ? completed.length : '—'}
          </div>
          <div className="text-micro">已完成</div>
        </div>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {active.length === 0 && mounted && (
          <p className="text-micro py-4 text-center" style={{ color: 'var(--color-text-tertiary)' }}>
            尚無進行中專案
          </p>
        )}
        {active.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between py-1.5"
          >
            <span className="text-xs font-medium truncate">{p.name}</span>
            <span
              className="badge shrink-0 ml-2"
              style={{ backgroundColor: 'var(--color-accent-soft)', color: '#cca300' }}
            >
              進行中
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-2 mt-auto" style={{ borderTop: '1px solid var(--color-border)' }}>
        <span className="text-micro">手動標記｜進行中 / 完成</span>
      </div>
    </div>
  )
}
