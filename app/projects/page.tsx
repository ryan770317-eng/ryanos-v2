'use client'

import { useState } from 'react'
import { Folder, Plus, Search } from 'lucide-react'

interface Project {
  id: string
  name: string
  status: 'active' | 'completed'
  createdAt: string
}

const STORAGE_KEY = 'ryanos_projects'

function loadProjects(): Project[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch { return [] }
}

function saveProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(loadProjects)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [search, setSearch] = useState('')
  const [newName, setNewName] = useState('')

  function addProject() {
    if (!newName.trim()) return
    const next: Project[] = [
      ...projects,
      { id: crypto.randomUUID(), name: newName.trim(), status: 'active', createdAt: new Date().toISOString() },
    ]
    setProjects(next)
    saveProjects(next)
    setNewName('')
  }

  function toggleStatus(id: string) {
    const next = projects.map((p) =>
      p.id === id ? { ...p, status: (p.status === 'active' ? 'completed' : 'active') as Project['status'] } : p
    )
    setProjects(next)
    saveProjects(next)
  }

  const filtered = projects
    .filter((p) => filter === 'all' || p.status === filter)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  const activeCount = projects.filter((p) => p.status === 'active').length
  const completedCount = projects.filter((p) => p.status === 'completed').length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-display">專案</h1>
        <div className="flex items-center gap-2 text-caption">
          <span>{activeCount} 進行中</span>
          <span style={{ color: 'var(--color-text-tertiary)' }}>·</span>
          <span style={{ color: 'var(--color-success)' }}>{completedCount} 已完成</span>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <Search size={14} style={{ color: 'var(--color-text-tertiary)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋專案…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-text)' }}
          />
        </div>
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              backgroundColor: filter === f ? 'var(--color-surface)' : 'transparent',
              color: filter === f ? 'var(--color-text)' : 'var(--color-text-tertiary)',
              border: filter === f ? '1px solid var(--color-border)' : '1px solid transparent',
            }}
          >
            {f === 'all' ? '全部' : f === 'active' ? '進行中' : '已完成'}
          </button>
        ))}
      </div>

      {/* Add project */}
      <div
        className="flex items-center gap-2 p-3 rounded-lg"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addProject()}
          placeholder="新增專案名稱…"
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--color-text)' }}
        />
        <button
          onClick={addProject}
          disabled={!newName.trim()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-30"
          style={{ backgroundColor: 'var(--color-accent)', color: '#1a1a1a' }}
        >
          <Plus size={14} />
          新增
        </button>
      </div>

      {/* Project list */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <p className="text-center py-12 text-caption">
            {projects.length === 0 ? '還沒有專案，新增一個吧' : '沒有符合的結果'}
          </p>
        )}
        {filtered.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-4 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-3">
              <Folder size={16} style={{ color: 'var(--color-text-tertiary)' }} />
              <span className="text-sm font-medium">{p.name}</span>
            </div>
            <button
              onClick={() => toggleStatus(p.id)}
              className="badge transition-colors cursor-pointer"
              style={{
                backgroundColor: p.status === 'active' ? 'var(--color-accent-soft)' : 'rgba(52,199,89,0.15)',
                color: p.status === 'active' ? '#cca300' : 'var(--color-success)',
              }}
            >
              {p.status === 'active' ? '進行中' : '已完成'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
