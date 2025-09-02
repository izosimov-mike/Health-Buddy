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
    <div className="bg-main min-h-screen">
      <div className="p-4 space-y-2">
        {/* User Info Frame */}
        <Card className="border-0" style={{ backgroundColor: '#180a34' }}>
          <CardContent className="p-1">
            <div className="flex items-center gap-3">
              {/* Profile Picture */}
              <div className="relative">
                {context?.user?.pfpUrl ? (
                  <img 
                    src={context.user.pfpUrl} 
                    alt={context.user.username || 'User'}
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-300"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {(context?.user?.username || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* User Info */}
              <div className="flex-1">
                <h3 className="text-white font-semibold text-base">
                  {context?.user?.username || 'Farcaster User'}
                </h3>
              </div>
              
              {/* Current Level */}
              <div className="text-right">
                <div className="text-white font-semibold text-sm">
                  {stats?.levelName || 'Beginner'}
                </div>
                <div className="text-white/70 text-xs">
                  Level {stats?.level || 1}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score and Streak Frame */}
        <Card className="border-0" style={{ backgroundColor: '#241f53' }}>
          <CardContent className="px-3" style={{ paddingTop: '4px', paddingBottom: '4px' }} sx={{ "&:last-child": { paddingBottom: '4px' } }}>
            <div className="flex justify-between items-center">
              <span className="text-white font-medium text-sm">Score</span>
              <span className="text-white font-bold text-base">{stats?.globalScore || 0}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-white font-medium text-sm">Streak</span>
              <span className="text-white font-bold text-base">{stats?.currentStreak || 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Level Image and Progress Frame */}
        <Card className="section-primary border-0">
          <CardContent className="p-1">
            <div className="text-center space-y-2">
              {/* App Title */}
              <div className="mb-2">
                <h3 className="text-white text-2xl font-bold mb-1">Health Buddy</h3>
                <p className="text-purple-200 text-sm">Your daily wellness companion</p>
              </div>
              
              {/* Level Image */}
              <div className="flex justify-center">
                <img 
                  src={getLevelImage(stats?.level || 1)} 
                  alt={`${stats?.levelName || 'Beginner'} level`}
                  className="w-32 h-32 object-contain"
                />
              </div>
              
              {/* Progress Bar */}
              <div className="max-w-xs mx-auto">
                <div className="flex justify-between text-xs text-white/70 mb-2">
                  <span>Progress to next level</span>
                  <span>{Math.round(stats?.levelProgress?.progress || 0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${stats?.levelProgress?.progress || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-white/70 mt-1">
                  <span>{stats?.levelProgress?.current || 0}</span>
                  <span>{stats?.levelProgress?.next || 100}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Check-in Frame */}
        <Card className="section-primary border-0">
          <CardContent className="p-1">
            <div className="text-center">
              <Button 
                className={`w-full ${checkedInToday ? 'bg-[#241f53] text-white' : 'btn-gradient'}`} 
                size="lg" 
                variant={checkedInToday ? "default" : "outline"}
                onClick={handleDailyCheckin}
                disabled={checkingIn || checkedInToday}
              >
                <CheckCircle className={`mr-2 h-4 w-4 ${checkedInToday ? 'text-green-400' : ''}`} />
                {checkingIn ? 'Checking in...' : checkedInToday ? '✓ Checked in' : 'Check-in'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Daily Health Actions Frame */}
        <Card className="section-primary border-0">
          <CardContent className="p-4">
            <Link href="/categories">
              <Button className="w-full btn-gradient" size="lg">
                <CheckCircle className="mr-2 h-4 w-4" />
                Daily Health Actions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
