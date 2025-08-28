"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

// Cat evolution stages
export const catStages = [
  { id: 1, name: "Kitten", minScore: 0, maxScore: 19, level: "Beginner", emoji: "🐱" },
  { id: 2, name: "Playful Cat", minScore: 20, maxScore: 49, level: "Apprentice", emoji: "😸" },
  { id: 3, name: "Explorer Cat", minScore: 50, maxScore: 99, level: "Explorer", emoji: "🐈" },
  { id: 4, name: "Strong Cat", minScore: 100, maxScore: 199, level: "Achiever", emoji: "💪🐱" },
  { id: 5, name: "Champion Cat", minScore: 200, maxScore: 399, level: "Champion", emoji: "🏆🐱" },
  { id: 6, name: "Wise Cat", minScore: 400, maxScore: 699, level: "Master", emoji: "🧙‍♂️🐱" },
  { id: 7, name: "Mystic Cat", minScore: 700, maxScore: 999, level: "Legend", emoji: "✨🐱" },
  { id: 8, name: "Celestial Cat", minScore: 1000, maxScore: Number.POSITIVE_INFINITY, level: "Mythic", emoji: "🌟🐱" },
]

interface HealthState {
  // User data
  globalScore: number
  currentStreak: number
  longestStreak: number
  lastCheckIn: string | null

  // Daily data
  dailyScore: number
  completedActions: Set<string>

  // Actions
  updateGlobalScore: (score: number) => void
  updateStreak: (current: number, longest: number) => void
  setLastCheckIn: (date: string) => void
  updateDailyScore: (score: number) => void
  addCompletedAction: (actionId: string) => void
  resetDailyData: () => void

  // Computed values
  getCurrentCat: () => (typeof catStages)[0]
  getProgressToNextLevel: () => number
  getTodayScore: () => number
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      // Initial state
      globalScore: 127,
      currentStreak: 6,
      longestStreak: 12,
      lastCheckIn: null,
      dailyScore: 0,
      completedActions: new Set(),

      // Actions
      updateGlobalScore: (score) => set({ globalScore: score }),

      updateStreak: (current, longest) =>
        set({
          currentStreak: current,
          longestStreak: longest,
        }),

      setLastCheckIn: (date) => set({ lastCheckIn: date }),

      updateDailyScore: (score) => {
        set({ dailyScore: score })
        // Also update global score
        const state = get()
        set({ globalScore: state.globalScore - state.dailyScore + score })
      },

      addCompletedAction: (actionId) => {
        const state = get()
        const newCompletedActions = new Set(state.completedActions)
        newCompletedActions.add(actionId)
        const newDailyScore = state.dailyScore + 1

        set({
          completedActions: newCompletedActions,
          dailyScore: newDailyScore,
          globalScore: state.globalScore + 1,
        })
      },

      resetDailyData: () =>
        set({
          dailyScore: 0,
          completedActions: new Set(),
        }),

      // Computed values
      getCurrentCat: () => {
        const { globalScore } = get()
        return catStages.find((stage) => globalScore >= stage.minScore && globalScore <= stage.maxScore) || catStages[0]
      },

      getProgressToNextLevel: () => {
        const { globalScore } = get()
        const currentCat = get().getCurrentCat()
        const nextStage = catStages.find((stage) => stage.minScore > globalScore)

        if (!nextStage) return 100 // Max level reached

        const progress = ((globalScore - currentCat.minScore) / (nextStage.minScore - currentCat.minScore)) * 100
        return Math.min(progress, 100)
      },

      getTodayScore: () => {
        const today = new Date().toISOString().split("T")[0]
        const savedScore = localStorage.getItem(`daily-score-${today}`)
        return savedScore ? Number.parseInt(savedScore) : 0
      },
    }),
    {
      name: "health-buddy-storage",
      partialize: (state) => ({
        globalScore: state.globalScore,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastCheckIn: state.lastCheckIn,
      }),
    },
  ),
)
