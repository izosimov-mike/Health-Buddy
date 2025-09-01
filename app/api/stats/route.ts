import { NextRequest, NextResponse } from 'next/server';
import { db, users, dailyProgress, actionCompletions, actions, categories } from '@/lib/db';
import { eq, and, sql, desc } from 'drizzle-orm';
import { getUserLevel, getProgressToNextLevel, getStreakBonus } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');

  if (!fid) {
    return NextResponse.json({ error: 'Farcaster ID is required' }, { status: 400 });
  }

  try {
    // Get user basic stats by Farcaster ID
    const user = await db.select().from(users).where(eq(users.farcasterFid, fid)).limit(1);
    if (user.length === 0) {
      // Create new user if not exists
      const newUserId = `farcaster-${fid}`;
      await db.insert(users).values({
        id: newUserId,
        farcasterFid: fid,
        name: `User ${fid}`,
        globalScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      // Return default stats for new user
      return NextResponse.json({
        globalScore: 0,
        dailyScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 1,
        levelName: 'Beginner',
        levelProgress: {
          current: 0,
          next: 100,
          progress: 0
        },
        streakBonus: 0,
        checkedInToday: false
      });
    }
    
    const userId = user[0].id;

    const today = new Date().toISOString().split('T')[0];
    
    // Get today's progress
    const todayProgress = await db.select()
      .from(dailyProgress)
      .where(and(
        eq(dailyProgress.userId, userId),
        eq(dailyProgress.date, today)
      ))
      .limit(1);

    // Get weekly progress (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const weeklyProgress = await db.select({
      date: dailyProgress.date,
      totalScore: dailyProgress.totalScore,
      completedActions: dailyProgress.completedActions,
    })
    .from(dailyProgress)
    .where(and(
      eq(dailyProgress.userId, userId),
      sql`${dailyProgress.date} >= ${weekAgoStr}`
    ))
    .orderBy(dailyProgress.date);

    // Get category statistics
    const categoryStats = await db.select({
      categoryId: categories.id,
      categoryName: categories.name,
      categoryColor: categories.color,
      totalActions: sql<number>`count(${actions.id})`,
      completedActions: sql<number>`count(case when ${actionCompletions.completed} = true and ${actionCompletions.date} = ${today} then 1 end)`,
    })
    .from(categories)
    .leftJoin(actions, eq(actions.categoryId, categories.id))
    .leftJoin(actionCompletions, and(
      eq(actionCompletions.actionId, actions.id),
      eq(actionCompletions.userId, userId)
    ))
    .groupBy(categories.id, categories.name, categories.color);

    // Get streak values from user data (managed by daily check-in)
    const currentStreak = user[0].currentStreak ?? 0;
    const longestStreak = user[0].longestStreak ?? 0;
    
    // Check if user has checked in today
    const checkedInToday = user[0].lastCheckinDate === today;

    const globalScore = user[0].globalScore ?? 0;
    const userLevel = getUserLevel(globalScore);
    const levelProgress = getProgressToNextLevel(globalScore);
    const streakBonus = getStreakBonus(currentStreak);

    // Create full week data (7 days) with proper day names
    const fullWeekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en', { weekday: 'short' });
      
      const dayData = weeklyProgress.find((d: typeof weeklyProgress[0]) => d.date === dateStr);
      fullWeekData.push({
        date: dateStr,
        day: dayName,
        points: dayData?.totalScore || 0,
        actions: dayData?.completedActions || 0,
      });
    }

    // Calculate daily average
    const totalWeekPoints = fullWeekData.reduce((sum, day) => sum + day.points, 0);
    const dailyAverage = Math.round((totalWeekPoints / 7) * 10) / 10;

    // Get category completion rates for the week
    const categoryWeekStats = await db.select({
      categoryId: categories.id,
      categoryName: categories.name,
      categoryColor: categories.color,
      totalActions: sql<number>`count(distinct ${actions.id})`,
      completedActions: sql<number>`count(distinct case when ${actionCompletions.completed} = true and ${actionCompletions.date} >= ${weekAgoStr} then ${actions.id} end)`,
    })
    .from(categories)
    .leftJoin(actions, eq(actions.categoryId, categories.id))
    .leftJoin(actionCompletions, and(
      eq(actionCompletions.actionId, actions.id),
      eq(actionCompletions.userId, userId)
    ))
    .groupBy(categories.id, categories.name, categories.color);

    return NextResponse.json({
      ...user[0],
      // Farcaster profile data
      fid: user[0].farcasterFid,
      // Level and progress data
      level: userLevel.id,
      levelName: userLevel.name,
      levelProgress: {
        current: levelProgress.current,
        next: levelProgress.next,
        progress: levelProgress.progress
      },
      currentStreak,
      longestStreak,
      streakBonus,
      checkedInToday,
      globalScore: globalScore,
      dailyScore: todayProgress[0]?.totalScore || 0,
      todayScore: todayProgress[0]?.totalScore || 0,
      todayActions: todayProgress[0]?.completedActions || 0,
      weeklyProgress: fullWeekData,
      dailyAverage,
      totalWeekPoints,
      categoryStats: categoryWeekStats.map((cat: typeof categoryWeekStats[0]) => {
        const dailyActions = Number(cat.totalActions);
        const weeklyGoal = dailyActions * 7;
        const completedWeekly = Number(cat.completedActions);
        return {
          categoryId: cat.categoryId,
          categoryName: cat.categoryName,
          totalPoints: 0, // Will be calculated from actions
          completedActions: completedWeekly,
          totalActions: weeklyGoal,
          weeklyCompletionRate: weeklyGoal > 0 ? Math.round((completedWeekly / weeklyGoal) * 100) : 0
        };
      }),
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}