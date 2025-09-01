import { NextRequest, NextResponse } from 'next/server';
import { db, users, dailyProgress } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { getStreakBonus } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { fid } = await request.json();
    
    if (!fid) {
      return NextResponse.json({ error: 'Farcaster ID is required' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Get user data by Farcaster ID
    const user = await db.select().from(users).where(eq(users.farcasterFid, fid));
    
    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userId = user[0].id;

    const userData = user[0];
    const lastCheckinDate = userData.lastCheckinDate;
    
    // Check if user already checked in today
    if (lastCheckinDate === today) {
      return NextResponse.json({ 
        error: 'Already checked in today',
        alreadyCheckedIn: true 
      }, { status: 400 });
    }

    // Calculate new streak
    let newCurrentStreak = 1;
    
    if (lastCheckinDate) {
      const lastDate = new Date(lastCheckinDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day - increment streak
        newCurrentStreak = (userData.currentStreak ?? 0) + 1;
      } else if (daysDiff > 1) {
        // Streak broken - reset to 1
        newCurrentStreak = 1;
      }
    }

    // Calculate streak bonus points using unified system
    const streakBonus = getStreakBonus(newCurrentStreak);

    const totalPoints = 1 + streakBonus; // 1 base point + streak bonus
    const newGlobalScore = (userData.globalScore ?? 0) + totalPoints;
    const newLongestStreak = Math.max(userData.longestStreak ?? 0, newCurrentStreak);

    // Update user data
    await db.update(users)
      .set({
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        globalScore: newGlobalScore,
        lastCheckinDate: today,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // Update or create daily progress entry
    const existingProgress = await db.select()
      .from(dailyProgress)
      .where(and(
        eq(dailyProgress.userId, userId),
        eq(dailyProgress.date, today)
      ));

    if (existingProgress.length > 0) {
      // Update existing entry
      const currentTotalScore = existingProgress[0].totalScore ?? 0;
      await db.update(dailyProgress)
        .set({
          checkedIn: true,
          totalScore: currentTotalScore + totalPoints
        })
        .where(and(
          eq(dailyProgress.userId, userId),
          eq(dailyProgress.date, today)
        ));
    } else {
      // Create new entry
      await db.insert(dailyProgress).values({
        userId,
        date: today,
        totalScore: totalPoints,
        completedActions: 0,
        checkedIn: true,
        createdAt: new Date()
      });
    }

    return NextResponse.json({
      success: true,
      pointsEarned: totalPoints,
      basePoints: 1,
      streakBonus,
      newCurrentStreak,
      newLongestStreak,
      newGlobalScore
    });

  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}