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
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex justify-around py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`flex-col gap-1 h-auto py-2 ${isActive ? "text-primary bg-primary/10" : ""}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
