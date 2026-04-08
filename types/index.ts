export type CategoryId = 'knowledge' | 'work' | 'personal' | 'health'

export interface Category {
  id: CategoryId
  name: string
  icon: string
}

export interface Tool {
  id: string
  name: string
  subtitle: string
  icon: string
  category: CategoryId
  type: 'builtin' | 'external'
  route?: string
  externalUrl?: string
  requiredKeys?: string[]
  status: 'active' | 'coming-soon'
}

export interface QuickNote {
  id: string
  content: string
  analysis?: {
    summary?: string
    todos?: string[]
    mood?: string
  }
  created_at: string
}

export interface UserSetting {
  id: string
  key: string
  encrypted_value: string
  updated_at: string
}

export interface ToolLog {
  id: string
  tool_id: string
  level: 'info' | 'warn' | 'error'
  message: string
  detail?: Record<string, unknown>
  created_at: string
}
