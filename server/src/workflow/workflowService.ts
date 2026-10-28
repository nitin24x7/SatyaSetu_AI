/**
 * SatyaSetu AI — Phase 8: Workflow Orchestration & Case Management Service
 * Central Facade Coordinating FSM, SLA Tracking, Workload Balancing & Multi-Channel Notifications
 */

import {
  ApplicationWorkflowState,
  WorkflowAction,
  TransitionEvent,
  PreconditionEvaluationResult,
  SlaTrackingRecord,
  AutoAssignmentResult,
  ReviewerWorkloadProfile,
  NotificationRecord,
  AllowedTransitionOption,
} from './types';
import { workflowStateMachine } from './stateMachine';
import { statutorySlaEngine } from './slaEngine';
import { workloadRouter } from './workloadRouter';
import { notificationDispatcher } from './notificationDispatcher';
import { applicationService } from '../services/applicationService';
import { cacheService } from '../cache/cacheService';

export class WorkflowService {
  private transitionHistory: Map<string, TransitionEvent[]> = new Map();
  private slaTracking: Map<string, SlaTrackingRecord> = new Map();

  constructor() {
    this.seedInitialHistory();
  }

  private seedInitialHistory(): void {
    const defaultAppId = 'PRM-2026-1001';
    this.transitionHistory.set(defaultAppId, [
      {
        id: `EVT-TR-INIT-001`,
        applicationId: defaultAppId,
        fromState: 'Draft',
        toState: 'Submitted',
        action: 'SUBMIT',
        actorId: 'INST-001',
        actorName: 'Dr. Suresh Kumar Nayak',
        actorRole: 'Applicant',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        preconditionsMet: true,
        comment: 'Initial institutional Extension of Approval submission for academic year 2026-2027.',
      },
      {
        id: `EVT-TR-INIT-002`,
        applicationId: defaultAppId,
        fromState: 'Submitted',
        toState: 'Under Verification',
        action: 'START_VERIFICATION',
        actorId: 'REV-001',
        actorName: 'Dr. Amitabh Sengupta',
        actorRole: 'TechnicalAssessor',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        preconditionsMet: true,
        comment: 'Intake triage completed. Verification audit commenced.',
      },
    ]);
  }

  /**
   * Execute an FSM State Transition with strict precondition validation.
   */
  async executeTransition(params: {
    applicationId: string;
    action: WorkflowAction;
    targetState: ApplicationWorkflowState;
    actorId: string;
    actorName: string;
    actorRole: 'Applicant' | 'ScrutinyOfficer' | 'TechnicalAssessor' | 'ComplianceDirector' | 'System';
    comment?: string;
    justification?: string;
    complianceScore?: number;
  }): Promise<{
    success: boolean;
    application: any;
    transitionEvent: TransitionEvent;
    sla?: SlaTrackingRecord | null;
    evaluationResult: PreconditionEvaluationResult;
  }> {
    const { applicationId, action, targetState, actorId, actorName, actorRole, comment, justification, complianceScore } = params;

    const app = await applicationService.getApplicationById(applicationId);
    if (!app) {
      throw new Error(`Application ${applicationId} not found.`);
    }

    const currentState = app.status as ApplicationWorkflowState;

    // 1. Verify FSM Topology
    if (!workflowStateMachine.isTransitionAllowed(currentState, targetState, action)) {
      throw new Error(`Illegal state transition: Cannot transition from '${currentState}' to '${targetState}' via action '${action}'.`);
    }

    // 2. Evaluate Statutory Preconditions
    const evaluation = workflowStateMachine.evaluatePreconditions(app, action, targetState, {
      comment,
      justification,
      complianceScore,
      findingsCount: app.findings?.length || 0,
    });

    if (!evaluation.canTransition) {
      throw new Error(`Precondition validation failed: ${evaluation.blockingReasons.join('; ')}`);
    }

    // 3. Update Application State
    const now = new Date().toISOString();
    app.status = targetState;
    app.updatedAt = now;
    if (comment) {
      app.reviewerComments = comment;
    }
    if (targetState === 'Verified' || targetState === 'Rejected') {
      app.decisionDate = now;
      if (targetState === 'Rejected') {
        app.rejectionReason = comment || 'Rejected on statutory compliance grounds.';
      }
    }

    // 4. Record Transition Event
    const event = workflowStateMachine.createTransitionEvent({
      applicationId,
      fromState: currentState,
      toState: targetState,
      action,
      actorId,
      actorName,
      actorRole,
      comment,
      justification,
      preconditionsMet: true,
    });

    const history = this.transitionHistory.get(applicationId) || [];
    history.unshift(event);
    this.transitionHistory.set(applicationId, history);

    // Also append to application's activityLog for backward compatibility
    app.activityLog.unshift({
      id: event.id,
      applicationId,
      actorId,
      actorName,
      actorRole: actorRole === 'Applicant' ? 'Applicant' : 'Administrator',
      action: `Workflow: ${action}`,
      description: comment || `Transitioned from ${currentState} to ${targetState}`,
      previousStatus: currentState,
      newStatus: targetState,
      timestamp: now,
      comment,
    });

    // 5. Initialize or Update SLA clock
    let sla: SlaTrackingRecord | null = null;
    const policyType = statutorySlaEngine.determinePolicyForState(targetState);
    if (policyType) {
      sla = statutorySlaEngine.createTrackingRecord(applicationId, policyType, now);
      this.slaTracking.set(applicationId, sla);
    } else {
      // Terminal state closes SLA clock
      this.slaTracking.delete(applicationId);
    }

    // 6. Multi-Channel Notification Dispatch
    await this.dispatchTransitionNotifications(app, action, targetState, comment);

    // 7. Invalidate Cache
    await cacheService.del(`apps:detail:${applicationId}`);
    await cacheService.del(`workflow:history:${applicationId}`);

    return {
      success: true,
      application: app,
      transitionEvent: event,
      sla,
      evaluationResult: evaluation,
    };
  }

