import { supabase } from './supabase'

type LogLevel = 'info' | 'warn' | 'error'

export async function toolLog(
  toolId: string,
  level: LogLevel,
  message: string,
  detail?: Record<string, unknown>
) {
  const fn =
    level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  fn(`[${toolId}] ${message}`, detail ?? '')

  supabase
    .from('tool_logs')
    .insert({ tool_id: toolId, level, message, detail })
    .then(({ error }) => {
      if (error) console.error('[logger] Failed to write log:', error)
    })
}
