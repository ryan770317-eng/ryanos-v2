import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { toolLog } from '@/lib/logger'
import { buildImagenPrompt, generateImage } from '@/lib/storyboard-prompts'

export const maxDuration = 60

async function getApiKey(): Promise<string | null> {
  const { data } = await supabase
    .from('user_settings')
    .select('encrypted_value')
    .eq('key', 'GOOGLE_AI_API_KEY')
    .single()
  return data?.encrypted_value ?? null
}

export interface StoryboardFrameResult {
  index: number
  prompt?: string
  imageBase64?: string
  error?: string
}

export async function POST(req: Request) {
  const toolId = 'storyboard'
  try {
    let body: { segment: string; index: number; fullScript: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ success: false, error: '請提供有效的 JSON body' }, { status: 400 })
    }

    const { segment, index, fullScript } = body

    if (!segment || typeof index !== 'number') {
      return NextResponse.json({ success: false, error: 'Missing required fields: segment, index' }, { status: 400 })
    }

    const apiKey = await getApiKey()
    if (!apiKey) {
      return NextResponse.json(
        { success: false, index, error: '請先在設定頁填入 Google AI API Key' },
        { status: 400 }
      )
    }

    await toolLog(toolId, 'info', `分鏡 #${index + 1} 開始生成`, { segmentLength: segment.length })

    // Step 1: Build Imagen prompt via Gemini
    let prompt: string
    try {
      prompt = await buildImagenPrompt(segment, fullScript ?? segment, apiKey)
    } catch (err) {
      const result: StoryboardFrameResult = {
        index,
        error: `Prompt 生成失敗: ${err instanceof Error ? err.message : String(err)}`,
      }
      await toolLog(toolId, 'error', `分鏡 #${index + 1} Gemini 失敗`, { error: result.error })
      return NextResponse.json(result)
    }

    // Step 2: Generate image via Imagen
    try {
      const imageBase64 = await generateImage(prompt, apiKey)
      await toolLog(toolId, 'info', `分鏡 #${index + 1} 生成完成`)
      const result: StoryboardFrameResult = { index, prompt, imageBase64 }
      return NextResponse.json(result)
    } catch (err) {
      const result: StoryboardFrameResult = {
        index,
        prompt,
        error: `圖片生成失敗: ${err instanceof Error ? err.message : String(err)}`,
      }
      await toolLog(toolId, 'error', `分鏡 #${index + 1} Imagen 失敗`, { error: result.error })
      return NextResponse.json(result)
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    await toolLog(toolId, 'error', error.message, { stack: error.stack })
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
