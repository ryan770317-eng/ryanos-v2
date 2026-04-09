'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid, Folder, User, Flame, Wrench, Settings,
} from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

const NAV_ITEMS = [
  { id: 'overview', label: '總覽', icon: LayoutGrid, href: '/' },
  { id: 'projects', label: '專案', icon: Folder, href: '/projects' },
  { id: 'social', label: '雜男萊恩', icon: User, href: '/social' },
  { id: 'incense', label: '製香', icon: Flame, href: '/incense' },
  { id: 'tools', label: '工具', icon: Wrench, href: '/tools' },
] as const

function ThemeToggle({ expanded }: { expanded: boolean }) {
  const { theme, mounted, toggle } = useTheme()
  if (!mounted) return <div className="h-[18px]" />

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2.5 w-full px-1"
      title={theme === 'dark' ? '切換淺色模式' : '切換深色模式'}
    >
      {expanded && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
      {/* Toggle switch */}
      <div
        className="relative shrink-0 rounded-full transition-colors"
        style={{
          width: 32,
          height: 18,
          backgroundColor: theme === 'dark' ? '#555' : 'var(--color-accent)',
        }}
      >
        <div
          className="absolute top-[2px] rounded-full bg-white transition-all duration-200"
          style={{
            width: 14,
            height: 14,
            left: theme === 'dark' ? 2 : 16,
          }}
        />
      </div>
    </button>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="hidden md:flex flex-col fixed left-3 top-1/2 z-50"
      style={{
        transform: 'translateY(-50%)',
        width: expanded ? 'var(--sidebar-width-expanded)' : 'var(--sidebar-width-collapsed)',
        backgroundColor: 'var(--sidebar-bg)',
        borderRadius: 'var(--sidebar-radius)',
        padding: '12px 6px',
        transition: 'width 300ms ease',
      }}
    >
      {/* R Logo toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-center mx-auto mb-3 shrink-0 rounded-full transition-transform hover:scale-105"
        style={{
          width: 28,
          height: 28,
          backgroundColor: 'var(--color-accent)',
        }}
        aria-label="Toggle sidebar"
      >
        <span
          className="font-display text-sm font-bold leading-none"
          style={{ color: '#1a1a1a' }}
        >
          R
        </span>
      </button>

      {/* Nav items */}
      <div className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg transition-colors duration-150 no-underline"
              style={{
                padding: expanded ? '8px 10px' : '8px',
                justifyContent: expanded ? 'flex-start' : 'center',
                color: active ? '#ffffff' : '#555555',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = '#999999'
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = '#555555'
              }}
              title={item.label}
            >
              <item.icon size={18} strokeWidth={1.5} className="shrink-0" />
              {expanded && (
                <span className="text-xs font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Divider */}
      <div className="mx-2 my-2" style={{ height: 1, backgroundColor: '#333' }} />

      {/* Theme toggle */}
      <div className="flex items-center justify-center py-1">
        <ThemeToggle expanded={expanded} />
      </div>

      {/* Settings */}
      <Link
        href="/settings"
        className="flex items-center gap-2.5 rounded-lg transition-colors duration-150 no-underline mt-1"
        style={{
          padding: expanded ? '8px 10px' : '8px',
          justifyContent: expanded ? 'flex-start' : 'center',
          color: isActive('/settings') ? '#ffffff' : '#555555',
        }}
        onMouseEnter={(e) => {
          if (!isActive('/settings')) e.currentTarget.style.color = '#999999'
        }}
        onMouseLeave={(e) => {
          if (!isActive('/settings')) e.currentTarget.style.color = '#555555'
        }}
        title="設定"
      >
        <Settings size={18} strokeWidth={1.5} className="shrink-0" />
        {expanded && (
          <span className="text-xs font-medium whitespace-nowrap">設定</span>
        )}
      </Link>
    </nav>
  )
}
