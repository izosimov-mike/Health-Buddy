"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Dumbbell, Apple, Brain, Heart, Users, ArrowLeft, Sparkles, Moon } from "lucide-react"
import Link from "next/link"
import { useMiniKit } from '@coinbase/onchainkit/minikit'
import { FarcasterAuth } from '@/components/FarcasterAuth'

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

// Category icons and gradient mapping
const categoryConfig: Record<string, { icon: any; gradient: string }> = {
  'Physical Health': { icon: Dumbbell, gradient: 'gradient-card-2' },
  'Nutrition & Hydration': { icon: Apple, gradient: 'gradient-card-3' },
  'Mental Health': { icon: Brain, gradient: 'gradient-card-1' },
  'Hygiene & Self-Care': { icon: Sparkles, gradient: 'gradient-card-6' },
  'Sleep & Routine': { icon: Moon, gradient: 'gradient-card-4' },
  // Fallback for unknown categories
  'default': { icon: Heart, gradient: 'gradient-card-5' }
}

export default function CategoriesPage() {
  const { context } = useMiniKit()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<HealthCategory[]>([])
  const [actions, setActions] = useState<HealthAction[]>([])
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set())
  const [dailyScore, setDailyScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [userFid, setUserFid] = useState<string | null>(null)

  // Get user FID from context
  useEffect(() => {
    if (context?.user?.fid) {
      setUserFid(context.user.fid.toString())
    }
  }, [context])

  // Load categories and actions
  useEffect(() => {
    const loadData = async () => {
      try {
        // Always load categories
        const categoriesRes = await fetch('/api/categories')
        
        // Load actions with FID if available, otherwise load without FID for testing
        const actionsUrl = userFid ? `/api/actions?fid=${userFid}` : '/api/actions'
        const actionsRes = await fetch(actionsUrl)
        
        if (categoriesRes.ok && actionsRes.ok) {
          const categoriesData = await categoriesRes.json()
          const actionsData = await actionsRes.json()
          
          console.log('Categories loaded:', categoriesData)
          console.log('Actions loaded:', actionsData)
          
          setCategories(categoriesData)
          setActions(actionsData)
          
          // Set completed actions and calculate daily score
          const completed = new Set<string>(actionsData.filter((action: HealthAction) => action.completed).map((action: HealthAction) => action.id))
          setCompletedActions(completed)
          
          const score = actionsData.reduce((total: number, action: HealthAction) => {
            return action.completed ? total + action.points : total
          }, 0)
          setDailyScore(score)
        } else {
          console.error('Failed to load data:', {
            categoriesStatus: categoriesRes.status,
            actionsStatus: actionsRes.status
          })
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
  }, [userFid])

  const handleClaimAction = async (actionId: string, points: number) => {
    if (completedActions.has(actionId)) return
    
    setLoading(true)
    try {
      const requestBody = { actionId, completed: true }
      if (userFid) {
        requestBody.fid = userFid
      }
      
      const response = await fetch('/api/actions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      if (response.ok) {
        setCompletedActions(prev => new Set([...prev, actionId]))
        setDailyScore(prev => prev + points)
        
        // Refresh actions data to get updated completion status
        const actionsUrl = userFid ? `/api/actions?fid=${userFid}` : '/api/actions'
        const actionsRes = await fetch(actionsUrl)
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

  const handleAuthSuccess = async (userData: any) => {
    console.log('Authentication successful:', userData)
    const fid = userData.fid?.toString()
    setUserFid(fid)
  }

  // Debug: Log context state
  console.log('MiniKit context:', context)
  console.log('User FID from context:', context?.user?.fid)
  console.log('UserFid state:', userFid)

  // Show auth screen if not authenticated (temporarily disabled for debugging)
  // if (!context?.user?.fid) {
  //   return (
  //     <div className="bg-main min-h-screen">
  //       <div className="bg-main text-white py-4 px-4">
  //         <div className="flex items-center gap-3">
  //           <Link href="/">
  //             <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
  //               <ArrowLeft className="h-4 w-4" />
  //             </div>
  //           </Link>
  //           <div>
  //             <h1 className="text-lg font-bold">Categories</h1>
  //             <p className="text-xs opacity-90">Connect to access health actions</p>
  //           </div>
  //         </div>
  //       </div>
  //       <div className="p-4">
  //         <FarcasterAuth onAuthSuccess={handleAuthSuccess} />
  //       </div>
  //     </div>
  //   )
  // }
  
  if (dataLoading) {
    return (
      <div className="bg-main p-4 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">Loading categories...</p>
        </div>
      </div>
    )
  }

  // Category overview
  if (!selectedCategory) {
    return (
      <div className="bg-main">
        {/* Header */}
        <div className="bg-main text-white py-4 px-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Categories</h1>
              <p className="text-xs opacity-90">Choose your health actions</p>
            </div>
          </div>
        </div>

        <div className="p-3">

          {/* Categories Grid */}
          <div className="space-y-4">
            {categories.map((category) => {
              const categoryActions = actions.filter(action => action.categoryId === category.id)
              const completedCount = categoryActions.filter((action) => isActionCompleted(action.id)).length
              const totalCount = categoryActions.length

              return (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 section-primary text-white border-0"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="px-1.5 py-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white">
                        {(() => {
                          const IconComponent = categoryConfig[category.name]?.icon || categoryConfig.default.icon;
                          return <IconComponent className="h-4 w-4" />;
                        })()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm leading-tight">{category.name}</h3>
                        <p className="text-xs opacity-90 leading-tight">
                          {completedCount}/{totalCount} completed
                        </p>
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
      <div className="bg-main">
      {/* Header */}
      <div className="bg-main text-white py-4 px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={() => setSelectedCategory(null)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white">
            {(() => {
              const IconComponent = categoryConfig[category.name]?.icon || categoryConfig.default.icon;
              return <IconComponent className="h-4 w-4" />;
            })()}
          </div>
          <div>
            <h1 className="text-lg font-bold">{category.name}</h1>
            <p className="text-xs opacity-90">Daily health actions</p>
          </div>
        </div>
      </div>

      {/* Actions List */}
      <div className="p-2 space-y-2">
        {categoryActions.map((action) => {
          const isCompleted = isActionCompleted(action.id)

          return (
            <Card key={action.id} className="section-primary border-0">
              <CardContent className="px-1.5 py-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0">
                      {isCompleted ? (
                        <CheckCircle className="h-3 w-3 text-green-400" />
                      ) : (
                        <Circle className="h-3 w-3 text-purple-400" />
                      )}
                      <h3 className={`font-medium text-xs leading-tight text-white ${isCompleted ? "text-green-400 line-through" : ""}`}>
                        {action.name}
                      </h3>
                    </div>
                    <p className="text-xs text-white opacity-90 mb-1 leading-tight">{action.description}</p>
                    <Badge variant="outline" className="text-xs px-1 py-0 border-purple-400/50 text-purple-400">
                      +{action.points} point
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleClaimAction(action.id, action.points)}
                    disabled={isCompleted || loading}
                    size="sm"
                    className={`shrink-0 ${isCompleted ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
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
