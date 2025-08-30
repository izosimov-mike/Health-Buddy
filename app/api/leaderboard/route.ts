import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { desc } from 'drizzle-orm';
import { getUserLevel } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    // Get all users ordered by global score
    const leaderboardData = await db.select({
      id: users.id,
      name: users.name,
      globalScore: users.globalScore,
      currentStreak: users.currentStreak,
      level: users.level,
    })
    .from(users)
    .orderBy(desc(users.globalScore))
    .limit(10);

    // Add rank and avatar to each user
    const leaderboard = leaderboardData.map((user: typeof leaderboardData[0], index: number) => {
      const userLevel = getUserLevel(user.globalScore);
      return {
        ...user,
        rank: index + 1,
        avatar: getAvatarForUser(user.name),
        level: userLevel.id,
        levelName: userLevel.name,
      };
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getAvatarForUser(name: string): string {
  const avatars = ['😸', '🐈', '🐱', '😺', '😻', '😽', '🙀', '😿', '😾'];
  const index = name.length % avatars.length;
  return avatars[index];
}