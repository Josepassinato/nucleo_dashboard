import { invokeLLM } from "./llm";
import { storagePut } from "../storage";
import fs from "fs";
import path from "path";

interface CodeGenerationRequest {
  proposalId: number;
  architecture: string;
  features: any[];
  integrations: any[];
  executionPlan: any[];
}

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
  type: "component" | "router" | "schema" | "test" | "config";
}

/**
 * Generate code based on CTO proposal
 */
export async function generateCode(request: CodeGenerationRequest): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = [];

  // Generate schema updates if needed
  if (request.features.some((f: any) => f.name.toLowerCase().includes("database"))) {
    const schemaCode = await generateSchemaCode(request.features);
    files.push(schemaCode);
  }

  // Generate API routes/routers
  const routerCode = await generateRouterCode(request.features);
  files.push(...routerCode);

  // Generate React components
  const componentCode = await generateComponentCode(request.features);
  files.push(...componentCode);

  // Generate tests
  const testCode = await generateTestCode(request.features);
  files.push(...testCode);

  // Generate migrations if schema changed
  if (files.some((f) => f.type === "schema")) {
    const migrationCode = await generateMigrationCode(request.features);
    files.push(migrationCode);
  }

  return files;
}

/**
 * Generate Drizzle schema code
 */
async function generateSchemaCode(features: any[]): Promise<GeneratedFile> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a database schema expert. Generate Drizzle ORM schema code for the following features.
        
Return TypeScript code that:
- Uses drizzle-orm with MySQL
- Defines tables with proper types
- Includes relationships and indexes
- Follows the existing schema patterns

The code should be production-ready and follow best practices.`,
      },
      {
        role: "user",
        content: `Generate schema for these features: ${JSON.stringify(features, null, 2)}`,
      },
    ],
  });

  const content =
    typeof response.choices[0].message.content === "string"
      ? response.choices[0].message.content
      : "// Schema generation failed";

  return {
    path: "drizzle/schema-generated.ts",
    content,
    language: "typescript",
    type: "schema",
  };
}

/**
 * Generate tRPC router code
 */
async function generateRouterCode(features: any[]): Promise<GeneratedFile[]> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a tRPC expert. Generate tRPC router code for the following features.

Return TypeScript code that:
- Uses tRPC with Zod validation
- Implements protectedProcedure for authenticated endpoints
- Includes proper error handling
- Follows the existing router patterns

Generate separate routers for each major feature.`,
      },
      {
        role: "user",
        content: `Generate tRPC routers for these features: ${JSON.stringify(features, null, 2)}`,
      },
    ],
  });

  const content =
    typeof response.choices[0].message.content === "string"
      ? response.choices[0].message.content
      : "// Router generation failed";

  return [
    {
      path: "server/routers/generated.ts",
      content,
      language: "typescript",
      type: "router",
    },
  ];
}

/**
 * Generate React component code
 */
async function generateComponentCode(features: any[]): Promise<GeneratedFile[]> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a React expert. Generate React component code for the following features.

Return TypeScript/JSX code that:
- Uses React 19 with hooks
- Integrates with tRPC for data fetching
- Uses Tailwind CSS for styling
- Uses shadcn/ui components
- Includes proper loading and error states
- Follows the existing component patterns

Generate separate components for each feature.`,
      },
      {
        role: "user",
        content: `Generate React components for these features: ${JSON.stringify(features, null, 2)}`,
      },
    ],
  });

  const content =
    typeof response.choices[0].message.content === "string"
      ? response.choices[0].message.content
      : "// Component generation failed";

  return [
    {
      path: "client/src/pages/Generated.tsx",
      content,
      language: "typescript",
      type: "component",
    },
  ];
}

/**
 * Generate test code
 */
async function generateTestCode(features: any[]): Promise<GeneratedFile[]> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a testing expert. Generate Vitest test code for the following features.

Return TypeScript code that:
- Uses Vitest for unit testing
- Tests tRPC procedures
- Tests React components
- Includes mocking where needed
- Covers happy path and error cases
- Follows the existing test patterns`,
      },
      {
        role: "user",
        content: `Generate tests for these features: ${JSON.stringify(features, null, 2)}`,
      },
    ],
  });

  const content =
    typeof response.choices[0].message.content === "string"
      ? response.choices[0].message.content
      : "// Test generation failed";

  return [
    {
      path: "server/generated.test.ts",
      content,
      language: "typescript",
      type: "test",
    },
  ];
}

/**
 * Generate migration code
 */
async function generateMigrationCode(features: any[]): Promise<GeneratedFile> {
  const timestamp = Date.now();
  const migrationName = `${timestamp}_generated_migration`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a database migration expert. Generate a Drizzle migration SQL for the following features.

Return SQL code that:
- Creates new tables
- Adds columns to existing tables
- Creates indexes
- Handles relationships
- Is idempotent and safe`,
      },
      {
        role: "user",
        content: `Generate migration for these features: ${JSON.stringify(features, null, 2)}`,
      },
    ],
  });

  const content =
    typeof response.choices[0].message.content === "string"
      ? response.choices[0].message.content
      : "-- Migration generation failed";

  return {
    path: `drizzle/migrations/${migrationName}.sql`,
    content,
    language: "sql",
    type: "config",
  };
}

/**
 * Save generated files to project
 */
export async function saveGeneratedFiles(files: GeneratedFile[], projectPath: string): Promise<void> {
  for (const file of files) {
    const filePath = path.join(projectPath, file.path);
    const dirPath = path.dirname(filePath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, file.content, "utf-8");
    console.log(`[Code Generator] Generated file: ${file.path}`);
  }
}

/**
 * Validate generated code
 */
export async function validateGeneratedCode(files: GeneratedFile[]): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  for (const file of files) {
    // Basic validation
    if (!file.content || file.content.length === 0) {
      errors.push(`File ${file.path} is empty`);
    }

    if (file.language === "typescript") {
      // Check for common TypeScript patterns
      if (!file.content.includes("export")) {
        errors.push(`File ${file.path} doesn't export anything`);
      }
    }

    if (file.language === "sql") {
      // Check for SQL syntax
      if (!file.content.match(/CREATE|ALTER|DROP/i)) {
        errors.push(`File ${file.path} doesn't contain valid SQL`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
