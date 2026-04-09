'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'ryanos_todos'

function getWeekDates(): string[] {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day === 0 ? 7 : day) - 1))
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

export function WeeklyProgressCard() {
  const [stats, setStats] = useState({ total: 0, done: 0, dailyAvg: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
      const weekDates = getWeekDates()
      let total = 0
      let done = 0
      let daysWithTasks = 0
      for (const date of weekDates) {
        const items = all[date] ?? []
        if (items.length > 0) daysWithTasks++
        total += items.length
        done += items.filter((t: { completed: boolean }) => t.completed).length
      }
      setStats({
        total,
        done,
        dailyAvg: daysWithTasks > 0 ? Math.round(total / daysWithTasks) : 0,
      })
    } catch { /* empty */ }
    setMounted(true)
  }, [])

  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

  // Health indicator — read thresholds from settings
  let warningThreshold = 8
  let dangerThreshold = 12
  if (typeof window !== 'undefined') {
    try {
      const s = JSON.parse(localStorage.getItem('ryanos_settings') ?? '{}')
      if (s.healthThreshold) {
        warningThreshold = s.healthThreshold.warning ?? 8
        dangerThreshold = s.healthThreshold.danger ?? 12
      }
    } catch { /* empty */ }
  }

  let healthColor = 'var(--color-success)'
  let healthLabel = '健康'
  if (stats.dailyAvg > dangerThreshold) {
    healthColor = 'var(--color-danger)'
    healthLabel = '超標'
  } else if (stats.dailyAvg > warningThreshold) {
    healthColor = 'var(--color-warning)'
    healthLabel = '注意'
  }

  // SVG ring
  const r = 28
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  return (
    <div
      className="h-full flex items-center gap-4"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        padding: 'var(--card-padding)',
      }}
    >
      {/* Ring chart */}
      <div className="relative shrink-0" style={{ width: 68, height: 68 }}>
        <svg width="68" height="68" viewBox="0 0 68 68">
          <circle
            cx="34" cy="34" r={r}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="5"
          />
          <circle
            cx="34" cy="34" r={r}
            fill="none"
            stroke={healthColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={mounted ? offset : c}
            transform="rotate(-90 34 34)"
            style={{ transition: 'stroke-dashoffset 800ms ease' }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums"
        >
          {mounted ? `${pct}%` : '—'}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
          本週待辦進度
        </span>
        <span className="text-xs tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
          {stats.done} / {stats.total} 完成
        </span>
        {mounted && stats.total > 0 && (
          <span
            className="badge mt-0.5"
            style={{ backgroundColor: healthColor + '20', color: healthColor }}
          >
            {healthLabel}・日均 {stats.dailyAvg} 項
          </span>
        )}
      </div>
    </div>
  )
}
