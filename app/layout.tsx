import type { Metadata, Viewport } from 'next'
import './globals.css'
import { TopBar } from '@/components/layout/TopBar'
import { QuickNoteFloating } from '@/components/layout/QuickNoteFloating'
import { ThemeProvider } from '@/components/ThemeProvider'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'RYANOS',
  description: 'Ryan 的個人工具 Launcher',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RYANOS',
  },
}

export const viewport: Viewport = {
  themeColor: '#f0f0f0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
      </head>
      <body className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
        <ThemeProvider>
          <TopBar />
          <main className="flex-1 overflow-auto px-5 py-6 md:px-8 md:py-8 max-w-5xl mx-auto w-full">
            {children}
          </main>
          <QuickNoteFloating />
        </ThemeProvider>
      </body>
    </html>
  )
}
