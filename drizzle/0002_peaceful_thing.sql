CREATE TABLE `dailyMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`dailyRevenue` int NOT NULL DEFAULT 0,
	`newSubscriptions` int NOT NULL DEFAULT 0,
	`cancelledSubscriptions` int NOT NULL DEFAULT 0,
	`activeUsers` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dailyMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monthlyMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`year` int NOT NULL,
	`month` int NOT NULL,
	`totalRevenue` int NOT NULL DEFAULT 0,
	`activeSubscriptions` int NOT NULL DEFAULT 0,
	`newSubscriptions` int NOT NULL DEFAULT 0,
	`cancelledSubscriptions` int NOT NULL DEFAULT 0,
	`mrr` int NOT NULL DEFAULT 0,
	`arr` int NOT NULL DEFAULT 0,
	`churnRate` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monthlyMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptionEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subscriptionId` int,
	`eventType` enum('created','upgraded','downgraded','cancelled','renewed') NOT NULL,
	`previousPlanId` varchar(255),
	`newPlanId` varchar(255),
	`amount` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscriptionEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `subscriptionEvents` ADD CONSTRAINT `subscriptionEvents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptionEvents` ADD CONSTRAINT `subscriptionEvents_subscriptionId_subscriptions_id_fk` FOREIGN KEY (`subscriptionId`) REFERENCES `subscriptions`(`id`) ON DELETE cascade ON UPDATE no action;