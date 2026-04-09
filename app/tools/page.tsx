import { tools } from '@/lib/tools-registry'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { ToolGrid } from '@/components/launcher/ToolGrid'

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

export default async function ToolsPage() {
  const configuredKeys = await getConfiguredKeys()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-display">工具</h1>
      <ToolGrid tools={tools} configuredKeys={configuredKeys} />
    </div>
  )
}
