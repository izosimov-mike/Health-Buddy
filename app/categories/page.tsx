"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Dumbbell, Apple, Brain, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useHealthStore } from "@/lib/health-store"
import { BottomNavigation } from "@/components/bottom-navigation"

// Health categories and actions
const healthCategories = [
  {
    id: "physical",
    name: "Physical",
    icon: Dumbbell,
    color: "bg-blue-500",
    actions: [
      { id: "h1", name: "Mini workout", description: "Do 10 push-ups, 20 squats, 30s plank", points: 1 },
      { id: "h4", name: "Walk 10,000 steps", description: "Take a long walk or use stairs", points: 1 },
      { id: "h5", name: "Stretch for 10 minutes", description: "Morning or evening stretching routine", points: 1 },
      { id: "h6", name: "Do yoga", description: "15-30 minute yoga session", points: 1 },
      { id: "h7", name: "Go for a run", description: "20+ minute jog or run", points: 1 },
    ],
  },
  {
    id: "nutrition",
    name: "Nutrition",
    icon: Apple,
    color: "bg-green-500",
    actions: [
      { id: "h2", name: "Drink 8 cups of water", description: "Stay hydrated throughout the day", points: 1 },
      { id: "h8", name: "Eat 5 fruits/vegetables", description: "Include variety of colors", points: 1 },
      { id: "h9", name: "No processed sugar", description: "Avoid sweets and sugary drinks", points: 1 },
      { id: "h10", name: "Healthy breakfast", description: "Start day with nutritious meal", points: 1 },
      { id: "h11", name: "Cook at home", description: "Prepare your own meal", points: 1 },
    ],
  },
  {
    id: "mental",
    name: "Mental",
    icon: Brain,
    color: "bg-purple-500",
    actions: [
      { id: "h3", name: "Meditation 5 minutes", description: "Short mindfulness practice", points: 1 },
      { id: "h12", name: "Read for 30 minutes", description: "Books, articles, or educational content", points: 1 },
      { id: "h13", name: "Practice gratitude", description: "Write 3 things you're grateful for", points: 1 },
      { id: "h14", name: "Digital detox hour", description: "1 hour without phone/social media", points: 1 },
      { id: "h15", name: "Learn something new", description: "Study a skill or hobby", points: 1 },
    ],
  },
]

export default function CategoriesPage() {
  const { addCompletedAction } = useHealthStore()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set())
  const [dailyScore, setDailyScore] = useState(0)

  // Load completed actions from localStorage on mount
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    const savedActions = localStorage.getItem(`completed-actions-${today}`)
    if (savedActions) {
      setCompletedActions(new Set(JSON.parse(savedActions)))
    }

    const savedScore = localStorage.getItem(`daily-score-${today}`)
    if (savedScore) {
      setDailyScore(Number.parseInt(savedScore))
    }
  }, [])

  // Save completed actions to localStorage
  const saveProgress = (actions: Set<string>, score: number) => {
    const today = new Date().toISOString().split("T")[0]
    localStorage.setItem(`completed-actions-${today}`, JSON.stringify([...actions]))
    localStorage.setItem(`daily-score-${today}`, score.toString())
  }

  const handleClaimAction = (actionId: string, points: number) => {
    const newCompletedActions = new Set(completedActions)
    newCompletedActions.add(actionId)
    const newScore = dailyScore + points

    setCompletedActions(newCompletedActions)
    setDailyScore(newScore)
    addCompletedAction(actionId)
    saveProgress(newCompletedActions, newScore)
  }

  const isActionCompleted = (actionId: string) => completedActions.has(actionId)

  // Category overview
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Categories</h1>
              <p className="text-sm opacity-90">Choose your health actions</p>
            </div>
          </div>
        </div>

        {/* Daily Score */}
        <div className="p-4">
          <Card className="mb-6">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{dailyScore}</div>
              <div className="text-sm text-muted-foreground">Points earned today</div>
            </CardContent>
          </Card>

          {/* Categories Grid */}
          <div className="space-y-4">
            {healthCategories.map((category) => {
              const completedCount = category.actions.filter((action) => isActionCompleted(action.id)).length
              const totalCount = category.actions.length
              const Icon = category.icon

              return (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${category.color} text-white`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {completedCount}/{totalCount} completed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={completedCount > 0 ? "default" : "secondary"}>+{completedCount} pts</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  // Category detail view
  const category = healthCategories.find((cat) => cat.id === selectedCategory)
  if (!category) return null

  const Icon = category.icon

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setSelectedCategory(null)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className={`p-2 rounded-full ${category.color} text-white`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{category.name}</h1>
            <p className="text-sm opacity-90">Daily health actions</p>
          </div>
        </div>
      </div>

      {/* Actions List */}
      <div className="p-4 space-y-4">
        {category.actions.map((action) => {
          const isCompleted = isActionCompleted(action.id)

          return (
            <Card key={action.id} className={isCompleted ? "bg-muted/50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <h3 className={`font-semibold ${isCompleted ? "text-muted-foreground line-through" : ""}`}>
                        {action.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                    <Badge variant="outline" className="text-xs">
                      +{action.points} point
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleClaimAction(action.id, action.points)}
                    disabled={isCompleted}
                    size="sm"
                    className="shrink-0"
                  >
                    {isCompleted ? "Claimed" : "Claim"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <BottomNavigation />
    </div>
  )
}
