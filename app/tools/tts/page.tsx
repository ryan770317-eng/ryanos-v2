import { BackButton } from '@/components/layout/BackButton'
import { EmptyState } from '@/components/shared/EmptyState'

export default function TtsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>
          出言不遜
        </h1>
      </div>
      <EmptyState
        title="P2 開發中"
        description="腳本 → 語音，從現有 TTS 程式碼遷移。"
      />
    </div>
  )
}
