/**
 * SatyaSetu AI — Phase 8: Workflow Orchestration, Case Management & Statutory SLA Engine
 * Core Domain Types & Data Contracts
 */

export type ApplicationWorkflowState =
  | 'Draft'
  | 'Submitted'
  | 'Under Verification'
  | 'Action Required'
  | 'Resubmitted'
  | 'Verified'
  | 'Rejected';

export type WorkflowAction =
  | 'SUBMIT'
  | 'START_VERIFICATION'
  | 'REQUEST_CORRECTIONS'
  | 'RESUBMIT'
  | 'APPROVE'
  | 'REJECT'
  | 'ADMIN_OVERRIDE'
  | 'REOPEN';

export interface PreconditionCheck {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  severity: 'BLOCKING' | 'WARNING';
  details?: string;
}

export interface PreconditionEvaluationResult {
  canTransition: boolean;
  checks: PreconditionCheck[];
  blockingReasons: string[];
  warnings: string[];
}

export interface TransitionEvent {
  id: string;
  applicationId: string;
  fromState: ApplicationWorkflowState;
  toState: ApplicationWorkflowState;
  action: WorkflowAction;
  actorId: string;
  actorName: string;
  actorRole: 'Applicant' | 'ScrutinyOfficer' | 'TechnicalAssessor' | 'ComplianceDirector' | 'System';
  timestamp: string;
  comment?: string;
  justification?: string;
  preconditionsMet: boolean;
  metadata?: Record<string, any>;
}

export type SlaPolicyType =
  | 'INITIAL_SCRUTINY'      // 7 statutory days for intake triage
  | 'TECHNICAL_ASSESSMENT'   // 14 statutory days for committee evaluation
  | 'APPLICANT_REMEDIATION'  // 10 statutory days for correction submission
  | 'EXPEDITED_REVIEW';      // 3 statutory days for high-priority or resubmissions

export type SlaStatus = 'ON_TRACK' | 'WARNING' | 'BREACHED';

export type EscalationLevel =
  | 'NORMAL'
  | 'LEVEL_1_LEAD_NOTIFIED'
  | 'LEVEL_2_DIRECTOR_ESCALATED';

export interface SlaPolicyConfig {
  policyType: SlaPolicyType;
  allowedHours: number;
  warningThresholdPercent: number; // e.g. 80%
  escalationRole: string;
  description: string;
}

export interface SlaTrackingRecord {
  applicationId: string;
  policyType: SlaPolicyType;
  startTimestamp: string;
  deadlineTimestamp: string;
  elapsedHours: number;
  remainingHours: number;
  percentageElapsed: number;
  status: SlaStatus;
  escalationLevel: EscalationLevel;
  escalatedAt?: string;
  escalatedTo?: string;
  lastEvaluatedAt: string;
}

export interface ReviewerWorkloadProfile {
  reviewerId: string;
  name: string;
  email: string;
  department: string;
  disciplines: string[];
  currentActiveCases: number;
  maxCapacity: number;
  utilizationRate: number; // 0.0 - 1.0
  slaAdherenceScore: number; // 0.0 - 1.0 (e.g. 0.95 = 95% on-time closures)
  isAvailable: boolean;
}

export interface AutoAssignmentResult {
  applicationId: string;
  assignedReviewerId: string;
  assignedReviewerName: string;
  department: string;
  matchScore: number; // 0 - 100
  assignmentReason: string;
  assignedAt: string;
}

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'WEBHOOK';

export type NotificationEventType =
  | 'APPLICATION_SUBMITTED'
  | 'REVIEWER_ASSIGNED'
  | 'CORRECTIONS_REQUESTED'
  | 'RESUBMISSION_RECEIVED'
  | 'SLA_WARNING'
  | 'SLA_BREACH_ESCALATED'
  | 'APPLICATION_APPROVED'
  | 'APPLICATION_REJECTED'
  | 'ADMIN_OVERRIDE_APPLIED';

export interface NotificationRecord {
  id: string;
  recipientId: string;
  recipientRole: 'applicant' | 'admin' | 'director' | 'all';
  channel: NotificationChannel;
  eventType: NotificationEventType;
  title: string;
  message: string;
  applicationId?: string;
  status: 'DISPATCHED' | 'DELIVERED' | 'FAILED';
  read: boolean;
  createdAt: string;
  metadata?: {
    emailTo?: string;
    phoneTo?: string;
    webhookUrl?: string;
    dltHeader?: string;
    deliveryTimestamp?: string;
  };
}

export interface AllowedTransitionOption {
  action: WorkflowAction;
  targetState: ApplicationWorkflowState;
  label: string;
  description: string;
  requiresComment: boolean;
  requiresJustification: boolean;
  requiredRole: string[];
}
