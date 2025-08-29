import { create } from 'zustand'

const catStages = [
  { level: 1, name: "Котенок", minScore: 0, image: "🐱" },
  { level: 2, name: "Молодой кот", minScore: 50, image: "😸" },
  { level: 3, name: "Взрослый кот", minScore: 150, image: "😺" },
  { level: 4, name: "Мудрый кот", minScore: 300, image: "😻" },
  { level: 5, name: "Кот-мастер", minScore: 500, image: "🦁" },
]

interface HealthState {
  // User data
  userId: string | null
  globalScore: number
  currentStreak: number
  longestStreak: number
  dailyScore: number
  isLoading: boolean
  
  // Actions
  setUserId: (userId: string) => void
  loadUserData: () => Promise<void>
  completeAction: (actionId: string) => Promise<void>
  
  // Computed values
  getCurrentCatStage: () => typeof catStages[0]
  getProgressToNext: () => number
}

export const useHealthStore = create<HealthState>()(
  (set, get) => ({
    // Initial state
    userId: null,
    globalScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    dailyScore: 0,
    isLoading: false,
    
    // Actions
    setUserId: (userId: string) => {
      set({ userId })
      get().loadUserData()
    },
    
    loadUserData: async () => {
      const { userId } = get()
      if (!userId) return
      
      set({ isLoading: true })
      
      try {
        // Load user stats
        const response = await fetch(`/api/stats?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          set({
            globalScore: data.user.globalScore,
            currentStreak: data.user.currentStreak,
            longestStreak: data.user.longestStreak,
            dailyScore: data.todayScore,
          })
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        set({ isLoading: false })
      }
    },
    
    completeAction: async (actionId: string) => {
      const { userId } = get()
      if (!userId) return
      
      try {
        const response = await fetch('/api/actions/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, actionId, completed: true }),
        })
        
        if (response.ok) {
          // Reload user data to get updated scores
          await get().loadUserData()
        }
      } catch (error) {
        console.error('Error completing action:', error)
      }
    },
    
    // Computed values
    getCurrentCatStage: () => {
      const { globalScore } = get()
      return catStages.reduce((current, stage) => 
        globalScore >= stage.minScore ? stage : current
      )
    },
    
    getProgressToNext: () => {
      const { globalScore } = get()
      const currentStage = get().getCurrentCatStage()
      const nextStage = catStages.find(stage => stage.level > currentStage.level)
      
      if (!nextStage) return 100
      
      const progress = ((globalScore - currentStage.minScore) / (nextStage.minScore - currentStage.minScore)) * 100
      return Math.min(100, Math.max(0, progress))
    },
  })
)
