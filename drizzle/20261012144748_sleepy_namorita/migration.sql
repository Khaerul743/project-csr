CREATE TABLE `opportunities` (
	`id` varchar(36) PRIMARY KEY,
	`company_id` varchar(36) NOT NULL,
	`created_by` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`focus_area` enum('LINGKUNGAN','PENDIDIKAN','KESEHATAN','PEMBERDAYAAN_EKONOMI','INFRASTRUKTUR_SOSIAL','TANGGAP_BENCANA','LAINNYA') NOT NULL,
	`target_city` varchar(100),
	`target_province` varchar(100),
	`estimated_budget` decimal(15,2),
	`start_date` timestamp,
	`end_date` timestamp,
	`deadline` timestamp,
	`banner_url` text,
	`status` enum('DRAFT','OPEN','IN_REVIEW','CLOSED') NOT NULL DEFAULT 'OPEN',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `opportunity_invitations` (
	`id` varchar(36) PRIMARY KEY,
	`opportunity_id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`partner_id` varchar(36) NOT NULL,
	`invited_by` varchar(36) NOT NULL,
	`message` text,
	`status` enum('INVITED','ACCEPTED','DECLINED') NOT NULL DEFAULT 'INVITED',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` varchar(36) PRIMARY KEY,
	`opportunity_id` varchar(36) NOT NULL,
	`partner_id` varchar(36) NOT NULL,
	`submitted_by` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`summary` text NOT NULL,
	`proposed_budget` decimal(15,2) NOT NULL,
	`duration_months` int,
	`target_beneficiaries` varchar(255),
	`document_url` text,
	`feedback` text,
	`status` enum('SUBMITTED','UNDER_REVIEW','ACCEPTED','REJECTED','WITHDRAWN') NOT NULL DEFAULT 'SUBMITTED',
	`reviewed_by` varchar(36),
	`reviewed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `collaborations` (
	`id` varchar(36) PRIMARY KEY,
	`opportunity_id` varchar(36) NOT NULL,
	`proposal_id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`partner_id` varchar(36) NOT NULL,
	`final_budget` decimal(15,2),
	`target_beneficiaries` varchar(255),
	`start_date` timestamp,
	`end_date` timestamp,
	`mou_document_url` text,
	`notes` text,
	`status` enum('NEGOTIATION','AGREED','CANCELLED') NOT NULL DEFAULT 'NEGOTIATION',
	`agreed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` varchar(36) PRIMARY KEY,
	`collaboration_id` varchar(36) NOT NULL,
	`opportunity_id` varchar(36) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`partner_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`focus_area` enum('LINGKUNGAN','PENDIDIKAN','KESEHATAN','PEMBERDAYAAN_EKONOMI','INFRASTRUKTUR_SOSIAL','TANGGAP_BENCANA','LAINNYA') NOT NULL,
	`budget` decimal(15,2) NOT NULL,
	`spent_budget` decimal(15,2) DEFAULT (0),
	`target_beneficiaries` varchar(255),
	`actual_beneficiaries` varchar(255),
	`target_city` varchar(100),
	`target_province` varchar(100),
	`start_date` timestamp,
	`end_date` timestamp,
	`status` enum('PLANNED','IN_PROGRESS','COMPLETED','ON_HOLD','CANCELLED') NOT NULL DEFAULT 'PLANNED',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE `partners` ADD `focus_area` enum('LINGKUNGAN','PENDIDIKAN','KESEHATAN','PEMBERDAYAAN_EKONOMI','INFRASTRUKTUR_SOSIAL','TANGGAP_BENCANA','LAINNYA') DEFAULT 'LAINNYA' NOT NULL;--> statement-breakpoint
ALTER TABLE `opportunities` ADD CONSTRAINT `opportunities_company_id_companies_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`);--> statement-breakpoint
ALTER TABLE `opportunities` ADD CONSTRAINT `opportunities_created_by_users_id_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`);--> statement-breakpoint
ALTER TABLE `opportunity_invitations` ADD CONSTRAINT `opportunity_invitations_opportunity_id_opportunities_id_fkey` FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`);--> statement-breakpoint
ALTER TABLE `opportunity_invitations` ADD CONSTRAINT `opportunity_invitations_company_id_companies_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`);--> statement-breakpoint
ALTER TABLE `opportunity_invitations` ADD CONSTRAINT `opportunity_invitations_partner_id_partners_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`);--> statement-breakpoint
ALTER TABLE `opportunity_invitations` ADD CONSTRAINT `opportunity_invitations_invited_by_users_id_fkey` FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`);--> statement-breakpoint
ALTER TABLE `proposals` ADD CONSTRAINT `proposals_opportunity_id_opportunities_id_fkey` FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`);--> statement-breakpoint
ALTER TABLE `proposals` ADD CONSTRAINT `proposals_partner_id_partners_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`);--> statement-breakpoint
ALTER TABLE `proposals` ADD CONSTRAINT `proposals_submitted_by_users_id_fkey` FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`);--> statement-breakpoint
ALTER TABLE `proposals` ADD CONSTRAINT `proposals_reviewed_by_users_id_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`);--> statement-breakpoint
ALTER TABLE `collaborations` ADD CONSTRAINT `collaborations_opportunity_id_opportunities_id_fkey` FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`);--> statement-breakpoint
ALTER TABLE `collaborations` ADD CONSTRAINT `collaborations_proposal_id_proposals_id_fkey` FOREIGN KEY (`proposal_id`) REFERENCES `proposals`(`id`);--> statement-breakpoint
ALTER TABLE `collaborations` ADD CONSTRAINT `collaborations_company_id_companies_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`);--> statement-breakpoint
ALTER TABLE `collaborations` ADD CONSTRAINT `collaborations_partner_id_partners_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`);--> statement-breakpoint
ALTER TABLE `programs` ADD CONSTRAINT `programs_collaboration_id_collaborations_id_fkey` FOREIGN KEY (`collaboration_id`) REFERENCES `collaborations`(`id`);--> statement-breakpoint
ALTER TABLE `programs` ADD CONSTRAINT `programs_opportunity_id_opportunities_id_fkey` FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`);--> statement-breakpoint
ALTER TABLE `programs` ADD CONSTRAINT `programs_company_id_companies_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`);--> statement-breakpoint
ALTER TABLE `programs` ADD CONSTRAINT `programs_partner_id_partners_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`);