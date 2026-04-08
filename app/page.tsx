import { tools } from '@/lib/tools-registry'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { ToolGrid } from '@/components/launcher/ToolGrid'
import Link from 'next/link'
import { Settings } from 'lucide-react'

async function getConfiguredKeys(): Promise<string[]> {
  if (!isSupabaseConfigured) return []
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('key')
    if (error) return []
    return (data ?? []).map((row: { key: string }) => row.key)
  } catch {
    return []
  }
}

export default async function HomePage() {
  const configuredKeys = await getConfiguredKeys()

  return (
    <>
      {!isSupabaseConfigured && (
        <div
          className="mb-6 flex items-center justify-between gap-3 px-4 py-3 rounded-[var(--radius-card)] text-sm"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--text-primary)' }}
        >
          <span className="font-medium">尚未設定 Supabase — 請填入 .env.local</span>
          <Link href="/settings" className="flex items-center gap-1 font-semibold shrink-0">
            <Settings size={14} />
            設定
          </Link>
        </div>
      )}
      <ToolGrid tools={tools} configuredKeys={configuredKeys} />
    </>
  )
}
