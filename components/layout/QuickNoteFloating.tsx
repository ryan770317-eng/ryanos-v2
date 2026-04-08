'use client'

import { useState } from 'react'
import { PenLine, X } from 'lucide-react'

export function QuickNoteFloating() {
  const [showToast, setShowToast] = useState(false)

  function handleClick() {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2500)
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: 'var(--accent)' }}
        aria-label="光速筆記"
      >
        <PenLine size={22} style={{ color: 'var(--text-primary)' }} />
      </button>

      {showToast && (
        <div
          className="fixed bottom-24 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-[var(--radius-btn)] shadow-lg text-sm font-medium"
          style={{
            backgroundColor: 'var(--text-primary)',
            color: 'var(--bg)',
          }}
        >
          <span>光速筆記即將推出</span>
          <button
            onClick={() => setShowToast(false)}
            className="opacity-60 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </>
  )
}
