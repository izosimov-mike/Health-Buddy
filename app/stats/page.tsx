'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Calendar, Award, Target, BarChart3, Flame, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useMiniKit } from '@farcaster/miniapp-sdk'
import FarcasterAuth from '@/components/FarcasterAuth'


interface StatsData {
  globalScore: number
  level: number
  levelName: string
  currentStreak: number
  longestStreak: number
  dailyAverage: number
  totalWeekPoints: number
  weeklyProgress: Array<{
    date: string
    day: string
    points: number
    actions: number
  }>
  categoryStats: Array<{
    categoryId: string
    categoryName: string
    totalPoints: number
    completedActions: number
    totalActions: number
    weeklyCompletionRate: number
  }>
}

export default function StatsPage() {
  const { isAuthenticated, user } = useMiniKit()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [userFid, setUserFid] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      setUserFid(user.fid?.toString() || null)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (!isAuthenticated || !userFid) {
      setLoading(false)
      return
    }

    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/stats?fid=${userFid}`)
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
  }, [isAuthenticated, userFid])

  const handleAuthSuccess = (userData: any) => {
    console.log('Authentication successful:', userData)
    setUserFid(userData.fid?.toString() || null)
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-main min-h-screen">
        <div className="bg-main text-white p-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Statistics</h1>
              <p className="text-sm opacity-90">Your health journey</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <FarcasterAuth onAuthSuccess={handleAuthSuccess} />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-main">
        <div className="bg-main text-white p-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Statistics</h1>
              <p className="text-sm opacity-90">Your health journey</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-white mt-2">Loading stats...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-main">
        <div className="bg-main text-white p-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Statistics</h1>
              <p className="text-sm opacity-90">Your health journey</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="text-center py-8">
            <p className="text-white">No stats available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-main">
      {/* Header */}
      <div className="bg-main text-white py-4 px-4">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <div>
              <h1 className="text-lg font-bold">Statistics</h1>
              <p className="text-xs opacity-90">Your health journey</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-2 space-y-3">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <Card className="section-primary text-white border-0">
            <CardContent className="px-1.5 py-1 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0">
                <Award className="h-3 w-3 text-yellow-300" />
                <span className="text-base font-bold leading-tight">{stats.globalScore}</span>
              </div>
              <div className="text-xs opacity-90 leading-tight">Total Points</div>
            </CardContent>
          </Card>
          <Card className="section-primary text-white border-0">
            <CardContent className="px-1.5 py-1 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0">
                <Flame className="h-3 w-3 text-orange-300" />
                <span className="text-base font-bold leading-tight">{stats.currentStreak}</span>
              </div>
              <div className="text-xs opacity-90 leading-tight">Current Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Progress Chart */}
        <Card className="section-primary border-0">
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-1.5 text-sm text-white">
              <TrendingUp className="h-3 w-3 text-purple-400" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {stats.weeklyProgress && stats.weeklyProgress.length > 0 && (
                <>
                  <div className="flex justify-between text-xs text-white opacity-90">
                    <span>Daily Average: {stats.dailyAverage} points</span>
                    <span>Total: {stats.totalWeekPoints} points</span>
                  </div>
                  <div className="flex items-end justify-between gap-2 h-24">
                    {stats.weeklyProgress.map((day, index) => {
                      const maxPoints = Math.max(...stats.weeklyProgress.map(d => d.points))
                      return (
                        <div key={day.date} className="flex flex-col items-center gap-2 flex-1">
                          <div className="text-xs text-white opacity-90">{day.points}</div>
                          <div
                            className="bg-gradient-to-t from-purple-500 to-purple-400 rounded-t w-full min-h-[4px]"
                            style={{
                              height: `${maxPoints > 0 ? (day.points / maxPoints) * 100 : 0}%`,
                              minHeight: day.points > 0 ? "8px" : "4px",
                            }}
                          />
                          <div className="text-xs font-medium text-white">{day.day}</div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Progress */}
        <Card className="section-primary border-0">
          <CardHeader className="pb-1">
            <CardTitle className="flex items-center gap-1.5 text-sm text-white">
              <Target className="h-3 w-3 text-purple-400" />
              Category Progress
            </CardTitle>
            <p className="text-xs text-white opacity-90 leading-tight">Weekly completion rate by category</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.categoryStats?.map((category, index) => {
              // Define different colors for category markers
              const categoryColors = {
                'Physical Activity': 'bg-blue-500',
                'Nutrition & Hydration': 'bg-green-500', 
                'Mental Health': 'bg-purple-500',
                'Sleep & Routine': 'bg-indigo-500',
                'Social': 'bg-pink-500'
              }
              const colorClass = categoryColors[category.categoryName as keyof typeof categoryColors] || 'bg-gray-500'
              
              return (
                <div key={category.categoryId || `category-${index}`} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                      <span className="font-medium text-white">{category.categoryName}</span>
                    </div>
                    <span className="text-sm text-white opacity-90">
                      {category.completedActions}/{category.totalActions} actions
                    </span>
                  </div>
                  <Progress value={category.weeklyCompletionRate} className="h-2" />
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs border-purple-400/50 text-purple-400">
                      {category.weeklyCompletionRate}% this week
                    </Badge>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>




      </div>
    </div>
  )
}
