'use client'

import Link from 'next/link'
import { Settings } from 'lucide-react'

export function TopBar() {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-5 py-3.5 md:px-8"
      style={{
        backgroundColor: 'var(--bg)',
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      <Link href="/" className="no-underline flex items-center" aria-label="RYANOS">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-black.svg"
          alt="RYANOS"
          style={{ height: 26, width: 'auto' }}
        />
      </Link>

      <Link
        href="/settings"
        className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-btn)] transition-all duration-150 btn-press"
        style={{ color: 'var(--text-secondary)' }}
        aria-label="設定"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent)'
          e.currentTarget.style.color = 'var(--text-primary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }}
      >
        <Settings size={18} />
      </Link>
    </header>
  )
}
