import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const configSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().default(4000),
  host: z.string().default('0.0.0.0'),
  
  databaseUrl: z.string().min(1, 'DATABASE_URL is required'),
  redisUrl: z.string().min(1, 'REDIS_URL is required'),
  
  repositoryWorkspace: z.string().default('/tmp/repo-doctor'),
  
  corsOrigin: z.string().default('http://localhost:5173'),
  
  maxRepositoryFiles: z.coerce.number().default(100000),
  maxFileSizeBytes: z.coerce.number().default(5 * 1024 * 1024), // 5MB
  maxTotalSizeBytes: z.coerce.number().default(500 * 1024 * 1024), // 500MB
  cloneTimeoutMs: z.coerce.number().default(300000), // 5 minutes
  
  // AI Configuration
  aiEnabled: z.coerce.boolean().default(false),
  openaiApiKey: z.string().optional(),
  anthropicApiKey: z.string().optional(),
  googleApiKey: z.string().optional(),
  defaultAiProvider: z.enum(['openai', 'anthropic', 'google']).default('openai'),
  aiModelRouterEnabled: z.coerce.boolean().default(true),
  maxTokensPerScan: z.coerce.number().default(100000),
  maxAiCostPerScanUsd: z.coerce.number().default(1.0),
  
  // Scanner Configuration
  scannersEnabled: z.string().default('security,quality,dependency'),
  scannerConcurrency: z.coerce.number().default(3),
  scannerTimeoutMs: z.coerce.number().default(60000),
  
  // Health Score
  healthScoreEnabled: z.coerce.boolean().default(true),
});

export type Config = z.infer<typeof configSchema>;

function loadConfig(): Config {
  try {
    return configSchema.parse({
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      host: process.env.HOST,
      databaseUrl: process.env.DATABASE_URL,
      redisUrl: process.env.REDIS_URL,
      repositoryWorkspace: process.env.REPOSITORY_WORKSPACE,
      corsOrigin: process.env.CORS_ORIGIN,
      maxRepositoryFiles: process.env.MAX_REPOSITORY_FILES,
      maxFileSizeBytes: process.env.MAX_FILE_SIZE_BYTES,
      maxTotalSizeBytes: process.env.MAX_TOTAL_SIZE_BYTES,
      cloneTimeoutMs: process.env.CLONE_TIMEOUT_MS,
      // AI Configuration
      aiEnabled: process.env.AI_ENABLED,
      openaiApiKey: process.env.OPENAI_API_KEY,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      googleApiKey: process.env.GOOGLE_API_KEY,
      defaultAiProvider: process.env.DEFAULT_AI_PROVIDER,
      aiModelRouterEnabled: process.env.AI_MODEL_ROUTER_ENABLED,
      maxTokensPerScan: process.env.MAX_TOKENS_PER_SCAN,
      maxAiCostPerScanUsd: process.env.MAX_AI_COST_PER_SCAN_USD,
      // Scanner Configuration
      scannersEnabled: process.env.SCANNERS_ENABLED,
      scannerConcurrency: process.env.SCANNER_CONCURRENCY,
      scannerTimeoutMs: process.env.SCANNER_TIMEOUT_MS,
      // Health Score
      healthScoreEnabled: process.env.HEALTH_SCORE_ENABLED,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

export const config = loadConfig();
