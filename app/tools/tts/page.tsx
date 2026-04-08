'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mic, Play, Pause, Download, Loader2 } from 'lucide-react'
import { cleanScriptForTTS } from '@/lib/tts-utils'

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function TtsPage() {
  const [text, setText] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBytes, setAudioBytes] = useState(0)
  const [playing, setPlaying] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const prefill = sessionStorage.getItem('tts-prefill')
    if (prefill) {
      setText(prefill)
      sessionStorage.removeItem('tts-prefill')
    }
  }, [])

  const clean = cleanScriptForTTS(text)

  async function handleGenerate() {
    if (!clean || generating) return
    setGenerating(true)
    setError('')
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setPlaying(false)

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }

      const blob = await res.blob()
      setAudioBytes(blob.size)
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失敗')
    } finally {
      setGenerating(false)
    }
  }

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  function handleDownload() {
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = 'output.mp3'
    a.click()
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--text-primary)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} />
          返回
        </Link>
        <div className="flex items-center gap-2">
          <Mic size={18} style={{ color: 'var(--text-primary)' }} />
          <h1 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>
            出言不遜
          </h1>
        </div>
      </div>

      {/* Script input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          腳本內容
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="貼上腳本文字，或直接輸入…"
          rows={14}
          className="w-full resize-none rounded-[var(--radius-card)] border px-4 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-[var(--text-primary)]"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {clean.length > 0 ? `${clean.length.toLocaleString()} 字` : ''}
          </span>
          {text && (
            <button
              onClick={() => setText('')}
              className="text-xs transition-colors hover:text-[var(--text-primary)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!clean || generating}
        className="flex items-center justify-center gap-2 py-3 rounded-[var(--radius-btn)] font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
        style={{ backgroundColor: 'var(--accent)', color: 'var(--text-primary)' }}
      >
        {generating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            生成中…
          </>
        ) : (
          <>
            <Mic size={16} />
            生成語音
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div
          className="px-4 py-3 rounded-[var(--radius-btn)] text-sm"
          style={{ backgroundColor: '#fff1f0', color: '#ff3b30', border: '1px solid #ffccc7' }}
        >
          {error}
        </div>
      )}

      {/* Audio player */}
      {audioUrl && (
        <div
          className="flex flex-col gap-4 p-5 rounded-[var(--radius-card)] border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {playing ? (
                <Pause size={18} style={{ color: 'var(--text-primary)' }} />
              ) : (
                <Play size={18} style={{ color: 'var(--text-primary)' }} />
              )}
            </button>

            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                output.mp3
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {formatBytes(audioBytes)}
              </p>
            </div>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-btn)] text-sm font-medium transition-colors hover:bg-[var(--bg)]"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              <Download size={14} />
              下載
            </button>
          </div>

          {/* Native audio for waveform / scrub */}
          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            className="w-full h-10"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
          />
        </div>
      )}

      {/* Usage note */}
      <div
        className="p-4 rounded-[var(--radius-card)] text-xs leading-relaxed"
        style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
      >
        <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>使用說明</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>使用 Fish Audio s2-pro 模型，支援長文單次生成</li>
          <li>Voice ID 與 API Key 請至設定頁填入</li>
          <li>生成完成後可在瀏覽器播放或下載 .mp3</li>
        </ul>
      </div>
    </div>
  )
}
