import { getDb } from "./db";
import { onboardingProgress, userSegments } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Initialize onboarding progress for a new user
 */
export async function initializeOnboarding(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.insert(onboardingProgress).values({
      userId,
      viewedOnboarding: false,
      createdFirstAgent: false,
      configuredFirstIntegration: false,
      completedFirstAction: false,
      videosWatched: 0,
      emailSequenceStep: 0,
      completionPercentage: 0,
    });
  } catch (error) {
    // User already has onboarding progress
  }
}

/**
 * Get onboarding progress for a user
 */
export async function getOnboardingProgress(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(onboardingProgress).where(eq(onboardingProgress.userId, userId)).limit(1);
  return result[0] || null;
}

/**
 * Mark onboarding step as completed
 */
export async function markOnboardingStep(
  userId: number,
  step: "viewedOnboarding" | "createdFirstAgent" | "configuredFirstIntegration" | "completedFirstAction"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const progress = await getOnboardingProgress(userId);
  if (!progress) return;

  const updates: any = { [step]: true };

  // Calculate completion percentage
  const completedSteps = [
    progress.viewedOnboarding ? 1 : 0,
    progress.createdFirstAgent ? 1 : 0,
    progress.configuredFirstIntegration ? 1 : 0,
    progress.completedFirstAction ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const newCompletedSteps = completedSteps + (updates[step] ? 1 : 0);
  updates.completionPercentage = Math.round((newCompletedSteps / 4) * 100);

  // Mark as completed if all steps done
  if (newCompletedSteps === 4 && !progress.completedAt) {
    updates.completedAt = new Date();
  }

  await db!.update(onboardingProgress).set(updates).where(eq(onboardingProgress.userId, userId));
}

/**
 * Track video watched
 */
export async function trackVideoWatched(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const progress = await getOnboardingProgress(userId);
  if (!progress) return;

  await db
    .update(onboardingProgress)
    .set({
      videosWatched: (progress.videosWatched || 0) + 1,
      lastVideoWatchedAt: new Date(),
    })
    .where(eq(onboardingProgress.userId, userId));
}

/**
 * Update email sequence step
 */
export async function updateEmailSequenceStep(userId: number, step: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(onboardingProgress)
    .set({
      emailSequenceStep: step,
      lastEmailSentAt: new Date(),
    })
    .where(eq(onboardingProgress.userId, userId));
}

/**
 * Initialize user segment
 */
export async function initializeUserSegment(userId: number, planId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const segmentMap: Record<string, "free_trial" | "starter" | "pro" | "enterprise" | "churned" | "at_risk"> = {
      starter: "starter",
      pro: "pro",
      enterprise: "enterprise",
      license: "enterprise",
    };

    const segment = (segmentMap[planId] || "free_trial") as "free_trial" | "starter" | "pro" | "enterprise" | "churned" | "at_risk";
    
    await db.insert(userSegments).values({
      userId,
      segment,
      engagementLevel: "medium",
      loginCount: 0,
      monthlyActiveUsers: 0,
    });
  } catch (error) {
    // User already has segment
  }
}

/**
 * Update user segment
 */
export async function updateUserSegment(
  userId: number,
  updates: {
    segment?: "free_trial" | "starter" | "pro" | "enterprise" | "churned" | "at_risk";
    industry?: string;
    companySize?: "solo" | "small" | "medium" | "large" | "enterprise";
    useCase?: string;
    engagementLevel?: "low" | "medium" | "high";
    loginCount?: number;
    monthlyActiveUsers?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const safeUpdates: any = updates;
  await db.update(userSegments).set(safeUpdates).where(eq(userSegments.userId, userId));
}

/**
 * Get user segment
 */
export async function getUserSegment(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(userSegments).where(eq(userSegments.userId, userId)).limit(1);
  return result[0] || null;
}

/**
 * Get onboarding completion stats
 */
export async function getOnboardingStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const allProgress = await db.select().from(onboardingProgress);

  const stats: any = {
    totalUsers: allProgress.length,
    completedOnboarding: allProgress.filter((p: any) => p.completedAt).length,
    completionRate: 0,
    avgCompletionPercentage: 0,
    viewedOnboarding: allProgress.filter((p: any) => p.viewedOnboarding).length,
    createdFirstAgent: allProgress.filter((p: any) => p.createdFirstAgent).length,
    configuredFirstIntegration: allProgress.filter((p: any) => p.configuredFirstIntegration).length,
    completedFirstAction: allProgress.filter((p: any) => p.completedFirstAction).length,
    avgVideosWatched: 0,
  };

  if (stats.totalUsers > 0) {
    stats.completionRate = Math.round((stats.completedOnboarding / stats.totalUsers) * 100);
    stats.avgCompletionPercentage = Math.round(
      allProgress.reduce((sum: number, p: any) => sum + p.completionPercentage, 0) / stats.totalUsers
    );
    stats.avgVideosWatched = Math.round(
      allProgress.reduce((sum: number, p: any) => sum + p.videosWatched, 0) / stats.totalUsers
    );
  }

  return stats;
}
