CREATE TABLE `churnPredictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`churnRiskScore` int NOT NULL,
	`riskLevel` enum('low','medium','high','critical') NOT NULL,
	`daysWithoutLogin` int DEFAULT 0,
	`monthlyActiveUsagePercent` int DEFAULT 0,
	`supportTicketsCount` int DEFAULT 0,
	`lastPaymentFailed` boolean DEFAULT false,
	`actionTaken` varchar(255),
	`actionTakenAt` timestamp,
	`predictedChurnDate` varchar(10),
	`confidence` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `churnPredictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cohortData` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`signupDate` varchar(10) NOT NULL,
	`signupWeek` varchar(10) NOT NULL,
	`signupMonth` varchar(7) NOT NULL,
	`initialPlanId` varchar(255),
	`trafficSource` varchar(255),
	`week1Retained` boolean DEFAULT false,
	`week2Retained` boolean DEFAULT false,
	`week4Retained` boolean DEFAULT false,
	`month1Retained` boolean DEFAULT false,
	`month3Retained` boolean DEFAULT false,
	`month6Retained` boolean DEFAULT false,
	`month12Retained` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cohortData_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onboardingProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`viewedOnboarding` boolean DEFAULT false,
	`createdFirstAgent` boolean DEFAULT false,
	`configuredFirstIntegration` boolean DEFAULT false,
	`completedFirstAction` boolean DEFAULT false,
	`videosWatched` int DEFAULT 0,
	`lastVideoWatchedAt` timestamp,
	`emailSequenceStep` int DEFAULT 0,
	`lastEmailSentAt` timestamp,
	`completedAt` timestamp,
	`completionPercentage` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onboardingProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userSegments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`segment` enum('free_trial','starter','pro','enterprise','churned','at_risk') NOT NULL,
	`industry` varchar(255),
	`companySize` enum('solo','small','medium','large','enterprise'),
	`useCase` varchar(255),
	`engagementLevel` enum('low','medium','high') DEFAULT 'medium',
	`lastActivityAt` timestamp,
	`loginCount` int DEFAULT 0,
	`monthlyActiveUsers` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSegments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `churnPredictions` ADD CONSTRAINT `churnPredictions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cohortData` ADD CONSTRAINT `cohortData_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `onboardingProgress` ADD CONSTRAINT `onboardingProgress_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userSegments` ADD CONSTRAINT `userSegments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;