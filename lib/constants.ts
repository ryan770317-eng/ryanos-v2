import type { Category } from '@/types'

export const CATEGORIES: Category[] = [
  { id: 'knowledge', name: '知識處理', icon: 'brain' },
  { id: 'work', name: '工作助手', icon: 'briefcase' },
  { id: 'personal', name: '個人', icon: 'user' },
  { id: 'health', name: '個人健康', icon: 'heart-pulse' },
]

export const API_KEY_LABELS: Record<string, { label: string; usedBy: string[] }> = {
  CLAUDE_API_KEY: {
    label: 'Claude API Key',
    usedBy: ['光速筆記', '腳本魔法師', 'Email 掃描', '發票整理'],
  },
  FISH_AUDIO_API_KEY: {
    label: 'Fish Audio API Key',
    usedBy: ['出言不遜'],
  },
  FISH_AUDIO_VOICE_ID: {
    label: 'Fish Audio Voice ID',
    usedBy: ['出言不遜'],
  },
  GOOGLE_AI_API_KEY: {
    label: 'Google AI API Key',
    usedBy: ['麥麥分鏡'],
  },
  GMAIL_API_KEY: {
    label: 'Gmail API Key',
    usedBy: ['Email 掃描'],
  },
}
