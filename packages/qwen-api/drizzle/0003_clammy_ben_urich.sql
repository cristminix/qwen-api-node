PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_kimi_chat` (
	`chat_id` text PRIMARY KEY NOT NULL,
	`last_user_message_id` text,
	`last_assistant_message_id` text,
	`checksum` text,
	`session_id` text NOT NULL,
	`history` text,
	`created_at` integer DEFAULT '"2025-10-27T13:13:04.270Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-10-27T13:13:04.270Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_kimi_chat`("chat_id", "last_user_message_id", "last_assistant_message_id", "checksum", "session_id", "history", "created_at", "updated_at") SELECT "chat_id", "last_user_message_id", "last_assistant_message_id", "checksum", "session_id", "history", "created_at", "updated_at" FROM `kimi_chat`;--> statement-breakpoint
DROP TABLE `kimi_chat`;--> statement-breakpoint
ALTER TABLE `__new_kimi_chat` RENAME TO `kimi_chat`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_uploaded_files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`file_path` text NOT NULL,
	`file_url` text NOT NULL,
	`file_id` text NOT NULL,
	`crc` text NOT NULL,
	`created_at` integer DEFAULT '"2025-10-27T13:13:04.269Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-10-27T13:13:04.269Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_uploaded_files`("id", "file_path", "file_url", "file_id", "crc", "created_at", "updated_at") SELECT "id", "file_path", "file_url", "file_id", "crc", "created_at", "updated_at" FROM `uploaded_files`;--> statement-breakpoint
DROP TABLE `uploaded_files`;--> statement-breakpoint
ALTER TABLE `__new_uploaded_files` RENAME TO `uploaded_files`;--> statement-breakpoint
CREATE UNIQUE INDEX `uploaded_files_file_path_unique` ON `uploaded_files` (`file_path`);--> statement-breakpoint
CREATE TABLE `__new_usages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider` text NOT NULL,
	`model` text NOT NULL,
	`date` text NOT NULL,
	`connections` integer NOT NULL,
	`tokens` integer NOT NULL,
	`ipaddr` text,
	`updated_at` integer DEFAULT '"2025-10-27T13:13:04.269Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_usages`("id", "provider", "model", "date", "connections", "tokens", "ipaddr", "updated_at") SELECT "id", "provider", "model", "date", "connections", "tokens", "ipaddr", "updated_at" FROM `usages`;--> statement-breakpoint
DROP TABLE `usages`;--> statement-breakpoint
ALTER TABLE `__new_usages` RENAME TO `usages`;