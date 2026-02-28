/**
 * Metrics calculation helpers for Admin Dashboard
 * Calculates MRR, ARR, Churn Rate, and other business metrics
 */

import { getDb } from "./db";
import { monthlyMetrics, dailyMetrics, subscriptionEvents } from "../drizzle/schema";
import { eq, and, gte, lt } from "drizzle-orm";

/**
 * Get metrics for a specific month
 */
export async function getMonthlyMetrics(year: number, month: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(monthlyMetrics)
    .where(and(eq(monthlyMetrics.year, year), eq(monthlyMetrics.month, month)))
    .limit(1);

  return result[0] || null;
}

/**
 * Get metrics for the current month
 */
export async function getCurrentMonthMetrics() {
  const now = new Date();
  return getMonthlyMetrics(now.getFullYear(), now.getMonth() + 1);
}

/**
 * Get daily metrics for a specific date
 */
export async function getDailyMetrics(date: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(dailyMetrics)
    .where(eq(dailyMetrics.date, date))
    .limit(1);

  return result[0] || null;
}

/**
 * Get metrics for a date range
 */
export async function getMetricsRange(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(dailyMetrics)
    .where(and(gte(dailyMetrics.date, startDate), lt(dailyMetrics.date, endDate)))
    .orderBy(dailyMetrics.date);
}

/**
 * Get last N months of metrics
 */
export async function getLastMonthsMetrics(months: number = 12) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const results = [];

  for (let i = 0; i < months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const metrics = await getMonthlyMetrics(date.getFullYear(), date.getMonth() + 1);
    if (metrics) {
      results.unshift(metrics);
    }
  }

  return results;
}

/**
 * Get subscription events for a date range
 */
export async function getSubscriptionEvents(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(subscriptionEvents)
    .where(
      and(
        gte(subscriptionEvents.createdAt, startDate),
        lt(subscriptionEvents.createdAt, endDate)
      )
    )
    .orderBy(subscriptionEvents.createdAt);
}

/**
 * Calculate MRR (Monthly Recurring Revenue)
 * Sum of all active monthly subscriptions
 */
export async function calculateMRR() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const metrics = await getCurrentMonthMetrics();
  if (!metrics) return 0;

  // MRR is stored in cents, convert to reais
  return metrics.mrr / 100;
}

/**
 * Calculate ARR (Annual Recurring Revenue)
 * MRR * 12
 */
export async function calculateARR() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const metrics = await getCurrentMonthMetrics();
  if (!metrics) return 0;

  // ARR is stored in cents, convert to reais
  return metrics.arr / 100;
}

/**
 * Calculate Churn Rate
 * (Cancelled subscriptions / Beginning subscriptions) * 100
 */
export async function calculateChurnRate() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const metrics = await getCurrentMonthMetrics();
  if (!metrics) return 0;

  // Churn rate is stored as percentage * 100 (e.g., 5.5% = 550)
  return metrics.churnRate / 100;
}

/**
 * Get revenue trend (last 12 months)
 */
export async function getRevenueTrend() {
  const metrics = await getLastMonthsMetrics(12);

  return metrics.map((m) => ({
    month: `${m.month}/${m.year}`,
    revenue: m.totalRevenue / 100,
    mrr: m.mrr / 100,
  }));
}

/**
 * Get subscription trend (last 12 months)
 */
export async function getSubscriptionTrend() {
  const metrics = await getLastMonthsMetrics(12);

  return metrics.map((m) => ({
    month: `${m.month}/${m.year}`,
    active: m.activeSubscriptions,
    new: m.newSubscriptions,
    cancelled: m.cancelledSubscriptions,
  }));
}

/**
 * Get churn rate trend (last 12 months)
 */
export async function getChurnTrend() {
  const metrics = await getLastMonthsMetrics(12);

  return metrics.map((m) => ({
    month: `${m.month}/${m.year}`,
    churnRate: m.churnRate / 100,
  }));
}

/**
 * Get plan distribution
 * How many subscriptions per plan
 */
