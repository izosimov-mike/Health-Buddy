import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

// Mock data for local development when DATABASE_URL is not set
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    globalScore: 100,
    currentStreak: 5,
    longestStreak: 10,
    level: 2,
    farcasterFid: '12345',
    fid: 12345,
    farcasterUsername: 'johndoe',
    farcasterDisplayName: 'John Doe',
    farcasterPfpUrl: 'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/12345/original',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let useMockData = false;

// Check if database is available
try {
  if (!process.env.DATABASE_URL) {
    useMockData = true;
    console.log('Using mock data for local development');
  }
} catch (error) {
  useMockData = true;
  console.log('Database not available, using mock data');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (userId) {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json(user[0]);
    }

    const allUsers = await db.select().from(users);
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, fid, farcasterUsername, farcasterDisplayName, farcasterPfpUrl } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Проверяем существует ли пользователь с таким FID
    if (fid) {
      const existingUser = await db.select().from(users).where(eq(users.fid, fid)).limit(1);
      if (existingUser.length > 0) {
        // Обновляем существующего пользователя с новыми данными Farcaster
        const updateData: any = {
          name,
          updatedAt: new Date()
        };
        
        if (email) updateData.email = email;
        if (farcasterUsername) updateData.farcasterUsername = farcasterUsername;
        if (farcasterDisplayName) updateData.farcasterDisplayName = farcasterDisplayName;
        if (farcasterPfpUrl) updateData.farcasterPfpUrl = farcasterPfpUrl;
        
        const updatedUser = await db.update(users)
          .set(updateData)
          .where(eq(users.fid, fid))
          .returning();
          
        return NextResponse.json(updatedUser[0], { status: 200 });
      }
    }

    const userData: any = {
      id: fid ? `farcaster-${fid}` : undefined,
      name,
      email,
      globalScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      level: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add Farcaster data if provided
    if (fid) {
      userData.fid = fid;
      userData.farcasterFid = fid.toString();
    }
    if (farcasterUsername) userData.farcasterUsername = farcasterUsername;
    if (farcasterDisplayName) userData.farcasterDisplayName = farcasterDisplayName;
    if (farcasterPfpUrl) userData.farcasterPfpUrl = farcasterPfpUrl;

    const newUser = await db.insert(users).values(userData).returning();

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updatedUser = await db.update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}