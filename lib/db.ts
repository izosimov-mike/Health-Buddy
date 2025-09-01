import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, text, integer, serial, boolean, timestamp } from 'drizzle-orm/pg-core';

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = postgres(connectionString);
export const db = drizzle(client);

// Schema definitions
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique(),
  farcasterFid: text('farcaster_fid').unique(),
  fid: integer('fid').unique(),
  farcasterUsername: text('farcaster_username'),
  farcasterDisplayName: text('farcaster_display_name'),
  farcasterPfpUrl: text('farcaster_pfp_url'),
  globalScore: integer('global_score').default(0),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  level: integer('level').default(1),
  lastCheckinDate: text('last_checkin_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const actions = pgTable('actions', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').references(() => categories.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
  points: integer('points').default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

export const actionCompletions = pgTable('action_completions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  actionId: text('action_id').references(() => actions.id),
  date: text('date').notNull(),
  completed: boolean('completed').default(true),
  completedAt: timestamp('completed_at'),
});

export const dailyProgress = pgTable('daily_progress', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  date: text('date').notNull(),
  totalScore: integer('total_score').default(0),
  completedActions: integer('completed_actions').default(0),
  checkedIn: boolean('checked_in').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const levels = pgTable('levels', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  minPoints: integer('min_points').notNull(),
  maxPoints: integer('max_points'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Export all tables for convenience
export { client };