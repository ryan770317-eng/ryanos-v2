'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid, Folder, User, Flame, Wrench, Settings,
} from 'lucide-react'

const TABS = [
  { id: 'overview', icon: LayoutGrid, href: '/' },
  { id: 'projects', icon: Folder, href: '/projects' },
  { id: 'social', icon: User, href: '/social' },
  { id: 'incense', icon: Flame, href: '/incense' },
  { id: 'tools', icon: Wrench, href: '/tools' },
  { id: 'settings', icon: Settings, href: '/settings' },
] as const

export function BottomTabBar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="fixed bottom-4 left-4 right-4 z-50 flex md:hidden"
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        borderRadius: 'var(--sidebar-radius)',
        padding: '0 8px',
        paddingBottom: 'max(env(safe-area-inset-bottom), 4px)',
      }}
    >
      <div className="flex w-full justify-around items-center" style={{ height: 56 }}>
        {TABS.map((tab) => {
          const active = isActive(tab.href)
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="flex items-center justify-center no-underline transition-colors"
              style={{
                width: 40,
                height: 40,
                color: active ? '#ffffff' : 'rgba(255,255,255,0.35)',
              }}
            >
              <tab.icon size={20} strokeWidth={1.5} />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
