import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// PostgreSQL database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/health_buddy';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

export { db };

export * from './schema';