import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { QueryProvider } from '@/components/query-provider'
import { NextAuthProvider } from '@/components/session-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Token Exchange - Đổi Request thành Token',
  description: 'Hệ thống quản lý và đổi request thành token một cách dễ dàng và bảo mật',
  keywords: ['token', 'exchange', 'request', 'api'],
  authors: [{ name: 'Token Exchange Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <div className="relative min-h-screen bg-background">
                {children}
              </div>
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
