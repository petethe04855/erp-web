import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/design/ThemeContext'
import BodyStyle from '@/components/BodyStyle'
import AuthGuard from '@/components/AuthGuard'

export const metadata: Metadata = {
  title: 'Chawy ERP — ชาวี Pet Food System',
  description: 'ระบบจัดการธุรกิจฟรีซดรายสัตว์เลี้ยง',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+Thai:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, minHeight: '100vh', display: 'flex' }}>
        <ThemeProvider>
          <BodyStyle />
          <AuthGuard>
            {children}
          </AuthGuard>
        </ThemeProvider>
      </body>
    </html>
  )
}
