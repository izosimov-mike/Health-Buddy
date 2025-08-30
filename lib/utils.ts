import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Level system based on points
export function getUserLevel(points: number): { name: string; id: number; minPoints: number; maxPoints: number | null } {
  const levels = [
    { id: 1, name: "Beginner", minPoints: 0, maxPoints: 149 },
    { id: 2, name: "Apprentice", minPoints: 150, maxPoints: 299 },
    { id: 3, name: "Explorer", minPoints: 300, maxPoints: 449 },
    { id: 4, name: "Performer", minPoints: 450, maxPoints: 599 },
    { id: 5, name: "Champion", minPoints: 600, maxPoints: 749 },
    { id: 6, name: "Master", minPoints: 750, maxPoints: 899 },
    { id: 7, name: "Legend", minPoints: 900, maxPoints: 1049 },
    { id: 8, name: "Mythic", minPoints: 1050, maxPoints: null },
  ];

  for (let i = levels.length - 1; i >= 0; i--) {
    const level = levels[i];
    if (points >= level.minPoints) {
      return level;
    }
  }
  
  return levels[0]; // Default to Beginner
}

export function getProgressToNextLevel(points: number): { current: number; next: number | null; progress: number } {
  const currentLevel = getUserLevel(points);
  const nextLevel = currentLevel.maxPoints ? currentLevel.maxPoints + 1 : null;
  
  if (!nextLevel) {
    return { current: points, next: null, progress: 100 };
  }
  
  const progress = ((points - currentLevel.minPoints) / (currentLevel.maxPoints! - currentLevel.minPoints)) * 100;
  return { current: points, next: nextLevel, progress: Math.min(progress, 100) };
}

// Calculate streak bonus points
export function getStreakBonus(streak: number): number {
  if (streak >= 150) return 3;
  if (streak >= 30) return 2;
  if (streak >= 7) return 1;
  return 0;
}

// Calculate total daily points including streak bonus
export function calculateDailyPoints(basePoints: number, streak: number): number {
  const streakBonus = getStreakBonus(streak);
  return basePoints + streakBonus;
}
