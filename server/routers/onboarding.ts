import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  initializeOnboarding,
  getOnboardingProgress,
  markOnboardingStep,
  trackVideoWatched,
  updateEmailSequenceStep,
  initializeUserSegment,
  updateUserSegment,
  getUserSegment,
  getOnboardingStats,
} from "../db-onboarding";

export const onboardingRouter = router({
  /**
   * Initialize onboarding for current user
   */
  initialize: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await initializeOnboarding(ctx.user.id);
      await initializeUserSegment(ctx.user.id, "free_trial");
      return { success: true };
    } catch (error) {
      console.error("[Onboarding] Initialize error:", error);
      return { success: false, error: "Failed to initialize onboarding" };
    }
  }),

  /**
   * Get current user's onboarding progress
   */
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    try {
      const progress = await getOnboardingProgress(ctx.user.id);
      const segment = await getUserSegment(ctx.user.id);
      return { progress, segment };
    } catch (error) {
      console.error("[Onboarding] Get progress error:", error);
      return { progress: null, segment: null };
    }
  }),

  /**
   * Mark a quick win as completed
   */
  markQuickWin: protectedProcedure
    .input(
      z.enum([
        "viewedOnboarding",
        "createdFirstAgent",
        "configuredFirstIntegration",
        "completedFirstAction",
      ])
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await markOnboardingStep(ctx.user.id, input);
        const progress = await getOnboardingProgress(ctx.user.id);
        return { success: true, progress };
      } catch (error) {
        console.error("[Onboarding] Mark quick win error:", error);
        return { success: false, error: "Failed to mark quick win" };
      }
    }),

  /**
   * Track video watched
   */
  trackVideo: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await trackVideoWatched(ctx.user.id);
      const progress = await getOnboardingProgress(ctx.user.id);
      return { success: true, progress };
    } catch (error) {
      console.error("[Onboarding] Track video error:", error);
      return { success: false, error: "Failed to track video" };
    }
  }),

  /**
   * Update email sequence step
   */
  updateEmailSequence: protectedProcedure
    .input(z.object({ step: z.number().min(0).max(4) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await updateEmailSequenceStep(ctx.user.id, input.step);
        return { success: true };
      } catch (error) {
        console.error("[Onboarding] Update email sequence error:", error);
        return { success: false, error: "Failed to update email sequence" };
      }
    }),

  /**
   * Update user segment
   */
  updateSegment: protectedProcedure
    .input(
      z.object({
        industry: z.string().optional(),
        companySize: z
          .enum(["solo", "small", "medium", "large", "enterprise"])
          .optional(),
        useCase: z.string().optional(),
        engagementLevel: z.enum(["low", "medium", "high"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await updateUserSegment(ctx.user.id, input);
        const segment = await getUserSegment(ctx.user.id);
        return { success: true, segment };
      } catch (error) {
        console.error("[Onboarding] Update segment error:", error);
        return { success: false, error: "Failed to update segment" };
      }
    }),

  /**
   * Get onboarding statistics (admin only)
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        return { error: "Unauthorized" };
      }

      const stats = await getOnboardingStats();
      return stats;
    } catch (error) {
      console.error("[Onboarding] Get stats error:", error);
      return { error: "Failed to get statistics" };
    }
  }),
});
