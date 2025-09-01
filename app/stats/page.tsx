'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Calendar, Award, Target, BarChart3, Flame, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { sdk } from '@farcaster/miniapp-sdk'
import { FarcasterAuth } from '@/components/FarcasterAuth'


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
  const [userFid, setUserFid] = useState<string | null>(null)
  const [context, setContext] = useState<any>(null)

  const handleViewProfile = async () => {
    const fid = context?.user?.fid
    if (fid) {
      try {
        // Use Farcaster SDK to view profile
        console.log('Viewing profile for FID:', fid)
      } catch (error) {
        console.error('Failed to view profile:', error)
      }
    }
  }

  // Initialize frame readiness and get context
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await sdk.actions.ready()
        const userContext = await sdk.context
        setContext(userContext)
        if (userContext?.user?.fid) {
          setUserFid(userContext.user.fid.toString())
        }
      } catch (error) {
        console.error('Failed to initialize app:', error)
      }
    }
    
    initializeApp()
  }, [])

  useEffect(() => {
    if (!context?.user?.fid || !userFid) {
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
  }, [context?.user?.fid, userFid])

  const handleAuthSuccess = async (userData: any) => {
    console.log('Authentication successful:', userData)
    const fid = userData.fid?.toString()
    setUserFid(fid)
    
    // Автоматически создаем/обновляем пользователя в базе данных
    if (fid && userData) {
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: userData.displayName || userData.username || `User ${fid}`,
            fid: parseInt(fid)
          })
        })
        
        if (response.ok) {
          console.log('User saved to database successfully')
        } else {
          console.log('User might already exist in database')
        }
      } catch (error) {
        console.error('Failed to save user to database:', error)
      }
    }
  }

  // Show auth screen if not authenticated
  if (!userFid || !context?.user?.fid) {
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
        {/* Farcaster Profile Section */}
        {context?.user?.fid && (
          <Card className="section-primary border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                {/* Profile Picture */}
                <div className="relative">
                  {context?.user?.pfpUrl ? (
                    <img 
                      src={context.user.pfpUrl} 
                      alt={context.user.displayName || context.user.username || 'User'}
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-300"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {(context?.user?.displayName || context?.user?.username || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                    <Activity className="w-3 h-3 text-white" />
                  </div>
                </div>
                
                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold text-base">
                      {context?.user?.displayName || context?.user?.username || 'Farcaster User'}
                    </h3>
                    <Badge variant="outline" className="text-xs text-purple-300 border-purple-300">
                      FC
                    </Badge>
                  </div>
                  <div className="text-sm text-white/70">
                    {context?.user?.username && `@${context.user.username}`}
                    <span className="ml-2 text-xs text-purple-300">
                      FID: {context?.user?.fid}
                    </span>
                  </div>
                  {context?.user?.fid && (
                    <div className="text-xs text-green-300 mt-1">
                      ✓ Verified Identity
                    </div>
                  )}
                </div>
                
                {/* View Profile Button */}
                <Button
                  onClick={handleViewProfile}
                  variant="outline"
                  size="sm"
                  className="text-purple-300 border-purple-300 hover:bg-purple-300 hover:text-purple-900"
                >
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
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
