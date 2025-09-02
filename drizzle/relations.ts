import { relations } from "drizzle-orm/relations";
import { categories, actions, users, dailyProgress, actionCompletions } from "./schema";

export const actionsRelations = relations(actions, ({one, many}) => ({
	category: one(categories, {
		fields: [actions.categoryId],
		references: [categories.id]
	}),
	actionCompletions: many(actionCompletions),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	actions: many(actions),
}));

export const dailyProgressRelations = relations(dailyProgress, ({one}) => ({
	user: one(users, {
		fields: [dailyProgress.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	dailyProgresses: many(dailyProgress),
	actionCompletions: many(actionCompletions),
}));

export const actionCompletionsRelations = relations(actionCompletions, ({one}) => ({
	user: one(users, {
		fields: [actionCompletions.userId],
		references: [users.id]
	}),
	action: one(actions, {
		fields: [actionCompletions.actionId],
		references: [actions.id]
	}),
}));