ALTER TABLE `programs` ADD `sentiment_analysis` text;--> statement-breakpoint
ALTER TABLE `programs` ADD `sentiment_analyzed_at` timestamp;--> statement-breakpoint
ALTER TABLE `program_reviews` ADD `sentiment` enum('POSITIVE','NEUTRAL','NEGATIVE');