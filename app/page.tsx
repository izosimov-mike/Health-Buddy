"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Trophy, Target, Calendar } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { sdk } from '@farcaster/miniapp-sdk'
import { FarcasterAuth } from '@/components/FarcasterAuth'

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
  checkedInToday: boolean;
}

export default function HomePage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkedInToday, setCheckedInToday] = useState(false)
  const [userFid, setUserFid] = useState<string | null>(null)
  const [context, setContext] = useState<any>(null)

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
          setCheckedInToday(data.checkedInToday || false)
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
  }, [context?.user?.fid, userFid])

  const handleDailyCheckin = async () => {
    if (checkingIn || checkedInToday || !userFid) return
    
    setCheckingIn(true)
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fid: userFid })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Success - refresh stats
        setCheckedInToday(true)
        const statsResponse = await fetch(`/api/stats?fid=${userFid}`)
        if (statsResponse.ok) {
          const updatedStats = await statsResponse.json()
          setStats(updatedStats)
          setCheckedInToday(updatedStats.checkedInToday || true)
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

  // Function to get level image based on level
  const getLevelImage = (level: number) => {
    const levelImages = {
      1: '/images/1_Beginner.png',
      2: '/images/2_Apprentice.png',
      3: '/images/3_Explorer.png',
      4: '/images/4_Achiever.png',
      5: '/images/5_Champion.png',
      6: '/images/6_Master.png',
      7: '/images/7_Legend.png',
      8: '/images/8_Mythic.png'
    }
    return levelImages[level as keyof typeof levelImages] || '/images/1_Beginner.png'
  }

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

  // Validate MiniKit context
  useEffect(() => {
    if (context) {
      console.log('MiniKit context available:', {
        client: context.client,
        location: context.location,
        user: context.user
      })
    }
  }, [context])

  // Проверяем MiniApp окружение
  const isMiniApp = typeof window !== 'undefined' && (
    navigator.userAgent.toLowerCase().includes('farcaster') ||
    window.location.hostname.includes('warpcast') ||
    (window as any).farcaster
  );

  // Show auth screen if not authenticated or in MiniApp without proper setup
  if (!userFid || !context?.user?.fid) {
    return (
      <div className="bg-main min-h-screen">
        <div className="bg-main text-white py-4 px-4">
          <div className="text-center max-w-sm mx-auto">
            <h1 className="text-xl font-bold mb-0.5">Health Buddy</h1>
            <p className="text-xs opacity-90">Your daily wellness companion</p>
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
      <div className="bg-main p-4 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">Loading your health data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-main">
      {/* Header */}
      <div className="bg-main text-white py-4 px-4">
        <div className="text-center max-w-sm mx-auto">
          <h1 className="text-xl font-bold mb-0.5">Health Buddy</h1>
          <p className="text-xs opacity-90">Your daily wellness companion</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Level Badge */}
        <div className="text-center space-y-1.5">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Level {stats?.level || 1} - {stats?.levelName || 'Beginner'}
          </Badge>
            
            {/* Level Image */}
            <div className="flex justify-center">
              <img 
                src={getLevelImage(stats?.level || 1)} 
                alt={`${stats?.levelName || 'Beginner'} level`}
                className="w-24 h-24 object-contain"
              />
            </div>
            
            {/* Progress Bar */}
            <div className="max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress to next level</span>
                <span>{Math.round(stats?.levelProgress?.progress || 0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${stats?.levelProgress?.progress || 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                <span>{stats?.levelProgress?.current || 0}</span>
                <span>{stats?.levelProgress?.next || 100}</span>
              </div>
            </div>
          </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="section-primary text-white border-0">
            <CardContent className="px-1.5 py-0.5 text-center">
              <Trophy className="h-4 w-4 text-yellow-300 mx-auto mb-0" />
              <div className="text-base font-bold">{stats?.globalScore || 0}</div>
              <div className="text-xs opacity-90 leading-tight">Total Score</div>
            </CardContent>
          </Card>
          
          <Card className="section-primary text-white border-0">
            <CardContent className="px-1.5 py-0.5 text-center">
              <Target className="h-4 w-4 text-blue-300 mx-auto mb-0" />
              <div className="text-base font-bold">{stats?.dailyScore || 0}</div>
              <div className="text-xs opacity-90 leading-tight">Today Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Check-in Section */}
        <Card className="section-primary border-0">
          <CardContent className="px-1.5 py-1">
            <div className="text-center space-y-1.5">
              <div className="flex items-center justify-center gap-1">
                <h3 className="text-sm font-medium leading-tight text-white">Daily Check-in</h3>
                <Calendar className="h-3 w-3 text-purple-400" />
              </div>
              
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-1.5 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium leading-tight text-white opacity-90">Current Streak:</span>
                  <span className="text-sm font-bold text-primary leading-tight">{stats?.currentStreak || 0} days</span>
                </div>
                
                <div className="text-xs text-white opacity-90 space-y-0 leading-tight">
                  <div>• Check-in: +1 point</div>
                  {(stats?.currentStreak ?? 0) >= 7 ? (
                    <div className="text-green-400 font-medium">• Streak bonus: +{stats?.streakBonus || 0} points</div>
                  ) : (
                    <div>• Streak bonus starts at 7+ days</div>
                  )}
                </div>
              </div>
              
              <Button 
                className={`w-full ${checkedInToday ? 'bg-[#241f53] text-white' : 'btn-gradient'}`} 
                size="lg" 
                variant={checkedInToday ? "default" : "outline"}
                onClick={handleDailyCheckin}
                disabled={checkingIn || checkedInToday}
              >
                <CheckCircle className={`mr-1.5 h-3 w-3 ${checkedInToday ? 'text-green-400' : ''}`} />
                {checkingIn ? 'Checking in...' : checkedInToday ? '✓ Checked in' : 'Check-in'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="section-primary border-0">
          <CardContent className="px-1.5 py-1">
            <Link href="/categories">
              <Button className="w-full btn-gradient" size="lg">
                <CheckCircle className="mr-1.5 h-3 w-3" />
                Daily Health Actions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
