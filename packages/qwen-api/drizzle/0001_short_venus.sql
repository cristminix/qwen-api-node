CREATE TABLE `usages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider` text NOT NULL,
	`model` text NOT NULL,
	`date` text NOT NULL,
	`connections` integer NOT NULL,
	`tokens` integer NOT NULL,
	`updated_at` integer DEFAULT '"2025-09-11T04:03:33.667Z"' NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_uploaded_files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`file_path` text NOT NULL,
	`file_url` text NOT NULL,
	`file_id` text NOT NULL,
	`crc` text NOT NULL,
	`created_at` integer DEFAULT '"2025-09-11T04:03:33.666Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-09-11T04:03:33.666Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_uploaded_files`("id", "file_path", "file_url", "file_id", "crc", "created_at", "updated_at") SELECT "id", "file_path", "file_url", "file_id", "crc", "created_at", "updated_at" FROM `uploaded_files`;--> statement-breakpoint
DROP TABLE `uploaded_files`;--> statement-breakpoint
ALTER TABLE `__new_uploaded_files` RENAME TO `uploaded_files`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `uploaded_files_file_path_unique` ON `uploaded_files` (`file_path`);