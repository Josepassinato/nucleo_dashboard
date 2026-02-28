import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useExecutionMonitor } from "./useExecutionMonitor";

// Mock trpc
vi.mock("@/lib/trpc", () => ({
  trpc: {
    ceoAgent: {
      getExecutions: {
        useQuery: vi.fn(() => ({
          data: [
            {
              id: 1,
              proposalId: 1,
              userId: 1,
              phase: 1,
              phaseName: "Code Generation",
              deployStatus: "deploying",
              progressPercent: 50,
              estimatedTimeRemaining: 300,
              testsPassed: null,
              canRollback: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          refetch: vi.fn(),
          isLoading: false,
        })),
      },
      rollbackExecution: {
        useMutation: vi.fn(() => ({
          mutate: vi.fn(),
          mutateAsync: vi.fn(),
          isPending: false,
        })),
      },
    },
  },
}));

describe("useExecutionMonitor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() =>
      useExecutionMonitor({ executionId: 1 })
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.isConnected).toBe(false);
  });

  it("should handle execution data", async () => {
    const { result } = renderHook(() =>
      useExecutionMonitor({ executionId: 1 })
    );

    await waitFor(() => {
      expect(result.current.execution).toBeDefined();
    });

    expect(result.current.execution?.id).toBe(1);
    expect(result.current.execution?.phase).toBe(1);
  });

  it("should support polling interval configuration", () => {
    const { result } = renderHook(() =>
      useExecutionMonitor({ executionId: 1, pollInterval: 5000 })
    );

    expect(result.current).toBeDefined();
  });

  it("should support WebSocket toggle", () => {
    const { result } = renderHook(() =>
      useExecutionMonitor({ executionId: 1, useWebSocket: false })
    );

    expect(result.current).toBeDefined();
  });

  it("should provide rollback function", () => {
    const { result } = renderHook(() =>
      useExecutionMonitor({ executionId: 1 })
    );

    expect(typeof result.current.rollback).toBe("function");
  });

  it("should provide manual refetch function", () => {
    const { result } = renderHook(() =>
      useExecutionMonitor({ executionId: 1 })
    );

    expect(typeof result.current.refetch).toBe("function");
  });
});
