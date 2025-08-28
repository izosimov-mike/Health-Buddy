"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, ArrowLeft, Crown } from "lucide-react"
import Link from "next/link"
import { BottomNavigation } from "@/components/bottom-navigation"

// Mock leaderboard data - user mentioned they'll develop this further
const mockLeaderboardData = [
  { id: 1, name: "Alex", score: 127, level: "Apprentice", streak: 6, rank: 1, avatar: "😸" },
  { id: 2, name: "Maria", score: 89, level: "Explorer", streak: 4, rank: 2, avatar: "🐈" },
  { id: 3, name: "John", score: 76, level: "Explorer", streak: 3, rank: 3, avatar: "🐱" },
  { id: 4, name: "Sarah", score: 45, level: "Apprentice", streak: 2, rank: 4, avatar: "😸" },
  { id: 5, name: "Mike", score: 23, level: "Apprentice", streak: 1, rank: 5, avatar: "😸" },
]

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
        {/* Coming Soon Notice */}
        <Card className="border-dashed border-2 border-muted-foreground/20">
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Leaderboard Coming Soon!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with friends and compete in health challenges. This feature is under development.
            </p>
            <Badge variant="outline">In Development</Badge>
          </CardContent>
        </Card>

        {/* Preview/Mock Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Preview Rankings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockLeaderboardData.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  user.name === "Alex" ? "bg-primary/10 border border-primary/20" : "bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8">{getRankIcon(user.rank)}</div>
                  <div className="text-2xl">{user.avatar}</div>
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {user.name}
                      {user.name === "Alex" && (
                        <Badge variant="secondary" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{user.level}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{user.score}</div>
                  <div className="text-xs text-muted-foreground">{user.streak} day streak</div>
                </div>
              </div>
            ))}
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
      <BottomNavigation />
    </div>
  )
}
