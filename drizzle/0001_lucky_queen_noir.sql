CREATE TABLE `budgetItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itineraryId` int NOT NULL,
	`category` enum('accommodation','transport','food','activities','shopping','other') NOT NULL,
	`title` varchar(255) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) DEFAULT 'USD',
	`dayNumber` int,
	`notes` text,
	`bookingUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `budgetItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communityTips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stopId` int,
	`itineraryId` int,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`tipType` enum('tip','warning','recommendation','hidden-gem') NOT NULL DEFAULT 'tip',
	`upvotes` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `communityTips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `itineraries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`destination` varchar(255) NOT NULL,
	`country` varchar(100),
	`coverImageUrl` text,
	`description` text,
	`startDate` timestamp,
	`endDate` timestamp,
	`duration` int,
	`travelStyle` varchar(50),
	`isPublic` boolean NOT NULL DEFAULT false,
	`shareToken` varchar(64),
	`totalBudget` decimal(10,2),
	`currency` varchar(10) DEFAULT 'USD',
	`status` enum('draft','planning','active','completed') NOT NULL DEFAULT 'draft',
	`optimizedRoute` json,
	`viewCount` int DEFAULT 0,
	`likeCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `itineraries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `itineraryLikes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itineraryId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `itineraryLikes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itineraryId` int NOT NULL,
	`dayNumber` int NOT NULL,
	`orderIndex` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` enum('must-see','must-do','must-try','must-eat') NOT NULL,
	`address` text,
	`lat` decimal(10,7),
	`lng` decimal(10,7),
	`placeId` varchar(255),
	`startTime` varchar(10),
	`endTime` varchar(10),
	`duration` int,
	`travelTimeFromPrev` int,
	`travelDistanceFromPrev` decimal(10,2),
	`notes` text,
	`tips` text,
	`rating` decimal(2,1),
	`imageUrl` text,
	`bookingUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stops_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;