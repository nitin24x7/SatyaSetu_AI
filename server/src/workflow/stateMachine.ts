/**
 * SatyaSetu AI — Phase 8: Workflow Orchestration & Case Management
 * Finite State Machine (FSM) Engine with Strict Transition Guards & Audit Logging
 */

import crypto from 'crypto';
import {
  ApplicationWorkflowState,
  WorkflowAction,
  TransitionEvent,
  PreconditionEvaluationResult,
  PreconditionCheck,
  AllowedTransitionOption,
} from './types';

export class WorkflowStateMachine {
  /**
   * Transition graph defining allowed paths from each operational state.
   */
  private readonly transitionGraph: Record<
    ApplicationWorkflowState,
    { action: WorkflowAction; targetState: ApplicationWorkflowState; requiredRole: string[] }[]
  > = {
    Draft: [
      { action: 'SUBMIT', targetState: 'Submitted', requiredRole: ['InstitutionalApplicant', 'applicant:submit'] },
    ],
    Submitted: [
      { action: 'START_VERIFICATION', targetState: 'Under Verification', requiredRole: ['ScrutinyOfficer', 'TechnicalAssessor', 'ComplianceDirector', 'admin:review'] },
      { action: 'REJECT', targetState: 'Rejected', requiredRole: ['ComplianceDirector', 'admin:decide'] },
    ],
    'Under Verification': [
      { action: 'REQUEST_CORRECTIONS', targetState: 'Action Required', requiredRole: ['ScrutinyOfficer', 'TechnicalAssessor', 'admin:review'] },
      { action: 'APPROVE', targetState: 'Verified', requiredRole: ['TechnicalAssessor', 'ComplianceDirector', 'admin:decide'] },
      { action: 'REJECT', targetState: 'Rejected', requiredRole: ['ComplianceDirector', 'admin:decide'] },
    ],
    'Action Required': [
      { action: 'RESUBMIT', targetState: 'Resubmitted', requiredRole: ['InstitutionalApplicant', 'applicant:resubmit'] },
    ],
    Resubmitted: [
      { action: 'START_VERIFICATION', targetState: 'Under Verification', requiredRole: ['ScrutinyOfficer', 'TechnicalAssessor', 'ComplianceDirector', 'admin:review'] },
      { action: 'REQUEST_CORRECTIONS', targetState: 'Action Required', requiredRole: ['ScrutinyOfficer', 'TechnicalAssessor', 'admin:review'] },
      { action: 'APPROVE', targetState: 'Verified', requiredRole: ['TechnicalAssessor', 'ComplianceDirector', 'admin:decide'] },
      { action: 'REJECT', targetState: 'Rejected', requiredRole: ['ComplianceDirector', 'admin:decide'] },
    ],
    Verified: [], // Terminal state, unlocked only via ADMIN_OVERRIDE
    Rejected: [], // Terminal state, unlocked only via ADMIN_OVERRIDE
  };

  /**
   * Determine whether a direct state transition is permitted by the FSM topology.
   */
  isTransitionAllowed(fromState: ApplicationWorkflowState, targetState: ApplicationWorkflowState, action: WorkflowAction): boolean {
    if (action === 'ADMIN_OVERRIDE') {
      // Administrative override can transition from terminal or intermediate states to Under Verification or Draft
      return targetState === 'Under Verification' || targetState === 'Draft';
    }

    const transitions = this.transitionGraph[fromState] || [];
    return transitions.some((t) => t.action === action && t.targetState === targetState);
  }

  /**
   * Retrieve list of valid next actions and states from the current state.
   */
  getAllowedTransitions(currentState: ApplicationWorkflowState): AllowedTransitionOption[] {
    const list: AllowedTransitionOption[] = [];

    const transitions = this.transitionGraph[currentState] || [];
    for (const t of transitions) {
      list.push(this.describeTransition(t.action, t.targetState, t.requiredRole));
    }

    // Always permit administrative override for terminal or stalled states
    if (currentState === 'Verified' || currentState === 'Rejected') {
      list.push({
        action: 'ADMIN_OVERRIDE',
        targetState: 'Under Verification',
        label: 'Statutory Administrative Override',
        description: 'Reopen finalized regulatory case under authorized directorate review.',
        requiresComment: false,
        requiresJustification: true,
        requiredRole: ['ComplianceDirector', 'admin:override'],
      });
    }

    return list;
  }

