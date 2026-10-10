CREATE TABLE `invitations` (
	`id` varchar(36) PRIMARY KEY,
	`company_id` varchar(36),
	`partner_id` varchar(36),
	`email` varchar(255) NOT NULL,
	`role` enum('CSR_ADMIN','MANAGEMENT','PARTNER_ADMIN') NOT NULL,
	`invited_by` varchar(36) NOT NULL,
	`status` enum('PENDING','ACCEPTED','REJECTED','EXPIRED','CANCELLED') NOT NULL DEFAULT 'PENDING',
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `token_unique` UNIQUE INDEX(`token`),
	CONSTRAINT `invitations_company_id_companies_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`),
	CONSTRAINT `invitations_partner_id_partners_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`),
	CONSTRAINT `invitations_invited_by_users_id_fkey` FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`),
	CONSTRAINT `chk_invitation_company_or_partner` CHECK((`invitations`.`company_id` IS NULL OR `invitations`.`partner_id` IS NULL))
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('CSR_ADMIN','MANAGEMENT','PARTNER_ADMIN','STAGING') DEFAULT 'STAGING' NOT NULL;