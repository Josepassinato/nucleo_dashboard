import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  selectBestRoute,
  trackInvocation,
  getCostAnalytics,
  getRoutingRecommendations,
  type RoutingStrategy,
} from "../_core/llmRouter";
import { getDb } from "../db";
import { llmSkills, llmRoutes, llmInvocations } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export const llmRouterRouter = router({
  /**
   * Get best route for a skill
   */
  selectRoute: protectedProcedure
    .input(
      z.object({
        skillName: z.string(),
        strategy: z.enum(["cost", "speed", "quality", "balanced"]).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const route = await selectBestRoute(input.skillName, ctx.user.id, input.strategy);
      return route;
    }),

  /**
   * Track LLM invocation
   */
  trackInvocation: protectedProcedure
    .input(
      z.object({
        skillId: z.number(),
        routeId: z.number(),
        modelUsed: z.string(),
        inputTokens: z.number(),
        outputTokens: z.number(),
        latencyMs: z.number(),
        success: z.boolean(),
        errorMessage: z.string().optional(),
        qualityRating: z.number().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await trackInvocation(
        ctx.user.id,
        input.skillId,
        input.routeId,
        input.modelUsed,
        input.inputTokens,
        input.outputTokens,
        input.latencyMs,
        input.success,
        input.errorMessage,
        input.qualityRating
      );
      return { success: true };
    }),

  /**
   * Get cost analytics for a skill
   */
  getCostAnalytics: protectedProcedure
    .input(
      z.object({
        skillId: z.number(),
        period: z.enum(["daily", "weekly", "monthly"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const analytics = await getCostAnalytics(input.skillId, input.period);
      return analytics;
    }),

  /**
   * Get routing recommendations
   */
  getRecommendations: protectedProcedure
    .input(z.object({ skillId: z.number() }))
    .query(async ({ input }) => {
      const recommendations = await getRoutingRecommendations(input.skillId);
      return recommendations;
    }),

  /**
   * Get all skills
   */
  listSkills: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const skills = await db.select().from(llmSkills);
    return skills;
  }),

  /**
   * Get routes for a skill
   */
  getRoutes: protectedProcedure
    .input(z.object({ skillId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const routes = await db
        .select()
        .from(llmRoutes)
        .where(eq(llmRoutes.skillId, input.skillId))
        .orderBy(desc(llmRoutes.priority));

      return routes;
    }),

  /**
   * Get user's recent invocations
   */
  getRecentInvocations: protectedProcedure
    .input(
      z.object({
        skillId: z.number().optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const whereConditions = [eq(llmInvocations.userId, ctx.user.id)];
      if (input.skillId) {
        whereConditions.push(eq(llmInvocations.skillId, input.skillId));
      }

      const invocations = await db
        .select()
        .from(llmInvocations)
        .where(and(...whereConditions))
        .orderBy(desc(llmInvocations.createdAt))
        .limit(input.limit);

      return invocations;
    }),

  /**
   * Get cost summary
   */
  getCostSummary: protectedProcedure
    .input(
      z.object({
        days: z.number().default(30),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - input.days);

      const invocations = await db
        .select()
        .from(llmInvocations)
        .where(eq(llmInvocations.userId, ctx.user.id));

      const totalCost = invocations.reduce((sum, inv) => sum + (inv.costUSD || 0), 0);
      const totalTokens = invocations.reduce((sum, inv) => sum + (inv.totalTokens || 0), 0);
      const totalInvocations = invocations.length;
      const successRate = invocations.filter((inv) => inv.success).length / totalInvocations;
      const avgQuality = invocations.reduce((sum, inv) => sum + (inv.qualityRating || 3), 0) / totalInvocations;

      return {
        totalCostUSD: totalCost / 100,
        totalTokens,
        totalInvocations,
        successRate: Math.round(successRate * 100),
        avgQuality: Math.round(avgQuality * 10) / 10,
        period: `${input.days} days`,
      };
    }),
});
