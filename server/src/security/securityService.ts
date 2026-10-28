/**
 * SatyaSetu AI - Unified Security, Load Testing & Staging Service Facade
 * Phase 10: Security Auditing (Cert-In), Load Testing, Disaster Recovery & Staging Runbooks
 */

import { certInAuditor, CertInAuditor } from './certInAuditor';
import { dpdpPrivacyEngine, DpdpPrivacyEngine } from './dpdpPrivacyEngine';
import { loadTestSimulator, LoadTestSimulator } from './loadTestSimulator';
import { disasterRecoveryEngine, DisasterRecoveryEngine } from './disasterRecoveryEngine';
import { stagingDeploymentManager, StagingDeploymentManager } from './stagingDeploymentManager';
import {
  CertInAuditReport,
  DpdpRedactionResult,
  LoadTestBenchmarkConfig,
  LoadTestBenchmarkReport,
  DisasterRecoveryStatus,
  StagingRolloutStatus,
  ProductionRunbookEntry,
} from './types';

export class SecurityService {
  private static instance: SecurityService;

  private constructor(
    private auditor: CertInAuditor = certInAuditor,
    private privacy: DpdpPrivacyEngine = dpdpPrivacyEngine,
    private loadTester: LoadTestSimulator = loadTestSimulator,
    private drEngine: DisasterRecoveryEngine = disasterRecoveryEngine,
    private stagingManager: StagingDeploymentManager = stagingDeploymentManager
  ) {}

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Cert-In & OWASP Top 10 Auditing
  public runCertInAudit(): CertInAuditReport {
    return this.auditor.runFullAudit();
  }

  public getLatestAuditReport(): CertInAuditReport {
    return this.auditor.getLatestReport();
  }

  // DPDP Act 2023 Privacy & PII Sanitization
  public redactPii(text: string): DpdpRedactionResult {
    return this.privacy.redactPii(text);
  }

  public redactApplicationObject(data: any): any {
    return this.privacy.redactApplicationObject(data);
  }

  // High-Concurrency Load Testing
  public runLoadBenchmark(config?: Partial<LoadTestBenchmarkConfig>): LoadTestBenchmarkReport {
    return this.loadTester.simulateHighConcurrencyLoad(config);
  }

  public getLatestLoadBenchmark(): LoadTestBenchmarkReport {
    return this.loadTester.getLatestBenchmark();
  }

  // Disaster Recovery & Business Continuity
  public getDisasterRecoveryStatus(): DisasterRecoveryStatus {
    return this.drEngine.getStatus();
  }

  public executeDrFailoverDrill(
    simulatedFailureType?: 'REGION_OUTAGE' | 'PRIMARY_DB_CRASH' | 'S3_STORAGE_PARTITION'
  ): DisasterRecoveryStatus {
    return this.drEngine.executeFailoverDrill(simulatedFailureType);
  }

  // Phased Staging Rollout & Production Runbooks
  public getStagingRolloutStatus(): StagingRolloutStatus {
    return this.stagingManager.getRolloutStatus();
  }

  public promoteRolloutStage(): StagingRolloutStatus {
    return this.stagingManager.promoteRolloutStage();
  }

  public getProductionRunbooks(): ProductionRunbookEntry[] {
    return this.stagingManager.getProductionRunbooks();
  }
}

export const securityService = SecurityService.getInstance();
