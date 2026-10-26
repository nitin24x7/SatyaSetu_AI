import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { storageService } from '../../storage/storageService';
import { applicationService } from '../../services/applicationService';

export const documentsRouter = Router();

const presignedSchema = z.object({
  applicationId: z.string().min(1, 'applicationId is required'),
  category: z.string().min(1, 'category is required'),
  fileName: z.string().min(1, 'fileName is required'),
  mimeType: z.string().min(1, 'mimeType is required'),
  expiresInSeconds: z.number().optional().default(900),
});

/**
 * POST /api/v1/documents/presigned-url - Generate secure S3/MinIO upload ticket
 */
documentsRouter.post('/presigned-url', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = presignedSchema.parse(req.body);

    // Validate MIME types
    const validMimes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validMimes.includes(parsed.mimeType)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_MIME', message: 'Only PDF, JPEG, and PNG formats are permitted.' },
      });
    }

    const ticket = await storageService.generateUploadPresignedUrl(parsed);

    res.json({
      success: true,
      data: ticket,
      message: 'Presigned upload URL generated with SSE-S3 encryption.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/documents/:id/download - Get secure presigned download link
 */
documentsRouter.get('/:id/download', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s3Key = req.query.s3Key as string;
    const downloadName = req.query.fileName as string;

    if (!s3Key) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_KEY', message: 's3Key query parameter is required.' },
      });
    }

    const downloadUrl = await storageService.generateDownloadPresignedUrl(
      s3Key,
      3600,
      downloadName
    );

    res.json({
      success: true,
      data: { downloadUrl, expiresInSeconds: 3600 },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

