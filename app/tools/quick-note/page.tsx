import { BackButton } from '@/components/layout/BackButton'
import { EmptyState } from '@/components/shared/EmptyState'

export default function QuickNotePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>
          光速筆記
        </h1>
      </div>
      <EmptyState
        title="功能開發中"
        description="語音速記 → AI 分析，功能細節確認後開發。"
      />
    </div>
  )
}
