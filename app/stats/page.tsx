"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, ArrowLeft, TrendingUp, Target, Flame, Activity, Award } from "lucide-react"
import Link from "next/link"
import { useHealthStore } from "@/lib/health-store"
import { BottomNavigation } from "@/components/bottom-navigation"

// Mock statistics data
const mockWeeklyData = [
  { day: "Mon", points: 3, actions: 3 },
  { day: "Tue", points: 5, actions: 4 },
  { day: "Wed", points: 2, actions: 2 },
  { day: "Thu", points: 4, actions: 3 },
  { day: "Fri", points: 6, actions: 5 },
  { day: "Sat", points: 3, actions: 3 },
  { day: "Sun", points: 4, actions: 4 },
]

const categoryStats = [
  { name: "Physical", completed: 12, total: 20, color: "bg-blue-500" },
  { name: "Nutrition", completed: 15, total: 18, color: "bg-green-500" },
  { name: "Mental", completed: 8, total: 15, color: "bg-purple-500" },
]

export default function StatsPage() {
  const { globalScore, currentStreak, longestStreak } = useHealthStore()
  const [dailyScore, setDailyScore] = useState(0)

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    const savedDailyScore = localStorage.getItem(`daily-score-${today}`)
    if (savedDailyScore) setDailyScore(Number.parseInt(savedDailyScore))
  }, [])

  const maxWeeklyPoints = Math.max(...mockWeeklyData.map((d) => d.points))
  const totalWeeklyPoints = mockWeeklyData.reduce((sum, d) => sum + d.points, 0)
  const avgDailyPoints = Math.round((totalWeeklyPoints / 7) * 10) / 10

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
                <span className="text-2xl font-bold text-primary">{globalScore}</span>
              </div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold text-primary">{currentStreak}</span>
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
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Daily Average: {avgDailyPoints} points</span>
                <span>Total: {totalWeeklyPoints} points</span>
              </div>
              <div className="flex items-end justify-between gap-2 h-32">
                {mockWeeklyData.map((day, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1">
                    <div className="text-xs text-muted-foreground">{day.points}</div>
                    <div
                      className="bg-primary rounded-t w-full min-h-[4px]"
                      style={{
                        height: `${(day.points / maxWeeklyPoints) * 100}%`,
                        minHeight: day.points > 0 ? "8px" : "4px",
                      }}
                    />
                    <div className="text-xs font-medium">{day.day}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Category Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryStats.map((category, index) => {
              const percentage = Math.round((category.completed / category.total) * 100)
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {category.completed}/{category.total}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {percentage}% complete
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
                <div className="text-2xl font-bold text-accent">{longestStreak}</div>
                <div className="text-sm text-muted-foreground">Best Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{dailyScore}</div>
                <div className="text-sm text-muted-foreground">Today's Points</div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Recent Milestones</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                  <div className="text-lg">🏆</div>
                  <div>
                    <div className="font-medium">Apprentice Level</div>
                    <div className="text-sm text-muted-foreground">Reached 20+ points</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                  <div className="text-lg">🔥</div>
                  <div>
                    <div className="font-medium">Week Warrior</div>
                    <div className="text-sm text-muted-foreground">7 day streak achieved</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  )
}
