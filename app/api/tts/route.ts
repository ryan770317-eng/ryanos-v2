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

async function generateFishAudio(text: string): Promise<ArrayBuffer> {
  const apiKey = await getKeyFromSupabase('FISH_AUDIO_API_KEY')
  const voiceId = await getKeyFromSupabase('FISH_AUDIO_VOICE_ID')

  if (!apiKey) throw new Error('請先在設定頁填入 Fish Audio API Key')
  if (!voiceId) throw new Error('請先在設定頁填入 Fish Audio Voice ID')

  const res = await fetch('https://api.fish.audio/v1/tts', {
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

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Fish Audio 錯誤 (${res.status}): ${errText}`)
  }

  return res.arrayBuffer()
}

async function generateElevenLabs(text: string): Promise<ArrayBuffer> {
  const apiKey = await getKeyFromSupabase('ELEVENLABS_API_KEY')
  const voiceId = await getKeyFromSupabase('ELEVENLABS_VOICE_ID')

  if (!apiKey) throw new Error('請先在設定頁填入 ElevenLabs API Key')
  if (!voiceId) throw new Error('請先在設定頁填入 ElevenLabs Voice ID')

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      output_format: 'mp3_44100_128',
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`ElevenLabs 錯誤 (${res.status}): ${errText}`)
  }

  return res.arrayBuffer()
}

export async function POST(req: Request) {
  const toolId = 'tts'
  let text = ''
  let engine = 'fish'
  try {
    let body: { text?: string; engine?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ success: false, error: '請提供有效的 JSON body' }, { status: 400 })
    }
    text = body.text?.trim() ?? ''
    engine = body.engine === 'elevenlabs' ? 'elevenlabs' : 'fish'

    if (!text) {
      return NextResponse.json({ success: false, error: '文字內容不能為空' }, { status: 400 })
    }

    await toolLog(toolId, 'info', '開始生成語音', { textLength: text.length, engine })

    let audioBuffer: ArrayBuffer
    try {
      audioBuffer = engine === 'elevenlabs'
        ? await generateElevenLabs(text)
        : await generateFishAudio(text)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // Key-missing errors → 400, API errors → 502
      const status = msg.includes('請先在設定頁') ? 400 : 502
      await toolLog(toolId, 'error', msg, { engine })
      return NextResponse.json({ success: false, error: msg }, { status })
    }

    await toolLog(toolId, 'info', '語音生成完成', {
      textLength: text.length,
      audioBytes: audioBuffer.byteLength,
      engine,
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
    await toolLog(toolId, 'error', error.message, { stack: error.stack, textLength: text.length, engine })
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
