import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { forensicService } from '../../forensics/forensicService';
import { errorLevelAnalyzer } from '../../forensics/elaAnalyzer';
import { copyMoveForgeryDetector } from '../../forensics/cmfdAnalyzer';
import { pdfStructureInspector } from '../../forensics/pdfStructureInspector';
import { perceptualHashEngine } from '../../forensics/perceptualHashEngine';

export const forensicsRouter = Router();

const analyzeSchema = z.object({
  documentId: z.string().min(1, 'documentId is required'),
  applicationId: z.string().min(1, 'applicationId is required'),
  institutionId: z.string().optional(),
  fileName: z.string().min(1, 'fileName is required'),
  category: z.string().optional(),
  fileSizeBytes: z.number().positive().optional(),
  mimeType: z.string().optional(),
  isSimulatedTampered: z.boolean().optional(),
  isSimulatedCloned: z.boolean().optional(),
  isSimulatedRecycled: z.boolean().optional(),
});

const fileParamSchema = z.object({
  fileName: z.string().min(1, 'fileName is required'),
  fileSizeBytes: z.number().positive().optional(),
  category: z.string().optional(),
  isSimulatedTampered: z.boolean().optional(),
  isSimulatedCloned: z.boolean().optional(),
  isSimulatedRecycled: z.boolean().optional(),
  applicationId: z.string().optional(),
  institutionId: z.string().optional(),
});

/**
 * POST /api/v1/forensics/analyze - Comprehensive visual & structural forensic inspection
 */
forensicsRouter.post('/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = analyzeSchema.parse(req.body);
    const report = await forensicService.analyzeDocument(parsed);

    res.json({
      success: true,
      data: report,
      message: 'Document forensics analysis completed successfully.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/forensics/ela - Standalone Error Level Analysis (ELA)
 */
forensicsRouter.post('/ela', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = fileParamSchema.parse(req.body);
    const result = errorLevelAnalyzer.analyze(parsed);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/forensics/cmfd - Standalone Copy-Move Forgery Detection (CMFD)
 */
forensicsRouter.post('/cmfd', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = fileParamSchema.parse(req.body);
    const result = copyMoveForgeryDetector.analyze(parsed);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/forensics/pdf-inspect - Inspect PDF revision trees & vector overlays
 */
forensicsRouter.post('/pdf-inspect', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = fileParamSchema.parse(req.body);
    const result = pdfStructureInspector.inspect(parsed);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/forensics/fingerprint - Compute perceptual hash & detect recycled filings
 */
forensicsRouter.post('/fingerprint', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = fileParamSchema.parse(req.body);
    const result = perceptualHashEngine.checkDeduplication({
      fileName: parsed.fileName,
      applicationId: parsed.applicationId || 'APP-UNKNOWN',
      institutionId: parsed.institutionId || 'INST-UNKNOWN',
      category: parsed.category,
      isSimulatedRecycled: parsed.isSimulatedRecycled,
    });

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/forensics/reports/:documentId - Retrieve forensic report for a document
 */
forensicsRouter.get('/reports/:documentId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docId = req.params.documentId as string;
    const report = await forensicService.getForensicReport(docId);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `No forensic report found for document '${docId}'.` },
      });
    }

    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/forensics/reports - List recently executed forensic reports
 */
forensicsRouter.get('/reports', async (_req: Request, res: Response) => {
  const reports = await forensicService.listReports();
  res.json({
    success: true,
    data: reports,
    total: reports.length,
    timestamp: new Date().toISOString(),
  });
});
