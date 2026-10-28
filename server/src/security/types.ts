/**
 * SatyaSetu AI - Production Security, Load Testing & Staging Types
 * Phase 10: Security Auditing (Cert-In), Load Testing, Disaster Recovery & Staging Runbooks
 */

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
export type AuditFindingStatus = 'PASS' | 'FAIL' | 'REMEDIATED' | 'ACCEPTED_RISK';

export interface SecurityFinding {
  id: string;
  category: 'OWASP_TOP_10' | 'CERT_IN' | 'DPDP_ACT' | 'INFRASTRUCTURE' | 'CRYPTOGRAPHIC';
  ruleCode: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  status: AuditFindingStatus;
  affectedComponent: string;
  remediationGuideline: string;
  verificationEvidence?: string;
  timestamp: string;
}

export interface CertInAuditReport {
  reportId: string;
  auditScope: string;
  empanelledAuditor: string;
  standard: string; // e.g., "CERT-In Guidelines 2026 / ISO 27001 / OWASP Top 10"
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'CONDITIONALLY_COMPLIANT';
  overallScore: number; // 0 - 100
  totalChecksEvaluated: number;
  passedChecks: number;
  criticalVulnerabilitiesCount: number;
  highVulnerabilitiesCount: number;
  mediumVulnerabilitiesCount: number;
  lowVulnerabilitiesCount: number;
  findings: SecurityFinding[];
  cryptographicSignature: string;
  generatedAt: string;
  validUntil: string;
}

export interface DpdpRedactionResult {
  originalLength: number;
  redactedLength: number;
  redactedText: string;
  detectedPiiEntities: Array<{
    type: 'AADHAAR' | 'PAN' | 'PHONE' | 'EMAIL' | 'BANK_ACCOUNT' | 'PASSPORT';
    originalMasked: string;
    startIndex: number;
    endIndex: number;
    lawfulBasis: string;
  }>;
  complianceAttestation: {
    act: string;
    section: string;
    tamperProofHash: string;
    timestamp: string;
  };
}

export interface LoadTestBenchmarkConfig {
  testId?: string;
  scenarioName: string;
  concurrentSubmissions: number; // e.g., 10000
  durationSeconds: number; // e.g., 60
  rampUpSeconds: number;
  targetEndpoint: string;
  peakRpsThreshold: number;
}

export interface LatencyDistribution {
  minMs: number;
  p50Ms: number;
  p90Ms: number;
  p95Ms: number;
  p99Ms: number;
  maxMs: number;
  standardDeviationMs: number;
}

export interface LoadTestBenchmarkReport {
  testId: string;
  scenarioName: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  totalSubmissionsExecuted: number;
  successfulSubmissions: number;
  failedSubmissions: number;
  errorRatePercentage: number;
  achievedThroughputRps: number;
  targetThroughputRps: number;
  concurrencyLevel: number;
  latency: LatencyDistribution;
  systemResourceTelemetry: {
    peakCpuUtilizationPercentage: number;
    peakMemoryUtilizationMb: number;
    databaseConnectionPoolUsage: number; // 0 - 100%
    redisCacheHitRatio: number; // percentage
  };
  bottleneckAnalysis: string[];
  verdict: 'PASSED' | 'FAILED' | 'DEGRADED';
}

export interface DisasterRecoveryStatus {
  serviceName: string;
  deploymentMode: 'ACTIVE_ACTIVE' | 'ACTIVE_PASSIVE';
  primaryRegion: string;
  standbyRegion: string;
  targetRpoSeconds: number; // Recovery Point Objective target (e.g. 1s)
  achievedRpoSeconds: number; // Live RPO (e.g. 0.24s)
  targetRtoSeconds: number; // Recovery Time Objective target (e.g. 30s)
  achievedRtoSeconds: number; // Live RTO (e.g. 8.4s)
  replicationHealth: {
    postgresReplicationLagBytes: number;
    postgresSyncState: 'STREAMING' | 'CATCHING_UP' | 'DESYNCHRONIZED';
    minioObjectReplicationSync: 'SYNCHRONIZED' | 'PENDING' | 'ERROR';
    redisSentinelQuorum: boolean;
  };
  lastDrillExecution: {
    drillId: string;
    timestamp: string;
    durationSeconds: number;
    simulatedFailureType: 'REGION_OUTAGE' | 'PRIMARY_DB_CRASH' | 'S3_STORAGE_PARTITION';
    failoverStatus: 'SUCCESSFUL' | 'FAILED';
    dataLossBytes: number;
  };
  operationalReadiness: 'READY' | 'MAINTENANCE_REQUIRED' | 'DEGRADED';
}

export type RolloutStage = 'STAGE_A_CLOSED_PILOT' | 'STAGE_B_STATEWIDE_STAGING' | 'STAGE_C_NATIONAL_GO_LIVE';

export interface StageReadinessGate {
  gateCode: string;
  title: string;
  mandatory: boolean;
  satisfied: boolean;
  evaluationDetails: string;
}

export interface PilotInstitutionEnrollment {
  institutionId: string;
  institutionName: string;
  state: string;
  category: 'CENTRAL_UNIVERSITY' | 'STATE_AFFILIATED' | 'AUTONOMOUS' | 'POLYTECHNIC';
  onboardedAt: string;
  applicationsProcessed: number;
  errorIncidentCount: number;
  activeStatus: 'ACTIVE' | 'SUSPENDED';
}

export interface StagingRolloutStatus {
  currentStage: RolloutStage;
  stageDisplayName: string;
  progressPercentage: number;
  targetGoLiveDate: string;
  enrolledInstitutions: PilotInstitutionEnrollment[];
  readinessGates: StageReadinessGate[];
  allGatesSatisfied: boolean;
  allowedNextStage?: RolloutStage;
  lastPromotedAt: string;
}

export interface ProductionRunbookEntry {
  sopId: string;
  title: string;
  category: 'INCIDENT_RESPONSE' | 'DISASTER_RECOVERY' | 'SECRET_ROTATION' | 'ZERO_DOWNTIME_DEPLOYMENT' | 'DATA_BACKUP';
  triggerCondition: string;
  escalationMatrix: string[];
  executionSteps: string[];
  automatedActionAvailable: boolean;
}

