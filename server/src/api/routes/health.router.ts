import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../../db/dbClient';
import { cacheService } from '../../cache/cacheService';
import { storageService } from '../../storage/storageService';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  const [dbHealth, cacheHealth, storageHealth] = await Promise.all([
    checkDatabaseHealth(),
    cacheService.checkCacheHealth(),
    storageService.checkStorageHealth(),
  ]);

  const allHealthy = dbHealth.healthy && cacheHealth.healthy;

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        provider: 'PostgreSQL',
        healthy: dbHealth.healthy,
        latencyMs: dbHealth.latencyMs,
        error: dbHealth.error,
      },
      cache: {
        provider: 'Redis (with resilient fallback)',
        healthy: cacheHealth.healthy,
        latencyMs: cacheHealth.latencyMs,
        error: cacheHealth.error,
      },
      storage: {
        provider: 'S3 / MinIO (Encrypted SSE-S3/KMS)',
        healthy: storageHealth.healthy,
        error: storageHealth.error,
      },
    },
    version: '1.0.0-phase3-prod',
  });
});

