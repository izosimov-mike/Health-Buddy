import { pgTable, unique, text, integer, timestamp, serial, foreignKey, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	farcasterFid: text("farcaster_fid"),
	name: text().notNull(),
	globalScore: integer("global_score").default(0),
	currentStreak: integer("current_streak").default(0),
	longestStreak: integer("longest_streak").default(0),
	level: integer().default(1),
	lastCheckinDate: text("last_checkin_date"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	pfpUrl: text("pfp_url"),
}, (table) => [
	unique("users_farcaster_fid_unique").on(table.farcasterFid),
]);

export const levels = pgTable("levels", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	minPoints: integer("min_points").notNull(),
	maxPoints: integer("max_points"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const categories = pgTable("categories", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	icon: text().notNull(),
	color: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const actions = pgTable("actions", {
	id: text().primaryKey().notNull(),
	categoryId: text("category_id"),
	name: text().notNull(),
	description: text().notNull(),
	points: integer().default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "actions_category_id_categories_id_fk"
		}),
]);

export const dailyProgress = pgTable("daily_progress", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id"),
	date: text().notNull(),
	totalScore: integer("total_score").default(0),
	completedActions: integer("completed_actions").default(0),
	checkedIn: boolean("checked_in").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "daily_progress_user_id_users_id_fk"
		}),
]);

export const actionCompletions = pgTable("action_completions", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id"),
	actionId: text("action_id"),
	date: text().notNull(),
	completed: boolean().default(true),
	completedAt: timestamp("completed_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "action_completions_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.actionId],
			foreignColumns: [actions.id],
			name: "action_completions_action_id_actions_id_fk"
		}),
]);
