'use client'

import { useState } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'

interface ToastProps {
  message: string
  detail?: string
  level?: 'info' | 'warn' | 'error'
  onClose: () => void
}

export function Toast({ message, detail, level = 'info', onClose }: ToastProps) {
  const [expanded, setExpanded] = useState(false)

  const bgColors: Record<string, string> = {
    info: 'var(--text-primary)',
    warn: '#ff9500',
    error: '#ff3b30',
  }

  return (
    <div
      className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto rounded-[var(--radius-card)] shadow-lg overflow-hidden"
      style={{ backgroundColor: bgColors[level] }}
    >
      <div className="flex items-start gap-3 p-4">
        <p className="flex-1 text-sm font-medium text-white leading-snug">{message}</p>
        <div className="flex items-center gap-1 shrink-0">
          {detail && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-white opacity-70 hover:opacity-100"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
          <button onClick={onClose} className="text-white opacity-70 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      </div>
      {expanded && detail && (
        <div className="px-4 pb-4">
          <pre className="text-xs text-white opacity-80 whitespace-pre-wrap break-all">
            {detail}
          </pre>
        </div>
      )}
    </div>
  )
}
