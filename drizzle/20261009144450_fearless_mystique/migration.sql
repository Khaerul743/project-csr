CREATE TABLE `companies` (
	`id` varchar(36) PRIMARY KEY,
	`name` varchar(150) NOT NULL,
	`description` text,
	`email` varchar(255),
	`phone` varchar(30),
	`address` text,
	`city` varchar(100),
	`province` varchar(100),
	`website` varchar(255),
	`logo_url` text,
	`status` enum('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` varchar(36) PRIMARY KEY,
	`name` varchar(150) NOT NULL,
	`description` text,
	`email` varchar(255),
	`phone` varchar(30),
	`address` text,
	`city` varchar(100),
	`province` varchar(100),
	`website` varchar(255),
	`logo_url` text,
	`status` enum('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) PRIMARY KEY,
	`company_id` varchar(36),
	`partner_id` varchar(36),
	`name` varchar(150) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` enum('CSR_ADMIN','MANAGEMENT','PARTNER_ADMIN','PARTNER_STAFF','STAGING') NOT NULL DEFAULT 'STAGING',
	`status` enum('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_unique` UNIQUE INDEX(`email`),
	CONSTRAINT `chk_user_company_or_partner` CHECK((`users`.`company_id` IS NULL OR `users`.`partner_id` IS NULL))
);
--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_company_id_companies_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_partner_id_partners_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`);