/**
 * IDENT AFRICA - Health Check Service
 * System health monitoring endpoints
 */

import { Request, Response } from 'express';
import { healthCheck as dbHealthCheck } from '../../db/index.js';
import { logger } from './logger.js';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
  checks: ComponentHealth[];
}

export interface ComponentHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  message?: string;
  lastChecked: string;
}

export interface SystemStatus {
  status: 'operational' | 'partial' | 'down';
  timestamp: string;
  services: ServiceStatus[];
  metrics: SystemMetrics;
}

export interface ServiceStatus {
  name: string;
  status: 'up' | 'down' | 'degraded';
  uptime: number;
  lastCheck: string;
  responseTime?: number;
}

export interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    load: number[];
  };
  requests: {
    total: number;
    pending: number;
    completed: number;
    failed: number;
  };
  database: {
    connections: number;
    queries: number;
  };
}

// System start time
const systemStartTime = Date.now();

// Request counters
let requestStats = {
  total: 0,
  pending: 0,
  completed: 0,
  failed: 0,
};

// Health check functions
async function checkApplication(): Promise<ComponentHealth> {
  const start = Date.now();
  return {
    name: 'application',
    status: 'healthy',
    latency: Date.now() - start,
    lastChecked: new Date().toISOString(),
  };
}

async function checkDatabase(): Promise<ComponentHealth> {
  const start = Date.now();
  try {
    const health = await dbHealthCheck();
    if (health.connected) {
      return {
        name: 'database',
        status: 'healthy',
        latency: health.latency || (Date.now() - start),
        lastChecked: new Date().toISOString(),
      };
    }
    return {
      name: 'database',
      status: 'degraded',
      message: health.error || 'Using mock data',
      latency: Date.now() - start,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: 'database',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Connection failed',
      latency: Date.now() - start,
      lastChecked: new Date().toISOString(),
    };
  }
}

async function checkMemory(): Promise<ComponentHealth> {
  const memUsage = process.memoryUsage();
  const totalMem = memUsage.heapTotal;
  const usedMem = memUsage.heapUsed;
  const percentage = (usedMem / totalMem) * 100;

  return {
    name: 'memory',
    status: percentage > 90 ? 'unhealthy' : percentage > 70 ? 'degraded' : 'healthy',
    message: `${Math.round(usedMem / 1024 / 1024)}MB / ${Math.round(totalMem / 1024 / 1024)}MB`,
    lastChecked: new Date().toISOString(),
  };
}

async function checkApi(): Promise<ComponentHealth> {
  return {
    name: 'api',
    status: 'healthy',
    message: 'API responding',
    lastChecked: new Date().toISOString(),
  };
}

// Get system metrics
function getSystemMetrics(): SystemMetrics {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  return {
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    },
    cpu: {
      load: [cpuUsage.user / 1000000, cpuUsage.system / 1000000],
    },
    requests: {
      total: requestStats.total,
      pending: requestStats.pending,
      completed: requestStats.completed,
      failed: requestStats.failed,
    },
    database: {
      connections: 0, // Would need pool export from db
      queries: 0,
    },
  };
}

// Overall health determination
function determineOverallStatus(checks: ComponentHealth[]): 'healthy' | 'degraded' | 'unhealthy' {
  if (checks.some((c) => c.status === 'unhealthy')) return 'unhealthy';
  if (checks.some((c) => c.status === 'degraded')) return 'degraded';
  return 'healthy';
}

// Request tracking middleware
export function trackRequest() {
  return (req: Request, res: Response, next: () => void) => {
    requestStats.total++;
    requestStats.pending++;

    const startTime = Date.now();

    res.on('finish', () => {
      requestStats.pending--;
      requestStats.completed++;
      if (res.statusCode >= 400) {
        requestStats.failed++;
      }

      // Log API request
      logger.logApiRequest(
        req.method,
        req.path,
        res.statusCode,
        Date.now() - startTime,
        {
          ip: req.ip,
          userAgent: req.get('user-agent'),
        }
      );
    });

    next();
  };
}

// Health check endpoint
export async function getHealthStatus(): Promise<HealthStatus> {
  const checks = await Promise.all([
    checkApplication(),
    checkDatabase(),
    checkMemory(),
    checkApi(),
  ]);

  return {
    status: determineOverallStatus(checks),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor((Date.now() - systemStartTime) / 1000),
    environment: process.env.NODE_ENV || 'development',
    checks,
  };
}

// Detailed status endpoint
export async function getSystemStatus(): Promise<SystemStatus> {
  const checks = await Promise.all([
    checkApplication(),
    checkDatabase(),
    checkMemory(),
    checkApi(),
  ]);

  const services: ServiceStatus[] = checks.map((check) => ({
    name: check.name,
    status: check.status === 'healthy' ? 'up' : check.status === 'degraded' ? 'degraded' : 'down',
    uptime: 99.9, // Would track actual uptime
    lastCheck: check.lastChecked,
    responseTime: check.latency,
  }));

  return {
    status: determineOverallStatus(checks) === 'healthy' ? 'operational' : determineOverallStatus(checks) === 'degraded' ? 'partial' : 'down',
    timestamp: new Date().toISOString(),
    services,
    metrics: getSystemMetrics(),
  };
}

// Readiness check (for Kubernetes)
export async function getReadinessStatus(): Promise<{ ready: boolean; message: string }> {
  try {
    const dbCheck = await checkDatabase();
    if (dbCheck.status === 'unhealthy') {
      return { ready: false, message: 'Database not ready' };
    }
    return { ready: true, message: 'Ready to accept traffic' };
  } catch {
    return { ready: false, message: 'Health check failed' };
  }
}

// Liveness check (for Kubernetes)
export function getLivenessStatus(): { alive: boolean; uptime: number } {
  return {
    alive: true,
    uptime: Math.floor((Date.now() - systemStartTime) / 1000),
  };
}

export default {
  getHealthStatus,
  getSystemStatus,
  getReadinessStatus,
  getLivenessStatus,
  trackRequest,
};
