/**
 * SatyaSetu AI — Phase 9: Cryptographic Ledger & Regulatory Reporting Router
 * REST Endpoints for Hash Chain Audits, Merkle Verification, Certificates & Executive BI
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ledgerService } from '../../ledger/ledgerService';

const router = Router();

// Validation Schemas
const RecordAuditSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  institutionId: z.string().optional(),
  actorId: z.string().min(1, 'Actor ID is required'),
  actorName: z.string().min(1, 'Actor Name is required'),
  actorRole: z.string().min(1, 'Actor Role is required'),
  actionType: z.enum([
    'SUBMISSION',
    'DOCUMENT_UPLOAD',
    'VERIFICATION_STARTED',
    'CORRECTIONS_DISPATCHED',
    'RESUBMISSION_RECEIVED',
    'APPROVAL_RECORDED',
    'REJECTION_RECORDED',
    'ADMIN_OVERRIDE_EXECUTED',
    'CLEARANCE_CERTIFICATE_ISSUED',
  ]),
  actionDescription: z.string().min(1, 'Action description is required'),
  payload: z.record(z.any()),
});

const GenerateCertSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  complianceScore: z.number().min(0).max(100).optional(),
  sanctionedIntake: z.number().optional(),
  approvedProgramsCount: z.number().optional(),
  calculatedSfr: z.number().optional(),
  authorizerName: z.string().optional(),
  authorizerDesignation: z.string().optional(),
});

/**
 * POST /api/v1/ledger/record
 * Append an immutable cryptographically hashed block to the audit ledger.
 */
router.post('/record', async (req: Request, res: Response) => {
  try {
    const validated = RecordAuditSchema.parse(req.body);
    const block = await ledgerService.recordAuditEvent(validated);

    return res.status(201).json({
      success: true,
      message: `Audit block #${block.sequenceNumber} committed to cryptographic ledger.`,
      data: block,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: 'AuditRecordError',
      message: err.message || 'Failed to record audit block.',
    });
  }
});

/**
 * GET /api/v1/ledger/chain
 * Retrieve chronological cryptographic audit blocks with pagination.
 */
router.get('/chain', (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    const applicationId = req.query.applicationId ? String(req.query.applicationId) : undefined;
    const actionType = req.query.actionType ? (String(req.query.actionType) as any) : undefined;

    const result = ledgerService.getBlocks({ page, limit, applicationId, actionType });

    return res.status(200).json({
      success: true,
      data: result.blocks,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'LedgerRetrievalError',
      message: err.message || 'Failed to retrieve ledger chain.',
    });
  }
});

/**
 * GET /api/v1/ledger/verify
 * Execute full cryptographic hash chain verification from Genesis to Head.
 */
router.get('/verify', (_req: Request, res: Response) => {
  try {
    const verification = ledgerService.verifyChainIntegrity();

    return res.status(200).json({
      success: true,
      message: verification.isValid
        ? `Ledger integrity mathematically verified across all ${verification.totalBlocks} block(s).`
        : `Cryptographic audit ledger integrity breach detected: ${verification.tamperedDetails}`,
      data: verification,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'LedgerVerificationError',
      message: err.message || 'Failed to verify ledger integrity.',
    });
  }
});

/**
 * GET /api/v1/ledger/merkle-root
 * Retrieve current cryptographic Merkle tree root hash.
 */
router.get('/merkle-root', async (_req: Request, res: Response) => {
  try {
    const merkleRoot = await ledgerService.getMerkleRoot();

    return res.status(200).json({
      success: true,
      data: {
        merkleRoot,
        algorithm: 'SHA-256 Binary Merkle Tree',
        notarizedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'MerkleRootError',
      message: err.message || 'Failed to retrieve Merkle root.',
    });
  }
});

/**
 * POST /api/v1/ledger/certificates/generate
 * Issue digitally signed compliance clearance certificate with QR verification seal.
 */
router.post('/certificates/generate', async (req: Request, res: Response) => {
  try {
    const validated = GenerateCertSchema.parse(req.body);
    const cert = await ledgerService.generateClearanceCertificate(validated);

    return res.status(201).json({
      success: true,
      message: `Statutory compliance certificate ${cert.certificateNumber} issued successfully.`,
      data: cert,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: 'CertificateIssuanceError',
      message: err.message || 'Failed to generate compliance certificate.',
    });
  }
});

/**
 * GET /api/v1/ledger/certificates/verify/:certificateNumber
 * Public endpoint to verify clearance certificate authenticity via QR scan.
 */
router.get('/certificates/verify/:certificateNumber', async (req: Request, res: Response) => {
  try {
    const certNumber = String(req.params.certificateNumber);
    const verification = await ledgerService.verifyCertificate(certNumber);

    return res.status(200).json({
      success: true,
      data: verification,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'CertificateVerificationError',
      message: err.message || 'Failed to verify certificate.',
    });
  }
});

/**
 * GET /api/v1/ledger/certificates/:applicationId
 * Retrieve issued compliance certificate for an application.
 */
router.get('/certificates/:applicationId', (req: Request, res: Response) => {
  try {
    const appId = String(req.params.applicationId);
    const cert = ledgerService.getCertificateByApplicationId(appId);

    if (!cert) {
      return res.status(404).json({
        success: false,
        error: 'CertificateNotFound',
        message: `No compliance clearance certificate issued for application ${appId}.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: cert,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'CertificateRetrievalError',
      message: err.message || 'Failed to retrieve certificate.',
    });
  }
});

/**
 * GET /api/v1/reports/intelligence
 * Retrieve executive regulatory business intelligence and national compliance distributions.
 */
router.get('/intelligence', async (_req: Request, res: Response) => {
  try {
    const bi = await ledgerService.getRegulatoryIntelligence();

    return res.status(200).json({
      success: true,
      data: bi,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'BiIntelligenceError',
      message: err.message || 'Failed to retrieve regulatory intelligence.',
    });
  }
});

/**
 * GET /api/v1/reports/gazette/:applicationId
 * Generate official statutory gazette summary dossier for appellate tribunal review.
 */
router.get('/gazette/:applicationId', async (req: Request, res: Response) => {
  try {
    const appId = String(req.params.applicationId);
    const dossier = await ledgerService.getGazetteDossier(appId);

    return res.status(200).json({
      success: true,
      data: dossier,
    });
  } catch (err: any) {
    return res.status(404).json({
      success: false,
      error: 'GazetteDossierError',
      message: err.message || 'Failed to generate gazette dossier.',
    });
  }
});

export default router;

