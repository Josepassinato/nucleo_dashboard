import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Stripe subscriptions table - stores only essential Stripe identifiers
 * All other data (status, amounts, etc.) is fetched from Stripe API
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).notNull().unique(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).notNull().unique(),
  planId: varchar("planId", { length: 255 }).notNull(), // starter, pro, enterprise, license
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Stripe payment history - stores only essential payment identifiers
 * All payment details are fetched from Stripe API
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull().unique(),
  planId: varchar("planId", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Monthly metrics - stores aggregated business metrics
 * Calculated daily at midnight UTC
 */
export const monthlyMetrics = mysqlTable("monthlyMetrics", {
  id: int("id").autoincrement().primaryKey(),
  year: int("year").notNull(),
  month: int("month").notNull(), // 1-12
  totalRevenue: int("totalRevenue").notNull().default(0), // in cents
  activeSubscriptions: int("activeSubscriptions").notNull().default(0),
  newSubscriptions: int("newSubscriptions").notNull().default(0),
  cancelledSubscriptions: int("cancelledSubscriptions").notNull().default(0),
  mrr: int("mrr").notNull().default(0), // Monthly Recurring Revenue in cents
  arr: int("arr").notNull().default(0), // Annual Recurring Revenue in cents
  churnRate: int("churnRate").notNull().default(0), // percentage * 100 (e.g., 5.5% = 550)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MonthlyMetrics = typeof monthlyMetrics.$inferSelect;
export type InsertMonthlyMetrics = typeof monthlyMetrics.$inferInsert;

/**
 * Daily metrics - stores daily aggregated metrics for trend analysis
 */
export const dailyMetrics = mysqlTable("dailyMetrics", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  dailyRevenue: int("dailyRevenue").notNull().default(0), // in cents
  newSubscriptions: int("newSubscriptions").notNull().default(0),
  cancelledSubscriptions: int("cancelledSubscriptions").notNull().default(0),
  activeUsers: int("activeUsers").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyMetrics = typeof dailyMetrics.$inferSelect;
export type InsertDailyMetrics = typeof dailyMetrics.$inferInsert;

/**
 * Subscription events - tracks all subscription changes for audit trail
 */
export const subscriptionEvents = mysqlTable("subscriptionEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  subscriptionId: int("subscriptionId").references(() => subscriptions.id, { onDelete: "cascade" }),
  eventType: mysqlEnum("eventType", ["created", "upgraded", "downgraded", "cancelled", "renewed"]).notNull(),
  previousPlanId: varchar("previousPlanId", { length: 255 }),
  newPlanId: varchar("newPlanId", { length: 255 }),
  amount: int("amount"), // in cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SubscriptionEvent = typeof subscriptionEvents.$inferSelect;
export type InsertSubscriptionEvent = typeof subscriptionEvents.$inferInsert;

/**
 * User segments - tracks user segmentation for personalization
 */
export const userSegments = mysqlTable("userSegments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Segment type
  segment: mysqlEnum("segment", ["free_trial", "starter", "pro", "enterprise", "churned", "at_risk"]).notNull(),
  // User attributes
  industry: varchar("industry", { length: 255 }),
  companySize: mysqlEnum("companySize", ["solo", "small", "medium", "large", "enterprise"]),
  useCase: varchar("useCase", { length: 255 }),
  engagementLevel: mysqlEnum("engagementLevel", ["low", "medium", "high"]).default("medium"),
  // Metrics
  lastActivityAt: timestamp("lastActivityAt"),
  loginCount: int("loginCount").default(0),
  monthlyActiveUsers: int("monthlyActiveUsers").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSegment = typeof userSegments.$inferSelect;
export type InsertUserSegment = typeof userSegments.$inferInsert;

/**
 * Onboarding progress - tracks user progress through onboarding
 */
export const onboardingProgress = mysqlTable("onboardingProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Quick wins checklist
  viewedOnboarding: boolean("viewedOnboarding").default(false),
  createdFirstAgent: boolean("createdFirstAgent").default(false),
  configuredFirstIntegration: boolean("configuredFirstIntegration").default(false),
  completedFirstAction: boolean("completedFirstAction").default(false),
  // Video tracking
  videosWatched: int("videosWatched").default(0),
  lastVideoWatchedAt: timestamp("lastVideoWatchedAt"),
  // Email sequence
  emailSequenceStep: int("emailSequenceStep").default(0), // 0=none, 1=day1, 2=day3, 3=day7, 4=day14
  lastEmailSentAt: timestamp("lastEmailSentAt"),
  // Completion
  completedAt: timestamp("completedAt"),
  completionPercentage: int("completionPercentage").default(0), // 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OnboardingProgress = typeof onboardingProgress.$inferSelect;
export type InsertOnboardingProgress = typeof onboardingProgress.$inferInsert;

/**
 * Cohort data - stores cohort information for analysis
 */
export const cohortData = mysqlTable("cohortData", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Cohort identifiers
  signupDate: varchar("signupDate", { length: 10 }).notNull(), // YYYY-MM-DD
  signupWeek: varchar("signupWeek", { length: 10 }).notNull(), // YYYY-Www
  signupMonth: varchar("signupMonth", { length: 7 }).notNull(), // YYYY-MM
  initialPlanId: varchar("initialPlanId", { length: 255 }),
  trafficSource: varchar("trafficSource", { length: 255 }), // organic, paid, referral, direct
  // Retention tracking
  week1Retained: boolean("week1Retained").default(false),
  week2Retained: boolean("week2Retained").default(false),
  week4Retained: boolean("week4Retained").default(false),
  month1Retained: boolean("month1Retained").default(false),
  month3Retained: boolean("month3Retained").default(false),
  month6Retained: boolean("month6Retained").default(false),
  month12Retained: boolean("month12Retained").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CohortData = typeof cohortData.$inferSelect;
export type InsertCohortData = typeof cohortData.$inferInsert;

/**
 * Churn predictions - stores ML predictions for churn risk
 */
export const churnPredictions = mysqlTable("churnPredictions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Risk metrics
  churnRiskScore: int("churnRiskScore").notNull(), // 0-100
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high", "critical"]).notNull(),
  // Risk factors
  daysWithoutLogin: int("daysWithoutLogin").default(0),
  monthlyActiveUsagePercent: int("monthlyActiveUsagePercent").default(0), // 0-100
  supportTicketsCount: int("supportTicketsCount").default(0),
  lastPaymentFailed: boolean("lastPaymentFailed").default(false),
  // Actions
  actionTaken: varchar("actionTaken", { length: 255 }), // email_sent, call_scheduled, discount_offered
  actionTakenAt: timestamp("actionTakenAt"),
  // Prediction metadata
  predictedChurnDate: varchar("predictedChurnDate", { length: 10 }), // YYYY-MM-DD
  confidence: int("confidence").default(0), // 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChurnPrediction = typeof churnPredictions.$inferSelect;
export type InsertChurnPrediction = typeof churnPredictions.$inferInsert;

/**
 * CEO Chat Messages - stores conversations between user and CEO agent
 */
export const ceoMessages = mysqlTable("ceoMessages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Message content
  role: mysqlEnum("role", ["user", "ceo"]).notNull(), // who sent the message
  messageType: mysqlEnum("messageType", ["text", "audio", "transcribed_audio"]).notNull(),
  content: text("content").notNull(), // text or transcribed audio
  // Audio metadata
  audioUrl: varchar("audioUrl", { length: 1024 }), // S3 URL
  audioTranscript: text("audioTranscript"), // transcribed text
  audioLanguage: varchar("audioLanguage", { length: 10 }).default("pt-BR"),
  // Strategic command detection
  isStrategicCommand: boolean("isStrategicCommand").default(false),
  commandType: varchar("commandType", { length: 255 }), // change_business_model, adjust_team, etc
  commandConfidence: int("commandConfidence").default(0), // 0-100
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CeoMessage = typeof ceoMessages.$inferSelect;
export type InsertCeoMessage = typeof ceoMessages.$inferInsert;

/**
 * Strategic Commands - parsed strategic directives from user
 */
export const strategicCommands = mysqlTable("strategicCommands", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  messageId: int("messageId").notNull().references(() => ceoMessages.id, { onDelete: "cascade" }),
  // Command details
  commandType: varchar("commandType", { length: 255 }).notNull(), // change_business_model, adjust_team, etc
  commandDescription: text("commandDescription").notNull(),
  // Business context
  currentBusinessModel: varchar("currentBusinessModel", { length: 255 }), // e-commerce, saas, etc
  newBusinessModel: varchar("newBusinessModel", { length: 255 }), // seguros, etc
  targetMarkets: text("targetMarkets"), // JSON array of markets
  targetChannels: text("targetChannels"), // JSON array of channels (redes sociais, etc)
  // CEO Analysis
  ceoAnalysis: text("ceoAnalysis"), // CEO's understanding of the command
  requiredInteractions: text("requiredInteractions"), // JSON array of required integrations
  actionPlan: text("actionPlan"), // JSON structured action plan
  estimatedTimeframe: varchar("estimatedTimeframe", { length: 255 }), // 1 week, 2 weeks, etc
  // Status
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending"),
  executionStartedAt: timestamp("executionStartedAt"),
  executionCompletedAt: timestamp("executionCompletedAt"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StrategicCommand = typeof strategicCommands.$inferSelect;
export type InsertStrategicCommand = typeof strategicCommands.$inferInsert;

/**
 * Audio Recordings - stores raw audio files metadata
 */
export const audioRecordings = mysqlTable("audioRecordings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  messageId: int("messageId").notNull().references(() => ceoMessages.id, { onDelete: "cascade" }),
  // Audio metadata
  audioUrl: varchar("audioUrl", { length: 1024 }).notNull(), // S3 URL
  audioKey: varchar("audioKey", { length: 255 }).notNull(), // S3 key for deletion
  audioDuration: int("audioDuration").notNull(), // seconds
  audioFormat: varchar("audioFormat", { length: 10 }).notNull(), // mp3, wav, webm, etc
  audioSize: int("audioSize").notNull(), // bytes
  // Transcription
  transcriptText: text("transcriptText"),
  transcriptLanguage: varchar("transcriptLanguage", { length: 10 }).default("pt-BR"),
  transcriptionConfidence: int("transcriptionConfidence").default(0), // 0-100
  transcriptionModel: varchar("transcriptionModel", { length: 255 }).default("whisper-1"),
  // Processing status
  processingStatus: mysqlEnum("processingStatus", ["pending", "transcribing", "completed", "failed"]).default("pending"),
  processingError: text("processingError"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AudioRecording = typeof audioRecordings.$inferSelect;
export type InsertAudioRecording = typeof audioRecordings.$inferInsert;


/**
 * CEO Directives - Strategic directions from CEO
 */
export const ceoDirectives = mysqlTable("ceoDirectives", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Content
  directive: text("directive").notNull(),
  audioUrl: varchar("audioUrl", { length: 1024 }),
  audioTranscript: text("audioTranscript"),
  
  // Analysis
  strategicDirection: varchar("strategicDirection", { length: 255 }),
  businessModel: varchar("businessModel", { length: 255 }),
  targetMarkets: text("targetMarkets"), // JSON array
  targetChannels: text("targetChannels"), // JSON array
  
  // Status
  status: mysqlEnum("status", ["pending", "approved", "rejected", "in_progress", "completed"]).default("pending"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CeoDirective = typeof ceoDirectives.$inferSelect;
export type InsertCeoDirective = typeof ceoDirectives.$inferInsert;

/**
 * CTO Proposals - Technical proposals from CTO Agent
 */
export const ctoProposals = mysqlTable("ctoProposals", {
  id: int("id").autoincrement().primaryKey(),
  directiveId: int("directiveId").notNull().references(() => ceoDirectives.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Proposal
  architecture: text("architecture"),
  integrations: text("integrations"), // JSON array
  features: text("features"), // JSON array
  executionPlan: text("executionPlan"), // JSON array
  
  // Estimates
  totalEstimatedHours: int("totalEstimatedHours"),
  estimatedDays: int("estimatedDays"),
  risks: text("risks"), // JSON array
  recommendations: text("recommendations"), // JSON array
  
  // Status
  status: mysqlEnum("status", ["pending", "approved", "rejected", "in_progress"]).default("pending"),
  approvedAt: timestamp("approvedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CtoProposal = typeof ctoProposals.$inferSelect;
export type InsertCtoProposal = typeof ctoProposals.$inferInsert;

/**
 * CTO Executions - Code generation and deployment executions
 */
export const ctoExecutions = mysqlTable("ctoExecutions", {
  id: int("id").autoincrement().primaryKey(),
  proposalId: int("proposalId").notNull().references(() => ctoProposals.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Execution phase
  phase: int("phase"),
  phaseName: varchar("phaseName", { length: 255 }),
  tasks: text("tasks"), // JSON array
  
  // Generated code
  generatedCode: text("generatedCode"),
  codeLanguage: varchar("codeLanguage", { length: 50 }),
  filePath: varchar("filePath", { length: 255 }),
  
  // Tests
  testResults: text("testResults"), // JSON
  testsPassed: boolean("testsPassed").default(false),
  testsCoverage: int("testsCoverage").default(0),
  
  // Deploy
  deployStatus: mysqlEnum("deployStatus", ["pending", "deploying", "deployed", "failed"]).default("pending"),
  deployLog: text("deployLog"),
  
  // Rollback
  canRollback: boolean("canRollback").default(false),
  rollbackCommitHash: varchar("rollbackCommitHash", { length: 255 }),
  
  // Progress
  progressPercent: int("progressPercent").default(0),
  estimatedTimeRemaining: int("estimatedTimeRemaining"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CtoExecution = typeof ctoExecutions.$inferSelect;
export type InsertCtoExecution = typeof ctoExecutions.$inferInsert;

/**
 * CTO Execution Logs - Real-time logs during execution
 */
export const ctoExecutionLogs = mysqlTable("ctoExecutionLogs", {
  id: int("id").autoincrement().primaryKey(),
  executionId: int("executionId").notNull().references(() => ctoExecutions.id, { onDelete: "cascade" }),
  
  // Log
  level: mysqlEnum("level", ["info", "warning", "error", "success"]).default("info"),
  message: text("message").notNull(),
  details: text("details"), // JSON
  
  // Progress
  progressPercent: int("progressPercent"),
  estimatedTimeRemaining: int("estimatedTimeRemaining"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CtoExecutionLog = typeof ctoExecutionLogs.$inferSelect;
export type InsertCtoExecutionLog = typeof ctoExecutionLogs.$inferInsert;
