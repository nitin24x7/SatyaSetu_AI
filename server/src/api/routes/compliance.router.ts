import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { complianceService } from '../../compliance/complianceService';

export const complianceRouter = Router();

const evaluatePayloadSchema = z.object({
  applicationId: z.string().optional(),
  application: z.object({
    id: z.string().optional(),
    institutionName: z.string().min(1, 'institutionName is required'),
    institutionType: z.string().optional(),
    aisheCode: z.string().optional(),
    registrationNumber: z.string().optional(),
    academicYear: z.string().optional(),
    documents: z.array(z.any()).optional(),
  }).optional(),
  institution: z.any().optional(),
  documents: z.array(z.any()).optional(),
  idpResult: z.any().optional(),
});

const concordanceSchema = z.object({
  declared: z.object({
    institutionName: z.string().min(1, 'institutionName is required'),
    institutionType: z.string().optional(),
    aisheCode: z.string().optional(),
    registrationNumber: z.string().optional(),
    academicYear: z.string().optional(),
  }),
  extractedEntities: z.record(z.any()).optional(),
});

const cadreSchema = z.object({
  totalStudents: z.number().positive().optional(),
  professors: z.number().nonnegative().optional(),
  assocProfessors: z.number().nonnegative().optional(),
  asstProfessors: z.number().nonnegative().optional(),
  institutionType: z.string().optional(),
});

const infraSchema = z.object({
  totalStudents: z.number().positive().optional(),
  actualBuiltCarpetArea: z.number().positive().optional(),
});

/**
 * POST /api/v1/compliance/evaluate - Evaluates application dossier against statutory compliance rules
 */
complianceRouter.post('/evaluate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = evaluatePayloadSchema.parse(req.body);

    if (parsed.applicationId) {
      const summary = await complianceService.evaluateApplication(parsed.applicationId);
      if (!summary) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Application '${parsed.applicationId}' not found.` },
        });
      }
      return res.json({
        success: true,
        data: summary,
        timestamp: new Date().toISOString(),
      });
    }

    if (parsed.application) {
      const summary = complianceService.evaluatePayload({
        application: parsed.application,
        institution: parsed.institution,
        documents: parsed.documents || parsed.application.documents,
        idpResult: parsed.idpResult,
      });
      return res.json({
        success: true,
        data: summary,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Provide either applicationId or application payload.' },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/compliance/applications/:id - Evaluate existing application by identifier
 */
complianceRouter.get('/applications/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const summary = await complianceService.evaluateApplication(id);

    if (!summary) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Application '${id}' was not found.` },
      });
    }

    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/compliance/concordance - Cross-reference declared vs extracted attributes
 */
complianceRouter.post('/concordance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = concordanceSchema.parse(req.body);
    const report = complianceService.checkConcordance(parsed.declared, parsed.extractedEntities);

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
 * POST /api/v1/compliance/calculus/cadre - Calculate Student-to-Faculty Ratio (SFR) & Cadre Norms
 */
complianceRouter.post('/calculus/cadre', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = cadreSchema.parse(req.body);
    const result = complianceService.calculateCadre(parsed);

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
 * POST /api/v1/compliance/calculus/infrastructure - Calculate built carpet area norms & surplus/deficit
 */
complianceRouter.post('/calculus/infrastructure', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = infraSchema.parse(req.body);
    const result = complianceService.calculateInfrastructure(parsed);

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
 * GET /api/v1/compliance/rules - List all registered statutory compliance rules
 */
complianceRouter.get('/rules', async (_req: Request, res: Response) => {
  const rules = complianceService.getRegisteredRules();
  res.json({
    success: true,
    data: rules,
    total: rules.length,
    timestamp: new Date().toISOString(),
  });
});

