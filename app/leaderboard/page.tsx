"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, ArrowLeft, Crown, User } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { sdk } from '@farcaster/miniapp-sdk'

interface LeaderboardUser {
  id: string;
  name: string;
  globalScore: number;
  currentStreak: number;
  level: number;
  rank: number;
  avatar: string;
  levelName: string;
  fid?: string;
  farcasterUsername?: string;
  farcasterDisplayName?: string;
  farcasterPfpUrl?: string;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 text-yellow-500" />
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />
    default:
      return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
  }
}

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<any>(null);

  const handleViewProfile = async (fid: string) => {
    try {
      await sdk.actions.openUrl(`https://warpcast.com/~/profiles/${fid}`);
    } catch (error) {
      console.error('Failed to view profile:', error);
    }
  };

  useEffect(() => {
    // Initialize frame readiness and get context
    const initializeApp = async () => {
      try {
        await sdk.actions.ready()
        const userContext = await sdk.context
        setContext(userContext)
      } catch (error) {
        console.error('Failed to initialize app:', error)
      }
    }
    
    initializeApp()

    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        if (response.ok) {
          const data = await response.json();
          
          // Find current user in leaderboard if authenticated
          let currentUser = null;
          if (context?.user?.fid) {
            const userFid = context.user.fid.toString();
            // Get user stats
            const userResponse = await fetch(`/api/stats?fid=${userFid}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              // Find user's rank in the full leaderboard by farcasterFid
              const fullLeaderboardResponse = await fetch('/api/leaderboard?limit=1000');
              if (fullLeaderboardResponse.ok) {
                const fullData = await fullLeaderboardResponse.json();
                const userIndex = fullData.findIndex((u: LeaderboardUser) => u.fid === userFid);
                if (userIndex !== -1) {
                  currentUser = {
                    ...fullData[userIndex],
                    rank: userIndex + 1,
                    globalScore: userData.globalScore || 0
                  };
                } else {
                  // User not in top leaderboard, create entry with stats data
                  currentUser = {
                    id: `farcaster-${userFid}`,
                    name: userData.name || `User ${userFid}`,
                    globalScore: userData.globalScore || 0,
                    currentStreak: userData.currentStreak || 0,
                    level: userData.level || 1,
                    rank: fullData.length + 1,
                    avatar: '',
                    levelName: userData.levelName || 'Beginner',
                    fid: userFid
                  };
                }
              }
            }
          }
          
          setCurrentUserRank(currentUser);
          setLeaderboardData(data.slice(0, 10)); // Limit to TOP-10
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [context?.user?.fid]);

  return (
    <div className="min-h-screen bg-main pb-20">
      {/* Header */}
      <div className="bg-main text-white py-2 px-4">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            <div>
              <h1 className="text-lg font-bold">Leaderboard</h1>
              <p className="text-xs opacity-90">Health Champions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Current User Profile */}
        {context?.user && (
          <Card className="mb-6 bg-gradient-to-r from-primary/10 to-purple-100 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {context.user.pfpUrl ? (
                      <img 
                        src={context.user.pfpUrl} 
                        alt={context.user.displayName || context.user.username || 'User'}
                        className="w-16 h-16 rounded-full object-cover border-3 border-primary/30"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                        {context.user.displayName ? context.user.displayName[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-bold text-xl">
                      {context.user.displayName || context.user.username || 'User'}
                    </div>
                    <div className="text-base text-muted-foreground">
                      @{context.user.username || 'username'}
                    </div>
                    <div className="text-sm text-primary font-medium">
                      FID: {context.user.fid}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {currentUserRank && (
                    <>
                      <div className="font-bold text-3xl text-primary">
                        {currentUserRank.globalScore}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Score
                      </div>
                      <div className="text-xs text-primary font-medium mt-1">
                        Rank #{currentUserRank.rank}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 10 Leaderboard */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Top 10 Players
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No leaderboard data available
              </div>
            ) : (
              leaderboardData.map((user) => {
                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-2 rounded-md transition-colors bg-muted/20 hover:bg-muted/40 ${
                      user.fid ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => user.fid && handleViewProfile(user.fid)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 text-xs font-bold">
                        {getRankIcon(user.rank)}
                      </div>
                      
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                          {user.name[0].toUpperCase()}
                        </div>
                        {user.fid && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                            <User className="w-1.5 h-1.5 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium flex items-center gap-1">
                          {user.name}
                          {user.fid && (
                            <Badge variant="outline" className="text-xs px-1 py-0 text-purple-600 border-purple-200">
                              FC
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.levelName}
                          {user.fid && (
                            <span className="ml-1 text-purple-500">FID: {user.fid}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-primary">{user.globalScore}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>


      </div>
    </div>
  )
}
