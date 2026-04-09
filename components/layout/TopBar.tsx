'use client'

// Legacy TopBar — replaced by Sidebar in V3
// Kept for reference; not imported by layout.tsx

import Link from 'next/link'
import { Settings } from 'lucide-react'

export function TopBar() {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-5 py-3.5 md:px-8"
      style={{
        backgroundColor: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <Link href="/" className="no-underline flex items-center" aria-label="RYANOS">
        <span className="font-display text-lg font-bold">RYANOS</span>
      </Link>
      <Link
        href="/settings"
        className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <Settings size={18} />
      </Link>
    </header>
  )
}
