/**
 * IDENT AFRICA - Structured Logging Service
 * Centralized logging with user actions, system events, and errors
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export enum LogCategory {
  USER_ACTION = 'user_action',
  SYSTEM_EVENT = 'system_event',
  ERROR = 'error',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  API = 'api',
  DATABASE = 'database',
  PAYMENT = 'payment',
  AUTH = 'auth',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
  duration?: number;
  statusCode?: number;
}

export interface UserActionLog {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
  timestamp: string;
  success: boolean;
  metadata?: Record<string, unknown>;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private isProduction = process.env.NODE_ENV === 'production';
  private logToConsole = true;

  constructor() {
    if (this.isProduction) {
      this.initializeProductionLogger();
    }
  }

  private initializeProductionLogger(): void {
    // In production, logs would be sent to a logging service
    // Example: Winston, Pino, or cloud services like Datadog, CloudWatch
  }

  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    metadata?: Record<string, unknown>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      ...metadata,
    };
  }

  // Public method for external logging
  public writeLog(entry: LogEntry): void {
    // Add to in-memory logs (for debugging)
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output
    if (this.logToConsole) {
      this.outputToConsole(entry);
    }

    // In production, send to external service
    if (this.isProduction) {
      this.sendToExternalService(entry);
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`;
    const meta = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
    const error = entry.error ? ` ${entry.error.message}` : '';

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${entry.message}${meta}${error}`);
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${entry.message}${meta}${error}`);
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${entry.message}${meta}${error}`);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(`${prefix} ${entry.message}${meta}`, entry.error?.stack);
        break;
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // Placeholder for external logging service
    // Example: send to Datadog, CloudWatch, Sentry, etc.
    // In production, this would batch and send logs asynchronously
  }

  // User Action Logging
  logUserAction(action: string, resource: string, userId: string, metadata?: Record<string, unknown>): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      category: LogCategory.USER_ACTION,
      message: `User action: ${action} on ${resource}`,
      userId,
      metadata: { action, resource, ...metadata },
    });
  }

  // System Event Logging
  logSystemEvent(event: string, metadata?: Record<string, unknown>): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      category: LogCategory.SYSTEM_EVENT,
      message: `System event: ${event}`,
      metadata: { event, ...metadata },
    });
  }

  // Error Logging
  logError(error: Error, context?: string, metadata?: Record<string, unknown>): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      category: LogCategory.ERROR,
      message: `Error${context ? ` in ${context}` : ''}: ${error.message}`,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      metadata,
    });
  }

  // Security Event Logging
  logSecurityEvent(event: string, metadata?: Record<string, unknown>): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      category: LogCategory.SECURITY,
      message: `Security event: ${event}`,
      metadata: { event, ...metadata },
    });
  }

  // Performance Logging
  logPerformance(operation: string, duration: number, metadata?: Record<string, unknown>): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: duration > 1000 ? LogLevel.WARN : LogLevel.INFO,
      category: LogCategory.PERFORMANCE,
      message: `Performance: ${operation} took ${duration}ms`,
      duration,
      metadata: { operation, ...metadata },
    });
  }

  // API Logging
  logApiRequest(method: string, path: string, statusCode: number, duration: number, metadata?: Record<string, unknown>): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO,
      category: LogCategory.API,
      message: `${method} ${path} - ${statusCode} (${duration}ms)`,
      statusCode,
      duration,
      metadata: { method, path, ...metadata },
    });
  }

  // Database Logging
  logDatabaseOperation(operation: string, duration: number, success: boolean, metadata?: Record<string, unknown>): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: success ? LogLevel.DEBUG : LogLevel.ERROR,
      category: LogCategory.DATABASE,
      message: `Database ${operation} ${success ? 'successful' : 'failed'} (${duration}ms)`,
      duration,
      metadata: { operation, success, ...metadata },
    });
  }

  // Payment Logging
  logPayment(action: string, amount: number, currency: string, success: boolean, metadata?: Record<string, unknown>): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: success ? LogLevel.INFO : LogLevel.ERROR,
      category: LogCategory.PAYMENT,
      message: `Payment ${action}: ${amount} ${currency} - ${success ? 'Success' : 'Failed'}`,
      metadata: { action, amount, currency, success, ...metadata },
    });
  }

  // Authentication Logging
  logAuth(action: string, userId?: string, success?: boolean, metadata?: Record<string, unknown>): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: success === false ? LogLevel.WARN : LogLevel.INFO,
      category: LogCategory.AUTH,
      message: `Auth ${action}${userId ? ` for user ${userId}` : ''} - ${success === false ? 'Failed' : 'Success'}`,
      userId,
      metadata: { action, success, ...metadata },
    });
  }

  // Get recent logs (for debugging)
  getRecentLogs(count = 100, level?: LogLevel, category?: LogCategory): LogEntry[] {
    let filtered = this.logs;
    if (level) filtered = filtered.filter((l) => l.level === level);
    if (category) filtered = filtered.filter((l) => l.category === category);
    return filtered.slice(-count);
  }

  // Get logs by user
  getUserLogs(userId: string): LogEntry[] {
    return this.logs.filter((l) => l.userId === userId);
  }

  // Get error logs
  getErrorLogs(): LogEntry[] {
    return this.logs.filter((l) => l.level === LogLevel.ERROR || l.level === LogLevel.FATAL);
  }

  // Clear logs (for testing)
  clearLogs(): void {
    this.logs = [];
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for creating custom log instances
export function createLogger(context?: string) {
  return {
    debug: (message: string, metadata?: Record<string, unknown>) =>
      logger.writeLog({
        timestamp: new Date().toISOString(),
        level: LogLevel.DEBUG,
        category: LogCategory.SYSTEM_EVENT,
        message: context ? `[${context}] ${message}` : message,
        metadata,
      }),
    info: (message: string, metadata?: Record<string, unknown>) =>
      logger.writeLog({
        timestamp: new Date().toISOString(),
        level: LogLevel.INFO,
        category: LogCategory.SYSTEM_EVENT,
        message: context ? `[${context}] ${message}` : message,
        metadata,
      }),
    warn: (message: string, metadata?: Record<string, unknown>) =>
      logger.writeLog({
        timestamp: new Date().toISOString(),
        level: LogLevel.WARN,
        category: LogCategory.SYSTEM_EVENT,
        message: context ? `[${context}] ${message}` : message,
        metadata,
      }),
    error: (error: Error, metadata?: Record<string, unknown>) =>
      logger.logError(error, context, metadata),
  };
}

export default logger;
