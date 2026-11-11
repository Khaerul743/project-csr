CREATE TABLE `admin_audit_logs` (
	`id` varchar(36) PRIMARY KEY,
	`admin_id` varchar(36) NOT NULL,
	`action` varchar(100) NOT NULL,
	`target_type` enum('COMPANY','PARTNER','USER','OPPORTUNITY','PROGRAM','SYSTEM') NOT NULL,
	`target_id` varchar(36) NOT NULL,
	`target_label` varchar(255),
	`previous_value` text,
	`new_value` text,
	`reason` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_audit_logs_admin_id_users_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('SUPER_ADMIN','CSR_ADMIN','MANAGEMENT','PARTNER_ADMIN','STAGING') DEFAULT 'STAGING' NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `is_verified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `verified_at` timestamp;--> statement-breakpoint
ALTER TABLE `companies` ADD `verified_by` varchar(36);--> statement-breakpoint
ALTER TABLE `companies` ADD `verification_notes` text;--> statement-breakpoint
ALTER TABLE `partners` ADD `is_verified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `partners` ADD `verified_at` timestamp;--> statement-breakpoint
ALTER TABLE `partners` ADD `verified_by` varchar(36);--> statement-breakpoint
ALTER TABLE `partners` ADD `verification_notes` text;