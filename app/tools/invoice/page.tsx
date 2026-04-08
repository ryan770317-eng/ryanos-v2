import Link from 'next/link'
import { ArrowLeft, Receipt, ExternalLink } from 'lucide-react'

export default function InvoicePage() {
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
          <Receipt size={18} style={{ color: 'var(--text-primary)' }} />
          <h1 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>
            發票整理
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
            透過 Claude 對話執行發票整理。點擊下方按鈕，開啟 Claude 並自動帶入指令。
          </p>
        </div>

        <a
          href="https://claude.ai/new?q=%E5%B9%AB%E6%88%91%E6%95%B4%E7%90%86%E7%99%BC%E7%A5%A8%EF%BC%8C%E8%AB%8B%E5%95%8F%E6%88%91%E6%95%B4%E7%90%86%E5%93%AA%E5%80%8B%E5%8D%80%E9%96%93%E7%9A%84%E7%99%BC%E7%A5%A8%EF%BC%9F%E6%95%B4%E7%90%86%E5%AE%8C%E6%88%90%E5%BE%8C%E5%8C%AF%E5%87%BA%20PDF%20%E5%A0%B1%E8%A1%A8%E3%80%82"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 rounded-[var(--radius-btn)] font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--text-primary)' }}
        >
          <ExternalLink size={15} />
          開啟 Claude 整理發票
        </a>
      </div>

      {/* Phase 2 roadmap */}
      <div
        className="p-5 rounded-[var(--radius-card)] border text-sm"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      >
        <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Phase 2 規劃（尚未開發）</p>
        <ul className="list-disc list-inside space-y-1">
          <li>選擇整理區間（e.g. 2026/03-04）</li>
          <li>手動輸入或匯入載具 API 資料</li>
          <li>Claude 分類整理 + 匯出 PDF 報表</li>
        </ul>
      </div>
    </div>
  )
}
