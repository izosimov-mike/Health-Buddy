"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Dumbbell, Apple, Brain, Heart, Users, ArrowLeft, Sparkles, Moon } from "lucide-react"
import Link from "next/link"

interface HealthAction {
  id: string;
  name: string;
  description: string;
  points: number;
  categoryId: string;
  completed?: boolean;
}

interface HealthCategory {
  id: string;
  name: string;
  description: string;
  actions?: HealthAction[];
}

// Category icons and colors mapping
const categoryConfig: Record<string, { icon: any; color: string }> = {
  'Physical Health': { icon: Dumbbell, color: 'bg-blue-500' },
  'Nutrition & Hydration': { icon: Apple, color: 'bg-green-500' },
  'Mental Health': { icon: Brain, color: 'bg-purple-500' },
  'Hygiene & Self-Care': { icon: Sparkles, color: 'bg-pink-500' },
  'Sleep & Routine': { icon: Moon, color: 'bg-indigo-500' },
  // Fallback for unknown categories
  'default': { icon: Heart, color: 'bg-gray-500' }
}

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<HealthCategory[]>([])
  const [actions, setActions] = useState<HealthAction[]>([])
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set())
  const [dailyScore, setDailyScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  // Load categories and actions
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, actionsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/actions')
        ])
        
        if (categoriesRes.ok && actionsRes.ok) {
          const categoriesData = await categoriesRes.json()
          const actionsData = await actionsRes.json()
          
          setCategories(categoriesData)
          setActions(actionsData)
          
          // Set completed actions and calculate daily score
          const completed = new Set<string>(actionsData.filter((action: HealthAction) => action.completed).map((action: HealthAction) => action.id))
          setCompletedActions(completed)
          
          const score = actionsData.reduce((total: number, action: HealthAction) => {
            return action.completed ? total + action.points : total
          }, 0)
          setDailyScore(score)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setDataLoading(false)
      }
    }

    loadData()

    // Refresh data when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const handleClaimAction = async (actionId: string, points: number) => {
    if (completedActions.has(actionId)) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/actions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId, completed: true })
      })
      
      if (response.ok) {
        setCompletedActions(prev => new Set([...prev, actionId]))
        setDailyScore(prev => prev + points)
        
        // Refresh actions data to get updated completion status
        const actionsRes = await fetch('/api/actions')
        if (actionsRes.ok) {
          const actionsData = await actionsRes.json()
          setActions(actionsData)
          
          // Update completed actions set
          const completed = new Set<string>(actionsData.filter((action: HealthAction) => action.completed).map((action: HealthAction) => action.id))
          setCompletedActions(completed)
          
          // Recalculate daily score from server data
          const score = actionsData.reduce((total: number, action: HealthAction) => {
            return action.completed ? total + action.points : total
          }, 0)
          setDailyScore(score)
        }
      }
    } catch (error) {
      console.error('Error completing action:', error)
    } finally {
      setLoading(false)
    }
  }

  const isActionCompleted = (actionId: string) => completedActions.has(actionId)
  
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    )
  }

  // Category overview
  if (!selectedCategory) {
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
            {categories.map((category) => {
              const categoryActions = actions.filter(action => action.categoryId === category.id)
              const completedCount = categoryActions.filter((action) => isActionCompleted(action.id)).length
              const totalCount = categoryActions.length

              return (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${categoryConfig[category.name]?.color || categoryConfig.default.color} text-white`}>
                          {(() => {
                            const IconComponent = categoryConfig[category.name]?.icon || categoryConfig.default.icon;
                            return <IconComponent className="h-6 w-6" />;
                          })()}
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
      </div>
    )
  }

  // Category detail view
  const category = categories.find((cat) => cat.id === selectedCategory)
  if (!category) return null

  const categoryActions = actions.filter(action => action.categoryId === selectedCategory)

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
          <div className={`p-2 rounded-full ${categoryConfig[category.name]?.color || categoryConfig.default.color} text-white`}>
            {(() => {
              const IconComponent = categoryConfig[category.name]?.icon || categoryConfig.default.icon;
              return <IconComponent className="h-5 w-5" />;
            })()}
          </div>
          <div>
            <h1 className="text-xl font-bold">{category.name}</h1>
            <p className="text-sm opacity-90">Daily health actions</p>
          </div>
        </div>
      </div>

      {/* Actions List */}
      <div className="p-4 space-y-4">
        {categoryActions.map((action) => {
          const isCompleted = isActionCompleted(action.id)

          return (
            <Card key={action.id} className={isCompleted ? "bg-muted/50" : ""}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <h3 className={`font-medium text-sm ${isCompleted ? "text-muted-foreground line-through" : ""}`}>
                        {action.name}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{action.description}</p>
                    <Badge variant="outline" className="text-xs">
                      +{action.points} point
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleClaimAction(action.id, action.points)}
                    disabled={isCompleted || loading}
                    size="sm"
                    className="shrink-0"
                  >
                    {isCompleted ? "Claimed" : loading ? "..." : "Claim"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
