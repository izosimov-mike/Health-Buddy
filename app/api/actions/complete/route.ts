import { NextRequest, NextResponse } from 'next/server';
import { db, actionCompletions, users, dailyProgress, actions } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actionId, completed = true, fid } = body;
    const date = new Date().toISOString().split('T')[0];

    if (!fid) {
      return NextResponse.json({ error: 'Farcaster ID is required' }, { status: 400 });
    }

    // Get user by FID
    const user = await db.select().from(users).where(eq(users.farcasterFid, fid)).limit(1);
    
    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userId = user[0].id;

    if (!actionId) {
      return NextResponse.json({ error: 'Action ID is required' }, { status: 400 });
    }

      // Get action details for points
      const action = await db.select().from(actions).where(eq(actions.id, actionId)).limit(1);
      if (action.length === 0) {
        return NextResponse.json({ error: 'Action not found' }, { status: 404 });
      }

      // Check if completion already exists
      const existingCompletion = await db.select()
        .from(actionCompletions)
        .where(and(
          eq(actionCompletions.userId, userId),
          eq(actionCompletions.actionId, actionId),
          eq(actionCompletions.date, date)
        ))
        .limit(1);

      let completion;
      if (existingCompletion.length > 0) {
        // Update existing completion
        completion = await db.update(actionCompletions)
          .set({ completed, completedAt: new Date() })
          .where(eq(actionCompletions.id, existingCompletion[0].id))
          .returning();
      } else {
        // Create new completion
        completion = await db.insert(actionCompletions)
          .values({
            userId,
            actionId,
            date,
            completed,
            completedAt: new Date(),
          })
          .returning();
      }

      // Update user's global score and daily progress
      if (!action || action.length === 0) {
        return NextResponse.json({ error: 'Action not found' }, { status: 404 });
      }
      const actionData = action[0];
      const pointsChange = completed ? actionData.points : -actionData.points;
      
      // Update user's global score
      const currentUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (currentUser.length > 0) {
        await db.update(users)
          .set({ 
            globalScore: currentUser[0].globalScore + pointsChange,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId));
      }

      // Update or create daily progress
      const existingDailyProgress = await db.select()
        .from(dailyProgress)
        .where(and(
          eq(dailyProgress.userId, userId),
          eq(dailyProgress.date, date)
        ))
        .limit(1);

      if (existingDailyProgress.length > 0) {
        await db.update(dailyProgress)
          .set({
            totalScore: existingDailyProgress[0].totalScore + pointsChange,
            completedActions: completed 
              ? existingDailyProgress[0].completedActions + 1
              : Math.max(0, existingDailyProgress[0].completedActions - 1)
          })
          .where(eq(dailyProgress.id, existingDailyProgress[0].id));
      } else {
        await db.insert(dailyProgress)
          .values({
            userId,
            date,
            totalScore: completed ? action[0].points : 0,
            completedActions: completed ? 1 : 0,
            checkedIn: false,
          });
      }

      return NextResponse.json(completion[0]);
  } catch (error) {
    console.error('Error completing action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}