import { getDb } from "../db";
import { llmSkills, llmRoutes, llmInvocations, llmRouterConfig } from "../../drizzle/schema";
import { eq, and, desc, lte } from "drizzle-orm";

export type RoutingStrategy = "cost" | "speed" | "quality" | "balanced";

interface LLMRoute {
  id: number;
  skillId: number;
  modelName: string;
  provider: string;
  costPer1kTokens: number;
  avgLatencyMs: number | null;
  qualityScore: number | null;
  isActive: boolean | null;
  priority: number | null;
}

interface RoutingDecision {
  routeId: number;
  modelName: string;
  provider: string;
  reason: string;
  estimatedCostPer1kTokens: number;
  estimatedLatencyMs: number | null;
  qualityScore: number | null;
}

/**
 * Select best LLM route based on strategy
 */
export async function selectBestRoute(
  skillName: string,
  userId: number,
  strategy?: RoutingStrategy
): Promise<RoutingDecision | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Get skill
    const skill = await db
      .select()
      .from(llmSkills)
      .where(eq(llmSkills.name, skillName))
      .limit(1)
      .then((results) => results[0] || null);

    if (!skill) {
      console.error(`[LLM Router] Skill not found: ${skillName}`);
      return null;
    }

    // Get user's routing strategy
    let routingStrategy = strategy;
    if (!routingStrategy) {
      const config = await db
        .select()
        .from(llmRouterConfig)
        .where(
          and(
            eq(llmRouterConfig.userId, userId),
            eq(llmRouterConfig.skillId, skill.id)
          )
        )
        .limit(1)
        .then((results) => results[0] || null);

      routingStrategy = (config?.strategy || "balanced") as RoutingStrategy;
    }

    // Get available routes for this skill
    const routes = await db
      .select()
      .from(llmRoutes)
      .where(
        and(
          eq(llmRoutes.skillId, skill.id),
          eq(llmRoutes.isActive, true)
        )
      )
      .orderBy(desc(llmRoutes.priority));

    if (routes.length === 0) {
      console.error(`[LLM Router] No active routes for skill: ${skillName}`);
      return null;
    }

    // Select route based on strategy
    const selectedRoute = selectRouteByStrategy(
      routes,
      routingStrategy,
      userId
    );

    if (!selectedRoute) {
      console.error(`[LLM Router] Could not select route for skill: ${skillName}`);
      return null;
    }

    return {
      routeId: selectedRoute.id,
      modelName: selectedRoute.modelName,
      provider: selectedRoute.provider,
      reason: `Selected via ${routingStrategy} strategy`,
      estimatedCostPer1kTokens: selectedRoute.costPer1kTokens,
      estimatedLatencyMs: selectedRoute.avgLatencyMs,
      qualityScore: selectedRoute.qualityScore,
    };
  } catch (error) {
    console.error("[LLM Router] Error selecting route:", error);
    return null;
  }
}

/**
 * Select route based on strategy
 */
function selectRouteByStrategy(
  routes: LLMRoute[],
  strategy: RoutingStrategy,
  userId: number
): LLMRoute | null {
  switch (strategy) {
    case "cost":
      // Sort by cost (ascending)
      return routes.sort((a, b) => a.costPer1kTokens - b.costPer1kTokens)[0];

    case "speed":
      // Sort by latency (ascending)
      const speedRoutes = routes.filter((r) => r.avgLatencyMs !== null);
      return speedRoutes.sort((a, b) => (a.avgLatencyMs || 0) - (b.avgLatencyMs || 0))[0] || routes[0];

    case "quality":
      // Sort by quality score (descending)
      const qualityRoutes = routes.filter((r) => r.qualityScore !== null);
      return qualityRoutes.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0))[0] || routes[0];

    case "balanced":
    default:
      // Weighted score: 40% quality, 30% cost, 30% speed
      const scoredRoutes = routes.map((route) => {
        const qualityScore = (route.qualityScore || 50) / 100; // Normalize 0-1
        const costScore = 1 - Math.min(route.costPer1kTokens / 0.02, 1); // Normalize, assume max 0.02 per 1k tokens
        const speedScore = route.avgLatencyMs ? 1 - Math.min(route.avgLatencyMs / 5000, 1) : 0.5; // Normalize, assume max 5s

        const finalScore = qualityScore * 0.4 + costScore * 0.3 + speedScore * 0.3;
        return { route, score: finalScore };
      });

      scoredRoutes.sort((a, b) => b.score - a.score);
      return scoredRoutes[0]?.route || routes[0];
  }
}

