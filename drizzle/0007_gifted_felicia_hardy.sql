CREATE TABLE `actionLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actionId` int NOT NULL,
	`level` enum('debug','info','warning','error') NOT NULL,
	`message` text NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `actionLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agentId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`actionType` enum('task_execution','decision','recommendation','alert','system_change','report_generation','integration_sync','other') NOT NULL,
	`status` enum('pending','in_progress','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`result` text,
	`errorMessage` text,
	`impactLevel` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`affectedMetrics` text,
	`scheduledFor` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`durationMs` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`avatar` varchar(255),
	`status` enum('active','inactive','paused') NOT NULL DEFAULT 'active',
	`tasksCompleted` int DEFAULT 0,
	`successRate` int DEFAULT 0,
	`averageResponseTimeMs` int DEFAULT 0,
	`capabilities` text,
	`permissions` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `actionLogs` ADD CONSTRAINT `actionLogs_actionId_actions_id_fk` FOREIGN KEY (`actionId`) REFERENCES `actions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `actions` ADD CONSTRAINT `actions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `actions` ADD CONSTRAINT `actions_agentId_agents_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agents` ADD CONSTRAINT `agents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;