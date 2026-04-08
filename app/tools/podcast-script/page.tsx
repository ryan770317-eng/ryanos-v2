'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ScrollText, Copy, Download, ArrowRight, Loader2, CheckCheck } from 'lucide-react'
import { BackButton } from '@/components/layout/BackButton'
import { PODCAST_SERIES } from '@/lib/podcast-prompts'

function parseResult(raw: string): { script: string; report: string } {
  const scriptMatch = raw.match(/---TTS腳本---([\s\S]*?)(?:---替換報告---|$)/)
  const reportMatch = raw.match(/---替換報告---([\s\S]*)$/)
  return {
    script: scriptMatch?.[1]?.trim() ?? raw,
    report: reportMatch?.[1]?.trim() ?? '',
  }
}

export default function PodcastScriptPage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [seriesId, setSeriesId] = useState('hx-story')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [rawResult, setRawResult] = useState('')
  const [copied, setCopied] = useState(false)

  const seriesOptions = Object.entries(PODCAST_SERIES)
  const { script, report } = rawResult ? parseResult(rawResult) : { script: '', report: '' }

  async function handleGenerate() {
    if (!content.trim() || generating) return
    setGenerating(true)
    setError('')
    setRawResult('')

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'podcast-script',
          content: content.trim(),
          options: { seriesId },
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error ?? '生成失敗')
      setRawResult(data.result)
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失敗')
    } finally {
      setGenerating(false)
    }
  }

  async function handleCopy() {
    if (!script) return
    await navigator.clipboard.writeText(script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    if (!script) return
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'podcast-script.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleSendToTts() {
    if (!script) return
    sessionStorage.setItem('tts-prefill', script)
    router.push('/tools/tts')
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-4">
        <BackButton />
        <div className="flex items-center gap-2">
          <ScrollText size={18} style={{ color: 'var(--text-primary)' }} />
          <h1 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>
            腳本魔法師
          </h1>
        </div>
      </div>

      {/* Series selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          Podcast 系列
        </label>
        <div className="flex gap-2 flex-wrap">
          {seriesOptions.map(([id, series]) => (
            <button
              key={id}
              onClick={() => setSeriesId(id)}
              className="px-4 py-2 rounded-[var(--radius-btn)] text-sm font-medium transition-colors"
              style={{
                backgroundColor: seriesId === id ? 'var(--text-primary)' : 'var(--surface)',
                color: seriesId === id ? 'var(--bg)' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {series.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          知識內容 / 主題大綱
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="貼上知識萃取內容、逐字稿摘要，或主題大綱…"
          rows={12}
          className="w-full resize-none rounded-[var(--radius-card)] border px-4 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-[var(--text-primary)]"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        />
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {content.length > 0 ? `${content.length.toLocaleString()} 字` : ''}
        </p>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!content.trim() || generating}
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
            <ScrollText size={16} />
            生成腳本
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

      {/* Results */}
      {rawResult && (
        <div className="flex flex-col gap-5">
          {/* TTS Script */}
          <div
            className="flex flex-col gap-3 p-5 rounded-[var(--radius-card)] border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                TTS 腳本
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-btn)] text-xs font-medium transition-colors"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
                  {copied ? '已複製' : '複製'}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-btn)] text-xs font-medium transition-colors"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  <Download size={13} />
                  .txt
                </button>
              </div>
            </div>

            <pre
              className="text-sm leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto"
              style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}
            >
              {script}
            </pre>

            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {script.length.toLocaleString()} 字
            </p>

            <button
              onClick={handleSendToTts}
              className="flex items-center justify-center gap-2 py-2.5 rounded-[var(--radius-btn)] text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg)' }}
            >
              送去 TTS 生成語音
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Replacement report */}
          {report && (
            <div
              className="flex flex-col gap-3 p-5 rounded-[var(--radius-card)] border"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                同字異讀替換報告
              </h2>
              <pre
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: 'var(--text-secondary)', fontFamily: 'inherit' }}
              >
                {report}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
