import { BackButton } from '@/components/layout/BackButton'
import { EmptyState } from '@/components/shared/EmptyState'

export default function InvoicePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>
          發票整理
        </h1>
      </div>
      <EmptyState
        title="P5 開發中"
        description="發票分類匯出 PDF。Phase 1 快捷入口，Phase 2 接載具 API。"
      />
    </div>
  )
}