export async function getPlanDistribution() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const events = await getSubscriptionEvents(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    new Date()
  );

  const distribution: Record<string, number> = {
    starter: 0,
    pro: 0,
    enterprise: 0,
    license: 0,
  };

  for (const event of events) {
    if (event.newPlanId && distribution.hasOwnProperty(event.newPlanId)) {
      distribution[event.newPlanId]++;
    }
  }

  return distribution;
}

/**
 * Get LTV (Lifetime Value) by plan
 * Average revenue per subscription * average lifetime
 */
export async function getLTVByPlan() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const planPrices: Record<string, number> = {
    starter: 99,
    pro: 299,
    enterprise: 999,
    license: 2999,
  };

  // Average lifetime in months (estimated)
  const avgLifetime: Record<string, number> = {
    starter: 12,
    pro: 18,
    enterprise: 24,
    license: 60, // 5 years
  };

  const ltv: Record<string, number> = {};

  for (const [plan, price] of Object.entries(planPrices)) {
    ltv[plan] = price * (avgLifetime[plan] || 12);
  }

  return ltv;
}

/**
 * Get CAC (Customer Acquisition Cost)
 * Total marketing spend / new customers
 * Note: This is a placeholder - you should track marketing spend separately
 */
export async function getCAC() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const metrics = await getCurrentMonthMetrics();
  if (!metrics || metrics.newSubscriptions === 0) return 0;

  // Placeholder: assume 10% of revenue goes to marketing
  const estimatedMarketingSpend = (metrics.totalRevenue / 100) * 0.1;
  return estimatedMarketingSpend / metrics.newSubscriptions;
}

/**
 * Get LTV:CAC ratio
 * Should be at least 3:1 for healthy business
 */
export async function getLTVCACRatio() {
  const ltv = await getLTVByPlan();
  const cac = await getCAC();

  // Average LTV across all plans
  const avgLTV = Object.values(ltv).reduce((a, b) => a + b, 0) / Object.keys(ltv).length;

  if (cac === 0) return 0;
  return avgLTV / cac;
}

/**
 * Get cohort analysis
 * Track cohorts of users by signup month
 */
export async function getCohortAnalysis() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const events = await db
    .select()
    .from(subscriptionEvents)
    .where(eq(subscriptionEvents.eventType, "created"));

  const cohorts: Record<string, { total: number; retained: number }> = {};

  for (const event of events) {
    const month = `${event.createdAt.getMonth() + 1}/${event.createdAt.getFullYear()}`;

    if (!cohorts[month]) {
      cohorts[month] = { total: 0, retained: 0 };
    }

    cohorts[month].total++;

    // Check if subscription is still active (not cancelled)
    if (event.subscriptionId) {
      const cancelled = await db
        .select()
        .from(subscriptionEvents)
        .where(
          and(
            eq(subscriptionEvents.subscriptionId, event.subscriptionId),
            eq(subscriptionEvents.eventType, "cancelled")
          )
        )
        .limit(1);

      if (!cancelled.length) {
        cohorts[month].retained++;
      }
    }
  }

  return cohorts;
}

/**
 * Get key metrics summary
 */
export async function getMetricsSummary() {
  const current = await getCurrentMonthMetrics();
  const previous = await getMonthlyMetrics(
    new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear(),
    new Date().getMonth() === 0 ? 12 : new Date().getMonth()
  );

  if (!current) {
    return {
      mrr: 0,
      arr: 0,
      activeSubscriptions: 0,
      churnRate: 0,
      newSubscriptions: 0,
      mrrGrowth: 0,
      churnRateChange: 0,
    };
  }

  const mrrGrowth = previous
    ? ((current.mrr - previous.mrr) / previous.mrr) * 100
    : 0;

  const churnRateChange = previous
    ? (current.churnRate - previous.churnRate) / 100
    : 0;

  return {
    mrr: current.mrr / 100,
    arr: current.arr / 100,
    activeSubscriptions: current.activeSubscriptions,
    churnRate: current.churnRate / 100,
    newSubscriptions: current.newSubscriptions,
    mrrGrowth,
    churnRateChange,
  };
}
