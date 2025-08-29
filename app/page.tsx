"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Trophy, Target, TrendingUp, Calendar, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface UserStats {
  globalScore: number;
  dailyScore: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  levelName: string;
}

export default function HomePage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Refresh stats when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStats()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your health data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6">
        <div className="text-center">
          <div className="text-4xl mb-3">💪</div>
          <h1 className="text-2xl font-bold mb-1">Health Buddy</h1>
          <p className="text-sm opacity-90">Your daily wellness companion</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Level Badge */}
        {stats && (
          <div className="text-center">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Level {stats.level} - {stats.levelName}
            </Badge>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats?.globalScore || 0}</div>
              <div className="text-sm text-muted-foreground">Total Score</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats?.dailyScore || 0}</div>
              <div className="text-sm text-muted-foreground">Today</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats?.currentStreak || 0}</div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats?.longestStreak || 0}</div>
              <div className="text-sm text-muted-foreground">Best Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Link href="/categories">
            <Button className="w-full" size="lg">
              <Heart className="mr-2 h-5 w-5" />
              Daily Health Actions
            </Button>
          </Link>
          
          <div className="grid grid-cols-2 gap-3">
            <Link href="/stats">
              <Button variant="outline" className="w-full" size="lg">
                <TrendingUp className="mr-2 h-4 w-4" />
                Stats
              </Button>
            </Link>
            
            <Link href="/leaderboard">
              <Button variant="outline" className="w-full" size="lg">
                <Users className="mr-2 h-4 w-4" />
                Leaderboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Motivational Message */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-none">
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold mb-2">Keep Going! 🌟</h3>
            <p className="text-sm text-muted-foreground">
              Every small action counts towards a healthier you.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
