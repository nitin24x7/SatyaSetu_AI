import { Router, Request, Response, NextFunction } from 'express';
import { applicationService } from '../../services/applicationService';

export const auditRouter = Router();

auditRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await applicationService.getAuditLogs();
    res.json({
      success: true,
      data: logs,
      meta: {
        immutable: true,
        hashChained: true,
        count: logs.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});
