import { pgTable, serial, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique(),
  globalScore: integer('global_score').default(0),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  level: integer('level').default(1),
  lastCheckinDate: text('last_checkin_date'),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

// Levels table
export const levels = pgTable('levels', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  minPoints: integer('min_points').notNull(),
  maxPoints: integer('max_points'),
  createdAt: timestamp('created_at'),
});

// Health categories table
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  createdAt: timestamp('created_at'),
});

// Health actions table
export const actions = pgTable('actions', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').references(() => categories.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
  points: integer('points').default(1),
  createdAt: timestamp('created_at'),
});

// User daily progress table
export const dailyProgress = pgTable('daily_progress', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  date: text('date').notNull(),
  totalScore: integer('total_score').default(0),
  completedActions: integer('completed_actions').default(0),
  checkedIn: boolean('checked_in').default(false),
  createdAt: timestamp('created_at'),
});

// User action completions table
export const actionCompletions = pgTable('action_completions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  actionId: text('action_id').references(() => actions.id),
  date: text('date').notNull(),
  completed: boolean('completed').default(true),
  completedAt: timestamp('completed_at'),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  dailyProgress: many(dailyProgress),
  actionCompletions: many(actionCompletions),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  actions: many(actions),
}));

export const actionsRelations = relations(actions, ({ one, many }) => ({
  category: one(categories, {
    fields: [actions.categoryId],
    references: [categories.id],
  }),
  completions: many(actionCompletions),
}));

export const dailyProgressRelations = relations(dailyProgress, ({ one }) => ({
  user: one(users, {
    fields: [dailyProgress.userId],
    references: [users.id],
  }),
}));

export const actionCompletionsRelations = relations(actionCompletions, ({ one }) => ({
  user: one(users, {
    fields: [actionCompletions.userId],
    references: [users.id],
  }),
  action: one(actions, {
    fields: [actionCompletions.actionId],
    references: [actions.id],
  }),
}));

export const levelsRelations = relations(levels, ({ many }) => ({
  users: many(users),
}));