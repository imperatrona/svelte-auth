CREATE TABLE `email_verification_code` (
	`id` integer PRIMARY KEY NOT NULL,
	`code` text,
	`user_id` text,
	`email` text,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `oauth_account` (
	`user_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`provider_user_id` text NOT NULL,
	`raw_user_data` text,
	PRIMARY KEY(`provider_id`, `provider_user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `password_reset_token` (
	`text` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`hashed_password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `emailVerificationCodeIdx` ON `email_verification_code` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `emailVerificationUserIdIdx` ON `email_verification_code` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `oauthUserIdIdx` ON `oauth_account` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `sessionUserIdIdx` ON `session` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `userIdIdx` ON `user` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `userEmailIdx` ON `user` (`email`);