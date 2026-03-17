CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL,
	`hook` text NOT NULL,
	`problem` text NOT NULL,
	`hint1` text NOT NULL,
	`hint2` text NOT NULL,
	`hint3` text NOT NULL,
	`explanation` text NOT NULL,
	`going_deeper` text NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action
);
