import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function POST() {
  try {
    // First test database connection
    console.log('Testing database connection...');
    await db.execute(sql`SELECT 1`);
    console.log('Database connection successful');
    
    // Run seeding
    console.log('Starting database seeding...');
    await seedDatabase();
    console.log('Database seeding completed');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Allow GET for easy testing
export async function GET() {
  return POST();
}