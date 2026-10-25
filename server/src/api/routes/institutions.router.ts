import { Router, Request, Response, NextFunction } from 'express';
import { applicationService } from '../../services/applicationService';

export const institutionsRouter = Router();

institutionsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await applicationService.getInstitutions();
    res.json({ success: true, data: list, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

institutionsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const inst = await applicationService.getInstitutionById(id);
    if (!inst) {
      return res.status(404).json({ success: false, error: 'Institution not found.' });
    }
    res.json({ success: true, data: inst, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});
