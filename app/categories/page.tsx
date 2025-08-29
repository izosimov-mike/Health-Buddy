"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Dumbbell, Apple, Brain, ArrowLeft, Sparkles, Moon } from "lucide-react"
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
      { id: "h1", name: "Morning exercise (5–10 minutes)", description: "boosts energy, improves circulation, and wakes up muscles", points: 1 },
      { id: "h4", name: "Mini workout (push-ups, squats, plank)", description: "builds strength and supports joint health", points: 1 },
      { id: "h5", name: "Stretching or yoga", description: "increases flexibility, reduces stiffness, and lowers stress", points: 1 },
      { id: "h6", name: "Outdoor walk (7,000–10,000 steps)", description: "improves mood, supports cardiovascular health", points: 1 },
      { id: "h7", name: "Short posture/desk breaks", description: "prevents back pain and eye strain during long sitting periods", points: 1 },
    ],
  },
  {
    id: "nutrition",
    name: "Nutrition",
    icon: Apple,
    color: "bg-green-500",
    actions: [
      { id: "h2", name: "Start the day with water", description: "rehydrates the body and supports metabolism after sleep", points: 1 },
      { id: "h8", name: "Stay hydrated throughout the day", description: "aim for enough water to keep energy, focus, and digestion balanced", points: 1 },
      { id: "h9", name: "Eat vegetables and fruits daily", description: "ensure at least 2–3 servings for vitamins, minerals, and fiber", points: 1 },
      { id: "h10", name: "Choose whole foods over processed ones", description: "improves nutrient intake and reduces sugar/fat overload", points: 1 },
      { id: "h11", name: "Have a light dinner 2–3 hours before bed", description: "helps digestion and improves sleep quality", points: 1 },
    ],
  },
  {
    id: "mental",
    name: "Mental",
    icon: Brain,
    color: "bg-purple-500",
    actions: [
      { id: "h3", name: "Meditation (5–10 minutes)", description: "reduces stress and improves focus", points: 1 },
      { id: "h12", name: "Breathing exercises (2–5 minutes)", description: "calms the nervous system and lowers anxiety", points: 1 },
      { id: "h13", name: "Limit social media/screen time before bed", description: "supports better sleep and reduces overstimulation", points: 1 },
      { id: "h14", name: "Read a book for at least 10 minutes", description: "improves focus, relaxation, and learning", points: 1 },
      { id: "h15", name: "Learn something new", description: "Study a skill or hobby", points: 1 },
    ],
  },
  {
    id: "hygiene",
    name: "Hygiene & Self-Care",
    icon: Sparkles,
    color: "bg-pink-500",
    actions: [
      { id: "h16", name: "Brush teeth (morning and evening)", description: "prevents cavities and gum disease", points: 1 },
      { id: "h17", name: "Use dental floss or mouthwash", description: "floss removes plaque between teeth, mouthwash helps freshness", points: 1 },
      { id: "h18", name: "Wash face / skincare routine", description: "keeps skin clean, fresh, and healthy", points: 1 },
      { id: "h19", name: "Refreshing shower", description: "supports hygiene and helps body feel energized or relaxed", points: 1 },
    ],
  },
  {
    id: "sleep",
    name: "Sleep & Routine",
    icon: Moon,
    color: "bg-indigo-500",
    actions: [
      { id: "h20", name: "Go to bed before 11:00 PM", description: "aligns with natural circadian rhythm for better rest", points: 1 },
      { id: "h21", name: "Sleep at least 7–8 hours", description: "supports memory, immunity, and recovery", points: 1 },
      { id: "h22", name: "Wake up without phone scrolling", description: "reduces stress and helps start the day with focus", points: 1 },
      { id: "h23", name: "Avoid snoozing the alarm", description: "prevents sleep inertia and morning fatigue", points: 1 },
      { id: "h24", name: "Prepare a calm sleep environment", description: "cool, dark, and quiet rooms promote deep sleep", points: 1 },
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
