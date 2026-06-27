ALTER TABLE `stops` ADD `cost` decimal(10,2);--> statement-breakpoint
ALTER TABLE `stops` ADD `costCategory` enum('accommodation','transport','food','activities','shopping','other');--> statement-breakpoint
ALTER TABLE `stops` ADD `stopDate` varchar(10);