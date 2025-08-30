// Script to initialize database on Vercel
const { execSync } = require('child_process');

console.log('🚀 Initializing database on Vercel...');

try {
  // Run migrations
  console.log('📦 Running database migrations...');
  execSync('npm run db:migrate', { stdio: 'inherit' });
  
  // Run seeding
  console.log('🌱 Seeding database...');
  execSync('npm run db:seed', { stdio: 'inherit' });
  
  console.log('✅ Database initialization completed successfully!');
} catch (error) {
  console.error('❌ Database initialization failed:', error.message);
  process.exit(1);
}