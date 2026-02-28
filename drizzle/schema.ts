import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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