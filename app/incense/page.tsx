import { Flame } from 'lucide-react'

export default function IncensePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-display">製香工作區</h1>
      <p className="text-caption">即將連動 Sinus Note</p>

      <div
        className="bento-card flex flex-col items-center justify-center py-20 gap-4"
        style={{ borderStyle: 'dashed', borderColor: 'var(--color-border-dash)' }}
      >
        <Flame size={40} style={{ color: 'var(--color-text-tertiary)' }} />
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            製香配方管理
          </p>
          <p className="text-micro mt-1">
            未來將從 Firestore 讀取 Sinus Note 進行中的配方
          </p>
        </div>
      </div>
    </div>
  )
}
