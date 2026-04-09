'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

interface TodoItem {
  id: string
  text: string
  completed: boolean
  source: 'manual' | 'calendar'
  calendarEventId?: string
  time?: string
}

const STORAGE_KEY = 'ryanos_todos'

function loadAllTodos(): Record<string, TodoItem[]> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch { return {} }
}

function saveAllTodos(all: Record<string, TodoItem[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - ((day === 0 ? 7 : day) - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function formatShort(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const WEEKDAY_LABELS = ['週一', '週二', '週三', '週四', '週五', '週六', '週日']

interface Props {
  open: boolean
  onClose: () => void
}

export function WeeklyPlanner({ open, onClose }: Props) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [allTodos, setAllTodos] = useState<Record<string, TodoItem[]>>({})
  const [newTexts, setNewTexts] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) setAllTodos(loadAllTodos())
  }, [open])

  const monday = getMonday(new Date())
  monday.setDate(monday.getDate() + weekOffset * 7)

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })

  const today = formatDate(new Date())

  const update = useCallback((next: Record<string, TodoItem[]>) => {
    setAllTodos(next)
    saveAllTodos(next)
  }, [])

  function addTodo(dateStr: string) {
    const text = (newTexts[dateStr] ?? '').trim()
    if (!text) return
    const next = { ...allTodos }
    const items = [...(next[dateStr] ?? [])]
    items.push({ id: crypto.randomUUID(), text, completed: false, source: 'manual' })
    next[dateStr] = items
    update(next)
    setNewTexts((p) => ({ ...p, [dateStr]: '' }))
  }

  function toggleTodo(dateStr: string, id: string) {
    const next = { ...allTodos }
    const items = (next[dateStr] ?? []).map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    )
    next[dateStr] = items
    update(next)
  }

  function deleteTodo(dateStr: string, id: string) {
    const next = { ...allTodos }
    next[dateStr] = (next[dateStr] ?? []).filter((t) => t.id !== id)
    update(next)
  }

  const rangeLabel = `${formatShort(weekDates[0])}(一) — ${formatShort(weekDates[6])}(日)`

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed inset-x-4 top-[5%] bottom-[5%] z-50 flex flex-col md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[900px] overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-heading">本週計畫</h2>
            <span className="text-caption">{rangeLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="p-1.5 rounded-md transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              title="上週"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="px-2 py-1 rounded-md text-xs font-medium transition-colors"
              style={{
                backgroundColor: weekOffset === 0 ? 'var(--color-accent-soft)' : 'transparent',
                color: weekOffset === 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              }}
            >
              本週
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="p-1.5 rounded-md transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              title="下週"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md transition-colors ml-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Week grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-7 min-h-full" style={{ minWidth: 700 }}>
            {weekDates.map((date, i) => {
              const dateStr = formatDate(date)
              const isToday = dateStr === today
              const items = allTodos[dateStr] ?? []
              const done = items.filter((t) => t.completed).length

              return (
                <div
                  key={dateStr}
                  className="flex flex-col"
                  style={{
                    borderRight: i < 6 ? '1px solid var(--color-border)' : undefined,
                    backgroundColor: isToday ? 'rgba(255,202,0,0.04)' : undefined,
                  }}
                >
                  {/* Day header */}
                  <div
                    className="px-2 py-2 text-center shrink-0"
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                  >
                    <div
                      className="text-[10px] font-semibold uppercase"
                      style={{ color: isToday ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }}
                    >
                      {WEEKDAY_LABELS[i]}
                    </div>
                    <div
                      className="text-xs font-medium mt-0.5"
                      style={{ color: isToday ? 'var(--color-text)' : 'var(--color-text-secondary)' }}
                    >
                      {formatShort(date)}
                    </div>
                    {items.length > 0 && (
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                        {done}/{items.length}
                      </div>
                    )}
                  </div>

                  {/* Todo list */}
                  <div className="flex-1 px-1.5 py-1.5 space-y-0.5 overflow-y-auto">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-1 group py-0.5 px-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleTodo(dateStr, item.id)}
                          className="mt-0.5 shrink-0 accent-[var(--color-accent)]"
                        />
                        <span
                          className="flex-1 text-[11px] leading-snug"
                          style={{
                            color: item.completed ? 'var(--color-text-tertiary)' : 'var(--color-text)',
                            textDecoration: item.completed ? 'line-through' : 'none',
                          }}
                        >
                          {item.time && (
                            <span className="font-medium mr-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                              {item.time}
                            </span>
                          )}
                          {item.text}
                          {item.source === 'calendar' && (
                            <span
                              className="ml-1 inline-flex px-1 py-0 rounded text-[9px] font-medium"
                              style={{ backgroundColor: '#5a4a00', color: '#cca300' }}
                            >
                              行事曆
                            </span>
                          )}
                        </span>
                        {item.source === 'manual' && (
                          <button
                            onClick={() => deleteTodo(dateStr, item.id)}
                            className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 rounded transition-opacity"
                            style={{ color: 'var(--color-danger)' }}
                          >
                            <Trash2 size={10} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add input */}
                  <div className="px-1.5 pb-1.5 shrink-0">
                    <div className="flex items-center gap-1">
                      <input
                        value={newTexts[dateStr] ?? ''}
                        onChange={(e) => setNewTexts((p) => ({ ...p, [dateStr]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && addTodo(dateStr)}
                        placeholder="+"
                        className="flex-1 text-[11px] bg-transparent outline-none px-1.5 py-1 rounded"
                        style={{
                          border: '1px solid transparent',
                          color: 'var(--color-text)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border)'
                          e.currentTarget.style.backgroundColor = 'var(--color-surface-alt)'
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'transparent'
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      />
                      {(newTexts[dateStr] ?? '').trim() && (
                        <button
                          onClick={() => addTodo(dateStr)}
                          className="shrink-0 p-0.5 rounded"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          <Plus size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