/**
 * Track LLM invocation for cost and performance analysis
 */
export async function trackInvocation(
  userId: number,
  skillId: number,
  routeId: number,
  modelUsed: string,
  inputTokens: number,
  outputTokens: number,
  latencyMs: number,
  success: boolean,
  errorMessage?: string,
  qualityRating?: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const totalTokens = inputTokens + outputTokens;

    // Get route to calculate cost
    const route = await db
      .select()
      .from(llmRoutes)
      .where(eq(llmRoutes.id, routeId))
      .limit(1)
      .then((results) => results[0] || null);

    if (!route) return;

    const costUSD = Math.round((totalTokens / 1000) * route.costPer1kTokens);

    // Insert invocation record
    await db.insert(llmInvocations).values({
      userId,
      skillId,
      routeId,
      modelUsed,
      inputTokens,
      outputTokens,
      totalTokens,
      costUSD,
      latencyMs,
      success,
      errorMessage,
      qualityRating,
    });

    console.log(`[LLM Router] Tracked invocation: ${modelUsed} (${totalTokens} tokens, $${(costUSD / 100).toFixed(4)})`);
  } catch (error) {
    console.error("[LLM Router] Error tracking invocation:", error);
  }
}

/**
 * Get cost analytics for a skill
 */
export async function getCostAnalytics(
  skillId: number,
  period: "daily" | "weekly" | "monthly" = "monthly"
): Promise<any> {
  const db = await getDb();
  if (!db) return null;

  try {
    const analytics = await db
      .select()
      .from(llmCostAnalytics)
      .where(eq(llmCostAnalytics.skillId, skillId))
      .orderBy(desc(llmCostAnalytics.date))
      .limit(12);

    return analytics;
  } catch (error) {
    console.error("[LLM Router] Error getting cost analytics:", error);
    return null;
  }
}

/**
 * Get routing recommendations
 */
export async function getRoutingRecommendations(
  skillId: number
): Promise<{
  currentStrategy: RoutingStrategy;
  recommendation: string;
  potentialSavings: number;
  suggestedRoute: string;
} | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Get recent invocations
    const invocations = await db
      .select()
      .from(llmInvocations)
      .where(eq(llmInvocations.skillId, skillId))
      .orderBy(desc(llmInvocations.createdAt))
      .limit(100);

    if (invocations.length === 0) {
      return null;
    }

    // Calculate metrics
    const totalCost = invocations.reduce((sum, inv) => sum + (inv.costUSD || 0), 0);
    const avgQuality = invocations.reduce((sum, inv) => sum + (inv.qualityRating || 3), 0) / invocations.length;
    const successRate = invocations.filter((inv) => inv.success).length / invocations.length;

    // Get available routes
    const routes = await db
      .select()
      .from(llmRoutes)
      .where(
        and(
          eq(llmRoutes.skillId, skillId),
          eq(llmRoutes.isActive, true)
        )
      );

    // Find cheapest route with acceptable quality
    const cheapestRoute = routes
      .filter((r) => (r.qualityScore || 0) >= avgQuality * 80) // At least 80% of current quality
      .sort((a, b) => a.costPer1kTokens - b.costPer1kTokens)[0];

    const potentialSavings = cheapestRoute
      ? Math.round((totalCost * 0.2)) // Estimate 20% savings
      : 0;

    return {
      currentStrategy: "balanced",
      recommendation:
        successRate < 0.95
          ? "Consider switching to higher quality model"
          : cheapestRoute
          ? `Switch to ${cheapestRoute.modelName} to save costs`
          : "Current routing is optimal",
      potentialSavings,
      suggestedRoute: cheapestRoute?.modelName || "N/A",
    };
  } catch (error) {
    console.error("[LLM Router] Error getting recommendations:", error);
    return null;
  }
}

// Import for type safety
import { llmCostAnalytics } from "../../drizzle/schema";
