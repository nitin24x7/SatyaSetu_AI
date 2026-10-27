import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { digiLockerService } from '../../integrations/digiLockerService';
import { aadhaarESignService } from '../../integrations/aadhaarESignService';
import { nadAisheSyncService } from '../../integrations/nadAisheSyncService';

export const integrationsRouter = Router();

const digiLockerSchema = z.object({
  docUri: z.string().min(1, 'docUri is required'),
  docType: z.enum(['CHARTER', 'AFFILIATION_ORDER', 'ACCREDITATION_CERT', 'DEGREE', 'LAND_TITLE']),
  consent: z.boolean(),
  institutionAisheCode: z.string().min(1, 'institutionAisheCode is required'),
});

const eSignSchema = z.object({
  documentId: z.string().min(1, 'documentId is required'),
  fileName: z.string().min(1, 'fileName is required'),
  signatureHex: z.string().optional(),
  certificatePem: z.string().optional(),
  signerAadhaarRef: z.string().optional(),
});

const aisheSchema = z.object({
  aisheCode: z.string().min(1, 'aisheCode is required'),
});

/**
 * POST /api/v1/integrations/digilocker/pull - Pull authentic statutory record from National DigiLocker
 */
integrationsRouter.post('/digilocker/pull', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = digiLockerSchema.parse(req.body);
    const document = await digiLockerService.pullDocument(parsed);

    res.json({
      success: true,
      data: document,
      message: 'Statutory certificate successfully retrieved and verified from National DigiLocker Gateway.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(400).json({
      type: 'https://satyasetu.gov.in/errors/DIGILOCKER_ERROR',
      title: 'DigiLocker Retrieval Error',
      status: 400,
      detail: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/v1/integrations/esign/verify - Validate Aadhaar eSign or DSC PKI signature
 */
integrationsRouter.post('/esign/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = eSignSchema.parse(req.body);
    const result = await aadhaarESignService.verifyDigitalSignature(parsed);

    res.json({
      success: true,
      data: result,
      message: 'Digital signature verified under IT Act 2000 Section 3A. Non-repudiation established.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(400).json({
      type: 'https://satyasetu.gov.in/errors/ESIGN_ERROR',
      title: 'eSign Verification Error',
      status: 400,
      detail: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/v1/integrations/aishe/sync - Synchronize with Ministry of Education AISHE portal
 */
integrationsRouter.post('/aishe/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = aisheSchema.parse(req.body);
    const result = await nadAisheSyncService.syncAishe(parsed);

    res.json({
      success: true,
      data: result,
      message: 'Institutional parameters synchronized with AISHE National Registry.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(400).json({
      type: 'https://satyasetu.gov.in/errors/AISHE_SYNC_ERROR',
      title: 'AISHE Synchronization Error',
      status: 400,
      detail: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/v1/integrations/status - Health, latency, and SLA monitor for statutory adapters
 */
integrationsRouter.get('/status', async (_req: Request, res: Response) => {
  const statuses = await nadAisheSyncService.getGatewayStatus();
  res.json({
    success: true,
    data: statuses,
    timestamp: new Date().toISOString(),
  });
});
