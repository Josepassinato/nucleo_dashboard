import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { ceoDirectives, ctoProposals, ctoExecutions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

export const ceoAgentRouter = router({
  getDirectives: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    try {
      const directives = await db
        .select()
        .from(ceoDirectives)
        .where(eq(ceoDirectives.userId, ctx.user.id))
        .orderBy(ceoDirectives.createdAt);
      return directives;
    } catch (error) {
      console.error("[CEO Agent] Get directives error:", error);
      return [];
    }
  }),

  sendDirective: protectedProcedure
    .input(
      z.object({
        content: z.string().max(5000),
        messageType: z.enum(["text", "audio"]),
        audioBlob: z.instanceof(Blob).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      try {
        const result = await db.insert(ceoDirectives).values({
          userId: ctx.user.id,
          directive: input.content,
          status: "pending" as const,
        });
        return { success: true, directiveId: result[0]?.insertId };
      } catch (error) {
        console.error("[CEO Agent] Send directive error:", error);
        throw error;
      }
    }),

  generateProposal: protectedProcedure
    .input(z.object({ directiveId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      try {
        const directive = await db
          .select()
          .from(ceoDirectives)
          .where(eq(ceoDirectives.id, input.directiveId))
          .limit(1)
          .then((results) => results[0] || null);
        if (!directive) throw new Error("Directive not found");
        const proposal = await generateCTOProposal(directive.directive);
        const result = await db.insert(ctoProposals).values({
          directiveId: input.directiveId,
          userId: ctx.user.id,
          architecture: proposal.architecture,
          integrations: JSON.stringify(proposal.integrations),
          features: JSON.stringify(proposal.features),
          executionPlan: JSON.stringify(proposal.executionPlan),
          totalEstimatedHours: proposal.totalEstimatedHours,
          estimatedDays: proposal.estimatedDays,
          risks: JSON.stringify(proposal.risks),
          recommendations: JSON.stringify(proposal.recommendations),
          status: "pending" as const,
        });
        return {
          id: result[0]?.insertId || 0,
          ...proposal,
        };
      } catch (error) {
        console.error("[CEO Agent] Generate proposal error:", error);
        throw error;
      }
    }),

  approveProposal: protectedProcedure
    .input(z.object({ proposalId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      try {
        await db
          .update(ctoProposals)
          .set({ status: "approved" as const, approvedAt: new Date() })
          .where(eq(ctoProposals.id, input.proposalId));
        return { success: true };
      } catch (error) {
        console.error("[CEO Agent] Approve proposal error:", error);
        throw error;
      }
    }),

  getExecutions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    try {
      const executions = await db
        .select()
        .from(ctoExecutions)
        .where(eq(ctoExecutions.userId, ctx.user.id))
        .orderBy(ctoExecutions.createdAt);
      return executions;
    } catch (error) {
      console.error("[CEO Agent] Get executions error:", error);
      return [];
    }
  }),

  rollbackExecution: protectedProcedure
    .input(z.object({ executionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      try {
        const execution = await db
          .select()
          .from(ctoExecutions)
          .where(eq(ctoExecutions.id, input.executionId))
          .limit(1)
          .then((results) => results[0] || null);
        if (!execution) throw new Error("Execution not found");
        if (!execution.canRollback) throw new Error("Rollback not available");
        await db
          .update(ctoExecutions)
          .set({ deployStatus: "failed" as const })
          .where(eq(ctoExecutions.id, input.executionId));
        return { success: true };
      } catch (error) {
        console.error("[CEO Agent] Rollback error:", error);
        throw error;
      }
    }),
});

async function generateCTOProposal(directive: string) {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a CTO. Analyze the business directive and create a detailed technical proposal.
        
Return JSON with: architecture, integrations[], features[], executionPlan[], totalEstimatedHours, estimatedDays, risks[], recommendations[]`,
      },
      {
        role: "user",
        content: `Business Directive: ${directive}`,
      },
    ],
  });

  try {
    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }
    return {
      architecture: "Standard web application",
      integrations: [],
      features: [],
      executionPlan: [],
      totalEstimatedHours: 40,
      estimatedDays: 5,
      risks: [],
      recommendations: [],
    };
  } catch (error) {
    console.error("[CEO Agent] Proposal parsing error:", error);
    return {
      architecture: "Standard web application",
      integrations: [],
      features: [],
      executionPlan: [],
      totalEstimatedHours: 40,
      estimatedDays: 5,
      risks: [],
      recommendations: [],
    };
  }
}
