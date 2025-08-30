import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import BottomNavigation from '@/components/BottomNavigation'
import { MiniKitContextProvider } from '@/providers/MiniKitProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <MiniKitContextProvider>
          <div className="pb-16">
            {children}
          </div>
          <BottomNavigation />
          <Analytics />
        </MiniKitContextProvider>
      </body>
    </html>
  )
}
