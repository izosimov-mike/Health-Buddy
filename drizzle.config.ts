import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: './health_buddy.db',
  },
});