  /**
   * Evaluate statutory preconditions before executing an FSM transition.
   */
  evaluatePreconditions(
    application: any,
    action: WorkflowAction,
    targetState: ApplicationWorkflowState,
    context?: {
      comment?: string;
      justification?: string;
      complianceScore?: number;
      findingsCount?: number;
    }
  ): PreconditionEvaluationResult {
    const checks: PreconditionCheck[] = [];
    const blockingReasons: string[] = [];
    const warnings: string[] = [];

    // 1. Preconditions for SUBMIT
    if (action === 'SUBMIT') {
      const docs = application.documents || [];
      const hasDocs = docs.length > 0;
      checks.push({
        id: 'PRE-DOCS-EXIST',
        name: 'Statutory Documents Present',
        description: 'Application dossier must contain uploaded institutional filings.',
        passed: hasDocs,
        severity: 'BLOCKING',
        details: hasDocs ? `${docs.length} document(s) uploaded.` : 'No documents found in dossier.',
      });
      if (!hasDocs) blockingReasons.push('Cannot submit application without mandatory statutory documents.');

      const hasAishe = Boolean(application.institutionId || application.referenceNumber);
      checks.push({
        id: 'PRE-REG-ID',
        name: 'Institutional Identity Bound',
        description: 'Application must be linked to a recognized statutory institution code.',
        passed: hasAishe,
        severity: 'BLOCKING',
        details: hasAishe ? 'Institutional reference confirmed.' : 'Missing institution reference ID.',
      });
      if (!hasAishe) blockingReasons.push('Missing institutional identity reference.');
    }

    // 2. Preconditions for REQUEST_CORRECTIONS
    if (action === 'REQUEST_CORRECTIONS') {
      const commentValid = Boolean(context?.comment && context.comment.trim().length >= 10);
      checks.push({
        id: 'PRE-CORR-COMMENT',
        name: 'Correction Instructions Provided',
        description: 'Assessor must provide actionable clarification or correction instructions (min 10 chars).',
        passed: commentValid,
        severity: 'BLOCKING',
        details: commentValid ? 'Instructions validated.' : 'Remarks too short or missing.',
      });
      if (!commentValid) blockingReasons.push('Assessor must provide explicit correction directions with at least 10 characters.');
    }

    // 3. Preconditions for APPROVE (Verified)
    if (action === 'APPROVE') {
      const score = context?.complianceScore ?? 85;
      const scorePassed = score >= 75;
      checks.push({
        id: 'PRE-COMPLIANCE-THRESHOLD',
        name: 'Minimum Compliance Score Ceiling',
        description: 'Application must achieve an overall compliance concordance score of at least 75%.',
        passed: scorePassed,
        severity: 'BLOCKING',
        details: `Current evaluated score: ${score}%. Required: >= 75%.`,
      });
      if (!scorePassed) blockingReasons.push(`Compliance score (${score}%) falls below statutory approval threshold (75%).`);

      const openCriticalFindings = (application.findings || []).filter(
        (f: any) => f.severity === 'Critical' && f.status === 'Fail'
      );
      const noCritical = openCriticalFindings.length === 0;
      checks.push({
        id: 'PRE-NO-CRITICAL-FAILURES',
        name: 'Zero Critical Deficiencies',
        description: 'Case cannot be approved with unresolved Critical statutory failures.',
        passed: noCritical,
        severity: 'BLOCKING',
        details: noCritical ? 'Zero critical failures.' : `${openCriticalFindings.length} critical defect(s) unresolved.`,
      });
      if (!noCritical) blockingReasons.push(`Case contains ${openCriticalFindings.length} unresolved critical statutory defect(s).`);
    }

    // 4. Preconditions for REJECT
    if (action === 'REJECT') {
      const reasonValid = Boolean(context?.comment && context.comment.trim().length >= 15);
      checks.push({
        id: 'PRE-REJECT-REASON',
        name: 'Statutory Rejection Grounds',
        description: 'Regulatory rejection requires recorded statutory grounds (minimum 15 characters).',
        passed: reasonValid,
        severity: 'BLOCKING',
        details: reasonValid ? 'Rejection grounds recorded.' : 'Rejection reason missing or too brief.',
      });
      if (!reasonValid) blockingReasons.push('Statutory rejection requires comprehensive recorded grounds (min 15 characters).');
    }

    // 5. Preconditions for RESUBMIT
    if (action === 'RESUBMIT') {
      const responseValid = Boolean(context?.comment && context.comment.trim().length >= 10);
      checks.push({
        id: 'PRE-RESUBMIT-EXPLANATION',
        name: 'Applicant Clarification Statement',
        description: 'Institution must supply an explanatory response addressing assessor findings.',
        passed: responseValid,
        severity: 'BLOCKING',
        details: responseValid ? 'Clarification provided.' : 'Missing clarification statement.',
      });
      if (!responseValid) blockingReasons.push('Applicant must provide an explanatory clarification addressing requested revisions.');
    }

    // 6. Preconditions for ADMIN_OVERRIDE
    if (action === 'ADMIN_OVERRIDE') {
      const justificationValid = Boolean(context?.justification && context.justification.trim().length >= 15);
      checks.push({
        id: 'PRE-OVERRIDE-JUSTIFICATION',
        name: 'Administrative Override Justification',
        description: 'Statutory override requires executive legal justification recorded in immutable logs.',
        passed: justificationValid,
        severity: 'BLOCKING',
        details: justificationValid ? 'Justification recorded.' : 'Justification missing or insufficient.',
      });
      if (!justificationValid) blockingReasons.push('Executive administrative override requires a detailed legal justification (min 15 chars).');
    }

    return {
      canTransition: blockingReasons.length === 0,
      checks,
      blockingReasons,
      warnings,
    };
  }

