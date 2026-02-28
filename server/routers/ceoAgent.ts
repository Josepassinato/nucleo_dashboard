import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { ceoDirectives, ctoProposals, ctoExecutions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

export const ceoAgentRouter = router({
  /**
   * Get all directives for current user
   */
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

  /**
   * Send directive (text or audio)
   */
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
        // Save directive
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

  /**
   * Generate proposal from directive
   */
  generateProposal: protectedProcedure
    .input(z.object({ directiveId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Get directive
        const directive = await db
          .select()
          .from(ceoDirectives)
          .where(eq(ceoDirectives.id, input.directiveId))
          .limit(1)
          .then((results) => results[0] || null);

        if (!directive) throw new Error("Directive not found");

        // Generate proposal with LLM
        const proposal = await generateCTOProposal(directive.directive);

        // Save proposal
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

  /**
   * Approve proposal and start execution
   */
  approveProposal: protectedProcedure
    .input(z.object({ proposalId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Update proposal status
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
});

/**
 * Generate CTO proposal using LLM
 */
async function generateCTOProposal(directive: string) {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a CTO (Chief Technology Officer) AI. Analyze the business directive and create a detailed technical proposal.
        
Return a JSON response with:
{
  "architecture": "Technical architecture description",
  "integrations": [
    {
      "name": "Integration name",
      "purpose": "What it does",
      "complexity": "Low/Medium/High",
      "estimatedHours": number
    }
  ],
  "features": [
    {
      "name": "Feature name",
      "description": "Feature description",
      "estimatedHours": number
    }
  ],
  "executionPlan": [
    {
      "phase": number,
      "name": "Phase name",
      "tasks": ["task1", "task2"],
      "estimatedHours": number
    }
  ],
  "totalEstimatedHours": number,
  "estimatedDays": number,
  "risks": ["risk1", "risk2"],
  "recommendations": ["recommendation1", "recommendation2"]
}`,
      },
      {
        role: "user",
        content: `Business Directive: ${directive}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "cto_proposal",
        strict: true,
        schema: {
          type: "object",
          properties: {
            architecture: { type: "string" },
            integrations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  purpose: { type: "string" },
                  complexity: { type: "string" },
                  estimatedHours: { type: "number" },
                },
                required: ["name", "purpose", "complexity", "estimatedHours"],
                additionalProperties: false,
              },
            },
            features: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  estimatedHours: { type: "number" },
                },
                required: ["name", "description", "estimatedHours"],
                additionalProperties: false,
              },
            },
            executionPlan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase: { type: "number" },
                  name: { type: "string" },
                  tasks: { type: "array", items: { type: "string" } },
                  estimatedHours: { type: "number" },
                },
                required: ["phase", "name", "tasks", "estimatedHours"],
                additionalProperties: false,
              },
            },
            totalEstimatedHours: { type: "number" },
            estimatedDays: { type: "number" },
            risks: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
          },
          required: [
            "architecture",
            "integrations",
            "features",
            "executionPlan",
            "totalEstimatedHours",
            "estimatedDays",
            "risks",
            "recommendations",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }
    if (Array.isArray(content) && content.length > 0) {
      const firstContent = content[0];
      if ("text" in firstContent) {
        return JSON.parse(firstContent.text);
      }
    }
    return content;
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
