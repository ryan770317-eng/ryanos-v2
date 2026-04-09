'use client'

import { useState } from 'react'
import { RyanScoreCard } from '@/components/dashboard/RyanScoreCard'
import { ProjectsCard } from '@/components/dashboard/ProjectsCard'
import { ScreenshotCard } from '@/components/dashboard/ScreenshotCard'
import { WeeklyProgressCard } from '@/components/dashboard/WeeklyProgressCard'
import { WeeklyPlanner } from '@/components/dashboard/WeeklyPlanner'

export default function OverviewPage() {
  const [plannerOpen, setPlannerOpen] = useState(false)

  return (
    <>
      {/* Mobile: stack */}
      <div className="flex flex-col gap-[var(--grid-gap)] md:hidden">
        <div style={{ minHeight: 320 }}>
          <RyanScoreCard onOpenPlanner={() => setPlannerOpen(true)} />
        </div>
        <div style={{ minHeight: 240 }}>
          <ProjectsCard />
        </div>
        <div style={{ minHeight: 100 }}>
          <ScreenshotCard />
        </div>
        <div style={{ minHeight: 100 }}>
          <WeeklyProgressCard />
        </div>
      </div>

      {/* Desktop: 6-col bento grid */}
      <div
        className="hidden md:grid gap-[var(--grid-gap)]"
        style={{
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridAutoRows: '100px',
        }}
      >
        {/* Ryan Score — 2×3 */}
        <div style={{ gridColumn: 'span 2', gridRow: 'span 3' }}>
          <RyanScoreCard onOpenPlanner={() => setPlannerOpen(true)} />
        </div>

        {/* 手邊專案 — 2×2 */}
        <div style={{ gridColumn: 'span 2', gridRow: 'span 2' }}>
          <ProjectsCard />
        </div>

        {/* 截圖辨識 — 2×1 */}
        <div style={{ gridColumn: 'span 2', gridRow: 'span 1' }}>
          <ScreenshotCard />
        </div>

        {/* 本週待辦進度 — 2×1 */}
        <div style={{ gridColumn: 'span 2', gridRow: 'span 1' }}>
          <WeeklyProgressCard />
        </div>
      </div>

      {/* Weekly Planner modal */}
      <WeeklyPlanner open={plannerOpen} onClose={() => setPlannerOpen(false)} />
    </>
  )
}
