import { BackButton } from '@/components/layout/BackButton'
import { EmptyState } from '@/components/shared/EmptyState'

export default function EmailScanPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>
          Email 掃描
        </h1>
      </div>
      <EmptyState
        title="P5 開發中"
        description="每日信箱摘要。Phase 1 快捷入口，Phase 2 接 Gmail API。"
      />
    </div>
  )
}
