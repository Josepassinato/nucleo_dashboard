CREATE TABLE `ceoDirectives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`directive` text NOT NULL,
	`audioUrl` varchar(1024),
	`audioTranscript` text,
	`strategicDirection` varchar(255),
	`businessModel` varchar(255),
	`targetMarkets` text,
	`targetChannels` text,
	`status` enum('pending','approved','rejected','in_progress','completed') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ceoDirectives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ctoExecutionLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`executionId` int NOT NULL,
	`level` enum('info','warning','error','success') DEFAULT 'info',
	`message` text NOT NULL,
	`details` text,
	`progressPercent` int,
	`estimatedTimeRemaining` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ctoExecutionLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ctoExecutions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proposalId` int NOT NULL,
	`userId` int NOT NULL,
	`phase` int,
	`phaseName` varchar(255),
	`tasks` text,
	`generatedCode` text,
	`codeLanguage` varchar(50),
	`filePath` varchar(255),
	`testResults` text,
	`testsPassed` boolean DEFAULT false,
	`testsCoverage` int DEFAULT 0,
	`deployStatus` enum('pending','deploying','deployed','failed') DEFAULT 'pending',
	`deployLog` text,
	`canRollback` boolean DEFAULT false,
	`rollbackCommitHash` varchar(255),
	`progressPercent` int DEFAULT 0,
	`estimatedTimeRemaining` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ctoExecutions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ctoProposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`directiveId` int NOT NULL,
	`userId` int NOT NULL,
	`architecture` text,
	`integrations` text,
	`features` text,
	`executionPlan` text,
	`totalEstimatedHours` int,
	`estimatedDays` int,
	`risks` text,
	`recommendations` text,
	`status` enum('pending','approved','rejected','in_progress') DEFAULT 'pending',
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ctoProposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ceoDirectives` ADD CONSTRAINT `ceoDirectives_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ctoExecutionLogs` ADD CONSTRAINT `ctoExecutionLogs_executionId_ctoExecutions_id_fk` FOREIGN KEY (`executionId`) REFERENCES `ctoExecutions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ctoExecutions` ADD CONSTRAINT `ctoExecutions_proposalId_ctoProposals_id_fk` FOREIGN KEY (`proposalId`) REFERENCES `ctoProposals`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ctoExecutions` ADD CONSTRAINT `ctoExecutions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ctoProposals` ADD CONSTRAINT `ctoProposals_directiveId_ceoDirectives_id_fk` FOREIGN KEY (`directiveId`) REFERENCES `ceoDirectives`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ctoProposals` ADD CONSTRAINT `ctoProposals_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;