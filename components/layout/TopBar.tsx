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
      className="sticky top-0 z-40 flex items-center justify-between px-5 py-3 md:px-8"
    >
      <Link href="/" className="no-underline flex items-center" aria-label="RYANOS">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-black.svg"
          alt="RYANOS"
          style={{ height: 28, width: 'auto' }}
        />
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
