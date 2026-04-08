'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-sm transition-colors hover:text-[var(--text-primary)]"
      style={{ color: 'var(--text-secondary)' }}
    >
      <ArrowLeft size={16} />
      返回
    </button>
  )
}
