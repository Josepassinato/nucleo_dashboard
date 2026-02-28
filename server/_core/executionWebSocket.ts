import { WebSocketServer, WebSocket } from 'ws';
import { Server as HTTPServer } from 'http';
import type { IncomingMessage } from 'http';
import { getDb } from '../db';
import { ctoExecutions } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

// Store active WebSocket connections
const executionConnections = new Map<number, Set<WebSocket>>();

export function setupExecutionWebSocket(httpServer: HTTPServer) {
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/api/execution-monitor',
  });

  wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
    // Extract execution ID from URL
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const executionId = parseInt(url.pathname.split('/').pop() || '0');

    if (!executionId) {
      ws.close(1008, 'Invalid execution ID');
      return;
    }

    console.log(`[ExecutionWebSocket] Client connected for execution ${executionId}`);

    // Add to connections map
    if (!executionConnections.has(executionId)) {
      executionConnections.set(executionId, new Set());
    }
    executionConnections.get(executionId)!.add(ws);

    // Send initial state
    try {
      const db = await getDb();
      if (db) {
        const execution = await db
          .select()
          .from(ctoExecutions)
          .where(eq(ctoExecutions.id, executionId))
          .limit(1)
          .then((results) => results[0]);

        if (execution) {
          ws.send(JSON.stringify(execution));
        }
      }
    } catch (error) {
      console.error('[ExecutionWebSocket] Error fetching initial state:', error);
    }

    // Handle messages
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        console.log(`[ExecutionWebSocket] Message from execution ${executionId}:`, message);
      } catch (error) {
        console.error('[ExecutionWebSocket] Error parsing message:', error);
      }
    });

    // Handle close
    ws.on('close', () => {
      console.log(`[ExecutionWebSocket] Client disconnected for execution ${executionId}`);
      const connections = executionConnections.get(executionId);
      if (connections) {
        connections.delete(ws);
        if (connections.size === 0) {
          executionConnections.delete(executionId);
        }
      }
    });

    // Handle errors
    ws.on('error', (error: Error) => {
      console.error('[ExecutionWebSocket] Error:', error);
    });
  });

  return wss;
}

// Broadcast execution update to all connected clients
export async function broadcastExecutionUpdate(executionId: number) {
  const connections = executionConnections.get(executionId);
  if (!connections || connections.size === 0) return;

  try {
    const db = await getDb();
    if (!db) return;

    const execution = await db
      .select()
      .from(ctoExecutions)
      .where(eq(ctoExecutions.id, executionId))
      .limit(1)
      .then((results) => results[0]);

    if (execution) {
      const message = JSON.stringify(execution);
      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
  } catch (error) {
    console.error('[ExecutionWebSocket] Error broadcasting update:', error);
  }
}

// Get number of connected clients for an execution
export function getConnectionCount(executionId: number): number {
  return executionConnections.get(executionId)?.size || 0;
}
