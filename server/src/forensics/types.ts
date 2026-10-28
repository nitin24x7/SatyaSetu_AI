/**
 * SatyaSetu AI: Document Forensics, Anti-Fraud & Visual Integrity Analysis
 * Phase 7 Core Specifications
 */

export type ForensicAnomalyType =
  | 'COMPRESSION_DISCREPANCY_ELA'
  | 'CLONED_STAMP_SIGNATURE_CMFD'
  | 'PDF_INCREMENTAL_OVERLAY_MODIFICATION'
  | 'FONT_GLYPH_SUBSTITUTION'
  | 'CROSS_INSTITUTION_DOCUMENT_RECYCLING'
  | 'METADATA_TIMESTAMP_INCONSISTENCY'
  | 'SOFTWARE_EDIT_TAG_DETECTED';

export type ForensicVerdict = 'CLEAN' | 'SUSPICIOUS' | 'TAMPERED';

export type AnomalySeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AnomalyBoundingBox {
  x: number; // normalized 0.0 - 1.0
  y: number;
  width: number;
  height: number;
  pageNumber?: number;
  confidence: number;
  description: string;
}

export interface ForensicAnomaly {
  id: string;
  type: ForensicAnomalyType;
  severity: AnomalySeverity;
  title: string;
  location?: AnomalyBoundingBox;
  evidence: string;
  remediationAction: string;
}

export interface ElaAnalysisResult {
  meanErrorRate: number; // 0.0 to 100.0 scale
  variance: number;
  highErrorRegionsCount: number;
  hasInconsistentCompression: boolean;
  suspiciousRegions: AnomalyBoundingBox[];
  summary: string;
}

export interface ClonedRegionPair {
  sourceBox: AnomalyBoundingBox;
  targetBox: AnomalyBoundingBox;
  featureSimilarity: number; // 0.0 - 1.0
  descriptorDistance: number;
}

export interface CmfdAnalysisResult {
  keypointMatchesFound: number;
  clonedPairs: ClonedRegionPair[];
  isCloned: boolean;
  summary: string;
}

export interface PdfStructureAnalysisResult {
  incrementalUpdatesCount: number;
  overlaidLayersDetected: number;
  authoringTool: string;
  hasHiddenTextStreams: boolean;
  suspiciousAnnotationsCount: number;
  isTampered: boolean;
  summary: string;
}

export interface PerceptualHashResult {
  sha256: string;
  dhash: string; // 64-bit difference hash in hex
  ahash: string; // 64-bit average hash in hex
  isRecycled: boolean;
  matchedPreviousApplicationId?: string;
  matchedPreviousInstitution?: string;
  hammingDistance?: number;
  summary: string;
}

export interface MetadataForensicsResult {
  softwareFingerprint: string;
  creatorTool: string;
  creationDate: string;
  modificationDate: string;
  hasDiscrepantTimestamps: boolean;
  isSuspiciousSoftware: boolean; // e.g. Photoshop/Canva used on official government gazettes
  summary: string;
}

export interface ForensicReport {
  documentId: string;
  applicationId: string;
  fileName: string;
  analysisTimestamp: string;
  tamperLikelihoodScore: number; // 0.00 to 1.00
  verdict: ForensicVerdict;
  anomalies: ForensicAnomaly[];
  elaAnalysis: ElaAnalysisResult;
  cmfdAnalysis: CmfdAnalysisResult;
  pdfInspection: PdfStructureAnalysisResult;
  perceptualHash: PerceptualHashResult;
  metadataForensics: MetadataForensicsResult;
  summary: string;
}
