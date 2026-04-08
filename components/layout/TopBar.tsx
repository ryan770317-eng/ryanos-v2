'use client'

import Link from 'next/link'
import { Settings } from 'lucide-react'

export function TopBar() {
  return (
    <header
      style={{
        backgroundColor: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
      }}
      className="sticky top-0 z-40 flex items-center justify-between px-5 py-4 md:px-8"
    >
      <Link href="/" className="no-underline">
        <span
          className="font-display text-2xl tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          RYANOS
        </span>
      </Link>

      <Link
        href="/settings"
        className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-btn)] transition-colors hover:bg-[var(--accent)]"
        aria-label="設定"
      >
        <Settings size={20} style={{ color: 'var(--text-secondary)' }} />
      </Link>
    </header>
  )
}
