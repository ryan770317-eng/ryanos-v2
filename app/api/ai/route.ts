import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { toolLog } from '@/lib/logger'
import { PODCAST_SERIES } from '@/lib/podcast-prompts'

async function getClaudeKey(): Promise<string | null> {
  const { data } = await supabase
    .from('user_settings')
    .select('encrypted_value')
    .eq('key', 'CLAUDE_API_KEY')
    .single()
  return data?.encrypted_value ?? null
}

// Model per type
const MODEL_MAP: Record<string, string> = {
  'podcast-script': 'claude-sonnet-4-6',
  'quick-note-analyze': 'claude-haiku-4-5-20251001',
  'invoice-process': 'claude-haiku-4-5-20251001',
  'email-classify': 'claude-haiku-4-5-20251001',
}

export async function POST(req: Request) {
  const toolId = 'ai-route'
  try {
    const body = await req.json() as {
      type: string
      content: string
      options?: Record<string, unknown>
    }
    const { type, content, options } = body

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

    const client = new Anthropic({ apiKey })
    const model = MODEL_MAP[type] ?? 'claude-haiku-4-5-20251001'

    await toolLog(toolId, 'info', `開始 AI 請求 type=${type}`, {
      model,
      contentLength: content.length,
    })

    let systemPrompt = ''
    let userMessage = content

    if (type === 'podcast-script') {
      const seriesId = (options?.seriesId as string) ?? 'hx-story'
      const series = PODCAST_SERIES[seriesId]
      if (!series) {
        return NextResponse.json({ success: false, error: `未知系列: ${seriesId}` }, { status: 400 })
      }
      systemPrompt = series.systemPrompt
    } else if (type === 'quick-note-analyze') {
      systemPrompt = `你是助理。分析以下筆記，以 JSON 格式回傳：
{"summary": "3句內摘要", "todos": ["待辦1", "待辦2"], "mood": "情緒/語氣標記（選填）"}
只輸出 JSON，不要多餘文字。`
    } else if (type === 'invoice-process') {
      systemPrompt = `你是發票整理助手。分析使用者的發票資料，按類別整理並列出明細。`
    } else if (type === 'email-classify') {
      systemPrompt = `你是 Email 助手。分析信件，依緊急程度分類（🔴 立即處理 / 🟡 今天內 / 🟢 存檔），每封一行摘要。`
    } else {
      return NextResponse.json({ success: false, error: `未知 type: ${type}` }, { status: 400 })
    }

    const message = await client.messages.create({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const resultText = message.content
      .filter((c) => c.type === 'text')
      .map((c) => (c as { type: 'text'; text: string }).text)
      .join('')

    await toolLog(toolId, 'info', `AI 回傳完成 type=${type}`, {
      outputLength: resultText.length,
      usage: message.usage,
    })

    return NextResponse.json({ success: true, result: resultText })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    await toolLog(toolId, 'error', error.message, { stack: error.stack })
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
