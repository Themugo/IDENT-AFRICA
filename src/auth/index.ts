/**
 * Authentication System
 * 
 * Simple JWT-based authentication for the application.
 * In production, use a proper auth provider (Auth0, Clerk, Supabase Auth, etc.)
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

// Validate JWT_SECRET in production
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction && !secret) {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  
  if (isProduction && secret && secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  
  // Generate a deterministic secret for development if not set
  if (!secret) {
    return 'dev-secret-change-in-production';
  }
  
  return secret;
}

const JWT_SECRET = getJwtSecret();
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

// Real HMAC-SHA256 signature over header+body. Unlike the previous
// scheme, the secret is only ever used as an HMAC key here - it is
// never embedded in the token itself.
function sign(headerAndBody: string): string {
  return crypto.createHmac('sha256', JWT_SECRET).update(headerAndBody).digest('base64url');
}

function verifySignature(headerAndBody: string, signature: string): boolean {
  const expected = sign(headerAndBody);
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

// Create a signed token (for demo - use jsonwebtoken in production)
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
  const signature = sign(`${header}.${body}`);
  
  return `${header}.${body}.${signature}`;
}

// Verify and decode a token
export function verifyToken(token: string): TokenPayload | null {
  try {
    if (!token) return null;

    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;

    if (!verifySignature(`${header}.${body}`, signature)) return null;

    const payload = base64Decode<TokenPayload>(body);
    
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

// In-memory store for users created via /api/auth/register.
//
// IMPORTANT: this does NOT persist across server restarts - there is
// no database configured in this environment. Without this, a real
// registration issued a valid token for a user that was never stored
// anywhere: calling /api/auth/me with that exact token always
// returned 404, so nobody could actually use an account they just
// created. This closes that gap for the lifetime of a single server
// process. Replace with real database-backed storage once one is
// provisioned (see src/db/index.ts).
const registeredUsers = new Map<string, User & { passwordHash: string }>();

export function registerUser(user: User, passwordHash: string): void {
  registeredUsers.set(user.email.toLowerCase(), { ...user, passwordHash });
}

export function findRegisteredUserById(userId: string): User | null {
  for (const record of registeredUsers.values()) {
    if (record.id === userId) {
      const { passwordHash: _passwordHash, ...user } = record;
      return user;
    }
  }
  return null;
}

export function isEmailTaken(email: string): boolean {
  const normalized = email.toLowerCase();
  return (
    DEMO_USERS.some((u) => u.email.toLowerCase() === normalized) ||
    registeredUsers.has(normalized)
  );
}

// Find user by credentials
export async function findUserByCredentials(
  email: string,
  password: string
): Promise<User | null> {
  const normalized = email.toLowerCase();

  const registered = registeredUsers.get(normalized);
  if (registered) {
    const valid = await verifyPassword(password, registered.passwordHash);
    if (!valid) return null;
    const { passwordHash: _passwordHash, ...user } = registered;
    return user;
  }

  // Demo: accept the fixed demo password for the seeded demo users
  if (password === 'demo123') {
    return DEMO_USERS.find((u) => u.email.toLowerCase() === normalized) || null;
  }

  return null;
}

// Generate password hash
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Role-based Access Control Matrix
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  traveler: [
    'destinations:read',
    'lodges:read',
    'packages:read',
    'bookings:create',
    'bookings:read_own',
    'profile:manage_own',
    'loyalty:read_own',
    'payments:initiate',
  ],
  supplier: [
    'destinations:read',
    'lodges:read',
    'lodges:manage_own',
    'packages:read',
    'inventory:manage_own',
    'pricing:manage_own',
    'bookings:read_assigned',
    'bookings:update_assigned',
    'profile:manage_own',
  ],
  ranger_partner: [
    'destinations:read',
    'lodges:read',
    'lodges:manage_own',
    'packages:read',
    'inventory:manage_own',
    'pricing:manage_own',
    'bookings:read_assigned',
    'bookings:update_assigned',
    'profile:manage_own',
    'quality:audit',
  ],
  admin: [
    '*', // Full platform access
  ],
};

export function hasPermission(role: string, permission: string): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
}

export default {
  createToken,
  verifyToken,
  authenticate,
  optionalAuth,
  authorize,
  hasPermission,
  ROLE_PERMISSIONS,
  DEMO_USERS,
  findUserByCredentials,
  registerUser,
  findRegisteredUserById,
  isEmailTaken,
  hashPassword,
  verifyPassword,
};
