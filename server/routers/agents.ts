/**
 * Agents router - manage autonomous agents and their actions
 */

import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { agents, actions, actionLogs } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

export const agentsRouter = router({
  /**
   * List all agents for the current user
   */
  listAgents: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userAgents = await db
        .select()
        .from(agents)
        .where(eq(agents.userId, ctx.user.id))
        .orderBy(agents.name);

      return userAgents.map((agent) => ({
        ...agent,
        capabilities: agent.capabilities ? JSON.parse(agent.capabilities) : [],
        permissions: agent.permissions ? JSON.parse(agent.permissions) : [],
      }));
    } catch (error) {
      console.error("[Agents] Error listing agents:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list agents",
      });
    }
  }),

  /**
   * Get a specific agent by ID
   */
  getAgent: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const agent = await db
          .select()
          .from(agents)
          .where(
            and(
              eq(agents.id, input.agentId),
              eq(agents.userId, ctx.user.id)
            )
          )
          .limit(1);

        if (!agent.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agent not found",
          });
        }

        const agentData = agent[0];
        return {
          ...agentData,
          capabilities: agentData.capabilities
            ? JSON.parse(agentData.capabilities)
            : [],
          permissions: agentData.permissions
            ? JSON.parse(agentData.permissions)
            : [],
        };
      } catch (error) {
        console.error("[Agents] Error getting agent:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get agent",
        });
      }
    }),

  /**
   * List recent actions for all agents
   */
  listRecentActions: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        agentId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        let query = db
          .select()
          .from(actions)
          .where(eq(actions.userId, ctx.user.id));

        if (input.agentId) {
          query = db
            .select()
            .from(actions)
            .where(
              and(
                eq(actions.userId, ctx.user.id),
                eq(actions.agentId, input.agentId)
              )
            );
        }

        const recentActions = await query
          .orderBy(desc(actions.createdAt))
          .limit(input.limit);

        return recentActions.map((action) => ({
          ...action,
          result: action.result ? JSON.parse(action.result) : null,
          affectedMetrics: action.affectedMetrics
            ? JSON.parse(action.affectedMetrics)
            : [],
        }));
      } catch (error) {
        console.error("[Agents] Error listing actions:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list actions",
        });
      }
    }),

  /**
   * Get action details with logs
   */
  getActionWithLogs: protectedProcedure
    .input(z.object({ actionId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const action = await db
          .select()
          .from(actions)
          .where(
            and(
              eq(actions.id, input.actionId),
              eq(actions.userId, ctx.user.id)
            )
          )
          .limit(1);

        if (!action.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Action not found",
          });
        }

        const logs = await db
          .select()
          .from(actionLogs)
          .where(eq(actionLogs.actionId, input.actionId))
          .orderBy(actionLogs.createdAt);

        const actionData = action[0];
        return {
          ...actionData,
          result: actionData.result ? JSON.parse(actionData.result) : null,
          affectedMetrics: actionData.affectedMetrics
            ? JSON.parse(actionData.affectedMetrics)
            : [],
          logs: logs.map((log) => ({
            ...log,
            metadata: log.metadata ? JSON.parse(log.metadata) : null,
          })),
        };
      } catch (error) {
        console.error("[Agents] Error getting action with logs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get action details",
        });
      }
    }),

  /**
   * Get agent statistics
   */
  getAgentStats: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get agent
        const agent = await db
          .select()
          .from(agents)
          .where(
            and(
              eq(agents.id, input.agentId),
              eq(agents.userId, ctx.user.id)
            )
          )
          .limit(1);

        if (!agent.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agent not found",
          });
        }

        // Get action statistics
        const allActions = await db
          .select()
          .from(actions)
          .where(
            and(
              eq(actions.agentId, input.agentId),
              eq(actions.userId, ctx.user.id)
            )
          );

        const completedActions = allActions.filter(
          (a) => a.status === "completed"
        );
        const failedActions = allActions.filter((a) => a.status === "failed");
        const pendingActions = allActions.filter(
          (a) => a.status === "pending"
        );

        const avgDuration =
          completedActions.length > 0
            ? completedActions.reduce((sum, a) => sum + (a.durationMs || 0), 0) /
              completedActions.length
            : 0;

        return {
          agentId: input.agentId,
          totalActions: allActions.length,
          completedActions: completedActions.length,
          failedActions: failedActions.length,
          pendingActions: pendingActions.length,
          successRate:
            allActions.length > 0
              ? Math.round((completedActions.length / allActions.length) * 100)
              : 0,
          averageDurationMs: Math.round(avgDuration),
          lastActionAt:
            allActions.length > 0
              ? new Date(
                  Math.max(
                    ...allActions.map((a) => a.createdAt?.getTime() || 0)
                  )
                )
              : null,
        };
      } catch (error) {
        console.error("[Agents] Error getting agent stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get agent statistics",
        });
      }
    }),
});
