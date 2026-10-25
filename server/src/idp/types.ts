/**
 * SatyaSetu AI: Intelligent Document Processing (IDP) & OCR Types
 * Phase 4 Core Specifications
 */

export type DocumentLayoutType =
  | 'HEADER_GAZETTE_TITLE'
  | 'SEAL_STAMP_ZONE'
  | 'SIGNATURE_BLOCK'
  | 'KEY_VALUE_METADATA'
  | 'TABULAR_ROSTER_GRID'
  | 'STATUTORY_LEGAL_CLAUSE'
  | 'NOTARY_ENDORSEMENT';

export type JobStatus =
  | 'QUEUED'
  | 'PREPROCESSING'
  | 'EXTRACTING_OCR'
  | 'PARSING_TABLES'
  | 'EXTRACTING_ENTITIES'
  | 'COMPLETED'
  | 'FAILED';

export interface BoundingBox {
  x: number;      // normalized 0.0 - 1.0 or pixel coordinates
  y: number;
  width: number;
  height: number;
}

export interface OcrToken {
  text: string;
  confidence: number; // 0.0 to 1.0
  bbox: BoundingBox;
  language?: string;  // 'eng', 'hin', 'kan', 'tam', etc.
}

export interface LayoutSegment {
  id: string;
  type: DocumentLayoutType;
  bbox: BoundingBox;
  confidence: number;
  rawText: string;
  tokens: OcrToken[];
}

export interface TableCell {
  rowIndex: number;
  colIndex: number;
  rowSpan?: number;
  colSpan?: number;
  text: string;
  confidence: number;
  bbox?: BoundingBox;
}

export interface ExtractedTable {
  id: string;
  caption: string;
  rowCount: number;
  colCount: number;
  headers: string[];
  rows: string[][];
  cells: TableCell[];
  mathematicalValidation?: {
    checked: boolean;
    valid: boolean;
    summary: string;
  };
}

export interface ExtractedEntity {
  fieldKey: string;
  label: string;
  extractedValue: string | number | boolean;
  confidence: number;
  sourceSegmentType: DocumentLayoutType;
  boundingPolygon?: BoundingBox;
  validationStatus: 'VALID' | 'WARNING' | 'MISMATCH' | 'UNVERIFIED';
}

export interface PreprocessingMetrics {
  originalDpi: number;
  targetDpi: number;
  deskewAngleDegrees: number;
  noiseReductionApplied: boolean;
  contrastRatio: number;
  grayscaleBinarized: boolean;
  pageCount: number;
}

export interface IdpProcessingResult {
  jobId: string;
  documentId: string;
  applicationId: string;
  fileName: string;
  category: string;
  status: JobStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  preprocessing: PreprocessingMetrics;
  layoutSegments: LayoutSegment[];
  ocrWordCount: number;
  averageConfidence: number;
  extractedEntities: Record<string, ExtractedEntity>;
  extractedTables: ExtractedTable[];
  tamperScan: {
    tamperLikelihoodScore: number; // 0.00 to 1.00
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    anomaliesDetected: string[];
  };
  errors?: string[];
}

export interface IdpJobSummary {
  jobId: string;
  documentId: string;
  applicationId: string;
  fileName: string;
  status: JobStatus;
  progressPercent: number;
  currentStage: string;
  enqueuedAt: string;
  updatedAt: string;
}
