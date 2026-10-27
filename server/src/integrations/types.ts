/**
 * SatyaSetu AI: Statutory Integrations (DigiLocker, Aadhaar eSign, AISHE / NAD)
 * Phase 6 Core Types
 */

export interface DigiLockerPullRequest {
  docUri: string;
  docType: 'CHARTER' | 'AFFILIATION_ORDER' | 'ACCREDITATION_CERT' | 'DEGREE' | 'LAND_TITLE';
  consent: boolean;
  institutionAisheCode: string;
}

export interface DigiLockerDocument {
  docUri: string;
  docType: string;
  documentTitle: string;
  issuerId: string;
  issuerName: string;
  issuedTo: string;
  issueDate: string;
  expiryDate?: string;
  digitalSignature: {
    signerName: string;
    certifyingAuthority: string;
    verified: boolean;
    timestamp: string;
    algorithm: string;
  };
  attributes: Record<string, string>;
  verificationStatus: 'VERIFIED' | 'TAMPERED' | 'EXPIRED';
}

export interface ESignVerificationRequest {
  documentId: string;
  fileName: string;
  signatureHex?: string;
  certificatePem?: string;
  timestampIso?: string;
  signerAadhaarRef?: string;
}

export interface ESignVerificationResult {
  documentId: string;
  fileName: string;
  isSignatureValid: boolean;
  signerName: string;
  signerDesignation: string;
  signingTime: string;
  certifyingAuthority: string; // e.g. "e-Mudhra / (CCA) Government of India"
  certValidityStatus: 'VALID' | 'REVOKED' | 'EXPIRED';
  isAadhaarVerified: boolean;
  nonRepudiationGuaranteed: boolean;
  tamperIntegrityVerified: boolean;
  auditTrailReference: string;
  summary: string;
}

export interface AisheSyncRequest {
  aisheCode: string;
}

export interface AisheSyncResult {
  aisheCode: string;
  legalName: string;
  institutionType: string;
  state: string;
  district: string;
  establishedYear: number;
  accreditedProgramsCount: number;
  totalSanctionedIntake: number;
  statutoryStanding: 'ACTIVE_GOOD_STANDING' | 'UNDER_REVIEW' | 'FLAGGED_DEFICIT';
  lastSynchronizedAt: string;
  registrySource: string;
}

export interface IntegrationStatus {
  service: string;
  endpoint: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  responseTimeMs: number;
  lastHeartbeat: string;
  securityStandard: string;
}
