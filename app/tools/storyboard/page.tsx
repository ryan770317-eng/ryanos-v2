'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clapperboard, Download, RefreshCw, ChevronRight } from 'lucide-react'
import { parseSegments } from '@/lib/parse-segments'
import type { StoryboardFrameResult } from '@/app/api/storyboard/route'

type FrameStatus = 'idle' | 'building' | 'generating' | 'done' | 'error'

interface Frame {
  index: number
  segment: string
  status: FrameStatus
  prompt?: string
  imageBase64?: string
  error?: string
}

// ─── FrameCard ────────────────────────────────────────────────────────────────

function FrameCard({ frame, onRetry }: { frame: Frame; onRetry: (i: number) => void }) {
  const [promptOpen, setPromptOpen] = useState(false)

  function download() {
    if (!frame.imageBase64) return
    const a = document.createElement('a')
    a.href = `data:image/png;base64,${frame.imageBase64}`
    a.download = `frame-${frame.index + 1}.png`
    a.click()
  }

  const truncate = (s: string, max = 55) => s.length > max ? s.slice(0, max) + '…' : s

  return (
    <div
      className="flex flex-col rounded-[var(--radius-card)] border overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* 9:16 image area */}
      <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
        {/* Frame badge */}
        <div
          className="absolute top-2 left-2 z-10 text-xs font-bold px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff' }}
        >
          #{frame.index + 1}
        </div>

        {frame.status === 'idle' && (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>待生成</span>
          </div>
        )}

        {(frame.status === 'building' || frame.status === 'generating') && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 animate-pulse" style={{ backgroundColor: 'var(--bg)' }}>
            <div
              className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text-primary)' }}
            />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {frame.status === 'building' ? '分析口白…' : '生成圖片…'}
            </span>
          </div>
        )}

        {frame.status === 'done' && frame.imageBase64 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`data:image/png;base64,${frame.imageBase64}`}
            alt={`Frame ${frame.index + 1}`}
            className="w-full h-full object-cover"
          />
        )}

        {frame.status === 'error' && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-3" style={{ backgroundColor: '#fff1f0' }}>
            <p className="text-xs text-center leading-snug" style={{ color: '#ff3b30' }}>
              {frame.error ?? '生成失敗'}
            </p>
            <button
              onClick={() => onRetry(frame.index)}
              className="flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-[var(--radius-btn)]"
              style={{ backgroundColor: '#ff3b30', color: '#fff' }}
            >
              <RefreshCw size={11} />
              重試
            </button>
          </div>
        )}

        {frame.status === 'done' && (
          <button
            onClick={download}
            className="absolute bottom-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-[var(--radius-btn)] transition-opacity"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          >
            <Download size={13} color="#fff" />
          </button>
        )}
      </div>

      {/* Segment text */}
      <div className="px-3 pt-2 pb-1">
        <p className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>
          {truncate(frame.segment)}
        </p>
      </div>

      {/* Prompt toggle */}
      {frame.prompt && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setPromptOpen((v) => !v)}
            className="w-full flex items-center gap-1.5 px-3 py-2 text-left text-xs transition-colors hover:bg-[var(--bg)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ChevronRight
              size={12}
              className={`shrink-0 transition-transform ${promptOpen ? 'rotate-90' : ''}`}
            />
            <span className="truncate">{frame.prompt.split(/[\n.]/)[0]?.trim()}</span>
          </button>
          {promptOpen && (
            <p className="px-3 pb-3 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {frame.prompt}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StoryboardPage() {
  const [script, setScript] = useState('')
  const [segments, setSegments] = useState<string[]>([])
  const [frames, setFrames] = useState<Frame[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    setSegments(parseSegments(script))
  }, [script])

  const updateFrame = useCallback((index: number, updates: Partial<Frame>) => {
    setFrames((prev) => prev.map((f) => (f.index === index ? { ...f, ...updates } : f)))
  }, [])

  const generateFrame = useCallback(
    async (segment: string, index: number, fullScript: string) => {
      updateFrame(index, { status: 'building' })

      try {
        const res = await fetch('/api/storyboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ segment, index, fullScript }),
          signal: AbortSignal.timeout(90_000),
        })

        const data: StoryboardFrameResult = await res.json()

        if (data.error) {
          updateFrame(index, { status: 'error', error: data.error, prompt: data.prompt })
        } else {
          updateFrame(index, { status: 'done', imageBase64: data.imageBase64, prompt: data.prompt })
        }
      } catch (err) {
        const msg = err instanceof Error
          ? err.name === 'TimeoutError' ? '請求逾時（90s），請重試' : err.message
          : '未知錯誤'
        updateFrame(index, { status: 'error', error: msg })
      }
    },
    [updateFrame]
  )

  async function handleGenerate() {
    if (segments.length === 0 || isGenerating) return

    const initial: Frame[] = segments.map((segment, index) => ({
      index, segment, status: 'idle',
    }))
    setFrames(initial)
    setIsGenerating(true)

    await Promise.allSettled(
      segments.map((segment, index) => generateFrame(segment, index, script))
    )

    setIsGenerating(false)
  }

  function handleRetry(index: number) {
    const frame = frames[index]
    if (!frame) return
    generateFrame(frame.segment, index, script)
  }

  async function handleExportAll() {
    const doneFrames = frames.filter((f) => f.status === 'done' && f.imageBase64)
    if (doneFrames.length === 0) return
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    doneFrames.forEach((f) => {
      zip.file(`frame-${f.index + 1}.png`, f.imageBase64!, { base64: true })
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'storyboard.zip'
    a.click()
    URL.revokeObjectURL(url)
  }

  const doneCount = frames.filter((f) => f.status === 'done').length

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
          <Clapperboard size={18} style={{ color: 'var(--text-primary)' }} />
          <h1 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>
            麥麥分鏡
          </h1>
        </div>
      </div>

      {/* Two-column layout on desktop */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Script input */}
        <div className="flex flex-col gap-4 lg:w-80 xl:w-96 shrink-0">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              口白腳本
            </label>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              disabled={isGenerating}
              placeholder={`貼上口白文字，支援兩種格式：\n\n格式 1：空白行分隔\n第一段口白...\n\n第二段口白...\n\n格式 2：編號\n1. 第一段\n2. 第二段`}
              rows={14}
              className="w-full resize-none rounded-[var(--radius-card)] border px-4 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-[var(--text-primary)] disabled:opacity-60"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {segments.length > 0 ? (
                <>共偵測到 <strong style={{ color: 'var(--text-primary)' }}>{segments.length}</strong> 個分鏡</>
              ) : (
                '尚未偵測到分鏡段落'
              )}
            </span>

            <button
              onClick={handleGenerate}
              disabled={segments.length === 0 || isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-btn)] font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--text-primary)' }}
            >
              {isGenerating ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin shrink-0"
                    style={{ borderColor: 'rgba(0,0,0,0.3)', borderTopColor: 'var(--text-primary)' }}
                  />
                  生成中…
                </>
              ) : (
                '生成分鏡'
              )}
            </button>
          </div>

          {/* Tips */}
          <div
            className="p-4 rounded-[var(--radius-card)] text-xs leading-relaxed"
            style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>使用提示</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>每段口白對應一張 9:16 分鏡圖</li>
              <li>口白語言不限，自動轉英文 prompt</li>
              <li>單格失敗不影響其他格，可單獨重試</li>
              <li>需在設定頁填入 Google AI API Key</li>
            </ul>
          </div>
        </div>

        {/* Right: Frame grid */}
        <div className="flex-1">
          {frames.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border py-20 text-center"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <Clapperboard size={36} strokeWidth={1} className="mb-3 opacity-30" />
              <p className="text-sm">輸入口白後點擊「生成分鏡」</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Progress + export */}
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {doneCount} / {frames.length} 張完成
                </p>
                {doneCount > 0 && (
                  <button
                    onClick={handleExportAll}
                    className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-[var(--radius-btn)] transition-colors"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--text-primary)' }}
                  >
                    <Download size={14} />
                    匯出 ZIP
                  </button>
                )}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {frames.map((frame) => (
                  <FrameCard key={frame.index} frame={frame} onRetry={handleRetry} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
