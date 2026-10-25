import { Router, Request, Response, NextFunction } from 'express';
import { applicationService } from '../../services/applicationService';

export const reportsRouter = Router();

reportsRouter.get('/analytics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const analytics = await applicationService.getAnalytics();
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});
