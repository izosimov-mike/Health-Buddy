import { NextRequest, NextResponse } from 'next/server';
import { db, users, dailyProgress, actionCompletions, actions, categories } from '@/lib/db';
import { eq, and, sql, desc } from 'drizzle-orm';
import { getUserLevel, getProgressToNextLevel, getStreakBonus } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');
  const username = searchParams.get('username');
  const displayName = searchParams.get('displayName');
  const pfpUrl = searchParams.get('pfpUrl');

  if (!fid) {
    return NextResponse.json({ error: 'Farcaster ID is required' }, { status: 400 });
  }

  try {
    // Get user basic stats by Farcaster ID
    const userData = await db.select().from(users).where(eq(users.farcasterFid, fid)).limit(1);
    if (userData.length === 0) {
      // Create new user if not exists with SDK data
      const newUser = await db.insert(users).values({
        id: `user_${fid}`,
        name: displayName || username || `User ${fid}`,
        pfpUrl: pfpUrl,
        farcasterFid: fid
      }).returning();
      
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
    
    const userId = userData[0].id;

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
    const currentStreak = userData[0].currentStreak ?? 0;
    const longestStreak = userData[0].longestStreak ?? 0;
    
    // Check if user has checked in today
    const checkedInToday = userData[0].lastCheckinDate === today;

    const globalScore = userData[0].globalScore ?? 0;
    const userLevel = getUserLevel(globalScore);
    const levelProgress = getProgressToNextLevel(globalScore);
    const streakBonus = getStreakBonus(currentStreak);

    // Create full week data with static day names (Mon-Sun)
    const staticDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const fullWeekData = [];
    
    // Get current week's Monday
    const currentDate = new Date();
    const currentDay = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Adjust for Sunday being 0
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + mondayOffset);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = weeklyProgress.find((d: typeof weeklyProgress[0]) => d.date === dateStr);
      fullWeekData.push({
        date: dateStr,
        day: staticDayNames[i],
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
      ...userData[0],
      // Farcaster profile data
      fid: userData[0].farcasterFid,
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

export async function POST(request: NextRequest) {
  let cleanedPfpUrl = null; // Declare at function scope
  
  try {
    const body = await request.json();
    const { fid, username, displayName, pfpUrl } = body;

    // Log incoming data for debugging
    console.log('POST /api/stats - Incoming data:', {
      fid,
      username,
      displayName,
      pfpUrl,
      pfpUrlType: typeof pfpUrl,
      pfpUrlValue: pfpUrl,
      pfpUrlLength: pfpUrl ? pfpUrl.length : 0,
      pfpUrlHasBackticks: pfpUrl ? pfpUrl.includes('`') : false,
      pfpUrlCleaned: pfpUrl ? pfpUrl.trim().replace(/[`'"]/g, '') : null
    });
    
    // Log database connection
    console.log('Database URL configured:', !!process.env.DATABASE_URL);

    if (!fid) {
      return NextResponse.json({ error: 'Farcaster ID is required' }, { status: 400 });
    }

    // Clean pfpUrl from any unwanted characters more thoroughly
    if (pfpUrl && typeof pfpUrl === 'string') {
      cleanedPfpUrl = pfpUrl
        .trim() // Remove leading/trailing spaces
        .replace(/[`'"\s]/g, '') // Remove backticks, quotes, and all spaces
        .replace(/^https?:\/\//, 'https://'); // Ensure proper protocol
      
      // Validate URL format
      if (!cleanedPfpUrl.startsWith('https://') || cleanedPfpUrl.length < 10) {
        cleanedPfpUrl = null;
      }
    }
    
    console.log('pfpUrl cleaning in API:', { 
      original: pfpUrl, 
      cleaned: cleanedPfpUrl,
      isValid: cleanedPfpUrl !== null
    });

    // Check if user exists
    const userData = await db.select().from(users).where(eq(users.farcasterFid, fid.toString())).limit(1);
    
    if (userData.length === 0) {
      // Create new user with SDK data
      const insertData = {
        id: `user_${fid}`,
        name: displayName || username || `User ${fid}`,
        farcasterFid: fid.toString(),
        pfpUrl: cleanedPfpUrl || null
      };
      
      console.log('Creating new user with data:', insertData);
      
      const newUser = await db.insert(users).values(insertData).returning();
      
      console.log('New user created in database:', newUser[0]);
      
      return NextResponse.json({ message: 'User created successfully', user: newUser[0] }, { status: 201 });
    } else {
      // Update existing user with fresh SDK data
      const updateData: any = {
        updatedAt: new Date().toISOString()
      };
      
      if (displayName || username) {
        updateData.name = displayName || username;
      }
      // Always update pfpUrl, even if it's null or undefined
      updateData.pfpUrl = cleanedPfpUrl || null;
      
      console.log('Updating existing user with data:', updateData);
      console.log('Current user data before update:', userData[0]);
      
      const updatedUser = await db.update(users)
        .set(updateData)
        .where(eq(users.farcasterFid, fid.toString()))
        .returning();
      
      console.log('User updated in database:', updatedUser[0]);
        
      return NextResponse.json({ message: 'User updated successfully', user: updatedUser[0] }, { status: 200 });
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      pfpUrl: pfpUrl,
      cleanedPfpUrl: cleanedPfpUrl
    });
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}