import { User, TrendingUp, Eye, Heart } from 'lucide-react'

export default function SocialPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-display">雜男萊恩</h1>
      <p className="text-caption">Instagram 社群數據監控</p>

      {/* Mock KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: '粉絲數', value: '—', icon: User },
          { label: '觸及數', value: '—', icon: TrendingUp },
          { label: 'Reels 觀看', value: '—', icon: Eye },
          { label: '互動率', value: '—', icon: Heart },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bento-card flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <kpi.icon size={14} style={{ color: 'var(--color-text-tertiary)' }} />
              <span className="text-caption">{kpi.label}</span>
            </div>
            <span className="text-hero">{kpi.value}</span>
          </div>
        ))}
      </div>

      <div
        className="bento-card flex flex-col items-center justify-center py-16 gap-3"
        style={{ borderStyle: 'dashed', borderColor: 'var(--color-border-dash)' }}
      >
        <User size={32} style={{ color: 'var(--color-text-tertiary)' }} />
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          需串接 Meta Graph API
        </p>
        <p className="text-micro">
          Instagram Business 帳號 + Facebook Page Token
        </p>
      </div>
    </div>
  )
}
