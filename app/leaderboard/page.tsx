"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, ArrowLeft, Crown, User } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useViewProfile, useMiniKit } from '@coinbase/onchainkit/minikit'

interface LeaderboardUser {
  id: string;
  name: string;
  globalScore: number;
  currentStreak: number;
  level: number;
  rank: number;
  avatar: string;
  levelName: string;
  fid?: number;
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
  const { context } = useMiniKit();
  const viewProfile = useViewProfile();

  const handleViewProfile = async (fid: number) => {
    try {
      await viewProfile(fid);
    } catch (error) {
      console.error('Failed to view profile:', error);
    }
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        if (response.ok) {
          const data = await response.json();
          
          // Find current user in leaderboard if authenticated
          let currentUser = null;
          if (context?.user?.fid) {
            const userFid = context.user.fid.toString();
            // Find user by matching farcasterFid in database
            const userResponse = await fetch(`/api/stats?fid=${userFid}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              // Find user's rank in the full leaderboard
              const fullLeaderboardResponse = await fetch('/api/leaderboard?limit=1000');
              if (fullLeaderboardResponse.ok) {
                const fullData = await fullLeaderboardResponse.json();
                const userIndex = fullData.findIndex((u: LeaderboardUser) => u.id === userData.user?.id);
                if (userIndex !== -1) {
                  currentUser = {
                    ...fullData[userIndex],
                    rank: userIndex + 1
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
        {/* Current User Rank */}
        {currentUserRank && context?.user && (
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* User Rank */}
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-500 text-white rounded-full font-bold text-lg">
                    #{currentUserRank.rank}
                  </div>
                  
                  {/* User Avatar */}
                  <div className="relative">
                    {context.user.pfpUrl ? (
                      <img 
                        src={context.user.pfpUrl} 
                        alt={context.user.displayName || context.user.username || 'User'}
                        className="w-12 h-12 rounded-full object-cover border-2 border-purple-300"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {(context.user.displayName || context.user.username || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div>
                    <div className="font-bold text-lg text-gray-800">
                      {context.user.displayName || context.user.username || 'Farcaster User'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {context.user.username && `@${context.user.username}`}
                    </div>
                  </div>
                </div>
                
                {/* User Score */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{currentUserRank.globalScore}</div>
                  <div className="text-sm text-gray-500">points</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TOP-10 Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Health Champions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading leaderboard...</div>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-muted-foreground">No users found</div>
              </div>
            ) : (
              leaderboardData.map((user) => {
                // Check if this is the current user
                const isCurrentUser = context?.user?.fid && 
                  (user.fid === context.user.fid || 
                   (context.user.fid.toString() === user.id?.replace('farcaster-', '')));
                
                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isCurrentUser ? "bg-primary/10 border border-primary/20" : "bg-muted/30 hover:bg-muted/50"
                    } ${user.fid ? 'cursor-pointer' : ''}`}
                    onClick={() => user.fid && handleViewProfile(user.fid)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8">{getRankIcon(user.rank)}</div>
                      
                      {/* Profile Picture - use MiniKit data for current user */}
                      <div className="relative">
                        {isCurrentUser && context?.user?.pfpUrl ? (
                          <img 
                            src={context.user.pfpUrl} 
                            alt={context.user.displayName || context.user.username || user.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold">
                            {isCurrentUser && context?.user?.displayName 
                              ? context.user.displayName[0].toUpperCase() 
                              : user.name[0].toUpperCase()}
                          </div>
                        )}
                        {user.fid && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                            <User className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {isCurrentUser && context?.user?.displayName 
                            ? context.user.displayName 
                            : user.name}
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">
                              You
                            </Badge>
                          )}
                          {user.fid && (
                            <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">
                              FC
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {isCurrentUser && context?.user?.username 
                            ? `@${context.user.username}` 
                            : user.levelName}
                          {user.fid && (
                            <span className="ml-2 text-xs text-purple-500">FID: {user.fid}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{user.globalScore}</div>
                      <div className="text-xs text-muted-foreground">{user.currentStreak} day streak</div>
                      {user.fid && (
                        <div className="text-xs text-purple-500 mt-1">Click to view profile</div>
                      )}
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
