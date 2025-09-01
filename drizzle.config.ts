import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});