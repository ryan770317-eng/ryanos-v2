import { NextResponse } from 'next/server'
import { toolLog } from '@/lib/logger'

export async function POST(req: Request) {
  const toolId = 'tts'
  try {
    await req.json() // Placeholder — to be implemented in P2
    await toolLog(toolId, 'info', '收到 TTS 請求（尚未實作）')
    return NextResponse.json({ success: false, error: '尚未實作' }, { status: 501 })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    await toolLog(toolId, 'error', error.message, { stack: error.stack })
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
