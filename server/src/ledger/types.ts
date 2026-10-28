/**
 * SatyaSetu AI — Phase 9: Immutable Audit Ledger & Regulatory Reporting
 * Core Types & Cryptographic Data Contracts
 */

export type AuditActionType =
  | 'SUBMISSION'
  | 'DOCUMENT_UPLOAD'
  | 'VERIFICATION_STARTED'
  | 'CORRECTIONS_DISPATCHED'
  | 'RESUBMISSION_RECEIVED'
  | 'APPROVAL_RECORDED'
  | 'REJECTION_RECORDED'
  | 'ADMIN_OVERRIDE_EXECUTED'
  | 'CLEARANCE_CERTIFICATE_ISSUED';

export interface AuditBlock {
  sequenceNumber: number;
  blockId: string;
  timestamp: string;
  applicationId: string;
  institutionId?: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  actionType: AuditActionType;
  actionDescription: string;
  payload: Record<string, any>;
  payloadHash: string; // SHA-256 of canonical payload JSON
  previousBlockHash: string; // SHA-256 of preceding block (00000... for genesis)
  blockHash: string; // SHA-256 of (sequence + timestamp + actionType + payloadHash + previousBlockHash)
  digitalSignature: string; // HMAC-SHA256 platform regulatory key signature
}

export interface LedgerVerificationResult {
  isValid: boolean;
  totalBlocks: number;
  verifiedBlocks: number;
  genesisHash: string;
  headHash: string;
  merkleRoot: string;
  tamperedBlockIndex?: number;
  tamperedDetails?: string;
  verifiedAt: string;
}

export interface ComplianceCertificate {
  certificateNumber: string; // Format: SAT-CERT-2026-XXXX-XXXX
  applicationId: string;
  institutionId: string;
  institutionName: string;
  institutionType: string;
  aisheCode: string;
  state: string;
  academicYear: string;
  sanctionedIntake: number;
  approvedProgramsCount: number;
  calculatedSfr: number;
  complianceScore: number;
  issuedAt: string;
  validUntil: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'REVOKED';
  issuingAuthority: string;
  authorizerName: string;
  authorizerDesignation: string;
  merkleBlockSequence: number;
  certificateDigest: string; // SHA-256 of canonical certificate payload
  qrVerificationPayload: string;
  qrVerificationUrl: string;
  digitalSealSignature: string;
}

export interface CertificateVerificationResult {
  isValid: boolean;
  certificateNumber: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'REVOKED' | 'NOT_FOUND';
  institutionName?: string;
  complianceScore?: number;
  issuedAt?: string;
  validUntil?: string;
  merkleVerificationStatus: string;
  message: string;
}

export interface RegionalMetric {
  state: string;
  totalApplications: number;
  approved: number;
  rejected: number;
  pending: number;
  complianceRatePercent: number;
}

export interface DefectFrequencyIndex {
  category: string;
  defectName: string;
  incidentCount: number;
  percentageOfTotalDefects: number;
  recommendedRemediation: string;
}

export interface DisciplineMetric {
  discipline: string;
  applicationsCount: number;
  avgSfr: number;
  complianceRatePercent: number;
}

export interface RegulatoryIntelligence {
  overallMetrics: {
    totalApplications: number;
    approvedCount: number;
    rejectedCount: number;
    underVerificationCount: number;
    actionRequiredCount: number;
    clearanceRatePercent: number;
    averageTurnaroundDays: number;
    slaAdherencePercent: number;
  };
  regionalDistribution: RegionalMetric[];
  defectFrequencyIndices: DefectFrequencyIndex[];
  disciplineDistribution: DisciplineMetric[];
  tamperForensicTrends: {
    totalScanned: number;
    cleanCount: number;
    tamperedCount: number;
    tamperRatePercent: number;
    mostFrequentAnomaly: string;
  };
  generatedAt: string;
}

export interface GazetteDossier {
  gazetteReference: string;
  title: string;
  applicationId: string;
  institutionName: string;
  aisheCode: string;
  publicationDate: string;
  academicYear: string;
  statutoryFindingsSummary: string;
  cadreSummary: string;
  infrastructureSummary: string;
  forensicAuthenticitySummary: string;
  finalRegulatoryVerdict: string;
  merkleNotarizationHash: string;
  digitalAttestation: string;
}
