'use client'

import { useState, useRef } from 'react'
import { Camera, Loader2, Plus, Calendar, CheckSquare, X } from 'lucide-react'

interface RecognitionResult {
  text: string
  suggestion?: string
  action: 'pending' | 'added_to_todo' | 'added_to_calendar' | 'dismissed'
}

export function ScreenshotCard() {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RecognitionResult | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function processImage(file: File) {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const buffer = await file.arrayBuffer()
      const base64 = btoa(
        new Uint8Array(buffer).reduce((s, b) => s + String.fromCharCode(b), '')
      )
      const mediaType = file.type || 'image/png'

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'screenshot-recognize',
          content: '辨識截圖內容',
          options: { imageBase64: base64, mediaType },
        }),
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      setResult({ text: data.result, action: 'pending' })
    } catch (e) {
      setError(e instanceof Error ? e.message : '辨識失敗')
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) processImage(file)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processImage(file)
    e.target.value = ''
  }

  function addToTodo() {
    if (!result) return
    // Write to today's todos in localStorage
    const STORAGE_KEY = 'ryanos_todos'
    const today = new Date().toISOString().slice(0, 10)
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    const items = all[today] ?? []
    items.push({
      id: crypto.randomUUID(),
      text: result.text.slice(0, 100),
      completed: false,
      source: 'manual' as const,
    })
    all[today] = items
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    setResult({ ...result, action: 'added_to_todo' })
  }

  function dismiss() {
    setResult(null)
  }

  // Result view
  if (result) {
    return (
      <div
        className="h-full flex flex-col gap-2 overflow-hidden"
        style={{
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-border)',
          padding: 'var(--card-padding)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-caption">辨識結果</span>
          <button onClick={dismiss} className="p-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
            <X size={14} />
          </button>
        </div>
        <p className="text-xs leading-relaxed flex-1 overflow-y-auto" style={{ color: 'var(--color-text-secondary)' }}>
          {result.text}
        </p>
        {result.action === 'pending' && (
          <div className="flex gap-2 mt-auto pt-1" style={{ borderTop: '1px solid var(--color-border)' }}>
            <button
              onClick={addToTodo}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors"
              style={{ backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
            >
              <CheckSquare size={10} /> 加入今日待辦
            </button>
            <button
              onClick={dismiss}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              略過
            </button>
          </div>
        )}
        {result.action === 'added_to_todo' && (
          <div className="badge badge-success mt-auto">已加入待辦</div>
        )}
      </div>
    )
  }

  // Loading view
  if (loading) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center gap-2"
        style={{
          borderRadius: 'var(--radius-card)',
          border: '1.5px dashed var(--color-accent)',
          padding: 'var(--card-padding)',
        }}
      >
        <Loader2 size={22} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>AI 辨識中…</p>
      </div>
    )
  }

  // Drop zone
  return (
    <div
      className="h-full flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
      style={{
        borderRadius: 'var(--radius-card)',
        border: `1.5px dashed ${dragging ? 'var(--color-accent)' : 'var(--color-border-dash)'}`,
        padding: 'var(--card-padding)',
        backgroundColor: dragging ? 'rgba(255,202,0,0.05)' : 'transparent',
      }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileRef.current?.click()}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <Camera size={22} style={{ color: dragging ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }} />
      <p className="text-xs text-center" style={{ color: 'var(--color-text-secondary)' }}>
        {dragging ? '放開上傳' : '拖曳截圖，AI 辨識歸檔'}
      </p>
      {error && (
        <p className="text-[10px] text-center" style={{ color: 'var(--color-danger)' }}>{error}</p>
      )}
    </div>
  )
}
