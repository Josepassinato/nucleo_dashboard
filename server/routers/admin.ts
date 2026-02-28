/**
 * Admin router - metrics and business intelligence
 * Only accessible to admin users
 */

import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "../_core/trpc";
import * as metrics from "../db-metrics";

export const adminRouter = router({
  /**
   * Get current month metrics summary
   */
  getMetricsSummary: adminProcedure.query(async () => {
    try {
      return await metrics.getMetricsSummary();
    } catch (error) {
      console.error("[Admin] Error getting metrics summary:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get metrics",
      });
    }
  }),

  /**
   * Get revenue trend (last 12 months)
   */
  getRevenueTrend: adminProcedure.query(async () => {
    try {
      return await metrics.getRevenueTrend();
    } catch (error) {
      console.error("[Admin] Error getting revenue trend:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get revenue trend",
      });
    }
  }),

  /**
   * Get subscription trend (last 12 months)
   */
  getSubscriptionTrend: adminProcedure.query(async () => {
    try {
      return await metrics.getSubscriptionTrend();
    } catch (error) {
      console.error("[Admin] Error getting subscription trend:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get subscription trend",
      });
    }
  }),

  /**
   * Get churn rate trend (last 12 months)
   */
  getChurnTrend: adminProcedure.query(async () => {
    try {
      return await metrics.getChurnTrend();
    } catch (error) {
      console.error("[Admin] Error getting churn trend:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get churn trend",
      });
    }
  }),

  /**
   * Get plan distribution
   */
  getPlanDistribution: adminProcedure.query(async () => {
    try {
      return await metrics.getPlanDistribution();
    } catch (error) {
      console.error("[Admin] Error getting plan distribution:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get plan distribution",
      });
    }
  }),

  /**
   * Get LTV by plan
   */
  getLTVByPlan: adminProcedure.query(async () => {
    try {
      return await metrics.getLTVByPlan();
    } catch (error) {
      console.error("[Admin] Error getting LTV by plan:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get LTV by plan",
      });
    }
  }),

  /**
   * Get CAC (Customer Acquisition Cost)
   */
  getCAC: adminProcedure.query(async () => {
    try {
      return await metrics.getCAC();
    } catch (error) {
      console.error("[Admin] Error getting CAC:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get CAC",
      });
    }
  }),

  /**
   * Get LTV:CAC ratio
   */
  getLTVCACRatio: adminProcedure.query(async () => {
    try {
      return await metrics.getLTVCACRatio();
    } catch (error) {
      console.error("[Admin] Error getting LTV:CAC ratio:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get LTV:CAC ratio",
      });
    }
  }),

  /**
   * Get cohort analysis
   */
  getCohortAnalysis: adminProcedure.query(async () => {
    try {
      return await metrics.getCohortAnalysis();
    } catch (error) {
      console.error("[Admin] Error getting cohort analysis:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get cohort analysis",
      });
    }
  }),

  /**
   * Get MRR (Monthly Recurring Revenue)
   */
  getMRR: adminProcedure.query(async () => {
    try {
      return await metrics.calculateMRR();
    } catch (error) {
      console.error("[Admin] Error calculating MRR:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to calculate MRR",
      });
    }
  }),

  /**
   * Get ARR (Annual Recurring Revenue)
   */
  getARR: adminProcedure.query(async () => {
    try {
      return await metrics.calculateARR();
    } catch (error) {
      console.error("[Admin] Error calculating ARR:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to calculate ARR",
      });
    }
  }),

  /**
   * Get churn rate
   */
  getChurnRate: adminProcedure.query(async () => {
    try {
      return await metrics.calculateChurnRate();
    } catch (error) {
      console.error("[Admin] Error calculating churn rate:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to calculate churn rate",
      });
    }
  }),
});
