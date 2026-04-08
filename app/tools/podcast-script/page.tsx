import { BackButton } from '@/components/layout/BackButton'
import { EmptyState } from '@/components/shared/EmptyState'

export default function PodcastScriptPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>
          腳本魔法師
        </h1>
      </div>
      <EmptyState
        title="P4 開發中"
        description="知識 → TTS 腳本，Claude API + hx-podcast prompt 移植。"
      />
    </div>
  )
}
