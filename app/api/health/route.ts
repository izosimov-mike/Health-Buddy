import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Test database connection
    const result = await db.execute(sql`SELECT 1 as test`);
    
    return NextResponse.json({ 
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      test_query: result
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}