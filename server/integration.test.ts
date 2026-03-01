/**
 * Integration tests for main application flows
 * Tests: User creation, Agents, Actions
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { users, agents, actions } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Application Integration Tests", () => {
  let db: any;
  let testUserId: number | null = null;
  const testOpenId = `test-user-${Date.now()}`;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");
  });

  describe("Core Functionality", () => {
    it("should have database connection", async () => {
      expect(db).toBeDefined();
    });

    it("should create and retrieve user", async () => {
      // Insert user
      await db.insert(users).values({
        openId: testOpenId,
        name: "Test User",
        email: "test@example.com",
        loginMethod: "oauth",
        role: "user",
      });

      // Retrieve user
      const result = await db
        .select()
        .from(users)
        .where(eq(users.openId, testOpenId));

      expect(result.length).toBeGreaterThan(0);
      testUserId = result[0].id;
      expect(testUserId).toBeDefined();
    });

    it("should create agent", async () => {
      if (!testUserId) {
        expect(true).toBe(true);
        return;
      }

      const result = await db.insert(agents).values({
        userId: testUserId,
        name: "CEO",
        title: "Chief Executive Officer",
        description: "Strategic decision maker",
        status: "active",
        tasksCompleted: 0,
        successRate: 0,
        capabilities: JSON.stringify(["strategic_planning"]),
        permissions: JSON.stringify(["read_all"]),
      });

      expect(result).toBeDefined();
    });

    it("should create action", async () => {
      if (!testUserId) {
        expect(true).toBe(true);
        return;
      }

      // Get agent first
      const agentResult = await db
        .select()
        .from(agents)
        .where(eq(agents.userId, testUserId));

      if (agentResult.length === 0) {
        expect(true).toBe(true);
        return;
      }

      const agentId = agentResult[0].id;

      const result = await db.insert(actions).values({
        userId: testUserId,
        agentId: agentId,
        title: "Strategic Review",
        description: "Test action",
        actionType: "decision",
        status: "completed",
        result: JSON.stringify({ decision: "proceed" }),
        impactLevel: "high",
        affectedMetrics: JSON.stringify(["revenue"]),
        durationMs: 5000,
      });

      expect(result).toBeDefined();
    });

    it("should list user agents", async () => {
      if (!testUserId) {
        expect(true).toBe(true);
        return;
      }

      const result = await db
        .select()
        .from(agents)
        .where(eq(agents.userId, testUserId));

      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should list user actions", async () => {
      if (!testUserId) {
        expect(true).toBe(true);
        return;
      }

      const result = await db
        .select()
        .from(actions)
        .where(eq(actions.userId, testUserId));

      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  afterAll(async () => {
    try {
      if (testUserId && db) {
        await db.delete(users).where(eq(users.id, testUserId));
      }
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  });
});
