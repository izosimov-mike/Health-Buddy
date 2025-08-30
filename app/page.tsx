"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Trophy, Target, Calendar } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface UserStats {
  globalScore: number;
  dailyScore: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  levelName: string;
  levelProgress: {
    current: number;
    next: number | null;
    progress: number;
  };
  streakBonus: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkedInToday, setCheckedInToday] = useState(false)

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

  const handleDailyCheckin = async () => {
    if (checkingIn || checkedInToday) return
    
    setCheckingIn(true)
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 'user-1' })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Success - refresh stats
        setCheckedInToday(true)
        const statsResponse = await fetch('/api/stats')
        if (statsResponse.ok) {
          const updatedStats = await statsResponse.json()
          setStats(updatedStats)
        }
      } else if (data.alreadyCheckedIn) {
        // Already checked in today
        setCheckedInToday(true)
      } else {
        console.error('Check-in failed:', data.error)
      }
    } catch (error) {
      console.error('Check-in error:', error)
    } finally {
      setCheckingIn(false)
    }
  }

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
          <h1 className="text-2xl font-bold mb-1">Health Buddy</h1>
          <p className="text-sm opacity-90">Your daily wellness companion</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Level Badge */}
        {stats && (
          <div className="text-center space-y-2">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Level - {stats.levelName}
            </Badge>
            
            {/* Level Image */}
            <div className="flex justify-center">
              <img 
                src={stats.levelName === 'Beginner' ? 'https://obosg0ykkt0zseow.public.blob.vercel-storage.com/1_Beginner.png' : ''} 
                alt={`${stats.levelName} level`}
                className="w-24 h-24 object-contain"
              />
            </div>
            
            {stats.levelProgress.next && (
              <div className="max-w-xs mx-auto">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Progress to next level</span>
                  <span>{Math.round(stats.levelProgress.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${stats.levelProgress.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{stats.levelProgress.current}</span>
                  <span>{stats.levelProgress.next}</span>
                </div>
              </div>
            )}
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
              <div className="text-sm text-muted-foreground">Today Score</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-lg font-bold">
                {stats?.currentStreak || 0} days
                {stats?.streakBonus ? (
                  <span className="text-sm text-green-600 block">+{stats.streakBonus} bonus</span>
                ) : null}
              </div>
              <div className="text-sm text-muted-foreground">Daily Check-in</div>
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

        {/* Daily Check-in Section */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold">Daily Check-in</h3>
              
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Current Streak:</span>
                  <span className="text-lg font-bold text-green-600">{stats?.currentStreak || 0} days</span>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Check-in: +1 point</div>
                  {stats?.currentStreak >= 7 ? (
                    <div className="text-green-600 font-medium">• Streak bonus: +{stats?.streakBonus || 0} points</div>
                  ) : (
                    <div>• Streak bonus starts at 7+ days</div>
                  )}
                </div>
              </div>
              
              <Button 
                className="w-full" 
                size="lg" 
                variant={checkedInToday ? "secondary" : "outline"}
                onClick={handleDailyCheckin}
                disabled={checkingIn || checkedInToday}
              >
                <Heart className="mr-2 h-5 w-5" />
                {checkingIn ? 'Checking in...' : checkedInToday ? 'Checked in today!' : 'Check-in Today'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Link href="/categories">
            <Button className="w-full" size="lg">
              <Heart className="mr-2 h-5 w-5" />
              Daily Health Actions
            </Button>
          </Link>
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
