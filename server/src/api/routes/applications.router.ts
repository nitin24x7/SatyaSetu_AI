import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { applicationService } from '../../services/applicationService';

export const applicationsRouter = Router();

const createApplicationSchema = z.object({
  institutionId: z.string().optional(),
  institutionName: z.string().min(2, 'Institution name is required'),
  institutionType: z.string(),
  state: z.string(),
  applicationType: z.string(),
  academicYear: z.string().default('2026-2027'),
  purpose: z.string().min(5, 'Purpose of application is required'),
  referenceNumber: z.string().optional(),
  remarks: z.string().optional(),
  documents: z.array(z.any()).default([]),
  isSubmit: z.boolean().default(false),
});

const correctionsSchema = z.object({
  findingIds: z.array(z.string()).default([]),
  comment: z.string().min(3, 'Assessor comment is required'),
  dueDate: z.string().optional(),
});

const decisionSchema = z.object({
  decision: z.enum(['Verified', 'Rejected']),
  reasonOrComment: z.string().min(3, 'Reason or remarks required'),
});

const resubmitSchema = z.object({
  applicantResponse: z.string().min(3, 'Response explanation is required'),
  updatedDocs: z.array(z.any()).optional(),
});

/**
 * GET /api/v1/applications - List with pagination, filters & search
 */
applicationsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const status = req.query.status as string;
    const riskLevel = req.query.riskLevel as string;
    const institutionType = req.query.institutionType as string;
    const reviewerId = req.query.reviewerId as string;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string;
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const result = await applicationService.getApplications({
      page,
      limit,
      status,
      riskLevel,
      institutionType,
      reviewerId,
      search,
      sortBy,
      sortOrder,
    });

    res.json({
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/applications/:id - Full dossier details
 */
applicationsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const app = await applicationService.getApplicationById(id);
    if (!app) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Application ${id} not found.` },
      });
    }
    res.json({ success: true, data: app, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/applications - Create or Submit application
 */
applicationsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createApplicationSchema.parse(req.body);
    const actorName = (req.headers['x-actor-name'] as string) || parsed.institutionName;

    const result = await applicationService.createOrSubmit({
      appData: parsed,
      documents: parsed.documents,
      isSubmit: parsed.isSubmit,
      actorName,
      actorRole: 'Applicant',
    });

    res.status(201).json({
      success: true,
      data: result,
      message: parsed.isSubmit ? 'Application formally submitted.' : 'Application draft saved.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/applications/:id/verify - Commence verification
 */
applicationsRouter.post('/:id/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const reviewer = {
      id: (req.headers['x-reviewer-id'] as string) || 'REV-01',
      name: (req.headers['x-reviewer-name'] as string) || 'Dr. Priyadarshini Rao',
    };
    const app = await applicationService.startVerification(id, reviewer);
    res.json({ success: true, data: app, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/applications/:id/assign - Reassign reviewer
 */
applicationsRouter.post('/:id/assign', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { reviewerId } = req.body;
    if (!reviewerId) {
      return res.status(400).json({ success: false, error: 'reviewerId is required.' });
    }
    const actorName = (req.headers['x-actor-name'] as string) || 'Lead Regulatory Assessor';
    const app = await applicationService.assignReviewer(id, reviewerId, actorName);
    res.json({ success: true, data: app, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/applications/:id/corrections - Request corrections
 */
applicationsRouter.post('/:id/corrections', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const parsed = correctionsSchema.parse(req.body);
    const reviewer = {
      id: (req.headers['x-reviewer-id'] as string) || 'REV-01',
      name: (req.headers['x-reviewer-name'] as string) || 'Assessor Panel',
    };
    const app = await applicationService.requestCorrections({
      id,
      findingIds: parsed.findingIds,
      comment: parsed.comment,
      dueDate: parsed.dueDate,
      reviewer,
    });
    res.json({ success: true, data: app, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/applications/:id/resubmit - Applicant resubmission
 */
applicationsRouter.post('/:id/resubmit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const parsed = resubmitSchema.parse(req.body);
    const actorName = (req.headers['x-actor-name'] as string) || 'Authorized Representative';
    const app = await applicationService.resubmit({
      id,
      applicantResponse: parsed.applicantResponse,
      updatedDocs: parsed.updatedDocs,
      actorName,
    });
    res.json({ success: true, data: app, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/applications/:id/decision - Adjudicate approval/rejection
 */
applicationsRouter.post('/:id/decision', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const parsed = decisionSchema.parse(req.body);
    const reviewer = {
      id: (req.headers['x-reviewer-id'] as string) || 'REV-01',
      name: (req.headers['x-reviewer-name'] as string) || 'Compliance Director',
    };
    const app = await applicationService.recordDecision({
      id,
      decision: parsed.decision,
      reasonOrComment: parsed.reasonOrComment,
      reviewer,
    });
    res.json({ success: true, data: app, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/applications/:id/override - Administrative reopen
 */
applicationsRouter.post('/:id/override', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { justification } = req.body;
    if (!justification || justification.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'justification is required.' });
    }
    const reviewer = {
      id: (req.headers['x-reviewer-id'] as string) || 'REV-01',
      name: (req.headers['x-reviewer-name'] as string) || 'Chief Regulatory Officer',
    };
    const app = await applicationService.reopenApplication({
      id,
      justification,
      reviewer,
    });
    res.json({ success: true, data: app, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});