  /**
   * Helper to build human-readable transition descriptor.
   */
  private describeTransition(action: WorkflowAction, targetState: ApplicationWorkflowState, requiredRole: string[]): AllowedTransitionOption {
    switch (action) {
      case 'SUBMIT':
        return {
          action,
          targetState,
          label: 'Formal Application Submission',
          description: 'Submit institutional dossier for regulatory intake triage.',
          requiresComment: false,
          requiresJustification: false,
          requiredRole,
        };
      case 'START_VERIFICATION':
        return {
          action,
          targetState,
          label: 'Commence Verification Audit',
          description: 'Assign scrutiny officer and lock application into verification workspace.',
          requiresComment: false,
          requiresJustification: false,
          requiredRole,
        };
      case 'REQUEST_CORRECTIONS':
        return {
          action,
          targetState,
          label: 'Issue Correction Notice',
          description: 'Dispatch discrepancy report to applicant with required amendments.',
          requiresComment: true,
          requiresJustification: false,
          requiredRole,
        };
      case 'RESUBMIT':
        return {
          action,
          targetState,
          label: 'Resubmit with Revisions',
          description: 'Upload corrected documents and resubmit case for expedited review.',
          requiresComment: true,
          requiresJustification: false,
          requiredRole,
        };
      case 'APPROVE':
        return {
          action,
          targetState,
          label: 'Record Regulatory Approval',
          description: 'Formally approve statutory compliance verification and issue clearance certificate.',
          requiresComment: true,
          requiresJustification: false,
          requiredRole,
        };
      case 'REJECT':
        return {
          action,
          targetState,
          label: 'Reject Application',
          description: 'Formally reject application on statutory non-compliance grounds.',
          requiresComment: true,
          requiresJustification: false,
          requiredRole,
        };
      case 'ADMIN_OVERRIDE':
        return {
          action,
          targetState,
          label: 'Executive Administrative Override',
          description: 'Reopen case for re-evaluation with mandatory justification logging.',
          requiresComment: false,
          requiresJustification: true,
          requiredRole,
        };
      default:
        return {
          action,
          targetState,
          label: action,
          description: `Transition to ${targetState}`,
          requiresComment: false,
          requiresJustification: false,
          requiredRole,
        };
    }
  }

  /**
   * Construct an immutable TransitionEvent record.
   */
  createTransitionEvent(params: {
    applicationId: string;
    fromState: ApplicationWorkflowState;
    toState: ApplicationWorkflowState;
    action: WorkflowAction;
    actorId: string;
    actorName: string;
    actorRole: 'Applicant' | 'ScrutinyOfficer' | 'TechnicalAssessor' | 'ComplianceDirector' | 'System';
    comment?: string;
    justification?: string;
    preconditionsMet: boolean;
    metadata?: Record<string, any>;
  }): TransitionEvent {
    return {
      id: `EVT-TR-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      applicationId: params.applicationId,
      fromState: params.fromState,
      toState: params.toState,
      action: params.action,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      timestamp: new Date().toISOString(),
      comment: params.comment,
      justification: params.justification,
      preconditionsMet: params.preconditionsMet,
      metadata: params.metadata,
    };
  }
}

export const workflowStateMachine = new WorkflowStateMachine();