  /**
   * Execute an Administrative Override to reopen finalized cases.
   */
  async executeAdminOverride(params: {
    applicationId: string;
    justification: string;
    actorId: string;
    actorName: string;
    actorRole: 'ComplianceDirector';
  }): Promise<{
    application: any;
    transitionEvent: TransitionEvent;
    sla: SlaTrackingRecord | null;
  }> {
    const { applicationId, justification, actorId, actorName, actorRole } = params;

    if (!justification || justification.trim().length < 15) {
      throw new Error('Administrative override requires a comprehensive justification (min 15 characters).');
    }

    const result = await this.executeTransition({
      applicationId,
      action: 'ADMIN_OVERRIDE',
      targetState: 'Under Verification',
      actorId,
      actorName,
      actorRole,
      justification,
      comment: `Administrative Override: ${justification}`,
    });

    // Dispatch executive override notification
    await notificationDispatcher.dispatchNotification({
      recipientId: 'EXECUTIVE-DIRECTORATE',
      recipientRole: 'director',
      eventType: 'ADMIN_OVERRIDE_APPLIED',
      applicationId,
      customMessage: `Case ${applicationId} reopened by ${actorName}. Justification: ${justification}`,
    });

    return {
      application: result.application,
      transitionEvent: result.transitionEvent,
      sla: result.sla || null,
    };
  }

  /**
   * Automatically balance and assign an application to the optimal reviewer.
   */
  async autoAssignReviewer(applicationId: string): Promise<AutoAssignmentResult> {
    const app = await applicationService.getApplicationById(applicationId);
    if (!app) {
      throw new Error(`Application ${applicationId} not found.`);
    }

    const assignment = workloadRouter.findOptimalReviewer(app);

    // Update application
    app.assignedReviewerId = assignment.assignedReviewerId;
    app.assignedReviewerName = assignment.assignedReviewerName;
    app.updatedAt = new Date().toISOString();

    app.activityLog.unshift({
      id: `ACT-ASSIGN-${Date.now()}`,
      applicationId,
      actorId: 'SYSTEM-WORKLOAD-ROUTER',
      actorName: 'Workload Balancing Engine',
      actorRole: 'System',
      action: 'Automated Reviewer Assignment',
      description: assignment.assignmentReason,
      previousStatus: app.status,
      newStatus: app.status,
      timestamp: assignment.assignedAt,
    });

    // Dispatch notifications
    await notificationDispatcher.dispatchNotification({
      recipientId: assignment.assignedReviewerId,
      recipientRole: 'admin',
      eventType: 'REVIEWER_ASSIGNED',
      applicationId,
    });

    await cacheService.del(`apps:detail:${applicationId}`);
    return assignment;
  }

  /**
   * Get allowed transitions for an application.
   */
  async getAllowedTransitions(applicationId: string): Promise<{
    applicationId: string;
    currentState: ApplicationWorkflowState;
    allowedTransitions: AllowedTransitionOption[];
  }> {
    const app = await applicationService.getApplicationById(applicationId);
    if (!app) {
      throw new Error(`Application ${applicationId} not found.`);
    }

    const currentState = app.status as ApplicationWorkflowState;
    const allowed = workflowStateMachine.getAllowedTransitions(currentState);

    return {
      applicationId,
      currentState,
      allowedTransitions: allowed,
    };
  }

