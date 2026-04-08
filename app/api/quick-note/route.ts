import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { toolLog } from '@/lib/logger'

async function getClaudeKey(): Promise<string | null> {
  const { data } = await supabase
    .from('user_settings')
    .select('encrypted_value')
    .eq('key', 'CLAUDE_API_KEY')
    .single()
  return data?.encrypted_value ?? null
}

// POST /api/quick-note — analyze a note with Claude Haiku
export async function POST(req: Request) {
  const toolId = 'quick-note'
  try {
    let body: { content: string; noteId?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ success: false, error: '請提供有效的 JSON body' }, { status: 400 })
    }
    const { content, noteId } = body

    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: '內容不能為空' }, { status: 400 })
    }

    const apiKey = await getClaudeKey()
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: '請先在設定頁填入 Claude API Key' },
        { status: 400 }
      )
    }

    await toolLog(toolId, 'info', 'AI 分析開始', { contentLength: content.length })

    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `你是助理。分析使用者的語音筆記，以 JSON 格式回傳：
{"summary": "3句內的摘要", "todos": ["待辦1", "待辦2"], "mood": "情緒/語氣（選填，一個詞）"}
只輸出 JSON，不要任何多餘文字。`,
      messages: [{ role: 'user', content }],
    })

    const rawText = message.content
      .filter((c) => c.type === 'text')
      .map((c) => (c as { type: 'text'; text: string }).text)
      .join('')

    let analysis: { summary: string; todos: string[]; mood?: string }
    try {
      analysis = JSON.parse(rawText)
    } catch {
      analysis = { summary: rawText, todos: [] }
    }

    // Update the note in Supabase if noteId provided
    if (noteId) {
      await supabase
        .from('quick_notes')
        .update({ analysis })
        .eq('id', noteId)
    }

    await toolLog(toolId, 'info', 'AI 分析完成', { todos: analysis.todos?.length })
    return NextResponse.json({ success: true, analysis })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    await toolLog(toolId, 'error', error.message, { stack: error.stack })
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
