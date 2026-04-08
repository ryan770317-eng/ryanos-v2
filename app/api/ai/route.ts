import { NextResponse } from 'next/server'
import { toolLog } from '@/lib/logger'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, content, options } = body as {
      type: string
      content: string
      options?: Record<string, unknown>
    }

    await toolLog('ai-route', 'info', `收到請求 type=${type}`, {
      contentLength: content?.length,
      options,
    })

    // TODO: Implement per-type Claude API calls
    return NextResponse.json(
      { success: false, error: '尚未實作' },
      { status: 501 }
    )
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    await toolLog('ai-route', 'error', error.message, { stack: error.stack })
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
