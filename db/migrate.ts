import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import ws from 'ws';

// Configure WebSocket constructor
neonConfig.webSocketConstructor = ws;

// Load environment variables
dotenv.config({ path: '.env.development' });
if (!process.env.DATABASE_URL) {
  dotenv.config(); // Try loading from .env if .env.development doesn't exist
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  console.log('Running migrations...');
  
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });
  const db = drizzle(pool);

  try {
    await migrate(db, { migrationsFolder: './db/migrations' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 