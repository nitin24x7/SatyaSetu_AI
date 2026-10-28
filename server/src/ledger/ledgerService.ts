/**
 * SatyaSetu AI — Phase 9: Immutable Audit Ledger & Regulatory Reporting Service
 * Central Facade Coordinating Hash Chains, Merkle Roots, Certificates & Executive BI
 */

import {
  AuditBlock,
  AuditActionType,
  LedgerVerificationResult,
  ComplianceCertificate,
  CertificateVerificationResult,
  RegulatoryIntelligence,
  GazetteDossier,
} from './types';
import { cryptographicLedger } from './cryptographicLedger';
import { certificateGenerator } from './certificateGenerator';
import { regulatoryBiEngine } from './regulatoryBiEngine';
import { gazetteReportGenerator } from './gazetteReportGenerator';
import { applicationService } from '../services/applicationService';
import { cacheService } from '../cache/cacheService';

export class LedgerService {
  /**
   * Append an audit event to the cryptographic ledger.
   */
  async recordAuditEvent(params: {
    applicationId: string;
    institutionId?: string;
    actorId: string;
    actorName: string;
    actorRole: string;
    actionType: AuditActionType;
    actionDescription: string;
    payload: Record<string, any>;
  }): Promise<AuditBlock> {
    const block = cryptographicLedger.appendBlock(params);
    await cacheService.del('ledger:merkle_root');
    await cacheService.del('reports:bi_intelligence');
    return block;
  }

  /**
   * Retrieve ledger blocks with pagination.
   */
  getBlocks(params?: {
    page?: number;
    limit?: number;
    applicationId?: string;
    actionType?: AuditActionType;
  }): { blocks: AuditBlock[]; total: number; page: number; limit: number; totalPages: number } {
    return cryptographicLedger.getBlocks(params);
  }

  /**
   * Verify the entire cryptographic hash chain.
   */
  verifyChainIntegrity(): LedgerVerificationResult {
    return cryptographicLedger.verifyChainIntegrity();
  }

  /**
   * Get current Merkle tree root.
   */
  async getMerkleRoot(): Promise<string> {
    return cacheService.getOrSet('ledger:merkle_root', async () => {
      return cryptographicLedger.getMerkleRoot();
    }, 60);
  }

  /**
   * Generate an official statutory compliance clearance certificate.
   */
  async generateClearanceCertificate(params: {
    applicationId: string;
    complianceScore?: number;
    sanctionedIntake?: number;
    approvedProgramsCount?: number;
    calculatedSfr?: number;
    authorizerName?: string;
    authorizerDesignation?: string;
  }): Promise<ComplianceCertificate> {
    const app = await applicationService.getApplicationById(params.applicationId);
    if (!app) {
      throw new Error(`Application ${params.applicationId} not found.`);
    }

    if (app.status !== 'Verified') {
      throw new Error(`Cannot issue clearance certificate: Application status is '${app.status}', must be 'Verified'.`);
    }

    const cert = certificateGenerator.generateCertificate({
      application: app,
      complianceScore: params.complianceScore,
      sanctionedIntake: params.sanctionedIntake,
      approvedProgramsCount: params.approvedProgramsCount,
      calculatedSfr: params.calculatedSfr,
      authorizerName: params.authorizerName,
      authorizerDesignation: params.authorizerDesignation,
    });

    await cacheService.del(`cert:${cert.certificateNumber}`);
    await cacheService.del(`cert:app:${app.id}`);
    return cert;
  }

  /**
   * Verify authenticity of a compliance clearance certificate.
   */
  async verifyCertificate(certificateNumber: string): Promise<CertificateVerificationResult> {
    return cacheService.getOrSet(`cert:verify:${certificateNumber}`, async () => {
      return certificateGenerator.verifyCertificate(certificateNumber);
    }, 300);
  }

  /**
   * Get compliance certificate for an application.
   */
  getCertificateByApplicationId(applicationId: string): ComplianceCertificate | null {
    return certificateGenerator.getCertificateByApplicationId(applicationId);
  }

  /**
   * Retrieve live macroeconomic regulatory intelligence.
   */
  async getRegulatoryIntelligence(): Promise<RegulatoryIntelligence> {
    return cacheService.getOrSet('reports:bi_intelligence', async () => {
      return regulatoryBiEngine.computeIntelligence();
    }, 120);
  }

  /**
   * Generate official statutory gazette summary dossier.
   */
  async getGazetteDossier(applicationId: string): Promise<GazetteDossier> {
    const app = await applicationService.getApplicationById(applicationId);
    if (!app) {
      throw new Error(`Application ${applicationId} not found.`);
    }
    return gazetteReportGenerator.generateGazetteDossier(app);
  }
}

export const ledgerService = new LedgerService();

