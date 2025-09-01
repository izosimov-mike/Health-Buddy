import { NextRequest, NextResponse } from 'next/server';
import { db, actions, categories, actionCompletions, users } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');
  const fid = searchParams.get('fid');
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  let userId = null;
  
  // Get user by FID if provided
  if (fid) {
    const user = await db.select().from(users).where(eq(users.farcasterFid, fid)).limit(1);
    
    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    userId = user[0].id;
  }

  try {

    const baseQuery = db.select({
      id: actions.id,
      name: actions.name,
      description: actions.description,
      points: actions.points,
      categoryId: actions.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
    }).from(actions)
    .leftJoin(categories, eq(actions.categoryId, categories.id));

    const actionsData = categoryId 
      ? await baseQuery.where(eq(actions.categoryId, categoryId))
      : await baseQuery;

    // Get completion status for the date (only if user is authenticated)
    let completionMap = new Map();
    
    if (userId) {
      const completions = await db.select()
        .from(actionCompletions)
        .where(and(
          eq(actionCompletions.userId, userId),
          eq(actionCompletions.date, date)
        ));
      completionMap = new Map(completions.map((c: typeof actionCompletions.$inferSelect) => [c.actionId, c.completed]));
    }
    
    return NextResponse.json(actionsData.map((action: typeof actionsData[0]) => ({
      ...action,
      completed: completionMap.get(action.id) || false
    })));
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}