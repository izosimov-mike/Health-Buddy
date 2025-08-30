import { NextRequest, NextResponse } from 'next/server';
import { db, actions, categories, actionCompletions } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');
  const userId = 'user-1'; // Fixed user for demo
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

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

    // Get completion status for the date
    const completions = await db.select()
      .from(actionCompletions)
      .where(and(
        eq(actionCompletions.userId, userId),
        eq(actionCompletions.date, date)
      ));

    const completionMap = new Map(completions.map((c: typeof actionCompletions.$inferSelect) => [c.actionId, c.completed]));
    
    return NextResponse.json(actionsData.map((action: typeof actionsData[0]) => ({
      ...action,
      completed: completionMap.get(action.id) || false
    })));
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}