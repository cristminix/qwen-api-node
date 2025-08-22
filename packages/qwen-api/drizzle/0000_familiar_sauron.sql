CREATE TABLE `uploaded_files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`file_path` text NOT NULL,
	`file_url` text NOT NULL,
	`file_id` text NOT NULL,
	`crc` text NOT NULL,
	`created_at` integer DEFAULT '"2025-08-22T00:50:08.203Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-08-22T00:50:08.203Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uploaded_files_file_path_unique` ON `uploaded_files` (`file_path`);