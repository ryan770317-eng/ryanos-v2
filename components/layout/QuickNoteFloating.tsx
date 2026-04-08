'use client'

import Link from 'next/link'
import { PenLine } from 'lucide-react'

export function QuickNoteFloating() {
  return (
    <Link
      href="/tools/quick-note"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
      style={{ backgroundColor: 'var(--accent)' }}
      aria-label="光速筆記"
    >
      <PenLine size={22} style={{ color: 'var(--text-primary)' }} />
    </Link>
  )
}
