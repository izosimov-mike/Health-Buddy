CREATE TABLE `action_completions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`action_id` text,
	`date` text NOT NULL,
	`completed` integer DEFAULT true,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`action_id`) REFERENCES `actions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `actions` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`points` integer DEFAULT 1,
	`created_at` integer,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`color` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `daily_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`date` text NOT NULL,
	`total_score` integer DEFAULT 0,
	`completed_actions` integer DEFAULT 0,
	`checked_in` integer DEFAULT false,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `levels` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`min_points` integer NOT NULL,
	`max_points` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`global_score` integer DEFAULT 0,
	`current_streak` integer DEFAULT 0,
	`longest_streak` integer DEFAULT 0,
	`level` integer DEFAULT 1,
	`last_checkin_date` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);