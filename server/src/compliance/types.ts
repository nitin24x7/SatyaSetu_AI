/**
 * SatyaSetu AI: Deterministic Compliance Verification & Concordance Engine Types
 * Phase 5 Core Specifications
 */

export interface SimilarityResult {
  levenshteinDistance: number;
  jaroSimilarity: number;
  jaroWinklerSimilarity: number;
  tokenSortRatio: number;
  confidence: number; // 0.0 - 1.0
  matchLevel: 'EXACT_MATCH' | 'STRONG_MATCH' | 'PARTIAL_MATCH' | 'DISCREPANCY';
}

export interface ConcordanceItem {
  fieldKey: string;
  fieldLabel: string;
  declaredValue: string;
  extractedValue: string;
  sourceDocument: string;
  similarity: SimilarityResult;
  status: 'CONCORDANT' | 'WARNING' | 'MISMATCH';
  remediationAdvice?: string;
}

export interface ConcordanceReport {
  overallScore: number; // 0 - 100
  concordanceStatus: 'CONCORDANT' | 'NEEDS_REVIEW' | 'DISCREPANCY_DETECTED';
  totalFieldsCompared: number;
  concordantCount: number;
  warningCount: number;
  mismatchCount: number;
  items: ConcordanceItem[];
}

export interface TemporalCheckResult {
  certificateType: string;
  issuanceDate?: string;
  expiryDate?: string;
  academicYear: string;
  isValid: boolean;
  isExpired: boolean;
  daysRemaining?: number;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'UNSPECIFIED';
  details: string;
}

export interface CadreCalculusResult {
  totalStudents: number;
  totalFaculty: number;
  calculatedSfr: number;
  mandatedSfrCeiling: number;
  isSfrCompliant: boolean;
  cadreDistribution: {
    professors: number;
    assocProfessors: number;
    asstProfessors: number;
    ratio: string;
    isCadreRatioCompliant: boolean;
  };
  summary: string;
}

export interface InfrastructureCalculusResult {
  totalBuiltAreaSqM: number;
  mandatedMinimumSqM: number;
  deficitSurplusPercent: number;
  isCompliant: boolean;
  summary: string;
}

export type RuleSeverity = 'Pass' | 'Warning' | 'Fail';

export interface RuleEvaluationResult {
  ruleId: string;
  title: string;
  category: string;
  severity: RuleSeverity;
  status: 'Pass' | 'Warning' | 'Fail';
  scoreContribution: number;
  maxScore: number;
  evidence: string;
  recommendedAction?: string;
}

export interface ComplianceEvaluationContext {
  application: any;
  institution?: any;
  documents?: any[];
  idpResult?: any;
}

export interface ComplianceRule {
  id: string;
  code: string;
  title: string;
  category: 'CONCORDANCE' | 'TEMPORAL' | 'CADRE_NORMS' | 'INFRASTRUCTURE' | 'STATUTORY_LEGAL';
  regulatoryStandard: string;
  description: string;
  weight: number;
  evaluate: (context: ComplianceEvaluationContext) => RuleEvaluationResult;
}

export interface ComplianceEvaluationSummary {
  applicationId: string;
  institutionName: string;
  evaluationTimestamp: string;
  overallScore: number; // 0 - 100
  riskLevel: 'Low' | 'Medium' | 'High';
  findings: RuleEvaluationResult[];
  concordanceReport: ConcordanceReport;
  cadreCheck?: CadreCalculusResult;
  infrastructureCheck?: InfrastructureCalculusResult;
  temporalChecks: TemporalCheckResult[];
  recommendedDecision: 'Approve' | 'Request Corrections' | 'Reject' | 'Priority Triage';
}

