/**
 * Database Connection Layer
 * 
 * This module provides database connection management.
 * In production, connect to PostgreSQL using the DATABASE_URL environment variable.
 * For local development, use mock data (defined in src/data/).
 */

import { Pool, PoolConfig } from 'pg';

// Database configuration
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool (lazy initialization)
let pool: Pool | null = null;

export function getPool(): Pool | null {
  if (process.env.DATABASE_URL && !pool) {
    try {
      pool = new Pool(poolConfig);
      console.log('Database pool created');
    } catch (error) {
      console.error('Failed to create database pool:', error);
    }
  }
  return pool;
}

// Check if database is connected
export async function isConnected(): Promise<boolean> {
  const dbPool = getPool();
  if (!dbPool) return false;
  
  try {
    const client = await dbPool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch {
    return false;
  }
}

// Execute a query with parameters
export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number }> {
  const dbPool = getPool();
  if (!dbPool) {
    throw new Error('Database not configured. Set DATABASE_URL environment variable.');
  }
  
  const start = Date.now();
  const result = await dbPool.query(text, params);
  const duration = Date.now() - start;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Executed query', { text: text.substring(0, 100), duration, rows: result.rowCount });
  }
  
  return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
}

// Close all connections
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database pool closed');
  }
}

// Database health check for monitoring
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy' | 'not_configured';
  latency?: number;
  error?: string;
}> {
  if (!process.env.DATABASE_URL) {
    return { status: 'not_configured' };
  }
  
  const start = Date.now();
  try {
    const connected = await isConnected();
    const latency = Date.now() - start;
    
    return connected 
      ? { status: 'healthy', latency }
      : { status: 'unhealthy', latency, error: 'Connection failed' };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export default { getPool, isConnected, query, closePool, healthCheck };
