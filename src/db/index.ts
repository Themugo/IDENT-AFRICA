/**
 * Database Connection Layer
 * PostgreSQL connection pool with fallback to mock data
 */

import { Pool, PoolClient, QueryResult } from 'pg';

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Connection pool settings
const poolConfig = {
  connectionString: DATABASE_URL,
  ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create pool only if DATABASE_URL is provided
const pool = DATABASE_URL ? new Pool(poolConfig) : null;

// Track connection state
let isConnected = false;

/**
 * Initialize database connection
 */
export async function initDatabase(): Promise<boolean> {
  if (!pool) {
    console.log('[DB] No DATABASE_URL configured, using mock data mode');
    return false;
  }

  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    isConnected = true;
    console.log('[DB] PostgreSQL connected successfully');
    return true;
  } catch (error) {
    console.error('[DB] PostgreSQL connection failed:', error);
    isConnected = false;
    return false;
  }
}

/**
 * Execute a query with parameters
 */
export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  if (!pool) {
    throw new Error('Database not configured');
  }
  
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  
  if (NODE_ENV !== 'production') {
    console.log(`[DB] Query executed in ${duration}ms: ${text.substring(0, 100)}`);
  }
  
  return result;
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  if (!pool) {
    throw new Error('Database not configured');
  }
  return pool.connect();
}

/**
 * Execute a transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check if database is connected
 */
export function isDatabaseConnected(): boolean {
  return isConnected;
}

/**
 * Close all connections
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    isConnected = false;
    console.log('[DB] Database connections closed');
  }
}

/**
 * Health check for database
 */
export async function healthCheck(): Promise<{
  connected: boolean;
  latency?: number;
  error?: string;
}> {
  if (!pool) {
    return { connected: false, error: 'No database configured' };
  }

  try {
    const start = Date.now();
    await pool.query('SELECT 1');
    return {
      connected: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Re-export types
export type { Pool, PoolClient, QueryResult } from 'pg';
