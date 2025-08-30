import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import postgres from 'postgres';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Use SQLite for local development, PostgreSQL for production
let db: any;

if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.startsWith('postgres')) {
  // PostgreSQL for production
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString);
  db = drizzle(client, { schema });
} else {
  // SQLite for local development
  const sqlite = new Database('health_buddy.db');
  db = drizzleSqlite(sqlite, { schema });
}

export { db };

export * from './schema';