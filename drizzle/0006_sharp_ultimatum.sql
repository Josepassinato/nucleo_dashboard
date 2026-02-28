CREATE TABLE `llmCostAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`skillId` int NOT NULL,
	`period` enum('daily','weekly','monthly') NOT NULL,
	`date` varchar(10) NOT NULL,
	`totalInvocations` int,
	`totalTokens` int,
	`totalCostUSD` int,
	`avgLatencyMs` int,
	`successRate` int,
	`avgQualityRating` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `llmCostAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `llmInvocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`skillId` int NOT NULL,
	`routeId` int NOT NULL,
	`modelUsed` varchar(255) NOT NULL,
	`inputTokens` int,
	`outputTokens` int,
	`totalTokens` int,
	`costUSD` int,
	`latencyMs` int,
	`success` boolean DEFAULT true,
	`errorMessage` text,
	`qualityRating` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `llmInvocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `llmRouterConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`skillId` int NOT NULL,
	`strategy` enum('cost','speed','quality','balanced') NOT NULL,
	`maxCostPerInvocation` int,
	`maxLatencyMs` int,
	`minQualityScore` int,
	`enableFallback` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `llmRouterConfig_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `llmRoutes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`skillId` int NOT NULL,
	`modelName` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`costPer1kTokens` int NOT NULL,
	`avgLatencyMs` int,
	`qualityScore` int,
	`isActive` boolean DEFAULT true,
	`priority` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `llmRoutes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `llmSkills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(255) NOT NULL,
	`complexity` enum('low','medium','high') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `llmSkills_id` PRIMARY KEY(`id`),
	CONSTRAINT `llmSkills_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `llmCostAnalytics` ADD CONSTRAINT `llmCostAnalytics_skillId_llmSkills_id_fk` FOREIGN KEY (`skillId`) REFERENCES `llmSkills`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `llmInvocations` ADD CONSTRAINT `llmInvocations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `llmInvocations` ADD CONSTRAINT `llmInvocations_skillId_llmSkills_id_fk` FOREIGN KEY (`skillId`) REFERENCES `llmSkills`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `llmInvocations` ADD CONSTRAINT `llmInvocations_routeId_llmRoutes_id_fk` FOREIGN KEY (`routeId`) REFERENCES `llmRoutes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `llmRouterConfig` ADD CONSTRAINT `llmRouterConfig_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `llmRouterConfig` ADD CONSTRAINT `llmRouterConfig_skillId_llmSkills_id_fk` FOREIGN KEY (`skillId`) REFERENCES `llmSkills`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `llmRoutes` ADD CONSTRAINT `llmRoutes_skillId_llmSkills_id_fk` FOREIGN KEY (`skillId`) REFERENCES `llmSkills`(`id`) ON DELETE cascade ON UPDATE no action;