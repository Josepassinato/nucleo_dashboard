CREATE TABLE `audioRecordings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`messageId` int NOT NULL,
	`audioUrl` varchar(1024) NOT NULL,
	`audioKey` varchar(255) NOT NULL,
	`audioDuration` int NOT NULL,
	`audioFormat` varchar(10) NOT NULL,
	`audioSize` int NOT NULL,
	`transcriptText` text,
	`transcriptLanguage` varchar(10) DEFAULT 'pt-BR',
	`transcriptionConfidence` int DEFAULT 0,
	`transcriptionModel` varchar(255) DEFAULT 'whisper-1',
	`processingStatus` enum('pending','transcribing','completed','failed') DEFAULT 'pending',
	`processingError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `audioRecordings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ceoMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','ceo') NOT NULL,
	`messageType` enum('text','audio','transcribed_audio') NOT NULL,
	`content` text NOT NULL,
	`audioUrl` varchar(1024),
	`audioTranscript` text,
	`audioLanguage` varchar(10) DEFAULT 'pt-BR',
	`isStrategicCommand` boolean DEFAULT false,
	`commandType` varchar(255),
	`commandConfidence` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ceoMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `strategicCommands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`messageId` int NOT NULL,
	`commandType` varchar(255) NOT NULL,
	`commandDescription` text NOT NULL,
	`currentBusinessModel` varchar(255),
	`newBusinessModel` varchar(255),
	`targetMarkets` text,
	`targetChannels` text,
	`ceoAnalysis` text,
	`requiredInteractions` text,
	`actionPlan` text,
	`estimatedTimeframe` varchar(255),
	`status` enum('pending','in_progress','completed','failed') DEFAULT 'pending',
	`executionStartedAt` timestamp,
	`executionCompletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `strategicCommands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `audioRecordings` ADD CONSTRAINT `audioRecordings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audioRecordings` ADD CONSTRAINT `audioRecordings_messageId_ceoMessages_id_fk` FOREIGN KEY (`messageId`) REFERENCES `ceoMessages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ceoMessages` ADD CONSTRAINT `ceoMessages_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `strategicCommands` ADD CONSTRAINT `strategicCommands_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `strategicCommands` ADD CONSTRAINT `strategicCommands_messageId_ceoMessages_id_fk` FOREIGN KEY (`messageId`) REFERENCES `ceoMessages`(`id`) ON DELETE cascade ON UPDATE no action;