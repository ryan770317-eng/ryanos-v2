'use client'

import Link from 'next/link'
import { Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeProvider'
import { useTheme } from '@/components/ThemeProvider'

export function TopBar() {
  const { theme } = useTheme()

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-5 py-3.5 md:px-8"
      style={{
        backgroundColor: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border-light)',
      }}
    >
      <Link href="/" className="no-underline flex items-center" aria-label="RYANOS">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={theme === 'dark' ? '/logo-white.svg' : '/logo-black.svg'}
          alt="RYANOS"
          style={{ height: 26, width: 'auto' }}
        />
      </Link>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Link
          href="/settings"
          className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] transition-all duration-150 btn-press"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="設定"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-accent)'
            e.currentTarget.style.color = 'var(--color-text)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--color-text-secondary)'
          }}
        >
          <Settings size={18} />
        </Link>
      </div>
    </header>
  )
}
