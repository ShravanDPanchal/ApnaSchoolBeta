import { Request, Response, NextFunction } from 'express';
import { PermissionCode, UserRole } from '@apna-school/shared-types';

export function requirePermission(...requiredPermissions: (PermissionCode | string)[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    if (req.user.isSuperAdmin || req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.SCHOOL_ADMIN) {
      return next();
    }

    const userPermissions = new Set(req.user.permissions || []);
    const hasPermission = requiredPermissions.some((perm) => userPermissions.has(perm));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Permission denied. Required: ${requiredPermissions.join(' or ')}`,
        },
      });
    }

    next();
  };
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    if (req.user.isSuperAdmin || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: `Role denied. Allowed: ${allowedRoles.join(', ')}`,
      },
    });
  };
}
