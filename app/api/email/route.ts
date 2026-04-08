import { NextResponse } from 'next/server'
import { toolLog } from '@/lib/logger'

export async function POST(req: Request) {
  const toolId = 'email-scan'
  try {
    try {
      await req.json()
    } catch {
      return NextResponse.json({ success: false, error: '請提供有效的 JSON body' }, { status: 400 })
    }
    // Placeholder — to be implemented in P5
    await toolLog(toolId, 'info', '收到 Email 掃描請求（尚未實作）')
    return NextResponse.json({ success: false, error: '尚未實作' }, { status: 501 })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    await toolLog(toolId, 'error', error.message, { stack: error.stack })
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
