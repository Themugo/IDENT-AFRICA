/**
 * Authentication System
 * 
 * Simple JWT-based authentication for the application.
 * In production, use a proper auth provider (Auth0, Clerk, Supabase Auth, etc.)
 */

import { Request, Response, NextFunction } from 'express';

// JWT secret for signing tokens (use strong secret in production)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const TOKEN_EXPIRY = '24h';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'traveler' | 'admin' | 'ranger_partner' | 'supplier';
  avatar?: string;
}

// Simple token structure (in production, use proper JWT library)
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Simple base64 encoding (use crypto in production)
function base64Encode(obj: object): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

function base64Decode<T>(str: string): T {
  return JSON.parse(Buffer.from(str, 'base64url').toString());
}

// Create a simple token (for demo - use jsonwebtoken in production)
export function createToken(user: User): string {
  const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  
  const header = base64Encode({ alg: 'HS256', typ: 'JWT' });
  const body = base64Encode({
    ...payload,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
  const signature = base64Encode({ secret: JWT_SECRET, ...payload });
  
  return `${header}.${body}.${signature}`;
}

// Verify and decode a token
export function verifyToken(token: string): TokenPayload | null {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    
    const payload = base64Decode<TokenPayload>(body);
    const sigData = base64Decode<{ secret: string; userId: string }>(signature);
    
    // Verify signature
    if (sigData.secret !== JWT_SECRET) return null;
    
    // Check expiration
    if (payload.exp < Date.now()) return null;
    
    return payload;
  } catch {
    return null;
  }
}

// Extract token from request
export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check cookie
  if (req.cookies?.authToken) {
    return req.cookies.authToken;
  }
  
  return null;
}

// Authentication middleware
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = extractToken(req);
  
  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      details: 'Please provide a valid authentication token'
    });
    return;
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({
      success: false,
      error: 'Invalid token',
      details: 'Your session has expired or the token is invalid'
    });
    return;
  }
  
  // Attach user info to request
  (req as Request & { user?: TokenPayload }).user = payload;
  next();
}

// Optional authentication (doesn't fail if no token)
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = extractToken(req);
  
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      (req as Request & { user?: TokenPayload }).user = payload;
    }
  }
  
  next();
}

// Role-based authorization middleware
export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as Request & { user?: TokenPayload }).user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }
    
    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
        details: `This action requires one of these roles: ${allowedRoles.join(', ')}`
      });
      return;
    }
    
    next();
  };
}

// Demo users for local development
export const DEMO_USERS: User[] = [
  {
    id: 'usr-101',
    email: 'kamauwamakena@gmail.com',
    name: 'Makena Kamau',
    role: 'traveler',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  },
  {
    id: 'usr-admin',
    email: 'admin@identafrica.com',
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: 'usr-ranger',
    email: 'ranger@identafrica.com',
    name: 'Ranger Partner',
    role: 'ranger_partner',
  },
];

// Find user by credentials (demo implementation)
export function findUserByCredentials(
  email: string,
  password: string
): User | null {
  // Demo: accept any password for demo users
  if (password === 'demo123') {
    return DEMO_USERS.find(u => u.email === email) || null;
  }
  return null;
}

// Generate password hash (simple - use bcrypt in production)
export function hashPassword(password: string): string {
  return Buffer.from(password).toString('base64');
}

// Verify password hash
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export default {
  createToken,
  verifyToken,
  authenticate,
  optionalAuth,
  authorize,
  DEMO_USERS,
  findUserByCredentials,
  hashPassword,
  verifyPassword,
};
