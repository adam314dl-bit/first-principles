ALTER TABLE `topics` ADD `cosmos_x` real;--> statement-breakpoint
ALTER TABLE `topics` ADD `cosmos_y` real;--> statement-breakpoint
ALTER TABLE `topics` ADD `cosmos_radius` real DEFAULT 10;--> statement-breakpoint
ALTER TABLE `topics` ADD `domain` text DEFAULT 'core';--> statement-breakpoint
ALTER TABLE `topics` ADD `node_type` text DEFAULT 'star';