import { Request, Response, NextFunction } from 'express';
import { jwtService } from './jwtService';
import { rbacService } from './rbacService';
import { JwtPayload, PermissionScope } from './types';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      token?: string;
    }
  }
}

/**
 * Authentication middleware validating JWT bearer tokens
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      type: 'https://satyasetu.gov.in/errors/UNAUTHORIZED',
      title: 'Authentication Required',
      status: 401,
      detail: 'Missing or malformed Authorization header. Expected Bearer token.',
      timestamp: new Date().toISOString(),
    });
  }

  const token = authHeader.substring(7).trim();
  const payload = await jwtService.verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({
      type: 'https://satyasetu.gov.in/errors/INVALID_TOKEN',
      title: 'Invalid or Expired Token',
      status: 401,
      detail: 'The provided access token is invalid, expired, or has been revoked.',
      timestamp: new Date().toISOString(),
    });
  }

  req.user = payload;
  req.token = token;
  next();
}

/**
 * RBAC authorization middleware enforcing required permission scopes
 */
export function requireScope(...requiredScopes: PermissionScope[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        type: 'https://satyasetu.gov.in/errors/UNAUTHORIZED',
        title: 'Authentication Required',
        status: 401,
        detail: 'User session not authenticated.',
        timestamp: new Date().toISOString(),
      });
    }

    const hasPermission = rbacService.hasAnyScope(req.user.scopes, requiredScopes);
    if (!hasPermission) {
      return res.status(403).json({
        type: 'https://satyasetu.gov.in/errors/FORBIDDEN',
        title: 'Insufficient Permissions',
        status: 403,
        detail: `Access denied. Requires at least one of scopes: [${requiredScopes.join(', ')}]`,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
}

/**
 * Optional authentication middleware: attaches user if token present, continues regardless
 */
export async function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const payload = await jwtService.verifyAccessToken(token);
    if (payload) {
      req.user = payload;
      req.token = token;
    }
  }
  next();
}

