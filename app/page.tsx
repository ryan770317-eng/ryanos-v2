import { tools } from '@/lib/tools-registry'
import { supabase } from '@/lib/supabase'
import { ToolGrid } from '@/components/launcher/ToolGrid'

async function getConfiguredKeys(): Promise<string[]> {
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

  return <ToolGrid tools={tools} configuredKeys={configuredKeys} />
}
