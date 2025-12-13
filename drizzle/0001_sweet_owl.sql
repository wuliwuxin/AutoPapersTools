CREATE TABLE `analysisReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paperId` int NOT NULL,
	`background` text,
	`what` text,
	`why` text,
	`how` text,
	`howWhy` text,
	`summary` text,
	`status` enum('pending','processing','completed','failed') DEFAULT 'pending',
	`generatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analysisReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dailyDigests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`paperIds` text,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dailyDigests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`paperId` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `papers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`arxivId` varchar(64) NOT NULL,
	`title` text NOT NULL,
	`authors` text NOT NULL,
	`abstract` text,
	`publishedAt` timestamp NOT NULL,
	`source` varchar(64) NOT NULL,
	`sourceUrl` varchar(512) NOT NULL,
	`category` varchar(128),
	`keywords` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `papers_id` PRIMARY KEY(`id`),
	CONSTRAINT `papers_arxivId_unique` UNIQUE(`arxivId`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` varchar(128) NOT NULL,
	`keywords` text,
	`enabled` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
