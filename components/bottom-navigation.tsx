"use client"

import { Button } from "@/components/ui/button"
import { Home, Trophy, Target, BarChart3 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigationItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { href: "/categories", icon: Target, label: "Categories" },
  { href: "/stats", icon: BarChart3, label: "Stats" },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#241f53] border-t border-purple-500/30">
      <div className="flex justify-around py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`flex-col gap-1 h-auto py-2 text-white hover:bg-white/20 transition-all duration-300 ${isActive ? "bg-white/20 scale-110" : ""}`}
              >
                <Icon className="h-5 w-5 text-white" />
                <span className={`text-xs text-white ${isActive ? "font-medium" : "opacity-80"}`}>{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
