const { execSync } = require('child_process');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const fs = require('fs');
const path = require('path');

async function initProductionDatabase() {
  try {
    console.log('🚀 Initializing production database...');
    
    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    console.log('📦 Connecting to database...');
    const sql = postgres(databaseUrl, { max: 1 });
    const db = drizzle(sql);
    
    // Run migrations
    console.log('🔄 Running database migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    
    // Run seeding
    console.log('🌱 Seeding database...');
    const seedPath = path.join(__dirname, '..', 'lib', 'db', 'seed.ts');
    if (fs.existsSync(seedPath)) {
      execSync('npx tsx lib/db/seed.ts', { stdio: 'inherit' });
    } else {
      console.log('⚠️ Seed file not found, skipping seeding');
    }
    
    await sql.end();
    console.log('✅ Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initProductionDatabase();