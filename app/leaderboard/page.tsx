"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, ArrowLeft, Crown } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface LeaderboardUser {
  id: string;
  name: string;
  globalScore: number;
  currentStreak: number;
  level: number;
  rank: number;
  avatar: string;
  levelName: string;
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
            <Trophy className="h-6 w-6" />
            <div>
              <h1 className="text-xl font-bold">Leaderboard</h1>
              <p className="text-sm opacity-90">Health Champions</p>
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
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    user.name === "Test User" ? "bg-primary/10 border border-primary/20" : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8">{getRankIcon(user.rank)}</div>
                    <div className="text-2xl">{user.avatar}</div>
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {user.name}
                        {user.name === "Test User" && (
                          <Badge variant="secondary" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{user.levelName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{user.globalScore}</div>
                    <div className="text-xs text-muted-foreground">{user.currentStreak} day streak</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Features Coming Soon */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="opacity-60">
            <CardContent className="p-4 text-center">
              <h4 className="font-semibold mb-2">Weekly Challenges</h4>
              <p className="text-sm text-muted-foreground">Compete in themed health challenges</p>
            </CardContent>
          </Card>
          <Card className="opacity-60">
            <CardContent className="p-4 text-center">
              <h4 className="font-semibold mb-2">Friend System</h4>
              <p className="text-sm text-muted-foreground">Add friends and share progress</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
