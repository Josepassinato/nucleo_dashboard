import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { getDb } from "../db";
import { ctoExecutionLogs } from "../../drizzle/schema";

interface ExecutionTask {
  id: string;
  name: string;
  command: string;
  args: string[];
  cwd: string;
  timeout: number; // milliseconds
}

interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number; // milliseconds
}

/**
 * Execute a single task
 */
export async function executeTask(
  task: ExecutionTask,
  onProgress?: (message: string, percent: number) => Promise<void>
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = "";
    let stderr = "";

    const child = spawn(task.command, task.args, {
      cwd: task.cwd,
      shell: true,
    });

    // Handle stdout
    child.stdout?.on("data", (data) => {
      const message = data.toString();
      stdout += message;
      onProgress?.(message, 50);
    });

    // Handle stderr
    child.stderr?.on("data", (data) => {
      const message = data.toString();
      stderr += message;
      onProgress?.(message, 50);
    });

    // Handle timeout
    const timeoutHandle = setTimeout(() => {
      child.kill();
      resolve({
        success: false,
        stdout,
        stderr: stderr + `\nTask timeout after ${task.timeout}ms`,
        exitCode: -1,
        duration: Date.now() - startTime,
      });
    }, task.timeout);

    // Handle completion
    child.on("close", (code) => {
      clearTimeout(timeoutHandle);
      resolve({
        success: code === 0,
        stdout,
        stderr,
        exitCode: code || 0,
        duration: Date.now() - startTime,
      });
    });
  });
}

/**
 * Execute deployment pipeline
 */
export async function executeDeploymentPipeline(
  executionId: number,
  projectPath: string,
  tasks: ExecutionTask[],
  onProgress?: (message: string, percent: number) => Promise<void>
): Promise<{
  success: boolean;
  results: ExecutionResult[];
  errors: string[];
}> {
  const results: ExecutionResult[] = [];
  const errors: string[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const percent = Math.round((i / tasks.length) * 100);

    await onProgress?.(`Starting task: ${task.name}`, percent);

    const result = await executeTask(task, async (message, _) => {
      await onProgress?.(message, percent + 10);
    });

    results.push(result);

    if (!result.success) {
      errors.push(`Task "${task.name}" failed: ${result.stderr}`);
      await onProgress?.(
        `Task failed: ${task.name}. Stopping execution.`,
        percent + 10
      );
      break;
    }

    await onProgress?.(`Task completed: ${task.name}`, percent + 10);
  }

  return {
    success: errors.length === 0,
    results,
    errors,
  };
}

/**
 * Build and test generated code
 */
export async function buildAndTest(
  projectPath: string,
  onProgress?: (message: string, percent: number) => Promise<void>
): Promise<ExecutionResult> {
  const buildTask: ExecutionTask = {
    id: "build",
    name: "Build Project",
    command: "pnpm",
    args: ["run", "build"],
    cwd: projectPath,
    timeout: 60000, // 60 seconds
  };

  await onProgress?.("Building project...", 0);
  const buildResult = await executeTask(buildTask, onProgress);

  if (!buildResult.success) {
    return buildResult;
  }

  await onProgress?.("Running tests...", 50);
  const testTask: ExecutionTask = {
    id: "test",
    name: "Run Tests",
    command: "pnpm",
    args: ["test"],
    cwd: projectPath,
    timeout: 60000,
  };

  const testResult = await executeTask(testTask, onProgress);
  await onProgress?.("Build and test complete", 100);

  return testResult;
}

/**
 * Database migration execution
 */
export async function executeMigration(
  projectPath: string,
  onProgress?: (message: string, percent: number) => Promise<void>
): Promise<ExecutionResult> {
  const migrationTask: ExecutionTask = {
    id: "migration",
    name: "Database Migration",
    command: "pnpm",
    args: ["db:push"],
    cwd: projectPath,
    timeout: 30000,
  };

  await onProgress?.("Running database migrations...", 0);
  const result = await executeTask(migrationTask, onProgress);
  await onProgress?.("Migration complete", 100);

  return result;
}

/**
 * Log execution progress to database
 */
export async function logExecutionProgress(
  executionId: number,
  level: "info" | "warning" | "error" | "success",
  message: string,
  details?: any
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(ctoExecutionLogs).values({
      executionId,
      level,
      message,
      details: details ? JSON.stringify(details) : null,
    });
  } catch (error) {
    console.error("[Execution Engine] Failed to log progress:", error);
  }
}

/**
 * Generate deployment tasks
 */
export function generateDeploymentTasks(projectPath: string): ExecutionTask[] {
  return [
    {
      id: "install",
      name: "Install Dependencies",
      command: "pnpm",
      args: ["install"],
      cwd: projectPath,
      timeout: 120000,
    },
    {
      id: "migration",
      name: "Database Migration",
      command: "pnpm",
      args: ["db:push"],
      cwd: projectPath,
      timeout: 30000,
    },
    {
      id: "build",
      name: "Build Project",
      command: "pnpm",
      args: ["run", "build"],
      cwd: projectPath,
      timeout: 60000,
    },
    {
      id: "test",
      name: "Run Tests",
      command: "pnpm",
      args: ["test"],
      cwd: projectPath,
      timeout: 60000,
    },
  ];
}