  /**
   * Get full chronological state transition history for an application.
   */
  async getTransitionHistory(applicationId: string): Promise<TransitionEvent[]> {
    return this.transitionHistory.get(applicationId) || [];
  }

  /**
   * Retrieve real-time statutory SLA tracking details for an application.
   */
  async getApplicationSla(applicationId: string): Promise<SlaTrackingRecord | null> {
    const app = await applicationService.getApplicationById(applicationId);
    if (!app) return null;

    let record = this.slaTracking.get(applicationId);
    if (!record) {
      record = statutorySlaEngine.evaluateApplicationSla(app) || undefined;
      if (record) this.slaTracking.set(applicationId, record);
    } else {
      record = statutorySlaEngine.evaluateSla(record);
      this.slaTracking.set(applicationId, record);
    }

    return record || null;
  }

  /**
   * Batch evaluate all active cases for statutory SLA turnaround compliance.
   */
  async evaluateAllSlas(): Promise<{
    totalEvaluated: number;
    onTrackCount: number;
    warningCount: number;
    breachedCount: number;
    escalatedCases: string[];
    records: SlaTrackingRecord[];
  }> {
    const { items } = await applicationService.getApplications({ limit: 100 });
    const records: SlaTrackingRecord[] = [];
    let onTrack = 0;
    let warning = 0;
    let breached = 0;
    const escalated: string[] = [];

    for (const app of items) {
      const sla = await this.getApplicationSla(app.id);
      if (sla) {
        records.push(sla);
        if (sla.status === 'ON_TRACK') onTrack++;
        if (sla.status === 'WARNING') {
          warning++;
          // Trigger SLA warning notification if not already sent
          await notificationDispatcher.dispatchNotification({
            recipientId: app.assignedReviewerId || 'REVIEWER-LEAD',
            recipientRole: 'admin',
            eventType: 'SLA_WARNING',
            applicationId: app.id,
          });
        }
        if (sla.status === 'BREACHED') {
          breached++;
          escalated.push(app.id);
          // Trigger critical director escalation
          await notificationDispatcher.dispatchNotification({
            recipientId: 'COMPLIANCE-DIRECTOR',
            recipientRole: 'director',
            eventType: 'SLA_BREACH_ESCALATED',
            applicationId: app.id,
          });
        }
      }
    }

    return {
      totalEvaluated: records.length,
      onTrackCount: onTrack,
      warningCount: warning,
      breachedCount: breached,
      escalatedCases: escalated,
      records,
    };
  }

  /**
   * Get all reviewer workload profiles.
   */
  getReviewerWorkload(): ReviewerWorkloadProfile[] {
    return workloadRouter.getReviewerProfiles();
  }

  /**
   * Helper to dispatch notifications upon transition.
   */
  private async dispatchTransitionNotifications(
    app: any,
    action: WorkflowAction,
    targetState: ApplicationWorkflowState,
    comment?: string
  ): Promise<void> {
    switch (action) {
      case 'SUBMIT':
        await notificationDispatcher.dispatchNotification({
          recipientId: app.institutionId,
          recipientRole: 'applicant',
          eventType: 'APPLICATION_SUBMITTED',
          applicationId: app.id,
        });
        break;
      case 'REQUEST_CORRECTIONS':
        await notificationDispatcher.dispatchNotification({
          recipientId: app.institutionId,
          recipientRole: 'applicant',
          eventType: 'CORRECTIONS_REQUESTED',
          applicationId: app.id,
          customMessage: comment,
        });
        break;
      case 'RESUBMIT':
        await notificationDispatcher.dispatchNotification({
          recipientId: app.assignedReviewerId || 'SCRUTINY-DESK',
          recipientRole: 'admin',
          eventType: 'RESUBMISSION_RECEIVED',
          applicationId: app.id,
          customMessage: comment,
        });
        break;
      case 'APPROVE':
        await notificationDispatcher.dispatchNotification({
          recipientId: app.institutionId,
          recipientRole: 'applicant',
          eventType: 'APPLICATION_APPROVED',
          applicationId: app.id,
        });
        break;
      case 'REJECT':
        await notificationDispatcher.dispatchNotification({
          recipientId: app.institutionId,
          recipientRole: 'applicant',
          eventType: 'APPLICATION_REJECTED',
          applicationId: app.id,
          customMessage: comment,
        });
        break;
      default:
        break;
    }
  }
}

export const workflowService = new WorkflowService();

