CREATE TABLE `program_stages` (
	`id` varchar(36) PRIMARY KEY,
	`program_id` varchar(36) NOT NULL,
	`order_index` int NOT NULL DEFAULT 1,
	`title` varchar(255) NOT NULL,
	`description` text,
	`target_timeline` varchar(100),
	`expected_evidence` text,
	`suggested_kpi` varchar(255),
	`status` enum('PENDING','IN_PROGRESS','COMPLETED') NOT NULL DEFAULT 'PENDING',
	`source` enum('AI_GENERATED','MANUAL') NOT NULL DEFAULT 'AI_GENERATED',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `program_activities` (
	`id` varchar(36) PRIMARY KEY,
	`program_id` varchar(36) NOT NULL,
	`stage_id` varchar(36),
	`submitted_by` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`activity_date` timestamp NOT NULL,
	`location` varchar(255),
	`beneficiaries_reached` varchar(100),
	`funds_spent` decimal(15,2) DEFAULT (0),
	`media_urls` text,
	`document_url` varchar(500),
	`status` enum('SUBMITTED','VERIFIED','REVISION_REQUESTED') NOT NULL DEFAULT 'SUBMITTED',
	`company_feedback` text,
	`verified_by` varchar(36),
	`verified_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `collaboration_messages` (
	`id` varchar(36) PRIMARY KEY,
	`collaboration_id` varchar(36) NOT NULL,
	`sender_id` varchar(36) NOT NULL,
	`content` text NOT NULL,
	`attachment_url` varchar(500),
	`attachment_name` varchar(255),
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now())
);
--> statement-breakpoint
CREATE TABLE `program_reviews` (
	`id` varchar(36) PRIMARY KEY,
	`program_id` varchar(36) NOT NULL,
	`reviewer_name` varchar(100) NOT NULL,
	`reviewer_role` varchar(100) NOT NULL,
	`reviewer_city` varchar(100),
	`rating` int NOT NULL,
	`comment` text NOT NULL,
	`photo_url` varchar(500),
	`ip_address` varchar(100),
	`user_agent` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `program_disbursements` (
	`id` varchar(36) PRIMARY KEY,
	`program_id` varchar(36) NOT NULL,
	`tranche_number` int NOT NULL DEFAULT 1,
	`tranche_name` varchar(255) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`disbursed_date` timestamp NOT NULL DEFAULT (now()),
	`transfer_proof_url` text,
	`bank_name` varchar(100),
	`bank_account_number` varchar(100),
	`bank_account_holder` varchar(150),
	`notes` text,
	`status` enum('PENDING','CONFIRMED','REJECTED') NOT NULL DEFAULT 'PENDING',
	`confirmed_at` timestamp,
	`confirmed_by` varchar(36),
	`confirmed_notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `program_expenses` (
	`id` varchar(36) PRIMARY KEY,
	`program_id` varchar(36) NOT NULL,
	`disbursement_id` varchar(36),
	`category` enum('BAHAN_DAN_MATERIAL','LOGISTIK_DAN_TRANSPORTASI','HONOR_DAN_FASILITATOR','SEWA_ALAT_DAN_TEMPAT','KONSUMSI_KEGIATAN','DOKUMENTASI_DAN_PUBLIKASI','OPERASIONAL_LAINNYA') NOT NULL DEFAULT 'OPERASIONAL_LAINNYA',
	`title` varchar(255) NOT NULL,
	`description` text,
	`amount` decimal(15,2) NOT NULL,
	`expense_date` timestamp NOT NULL DEFAULT (now()),
	`receipt_url` text NOT NULL,
	`verification_status` enum('PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'PENDING',
	`verified_by` varchar(36),
	`verified_at` timestamp,
	`verification_notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE `proposals` MODIFY COLUMN `status` enum('SUBMITTED','UNDER_REVIEW','REVISION_REQUESTED','ACCEPTED','REJECTED','WITHDRAWN') DEFAULT 'SUBMITTED' NOT NULL;--> statement-breakpoint
ALTER TABLE `companies` ADD `tagline` varchar(255);--> statement-breakpoint
ALTER TABLE `companies` ADD `csr_vision` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `industry` varchar(100);--> statement-breakpoint
ALTER TABLE `companies` ADD `company_size` varchar(50);--> statement-breakpoint
ALTER TABLE `companies` ADD `founded_year` int;--> statement-breakpoint
ALTER TABLE `companies` ADD `cover_url` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `nib_number` varchar(50);--> statement-breakpoint
ALTER TABLE `companies` ADD `npwp_number` varchar(50);--> statement-breakpoint
ALTER TABLE `companies` ADD `sustainability_report_url` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `instagram_url` varchar(255);--> statement-breakpoint
ALTER TABLE `companies` ADD `linkedin_url` varchar(255);--> statement-breakpoint
ALTER TABLE `companies` ADD `csr_leaders` text;--> statement-breakpoint
ALTER TABLE `partners` ADD `tagline` varchar(255);--> statement-breakpoint
ALTER TABLE `partners` ADD `cover_url` text;--> statement-breakpoint
ALTER TABLE `partners` ADD `organization_type` varchar(100);--> statement-breakpoint
ALTER TABLE `partners` ADD `founded_year` int;--> statement-breakpoint
ALTER TABLE `partners` ADD `legal_number` varchar(150);--> statement-breakpoint
ALTER TABLE `partners` ADD `npwp_number` varchar(100);--> statement-breakpoint
ALTER TABLE `partners` ADD `instagram_url` varchar(255);--> statement-breakpoint
ALTER TABLE `partners` ADD `linkedin_url` varchar(255);--> statement-breakpoint
ALTER TABLE `partners` ADD `youtube_url` varchar(255);--> statement-breakpoint
ALTER TABLE `partners` ADD `portfolio_doc_url` varchar(500);--> statement-breakpoint
ALTER TABLE `partners` ADD `past_activities` text;--> statement-breakpoint
ALTER TABLE `partners` ADD `team_members` text;--> statement-breakpoint
ALTER TABLE `proposals` ADD `ai_score` int;--> statement-breakpoint
ALTER TABLE `proposals` ADD `ai_screening_result` text;--> statement-breakpoint
ALTER TABLE `proposals` ADD `ai_screened_at` timestamp;--> statement-breakpoint
ALTER TABLE `program_stages` ADD CONSTRAINT `program_stages_program_id_programs_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `program_activities` ADD CONSTRAINT `program_activities_program_id_programs_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `program_activities` ADD CONSTRAINT `program_activities_stage_id_program_stages_id_fkey` FOREIGN KEY (`stage_id`) REFERENCES `program_stages`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `program_activities` ADD CONSTRAINT `program_activities_submitted_by_users_id_fkey` FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`);--> statement-breakpoint
ALTER TABLE `program_activities` ADD CONSTRAINT `program_activities_verified_by_users_id_fkey` FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`);--> statement-breakpoint
ALTER TABLE `collaboration_messages` ADD CONSTRAINT `collaboration_messages_collaboration_id_collaborations_id_fkey` FOREIGN KEY (`collaboration_id`) REFERENCES `collaborations`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `collaboration_messages` ADD CONSTRAINT `collaboration_messages_sender_id_users_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`);--> statement-breakpoint
ALTER TABLE `program_reviews` ADD CONSTRAINT `program_reviews_program_id_programs_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `program_disbursements` ADD CONSTRAINT `program_disbursements_program_id_programs_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `program_disbursements` ADD CONSTRAINT `program_disbursements_confirmed_by_users_id_fkey` FOREIGN KEY (`confirmed_by`) REFERENCES `users`(`id`);--> statement-breakpoint
ALTER TABLE `program_expenses` ADD CONSTRAINT `program_expenses_program_id_programs_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `program_expenses` ADD CONSTRAINT `program_expenses_disbursement_id_program_disbursements_id_fkey` FOREIGN KEY (`disbursement_id`) REFERENCES `program_disbursements`(`id`) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `program_expenses` ADD CONSTRAINT `program_expenses_verified_by_users_id_fkey` FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`);