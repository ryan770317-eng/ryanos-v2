'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Save, Trash2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { BackButton } from '@/components/layout/BackButton'
import { supabase } from '@/lib/supabase'
import { API_KEY_LABELS } from '@/lib/constants'
import type { ToolLog } from '@/types'

const API_KEY_IDS = Object.keys(API_KEY_LABELS)

// Simple symmetric obfuscation — keys are user-owned values, not server secrets
function mask(value: string) {
  if (value.length <= 4) return '****'
  return '••••••••' + value.slice(-4)
}

interface KeyRowProps {
  keyId: string
  savedValue: string | null
  onSave: (keyId: string, value: string) => Promise<void>
}

function KeyRow({ keyId, savedValue, onSave }: KeyRowProps) {
  const [input, setInput] = useState('')
  const [visible, setVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const meta = API_KEY_LABELS[keyId]

  async function handleSave() {
    if (!input.trim()) return
    setSaving(true)
    await onSave(keyId, input.trim())
    setInput('')
    setSaving(false)
  }

  return (
    <div
      className="p-4 rounded-[var(--radius-card)] border"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {meta.label}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            使用於：{meta.usedBy.join('、')}
          </p>
        </div>
        {savedValue && (
          <span
            className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--text-primary)' }}
          >
            已設定
          </span>
        )}
      </div>

      {savedValue && (
        <p className="text-xs mb-3 font-mono" style={{ color: 'var(--text-secondary)' }}>
          {mask(savedValue)}
        </p>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={visible ? 'text' : 'password'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={savedValue ? '輸入新 Key 以覆蓋' : '貼上 API Key'}
            className="w-full text-sm px-3 py-2 pr-9 rounded-[var(--radius-btn)] border outline-none focus:border-[var(--text-primary)] transition-colors"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
          >
            {visible ? (
              <EyeOff size={14} style={{ color: 'var(--text-secondary)' }} />
            ) : (
              <Eye size={14} style={{ color: 'var(--text-secondary)' }} />
            )}
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={!input.trim() || saving}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-[var(--radius-btn)] transition-colors disabled:opacity-40"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--text-primary)' }}
        >
          <Save size={14} />
          {saving ? '儲存中' : '儲存'}
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [savedKeys, setSavedKeys] = useState<Record<string, string>>({})
  const [externalUrls, setExternalUrls] = useState<Record<string, string>>({})
  const [logs, setLogs] = useState<ToolLog[]>([])
  const [logFilter, setLogFilter] = useState<'all' | 'error'>('all')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [logsVisible, setLogsVisible] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [healthWarning, setHealthWarning] = useState(8)
  const [healthDanger, setHealthDanger] = useState(12)

  useEffect(() => {
    loadSettings()
    loadLogs()
    // Load health thresholds from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('ryanos_settings') ?? '{}')
      if (saved.healthThreshold) {
        setHealthWarning(saved.healthThreshold.warning ?? 8)
        setHealthDanger(saved.healthThreshold.danger ?? 12)
      }
    } catch { /* empty */ }
  }, [])

  async function loadSettings() {
    const { data } = await supabase.from('user_settings').select('key, encrypted_value')
    if (!data) return
    const keys: Record<string, string> = {}
    const urls: Record<string, string> = {}
    for (const row of data) {
      if (API_KEY_IDS.includes(row.key)) {
        keys[row.key] = row.encrypted_value
      } else if (row.key.startsWith('external_url_')) {
        urls[row.key.replace('external_url_', '')] = row.encrypted_value
      }
    }
    setSavedKeys(keys)
    setExternalUrls(urls)
  }

  async function saveKey(keyId: string, value: string) {
    await supabase
      .from('user_settings')
      .upsert({ key: keyId, encrypted_value: value }, { onConflict: 'key' })
    setSavedKeys((prev) => ({ ...prev, [keyId]: value }))
  }

  async function saveExternalUrl(toolId: string, url: string) {
    const key = `external_url_${toolId}`
    await supabase
      .from('user_settings')
      .upsert({ key, encrypted_value: url }, { onConflict: 'key' })
    setExternalUrls((prev) => ({ ...prev, [toolId]: url }))
  }

  async function loadLogs() {
    const { data } = await supabase
      .from('tool_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setLogs((data as ToolLog[]) ?? [])
  }

  async function clearOldLogs() {
    setClearing(true)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    await supabase
      .from('tool_logs')
      .delete()
      .lt('created_at', cutoff.toISOString())
    await loadLogs()
    setClearing(false)
  }

  const EXTERNAL_TOOLS = [
    { id: 'knowledge-thief', name: '知識小偷' },
    { id: 'dream-rec', name: '夢境記錄器' },
    { id: 'sinus-note', name: 'Sinus Note' },
  ]

  const levelBadge: Record<string, string> = {
    info: '🔵',
    warn: '🟡',
    error: '🔴',
  }

  const filteredLogs = logFilter === 'error' ? logs.filter((l) => l.level === 'error') : logs

  return (
    <div className="flex flex-col gap-8 pb-16">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="font-display text-2xl" style={{ color: 'var(--text-primary)' }}>
          設定
        </h1>
      </div>

      {/* API Keys */}
      <section>
        <h2 className="font-semibold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
          API Key 管理
        </h2>
        <div className="flex flex-col gap-3">
          {API_KEY_IDS.map((keyId) => (
            <KeyRow
              key={keyId}
              keyId={keyId}
              savedValue={savedKeys[keyId] ?? null}
              onSave={saveKey}
            />
          ))}
        </div>
      </section>

      {/* External URLs */}
      <section>
        <h2 className="font-semibold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
          外連工具 URL
        </h2>
        <div className="flex flex-col gap-3">
          {EXTERNAL_TOOLS.map((tool) => (
            <div
              key={tool.id}
              className="p-4 rounded-[var(--radius-card)] border"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <p className="font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                {tool.name}
              </p>
              <div className="flex gap-2">
                <input
                  type="url"
                  defaultValue={externalUrls[tool.id] ?? ''}
                  placeholder="https://..."
                  className="flex-1 text-sm px-3 py-2 rounded-[var(--radius-btn)] border outline-none focus:border-[var(--text-primary)] transition-colors"
                  style={{
                    backgroundColor: 'var(--bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim()) saveExternalUrl(tool.id, e.target.value.trim())
                  }}
                />
                {externalUrls[tool.id] && (
                  <a
                    href={externalUrls[tool.id]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-9 rounded-[var(--radius-btn)] border transition-colors hover:bg-[var(--accent)]"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <ExternalLink size={14} style={{ color: 'var(--text-secondary)' }} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Health Threshold */}
      <section>
        <h2 className="font-semibold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
          工作量健康指標
        </h2>
        <div
          className="flex flex-col gap-4 p-4 rounded-[var(--radius-card)] border"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                🟡 注意門檻（每日任務數）
              </label>
              <input
                type="number"
                value={healthWarning}
                onChange={(e) => setHealthWarning(Number(e.target.value))}
                min={1}
                max={50}
                className="w-full text-sm px-3 py-2 rounded-[var(--radius-btn)] border outline-none transition-colors"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                🔴 超標門檻（每日任務數）
              </label>
              <input
                type="number"
                value={healthDanger}
                onChange={(e) => setHealthDanger(Number(e.target.value))}
                min={1}
                max={50}
                className="w-full text-sm px-3 py-2 rounded-[var(--radius-btn)] border outline-none transition-colors"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
          <button
            onClick={() => {
              const settings = JSON.parse(localStorage.getItem('ryanos_settings') ?? '{}')
              settings.healthThreshold = { warning: healthWarning, danger: healthDanger }
              localStorage.setItem('ryanos_settings', JSON.stringify(settings))
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-[var(--radius-btn)] transition-colors self-start"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--text-primary)' }}
          >
            儲存門檻
          </button>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            每日平均 ≤ {healthWarning} 項 = 健康｜{healthWarning}–{healthDanger} 項 = 注意｜&gt; {healthDanger} 項 = 超標
          </p>
        </div>
      </section>

      {/* Log Viewer */}
      <section>
        <button
          onClick={() => setLogsVisible(!logsVisible)}
          className="flex items-center justify-between w-full"
        >
          <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
            系統紀錄
          </h2>
          {logsVisible ? (
            <ChevronUp size={18} style={{ color: 'var(--text-secondary)' }} />
          ) : (
            <ChevronDown size={18} style={{ color: 'var(--text-secondary)' }} />
          )}
        </button>

        {logsVisible && (
          <div className="mt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex gap-2">
                {(['all', 'error'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setLogFilter(f)}
                    className="text-xs px-3 py-1.5 rounded-full font-medium transition-colors"
                    style={{
                      backgroundColor: logFilter === f ? 'var(--text-primary)' : 'var(--surface)',
                      color: logFilter === f ? 'var(--bg)' : 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {f === 'all' ? '全部' : '僅錯誤'}
                  </button>
                ))}
              </div>
              <button
                onClick={clearOldLogs}
                disabled={clearing}
                className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full disabled:opacity-40 transition-colors"
                style={{
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                <Trash2 size={12} />
                {clearing ? '清除中' : '清除 30 天前'}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {filteredLogs.length === 0 && (
                <p className="text-sm py-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                  暫無紀錄
                </p>
              )}
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-[var(--radius-btn)] border cursor-pointer"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                >
                  <div className="flex items-center gap-2">
                    <span>{levelBadge[log.level] ?? '⚪'}</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {log.tool_id}
                    </span>
                    <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
                      {log.message}
                    </span>
                    <span className="text-xs shrink-0" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(log.created_at).toLocaleTimeString('zh-TW', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {expandedLog === log.id && log.detail && (
                    <pre
                      className="mt-2 text-xs whitespace-pre-wrap break-all p-2 rounded"
                      style={{ backgroundColor: 'var(--bg)', color: 'var(--text-secondary)' }}
                    >
                      {JSON.stringify(log.detail, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
