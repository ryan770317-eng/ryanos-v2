import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Sidebar } from '@/components/navigation/Sidebar'
import { BottomTabBar } from '@/components/navigation/BottomTabBar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'RYANOS',
  description: 'Ryan 的個人 Dashboard',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'RYANOS',
  },
}

export const viewport: Viewport = {
  themeColor: '#111111',
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
      <body className="h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
        <ThemeProvider>
          <Sidebar />
          <main className="h-full overflow-auto px-4 py-6 pb-24 md:pb-6 md:pl-[calc(var(--sidebar-width-collapsed)+24px)]">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
          <BottomTabBar />
        </ThemeProvider>
      </body>
    </html>
  )
}
