'use client'

import { useState, useEffect } from 'react'
import { Plus, CalendarDays } from 'lucide-react'

interface TodoItem {
  id: string
  text: string
  completed: boolean
  source: 'manual' | 'calendar'
  time?: string
}

const STORAGE_KEY = 'ryanos_todos'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function loadTodos(): TodoItem[] {
  if (typeof window === 'undefined') return []
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return all[todayKey()] ?? []
  } catch { return [] }
}

function saveTodos(items: TodoItem[]) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  all[todayKey()] = items
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

interface Props {
  onOpenPlanner?: () => void
}

export function RyanScoreCard({ onOpenPlanner }: Props) {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newText, setNewText] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTodos(loadTodos())
    setMounted(true)
  }, [])

  function update(next: TodoItem[]) {
    setTodos(next)
    saveTodos(next)
  }

  function addTodo() {
    if (!newText.trim()) return
    update([...todos, {
      id: crypto.randomUUID(),
      text: newText.trim(),
      completed: false,
      source: 'manual',
    }])
    setNewText('')
  }

  function toggleTodo(id: string) {
    update(todos.map((t) => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const total = todos.length
  const done = todos.filter((t) => t.completed).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{
        backgroundColor: 'var(--color-accent)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--card-padding)',
        color: '#1a1a1a',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
            Ryan Score
          </span>
          {onOpenPlanner && (
            <button
              onClick={onOpenPlanner}
              className="opacity-60 hover:opacity-100 transition-opacity"
              title="開啟週計畫"
            >
              <CalendarDays size={14} />
            </button>
          )}
        </div>
        <span className="text-xs font-medium opacity-60">
          {done}/{total} 完成
        </span>
      </div>

      {/* Percentage */}
      <div className="text-hero mb-2" style={{ color: '#1a1a1a' }}>
        {mounted ? `${pct}%` : '—'}
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full mb-3" style={{ backgroundColor: 'rgba(0,0,0,0.12)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: '#1a1a1a' }}
        />
      </div>

      {/* Checklist */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {todos.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-2 py-0.5 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleTodo(item.id)}
              className="mt-0.5 shrink-0 accent-[#1a1a1a]"
              style={{ borderRadius: 'var(--radius-checkbox)' }}
            />
            <span
              className="text-micro leading-snug"
              style={{
                color: item.completed ? '#7a6200' : '#1a1a1a',
                textDecoration: item.completed ? 'line-through' : 'none',
              }}
            >
              {item.time && (
                <span className="font-medium mr-1">{item.time}</span>
              )}
              {item.text}
              {item.source === 'calendar' && (
                <span
                  className="ml-1.5 inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium"
                  style={{ backgroundColor: '#5a4a00', color: '#cca300' }}
                >
                  行事曆
                </span>
              )}
            </span>
          </label>
        ))}
      </div>

      {/* Add input */}
      <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}>
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="新增待辦事項…"
          className="flex-1 text-xs bg-transparent outline-none placeholder:text-[#7a6200]"
          style={{
            backgroundColor: 'var(--color-accent-surface)',
            border: '1px solid #e6d68a',
            borderRadius: 'var(--radius-btn)',
            padding: '6px 8px',
            color: '#1a1a1a',
          }}
        />
        <button
          onClick={addTodo}
          disabled={!newText.trim()}
          className="flex items-center justify-center shrink-0 transition-colors disabled:opacity-30"
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-btn)',
            backgroundColor: '#1a1a1a',
            color: 'var(--color-accent)',
          }}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}
