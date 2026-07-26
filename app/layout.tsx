import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/design/ThemeContext'
import BodyStyle from '@/components/BodyStyle'
import AuthGuard from '@/components/AuthGuard'
import localFont from "next/font/local";

const geist = localFont({ src: "./(home)/fonts/GeistVF.woff", variable: "--font-sans" });

export const metadata: Metadata = {
  title: 'Chawy ERP — ชาวี Pet Food System',
  description: 'ระบบจัดการธุรกิจฟรีซดรายสัตว์เลี้ยง',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={geist.variable}>
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
