'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, Grid3X3, BarChart3, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

const BottomNavigation = () => {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
      active: pathname === '/'
    },
    {
      href: '/leaderboard',
      icon: Trophy,
      label: 'Leaderboard',
      active: pathname === '/leaderboard'
    },
    {
      href: '/categories',
      icon: Grid3X3,
      label: 'Categories',
      active: pathname === '/categories'
    },
    {
      href: '/stats',
      icon: BarChart3,
      label: 'Stats',
      active: pathname === '/stats'
    },
    {
      href: '/wallet',
      icon: Wallet,
      label: 'Wallet',
      active: pathname === '/wallet'
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#241f53] border-t border-purple-500/30 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                item.active
                  ? 'text-white bg-white/20'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNavigation