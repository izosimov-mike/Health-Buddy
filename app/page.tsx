"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Calendar, Flame } from "lucide-react"
import { useHealthStore } from "@/lib/health-store"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function HomePage() {
  const {
    globalScore,
    currentStreak,
    longestStreak,
    lastCheckIn,
    dailyScore,
    updateStreak,
    setLastCheckIn,
    updateDailyScore,
    getCurrentCat,
    getProgressToNextLevel,
  } = useHealthStore()

  const [isAnimating, setIsAnimating] = useState(false)
  const [localDailyScore, setLocalDailyScore] = useState(0)

  const currentCat = getCurrentCat()

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    const savedScore = localStorage.getItem(`daily-score-${today}`)
    if (savedScore) {
      const score = Number.parseInt(savedScore)
      setLocalDailyScore(score)
      updateDailyScore(score)
    }
  }, [updateDailyScore])

  const handleDailyCheckIn = () => {
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    setIsAnimating(true)

    let newStreak = 1
    if (lastCheckIn === yesterday) {
      newStreak = currentStreak + 1
    } else if (lastCheckIn !== today) {
      newStreak = 1
    }

    const newLongestStreak = Math.max(longestStreak, newStreak)
    updateStreak(newStreak, newLongestStreak)
    setLastCheckIn(today)

    // Add bonus points for check-in
    const bonusPoints = Math.min(newStreak, 7)
    const newDailyScore = localDailyScore + bonusPoints
    setLocalDailyScore(newDailyScore)
    updateDailyScore(newDailyScore)
    localStorage.setItem(`daily-score-${today}`, newDailyScore.toString())

    setTimeout(() => {
      setIsAnimating(false)
    }, 1000)
  }

  const today = new Date().toISOString().split("T")[0]
  const hasCheckedInToday = lastCheckIn === today

  const getStreakBonus = () => {
    if (hasCheckedInToday) return 0
    return Math.min(currentStreak + 1, 7)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 text-center">
        <h1 className="text-xl font-bold">Health Buddy</h1>
        <p className="text-sm opacity-90">Твой помощник здоровья</p>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Cat Display */}
        <Card className="text-center">
          <CardContent className="p-6">
            <div
              className={`text-8xl mb-4 transition-transform duration-500 ${isAnimating ? "scale-110" : "scale-100"}`}
            >
              {currentCat.emoji}
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{currentCat.name}</h2>
            <Badge variant="secondary" className="mb-4">
              {currentCat.level}
            </Badge>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress to next level</span>
                <span>{Math.round(getProgressToNextLevel())}%</span>
              </div>
              <Progress value={getProgressToNextLevel()} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Daily Check-in */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Daily Check-in</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-2xl font-bold text-primary">{currentStreak}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">day streak</div>
                </div>
              </div>
            </div>

            {!hasCheckedInToday && (
              <div className="mb-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Streak bonus:</span>
                  <Badge variant="outline" className="text-accent border-accent">
                    +{getStreakBonus()} points
                  </Badge>
                </div>
              </div>
            )}

            <Button onClick={handleDailyCheckIn} disabled={hasCheckedInToday} className="w-full" size="lg">
              {hasCheckedInToday ? "Checked in today!" : "Daily Check-in"}
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{globalScore}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">{localDailyScore}</div>
              <div className="text-sm text-muted-foreground">Today's Points</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Progress Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-primary">{longestStreak}</div>
                <div className="text-xs text-muted-foreground">Best Streak</div>
              </div>
              <div>
                <div className="text-lg font-bold text-accent">{currentCat.level}</div>
                <div className="text-xs text-muted-foreground">Current Level</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  )
}
