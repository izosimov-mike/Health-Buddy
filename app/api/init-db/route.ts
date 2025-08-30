import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET() {
  try {
    console.log('🚀 Initializing database...');
    
    // Run migrations
    console.log('📦 Running database migrations...');
    execSync('npm run db:migrate', { stdio: 'inherit' });
    
    // Run seeding
    console.log('🌱 Seeding database...');
    execSync('npm run db:seed', { stdio: 'inherit' });
    
    console.log('✅ Database initialization completed successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully!' 
    });
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}