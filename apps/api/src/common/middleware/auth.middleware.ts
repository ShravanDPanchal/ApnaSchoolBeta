import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { UserRole } from '@apna-school/shared-types';

export interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  email?: string;
  phone?: string;
  role: UserRole;
  isSuperAdmin: boolean;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      tenantId?: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (typeof req.query.token === 'string' && req.query.token.trim()) {
    token = req.query.token.trim();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication token is missing or invalid' },
    });
  }
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
    req.user = decoded;
    req.tenantId = decoded.tenantId;

    // Optional override for SuperAdmin if targeting specific tenant via header
    if (decoded.isSuperAdmin && req.headers['x-tenant-id']) {
      req.tenantId = req.headers['x-tenant-id'] as string;
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token has expired or is invalid' },
    });
  }
}

export function tenantGuard(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'User context is required' },
    });
  }

  if (!req.tenantId && !req.user.isSuperAdmin) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Tenant context is missing' },
    });
  }

  next();
}
