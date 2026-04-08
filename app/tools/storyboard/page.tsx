import { BackButton } from '@/components/layout/BackButton'
import { EmptyState } from '@/components/shared/EmptyState'

export default function StoryboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>
          麥麥分鏡
        </h1>
      </div>
      <EmptyState
        title="P3 開發中"
        description="口白 → AI 分鏡圖，從 McD_reels 遷移。"
      />
    </div>
  )
}
