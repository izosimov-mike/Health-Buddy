"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, ArrowLeft, Crown, User } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useViewProfile } from '@coinbase/onchainkit/minikit'

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
  const [loading, setLoading] = useState(true);
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
          setLeaderboardData(data);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

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
        {/* Real Leaderboard */}
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
              leaderboardData.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    user.name === "Test User" ? "bg-primary/10 border border-primary/20" : "bg-muted/30 hover:bg-muted/50"
                  } ${user.fid ? 'cursor-pointer' : ''}`}
                  onClick={() => user.fid && handleViewProfile(user.fid)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8">{getRankIcon(user.rank)}</div>
                    
                    {/* Farcaster Profile Picture or Avatar */}
                    <div className="relative">
                      {user.farcasterPfpUrl ? (
                        <img 
                          src={user.farcasterPfpUrl} 
                          alt={user.farcasterDisplayName || user.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold">
                          {user.farcasterDisplayName ? user.farcasterDisplayName[0].toUpperCase() : user.name[0].toUpperCase()}
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
                        {user.farcasterDisplayName || user.name}
                        {user.name === "Test User" && (
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
                        {user.farcasterUsername ? `@${user.farcasterUsername}` : user.levelName}
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
              ))
            )}
          </CardContent>
        </Card>


      </div>
    </div>
  )
}
