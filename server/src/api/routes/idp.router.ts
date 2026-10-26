import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { idpService } from '../../idp/idpService';

export const idpRouter = Router();

const processDocumentSchema = z.object({
  documentId: z.string().min(1, 'documentId is required'),
  applicationId: z.string().min(1, 'applicationId is required'),
  fileName: z.string().min(1, 'fileName is required'),
  category: z.string().min(1, 'category is required'),
  fileSizeBytes: z.number().positive().optional(),
  mimeType: z.string().optional(),
  institutionName: z.string().optional(),
  registrationNumber: z.string().optional(),
});

/**
 * POST /api/v1/idp/process - Enqueue document for background asynchronous IDP & OCR pipeline
 */
idpRouter.post('/process', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = processDocumentSchema.parse(req.body);
    const summary = await idpService.enqueueDocumentProcessing(parsed);

    res.status(202).json({
      success: true,
      data: summary,
      message: 'Document ingestion initiated. Processing asynchronous OCR and layout segmentation pipeline.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/idp/extract-sync - Synchronous IDP inspection & extraction endpoint
 */
idpRouter.post('/extract-sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = processDocumentSchema.parse(req.body);
    const result = await idpService.processSync(parsed);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Synchronous document OCR tokenization, table matrix parsing, and entity extraction completed.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/idp/jobs/:jobId - Query real-time status and extraction results of an IDP job
 */
idpRouter.get('/jobs/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = req.params.jobId as string;
    const { summary, result } = await idpService.getJob(jobId);

    if (!summary && !result) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `IDP job with identifier '${jobId}' was not found.` },
      });
    }

    res.json({
      success: true,
      data: {
        summary,
        result,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/idp/jobs - List recent IDP processing jobs
 */
idpRouter.get('/jobs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const jobs = await idpService.listJobs(limit);

    res.json({
      success: true,
      data: jobs,
      total: jobs.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/idp/categories - Get supported regulatory document templates and formats
 */
idpRouter.get('/categories', async (_req: Request, res: Response) => {
  const categories = idpService.getSupportedCategories();
  res.json({
    success: true,
    data: categories,
    timestamp: new Date().toISOString(),
  });
});

