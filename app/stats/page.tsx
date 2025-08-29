'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Calendar, Award, Target, BarChart3, Flame, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BottomNavigation } from '@/components/bottom-navigation'

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
  const [stats, setStats] = useState<StatsData | null>(null)
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
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-primary text-primary-foreground p-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
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
            <p className="text-muted-foreground mt-2">Loading stats...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-primary text-primary-foreground p-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
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
            <p className="text-muted-foreground">No stats available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            <div>
              <h1 className="text-xl font-bold">Statistics</h1>
              <p className="text-sm opacity-90">Your health journey</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-primary">{stats.globalScore}</span>
              </div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold text-primary">{stats.currentStreak}</span>
              </div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.weeklyProgress && stats.weeklyProgress.length > 0 && (
                <>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Daily Average: {stats.dailyAverage} points</span>
                    <span>Total: {stats.totalWeekPoints} points</span>
                  </div>
                  <div className="flex items-end justify-between gap-2 h-32">
                    {stats.weeklyProgress.map((day, index) => {
                      const maxPoints = Math.max(...stats.weeklyProgress.map(d => d.points))
                      return (
                        <div key={day.date} className="flex flex-col items-center gap-2 flex-1">
                          <div className="text-xs text-muted-foreground">{day.points}</div>
                          <div
                            className="bg-primary rounded-t w-full min-h-[4px]"
                            style={{
                              height: `${maxPoints > 0 ? (day.points / maxPoints) * 100 : 0}%`,
                              minHeight: day.points > 0 ? "8px" : "4px",
                            }}
                          />
                          <div className="text-xs font-medium">{day.day}</div>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Category Progress
            </CardTitle>
            <p className="text-sm text-muted-foreground">Weekly completion rate by category</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.categoryStats?.map((category, index) => {
              // Define colors for categories
              const categoryColors = {
                'Physical Activity': 'bg-blue-500',
                'Nutrition': 'bg-green-500', 
                'Mental Health': 'bg-purple-500',
                'Sleep': 'bg-indigo-500',
                'Social': 'bg-pink-500'
              }
              const colorClass = categoryColors[category.categoryName as keyof typeof categoryColors] || 'bg-gray-500'
              
              return (
                <div key={category.categoryId || `category-${index}`} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                      <span className="font-medium">{category.categoryName}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {category.completedActions}/{category.totalActions} actions
                    </span>
                  </div>
                  <Progress value={category.weeklyCompletionRate} className="h-2" />
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {category.weeklyCompletionRate}% this week
                    </Badge>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Achievement Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{stats.longestStreak}</div>
                <div className="text-sm text-muted-foreground">Best Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{stats.level}</div>
                <div className="text-sm text-muted-foreground">{stats.levelName}</div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Recent Milestones</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                  <div className="text-lg">🏆</div>
                  <div>
                    <div className="font-medium">Level Achievement</div>
                    <div className="text-sm text-muted-foreground">Reached {stats.levelName} (Level {stats.level})</div>
                  </div>
                </div>
                {stats.currentStreak >= 3 && (
                  <div className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                    <div className="text-lg">🔥</div>
                    <div>
                      <div className="font-medium">Daily Streak</div>
                      <div className="text-sm text-muted-foreground">{stats.currentStreak} days in a row</div>
                    </div>
                  </div>
                )}
                {stats.longestStreak >= 7 && (
                  <div className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                    <div className="text-lg">⭐</div>
                    <div>
                      <div className="font-medium">Best Streak Record</div>
                      <div className="text-sm text-muted-foreground">{stats.longestStreak} days longest streak</div>
                    </div>
                  </div>
                )}
                {stats.totalWeekPoints >= 50 && (
                  <div className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                    <div className="text-lg">💪</div>
                    <div>
                      <div className="font-medium">Weekly Champion</div>
                      <div className="text-sm text-muted-foreground">{stats.totalWeekPoints} points this week</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
      <BottomNavigation />
    </div>
  )
}
