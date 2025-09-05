import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import BottomNavigation from '@/components/BottomNavigation'
import { MiniKitContextProvider } from '@/providers/MiniKitProvider'
import { WagmiContextProvider } from '@/providers/WagmiProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Health Buddy - Your Daily Wellness Buddy',
  description: 'Turn wellness into a game! Check in daily, complete healthy actions, and see your progress grow. Stay motivated, stay healthy, stay happy!',
  generator: 'Health Buddy',
  openGraph: {
    title: 'Health Buddy - Your Daily Wellness Buddy',
    description: 'Turn wellness into a game! Check in daily, complete healthy actions, and see your progress grow.',
    images: [{
      url: 'https://health-buddy-seven.vercel.app/images/promo.png',
      width: 1200,
      height: 630,
    }],
  },
  other: {
    'fc:miniapp': JSON.stringify({
      version: '1',
      name: 'Health Buddy',
      icon: 'https://health-buddy-seven.vercel.app/images/icon.png',
      splashImage: 'https://health-buddy-seven.vercel.app/images/splash.png',
      splashBackgroundColor: '#241f53',
      homeUrl: 'https://health-buddy-seven.vercel.app/',
      imageUrl: 'https://health-buddy-seven.vercel.app/images/promo.png',
      button: {
        title: 'Open Health Buddy',
        action: {
          type: 'launch',
          name: 'launch',
          url: 'https://health-buddy-seven.vercel.app/',
          splashImageUrl: 'https://health-buddy-seven.vercel.app/images/splash.png',
          splashBackgroundColor: '#241f53'
        }
      }
    }),
    'fc:frame': JSON.stringify({
      version: '1',
      name: 'Health Buddy',
      icon: 'https://health-buddy-seven.vercel.app/images/icon.png',
      splashImage: 'https://health-buddy-seven.vercel.app/images/splash.png',
      splashBackgroundColor: '#241f53',
      homeUrl: 'https://health-buddy-seven.vercel.app/',
      imageUrl: 'https://health-buddy-seven.vercel.app/images/promo.png',
      button: {
        title: 'Open Health Buddy',
        action: {
          type: 'launch',
          name: 'launch',
          url: 'https://health-buddy-seven.vercel.app/',
          splashImageUrl: 'https://health-buddy-seven.vercel.app/images/splash.png',
          splashBackgroundColor: '#241f53'
        }
      }
    })
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <MiniKitContextProvider>
          <WagmiContextProvider>
            <div className="pb-16">
              {children}
            </div>
            <BottomNavigation />
            <Analytics />
          </WagmiContextProvider>
        </MiniKitContextProvider>
      </body>
    </html>
  )
}
