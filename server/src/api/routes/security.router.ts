/**
 * SatyaSetu AI - Security, Load Testing & Staging REST Router
 * Phase 10: Security Auditing (Cert-In), Load Testing, Disaster Recovery & Staging Runbooks
 */

import { Router, Request, Response } from 'express';
import { securityService } from '../../security/securityService';

export const securityRouter = Router();

/**
 * POST /api/v1/security/audit/run
 * Run full Cert-In security audit and return signed clearance report
 */
securityRouter.post('/audit/run', async (_req: Request, res: Response) => {
  try {
    const report = securityService.runCertInAudit();
    res.json({
      success: true,
      report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to execute Cert-In security audit',
    });
  }
});

/**
 * GET /api/v1/security/audit/report
 * Retrieve latest Cert-In compliance audit report
 */
securityRouter.get('/audit/report', async (_req: Request, res: Response) => {
  try {
    const report = securityService.getLatestAuditReport();
    res.json({
      success: true,
      report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch security audit report',
    });
  }
});

/**
 * POST /api/v1/security/dpdp/redact
 * Redact sensitive PII under DPDP Act 2023
 */
securityRouter.post('/dpdp/redact', async (req: Request, res: Response) => {
  try {
    const { text, payload } = req.body;
    if (text) {
      const result = securityService.redactPii(String(text));
      return res.json({
        success: true,
        data: result,
      });
    }

    if (payload) {
      const redactedPayload = securityService.redactApplicationObject(payload);
      return res.json({
        success: true,
        data: redactedPayload,
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Either "text" or "payload" must be provided in request body.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to redact personal data under DPDP Act',
    });
  }
});

/**
 * POST /api/v1/security/load-test/simulate
 * Run high-concurrency submission benchmark (e.g. 10,000 concurrent submissions)
 */
securityRouter.post('/load-test/simulate', async (req: Request, res: Response) => {
  try {
    const { concurrentSubmissions, durationSeconds, scenarioName, targetEndpoint, peakRpsThreshold } = req.body;
    const report = securityService.runLoadBenchmark({
      concurrentSubmissions: concurrentSubmissions ? Number(concurrentSubmissions) : 10000,
      durationSeconds: durationSeconds ? Number(durationSeconds) : 60,
      scenarioName: scenarioName ? String(scenarioName) : undefined,
      targetEndpoint: targetEndpoint ? String(targetEndpoint) : undefined,
      peakRpsThreshold: peakRpsThreshold ? Number(peakRpsThreshold) : undefined,
    });
    res.json({
      success: true,
      benchmark: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to execute load test benchmark',
    });
  }
});

/**
 * GET /api/v1/security/load-test/latest
 * Retrieve latest stress benchmark report
 */
securityRouter.get('/load-test/latest', async (_req: Request, res: Response) => {
  try {
    const report = securityService.getLatestLoadBenchmark();
    res.json({
      success: true,
      benchmark: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch load test benchmark',
    });
  }
});

/**
 * GET /api/v1/security/dr/status
 * Get live high-availability replication & RPO/RTO metrics
 */
securityRouter.get('/dr/status', async (_req: Request, res: Response) => {
  try {
    const status = securityService.getDisasterRecoveryStatus();
    res.json({
      success: true,
      disasterRecovery: status,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch disaster recovery status',
    });
  }
});

/**
 * POST /api/v1/security/dr/drill
 * Execute automated disaster recovery failover drill
 */
securityRouter.post('/dr/drill', async (req: Request, res: Response) => {
  try {
    const { simulatedFailureType } = req.body;
    const drillResult = securityService.executeDrFailoverDrill(simulatedFailureType);
    res.json({
      success: true,
      drillResult,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to execute DR failover drill',
    });
  }
});

/**
 * GET /api/v1/security/staging/status
 * Get current rollout stage (Stage A, Stage B, Stage C) and readiness gates
 */
securityRouter.get('/staging/status', async (_req: Request, res: Response) => {
  try {
    const rollout = securityService.getStagingRolloutStatus();
    res.json({
      success: true,
      rollout,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch staging rollout status',
    });
  }
});

/**
 * POST /api/v1/security/staging/promote
 * Promote rollout to the next stage
 */
securityRouter.post('/staging/promote', async (_req: Request, res: Response) => {
  try {
    const updatedRollout = securityService.promoteRolloutStage();
    res.json({
      success: true,
      rollout: updatedRollout,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to promote staging rollout stage',
    });
  }
});

/**
 * GET /api/v1/security/runbook
 * Retrieve production operational runbooks and emergency SOPs
 */
securityRouter.get('/runbook', async (_req: Request, res: Response) => {
  try {
    const runbooks = securityService.getProductionRunbooks();
    res.json({
      success: true,
      runbooks,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch production runbooks',
    });
  }
});

