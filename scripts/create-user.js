const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { users } = require('../lib/db/schema');

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function createUser() {
  try {
    const userData = {
      id: 'farcaster-358574',
      name: 'User 358574',
      fid: 358574,
      farcasterFid: '358574',
      farcasterUsername: 'user358574',
      farcasterDisplayName: 'User 358574',
      globalScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      level: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creating user with FID 358574...');
    const newUser = await db.insert(users).values(userData).returning();
    console.log('User created successfully:', newUser[0]);
    
    await client.end();
  } catch (error) {
    console.error('Error creating user:', error);
    await client.end();
    process.exit(1);
  }
}

createUser();