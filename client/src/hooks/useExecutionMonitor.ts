import { useEffect, useState, useCallback, useRef } from 'react';
import { trpc } from '@/lib/trpc';

interface UseExecutionMonitorOptions {
  executionId?: number;
  pollInterval?: number;
  useWebSocket?: boolean;
}

export function useExecutionMonitor({
  executionId,
  pollInterval = 2000,
  useWebSocket = true,
}: UseExecutionMonitorOptions) {
  const [execution, setExecution] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all executions
  const { data: executionData, refetch } = trpc.ceoAgent.getExecutions.useQuery(
    undefined,
    { staleTime: 1000 }
  );

  // Filter to get the specific execution
  const currentExecution = executionData?.find((e) => e.id === executionId);

  // Update local state when data changes
  useEffect(() => {
    if (currentExecution) {
      setExecution(currentExecution);
      setIsLoading(false);
    }
  }, [currentExecution]);

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!useWebSocket || !executionId) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/execution-monitor/${executionId}`;
      
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[ExecutionMonitor] WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setExecution(data);
          setError(null);
        } catch (err) {
          console.error('[ExecutionMonitor] Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('[ExecutionMonitor] WebSocket error:', error);
        setIsConnected(false);
        startPolling();
      };

      ws.onclose = () => {
        console.log('[ExecutionMonitor] WebSocket closed');
        setIsConnected(false);
        startPolling();
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[ExecutionMonitor] Failed to connect WebSocket:', err);
      setError('Failed to connect to real-time updates');
      startPolling();
    }
  }, [executionId, useWebSocket]);

  // Polling fallback
  const startPolling = useCallback(() => {
    if (!executionId) return;

    const poll = async () => {
      try {
        await refetch();
        
        // Continue polling if execution is still running
        const current = executionData?.find((e) => e.id === executionId);
        if (current?.phase !== null && current?.phase !== undefined) {
          pollTimeoutRef.current = setTimeout(poll, pollInterval);
        }
      } catch (err) {
        console.error('[ExecutionMonitor] Polling error:', err);
        setError('Failed to fetch execution status');
      }
    };

    pollTimeoutRef.current = setTimeout(poll, pollInterval);
  }, [executionId, refetch, executionData, pollInterval]);

  // Initialize connection
  useEffect(() => {
    if (!executionId) return;

    setIsLoading(true);
    
    if (useWebSocket) {
      connectWebSocket();
    } else {
      startPolling();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [executionId, useWebSocket, connectWebSocket, startPolling]);

  // Manual refetch
  const manualRefetch = useCallback(async () => {
    setIsLoading(true);
    try {
      await refetch();
      setError(null);
    } catch (err) {
      setError('Failed to refresh execution status');
    } finally {
      setIsLoading(false);
    }
  }, [refetch]);

  // Rollback execution
  const rollback = trpc.ceoAgent.rollbackExecution.useMutation({
    onSuccess: () => {
      manualRefetch();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  return {
    execution,
    isLoading,
    error,
    isConnected,
    refetch: manualRefetch,
    rollback: rollback.mutate,
    isRollingBack: rollback.isPending,
  };
}
