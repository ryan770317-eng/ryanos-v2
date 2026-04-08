import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { toolLog } from '@/lib/logger'

export const maxDuration = 300

async function getKeyFromSupabase(key: string): Promise<string | null> {
  const { data } = await supabase
    .from('user_settings')
    .select('encrypted_value')
    .eq('key', key)
    .single()
  return data?.encrypted_value ?? null
}

export async function POST(req: Request) {
  const toolId = 'tts'
  let text = ''
  try {
    const body = await req.json() as { text?: string }
    text = body.text?.trim() ?? ''

    if (!text) {
      return NextResponse.json({ success: false, error: '文字內容不能為空' }, { status: 400 })
    }

    const apiKey = await getKeyFromSupabase('FISH_AUDIO_API_KEY')
    const voiceId = await getKeyFromSupabase('FISH_AUDIO_VOICE_ID')

    if (!apiKey) {
      return NextResponse.json({ success: false, error: '請先在設定頁填入 Fish Audio API Key' }, { status: 400 })
    }
    if (!voiceId) {
      return NextResponse.json({ success: false, error: '請先在設定頁填入 Fish Audio Voice ID' }, { status: 400 })
    }

    await toolLog(toolId, 'info', '開始生成語音', { textLength: text.length })

    const fishRes = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'model': 's2-pro',
      },
      body: JSON.stringify({
        text,
        reference_id: voiceId,
        format: 'mp3',
        latency: 'normal',
      }),
    })

    if (!fishRes.ok) {
      const errText = await fishRes.text()
      await toolLog(toolId, 'error', 'Fish Audio API 回傳錯誤', {
        status: fishRes.status,
        body: errText,
      })
      return NextResponse.json(
        { success: false, error: `Fish Audio 錯誤 (${fishRes.status}): ${errText}` },
        { status: 502 }
      )
    }

    const audioBuffer = await fishRes.arrayBuffer()

    await toolLog(toolId, 'info', '語音生成完成', {
      textLength: text.length,
      audioBytes: audioBuffer.byteLength,
    })

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="output.mp3"',
        'Content-Length': String(audioBuffer.byteLength),
      },
    })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    await toolLog(toolId, 'error', error.message, { stack: error.stack, textLength: text.length })
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
