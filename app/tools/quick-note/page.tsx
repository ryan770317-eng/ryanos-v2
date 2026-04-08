'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, PenLine, Mic, MicOff, Sparkles, Trash2, ChevronDown, ChevronUp, Copy, CheckCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { QuickNote } from '@/types'

// Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}
interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}
interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
}

// ─── NoteCard ─────────────────────────────────────────────────────────────────

function NoteCard({
  note,
  onDelete,
  onAnalyze,
}: {
  note: QuickNote
  onDelete: (id: string) => void
  onAnalyze: (id: string, content: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleAnalyze() {
    setAnalyzing(true)
    await onAnalyze(note.id, note.content)
    setAnalyzing(false)
    setExpanded(true)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(note.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="rounded-[var(--radius-card)] border overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Note header */}
      <div className="flex items-start gap-3 p-4">
        <div className="shrink-0 mt-0.5">
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {formatDate(note.created_at)} {formatTime(note.created_at)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}
            style={{ color: 'var(--text-primary)' }}
          >
            {note.content}
          </p>
        </div>
      </div>

      {/* Action row */}
      <div
        className="flex items-center gap-2 px-4 pb-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 pt-2">
          {!note.analysis ? (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-btn)] text-xs font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--text-primary)' }}
            >
              {analyzing ? (
                <div className="w-3 h-3 rounded-full border border-t-transparent animate-spin" style={{ borderColor: 'var(--text-primary)', borderTopColor: 'transparent' }} />
              ) : (
                <Sparkles size={12} />
              )}
              {analyzing ? 'AI 分析中…' : 'AI 分析'}
            </button>
          ) : (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-btn)] text-xs font-medium transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? '收起分析' : '看分析'}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--radius-btn)] text-xs transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
          </button>
        </div>

        <button
          onClick={() => onDelete(note.id)}
          className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--radius-btn)] text-xs transition-colors hover:text-red-500"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Analysis panel */}
      {expanded && note.analysis && (
        <div
          className="px-4 pb-4 flex flex-col gap-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {note.analysis.summary && (
            <div className="pt-3">
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>摘要</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {note.analysis.summary}
              </p>
            </div>
          )}
          {note.analysis.todos && note.analysis.todos.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>待辦</p>
              <ul className="flex flex-col gap-1">
                {note.analysis.todos.map((todo, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                    <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
                    {todo}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {note.analysis.mood && (
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              語氣：{note.analysis.mood}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function QuickNotePage() {
  const [notes, setNotes] = useState<QuickNote[]>([])
  const [inputText, setInputText] = useState('')
  const [recording, setRecording] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [saving, setSaving] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    setSpeechSupported(
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    )
    loadNotes()
  }, [])

  async function loadNotes() {
    const { data } = await supabase
      .from('quick_notes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setNotes((data as QuickNote[]) ?? [])
  }

  function startRecording() {
    const SpeechRecognitionAPI =
      window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'zh-TW'
    recognition.continuous = true
    recognition.interimResults = true
    recognitionRef.current = recognition

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = ''
      let finalText = ''
      for (let i = e.results.length - 1; i >= 0; i--) {
        if (e.results[i].isFinal) {
          finalText = e.results[i][0].transcript + finalText
        } else {
          interim = e.results[i][0].transcript + interim
        }
      }
      if (finalText) {
        setInputText((prev) => {
          const ts = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
          const bullet = `• ${ts} — ${finalText.trim()}`
          return prev ? `${prev}\n${bullet}` : bullet
        })
      }
      setInterimText(interim)
    }

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error('Speech error:', e.error)
      setRecording(false)
      setInterimText('')
    }

    recognition.onend = () => {
      setRecording(false)
      setInterimText('')
    }

    recognition.start()
    setRecording(true)
  }

  function stopRecording() {
    recognitionRef.current?.stop()
    setRecording(false)
    setInterimText('')
  }

  async function handleSave() {
    const text = inputText.trim()
    if (!text || saving) return
    setSaving(true)

    const { data, error } = await supabase
      .from('quick_notes')
      .insert({ content: text })
      .select()
      .single()

    if (!error && data) {
      setNotes((prev) => [data as QuickNote, ...prev])
      setInputText('')
    }
    setSaving(false)
  }

  const handleAnalyze = useCallback(async (noteId: string, content: string) => {
    const res = await fetch('/api/quick-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, noteId }),
    })
    const data = await res.json()
    if (data.success) {
      setNotes((prev) =>
        prev.map((n) => n.id === noteId ? { ...n, analysis: data.analysis } : n)
      )
    }
  }, [])

  async function handleDelete(id: string) {
    await supabase.from('quick_notes').delete().eq('id', id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
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
          <PenLine size={18} style={{ color: 'var(--text-primary)' }} />
          <h1 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>
            光速筆記
          </h1>
        </div>
      </div>

      {/* Note list */}
      {notes.length > 0 && (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={handleDelete}
              onAnalyze={handleAnalyze}
            />
          ))}
        </div>
      )}

      {notes.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
          <PenLine size={32} strokeWidth={1} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">還沒有筆記，開始錄音或輸入吧</p>
        </div>
      )}

      {/* Input area — sticky bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 p-4 md:px-8"
        style={{ backgroundColor: 'var(--bg)', borderTop: '1px solid var(--border)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col gap-3">
          {/* Interim speech preview */}
          {interimText && (
            <p className="text-sm italic px-1" style={{ color: 'var(--text-secondary)' }}>
              {interimText}…
            </p>
          )}

          <div className="flex gap-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="輸入筆記，或點麥克風語音輸入…"
              rows={3}
              className="flex-1 resize-none rounded-[var(--radius-card)] border px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors focus:border-[var(--text-primary)]"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave()
              }}
            />

            <div className="flex flex-col gap-2 shrink-0">
              {/* Mic button */}
              {speechSupported && (
                <button
                  onClick={recording ? stopRecording : startRecording}
                  className="w-10 h-10 flex items-center justify-center rounded-full transition-all"
                  style={{
                    backgroundColor: recording ? '#ff3b30' : 'var(--surface)',
                    border: `1px solid ${recording ? '#ff3b30' : 'var(--border)'}`,
                  }}
                  title={recording ? '停止錄音' : '開始錄音'}
                >
                  {recording ? (
                    <MicOff size={16} color="#fff" />
                  ) : (
                    <Mic size={16} style={{ color: 'var(--text-secondary)' }} />
                  )}
                </button>
              )}

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={!inputText.trim() || saving}
                className="flex-1 px-3 rounded-[var(--radius-btn)] text-xs font-semibold transition-all disabled:opacity-40 min-h-[40px]"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--text-primary)' }}
                title="儲存（⌘Enter）"
              >
                {saving ? '…' : '儲存'}
              </button>
            </div>
          </div>

          <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
            ⌘ Enter 快速儲存
          </p>
        </div>
      </div>
    </div>
  )
}
