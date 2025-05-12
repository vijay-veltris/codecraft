import dotenv from 'dotenv';
// Load environment variables from .env.development or .env
dotenv.config({ path: '.env.development' });
if (!process.env.DATABASE_URL) {
  dotenv.config(); // Try loading from .env if .env.development doesn't exist
}

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon to use WebSocket
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = true;
neonConfig.pipelineConnect = false;

// Handle WebSocket errors
process.on('unhandledRejection', (error: any) => {
  if (error.message?.includes('WebSocket')) {
    console.warn('WebSocket connection error:', error.message);
    return;
  }
  throw error;
});

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a pool with Neon-specific configuration
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
  max: 1, // Use a single connection for serverless
  idleTimeoutMillis: 0, // Disable idle timeout
  connectionTimeoutMillis: 5000, // 5 second timeout
});

// Create the database instance
export const db = drizzle(pool, { schema });