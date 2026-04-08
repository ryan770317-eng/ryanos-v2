import Link from 'next/link'
import { ArrowLeft, MailSearch, ExternalLink } from 'lucide-react'

export default function EmailScanPage() {
  return (
    <div className="flex flex-col gap-6 pb-16">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--text-primary)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} />
          返回
        </Link>
        <div className="flex items-center gap-2">
          <MailSearch size={18} style={{ color: 'var(--text-primary)' }} />
          <h1 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>
            Email 掃描
          </h1>
        </div>
      </div>

      {/* Phase 1 quick-launch */}
      <div
        className="flex flex-col gap-4 p-6 rounded-[var(--radius-card)] border"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Phase 1：快捷啟動</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            透過 Claude 對話執行 Email 掃描。點擊下方按鈕，開啟 Claude 並自動帶入指令。
          </p>
        </div>

        <a
          href="https://claude.ai/new?q=%E5%B9%AB%E6%88%91%E6%8E%83%E6%8F%8F%E6%9C%80%E8%BF%9124%E5%B0%8F%E6%99%82%E7%9A%84%E6%9C%AA%E8%AE%80%20Gmail%EF%BC%8C%E5%88%86%E9%A1%9E%EF%BC%9A%F0%9F%94%B4%20%E9%9C%80%E7%AB%8B%E5%8D%B3%E8%99%95%E7%90%86%20%2F%20%F0%9F%9F%A1%20%E4%BB%8A%E5%A4%A9%E5%85%A7%20%2F%20%F0%9F%9F%A2%20%E5%AD%98%E6%AA%94%EF%BC%8C%E6%AF%8F%E5%B0%81%E4%B8%80%E8%A1%8C%E6%91%98%E8%A6%81%E3%80%82"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 rounded-[var(--radius-btn)] font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--text-primary)' }}
        >
          <ExternalLink size={15} />
          開啟 Claude 掃描 Email
        </a>
      </div>

      {/* Phase 2 roadmap */}
      <div
        className="p-5 rounded-[var(--radius-card)] border text-sm"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      >
        <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Phase 2 規劃（尚未開發）</p>
        <ul className="list-disc list-inside space-y-1">
          <li>OAuth 2.0 Gmail 授權</li>
          <li>自動抓取 24 小時未讀信件</li>
          <li>Claude 分類 + 摘要報告，在頁面內顯示</li>
        </ul>
      </div>
    </div>
  )
}
