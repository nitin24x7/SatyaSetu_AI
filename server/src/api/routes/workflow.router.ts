/**
 * SatyaSetu AI — Phase 8: Workflow Orchestration & SLA Gateway Router
 * REST Endpoints for FSM Transitions, Overrides, SLA Telemetry, Workload Balancing & Notifications
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { workflowService } from '../../workflow/workflowService';
import { notificationDispatcher } from '../../workflow/notificationDispatcher';

const router = Router();

// Validation Schemas
const TransitionSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  action: z.enum([
    'SUBMIT',
    'START_VERIFICATION',
    'REQUEST_CORRECTIONS',
    'RESUBMIT',
    'APPROVE',
    'REJECT',
    'ADMIN_OVERRIDE',
    'REOPEN',
  ]),
  targetState: z.enum([
    'Draft',
    'Submitted',
    'Under Verification',
    'Action Required',
    'Resubmitted',
    'Verified',
    'Rejected',
  ]),
  actorId: z.string().min(1, 'Actor ID is required'),
  actorName: z.string().min(1, 'Actor Name is required'),
  actorRole: z.enum(['Applicant', 'ScrutinyOfficer', 'TechnicalAssessor', 'ComplianceDirector', 'System']),
  comment: z.string().optional(),
  justification: z.string().optional(),
  complianceScore: z.number().min(0).max(100).optional(),
});

const OverrideSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  justification: z.string().min(15, 'Administrative override requires at least 15 characters of legal justification'),
  actorId: z.string().min(1, 'Actor ID is required'),
  actorName: z.string().min(1, 'Actor Name is required'),
});

const AutoAssignSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
});

const DispatchNotificationSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required'),
  recipientRole: z.enum(['applicant', 'admin', 'director', 'all']),
  eventType: z.enum([
    'APPLICATION_SUBMITTED',
    'REVIEWER_ASSIGNED',
    'CORRECTIONS_REQUESTED',
    'RESUBMISSION_RECEIVED',
    'SLA_WARNING',
    'SLA_BREACH_ESCALATED',
    'APPLICATION_APPROVED',
    'APPLICATION_REJECTED',
    'ADMIN_OVERRIDE_APPLIED',
  ]),
  applicationId: z.string().optional(),
  channels: z.array(z.enum(['IN_APP', 'EMAIL', 'SMS', 'WEBHOOK'])).optional(),
  customTitle: z.string().optional(),
  customMessage: z.string().optional(),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional(),
});

/**
 * POST /api/v1/workflow/transition
 * Execute an FSM State Transition with statutory precondition checks.
 */
router.post('/transition', async (req: Request, res: Response) => {
  try {
    const validated = TransitionSchema.parse(req.body);
    const result = await workflowService.executeTransition(validated);

    return res.status(200).json({
      success: true,
      message: `Application ${validated.applicationId} transitioned to '${validated.targetState}' successfully.`,
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: 'WorkflowTransitionError',
      message: err.message || 'Failed to execute state transition.',
    });
  }
});

/**
 * POST /api/v1/workflow/override
 * Execute an Administrative Override by Compliance Director to reopen finalized cases.
 */
router.post('/override', async (req: Request, res: Response) => {
  try {
    const validated = OverrideSchema.parse(req.body);
    const result = await workflowService.executeAdminOverride({
      ...validated,
      actorRole: 'ComplianceDirector',
    });

    return res.status(200).json({
      success: true,
      message: `Administrative override executed successfully for case ${validated.applicationId}.`,
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: 'AdministrativeOverrideError',
      message: err.message || 'Failed to execute administrative override.',
    });
  }
});

/**
 * GET /api/v1/workflow/allowed-transitions/:applicationId
 * Query allowed next states and actions for an application.
 */
router.get('/allowed-transitions/:applicationId', async (req: Request, res: Response) => {
  try {
    const applicationId = String(req.params.applicationId);
    const result = await workflowService.getAllowedTransitions(applicationId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return res.status(404).json({
      success: false,
      error: 'ApplicationNotFound',
      message: err.message || 'Application not found.',
    });
  }
});

/**
 * GET /api/v1/workflow/history/:applicationId
 * Retrieve complete chronological transition history.
 */
router.get('/history/:applicationId', async (req: Request, res: Response) => {
  try {
    const applicationId = String(req.params.applicationId);
    const history = await workflowService.getTransitionHistory(applicationId);

    return res.status(200).json({
      success: true,
      data: {
        applicationId,
        totalTransitions: history.length,
        events: history,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'HistoryRetrievalError',
      message: err.message || 'Failed to retrieve transition history.',
    });
  }
});

/**
 * GET /api/v1/workflow/sla/:applicationId
 * Get current statutory SLA countdown and breach status.
 */
router.get('/sla/:applicationId', async (req: Request, res: Response) => {
  try {
    const applicationId = String(req.params.applicationId);
    const sla = await workflowService.getApplicationSla(applicationId);

    if (!sla) {
      return res.status(200).json({
        success: true,
        message: 'No active SLA clock for this application state.',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: sla,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'SlaRetrievalError',
      message: err.message || 'Failed to retrieve SLA metrics.',
    });
  }
});

/**
 * POST /api/v1/workflow/sla/evaluate-all
 * Batch evaluation of statutory turnaround SLAs across all applications.
 */
router.post('/sla/evaluate-all', async (_req: Request, res: Response) => {
  try {
    const result = await workflowService.evaluateAllSlas();
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'SlaBatchEvaluationError',
      message: err.message || 'Failed to evaluate SLAs.',
    });
  }
});

/**
 * POST /api/v1/workflow/assign/auto
 * Automatically balance and assign application to optimal reviewer.
 */
router.post('/assign/auto', async (req: Request, res: Response) => {
  try {
    const validated = AutoAssignSchema.parse(req.body);
    const assignment = await workflowService.autoAssignReviewer(validated.applicationId);

    return res.status(200).json({
      success: true,
      message: `Assigned to ${assignment.assignedReviewerName} (${assignment.department}) with match score ${assignment.matchScore}%.`,
      data: assignment,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: 'AutoAssignmentError',
      message: err.message || 'Failed to automatically assign reviewer.',
    });
  }
});

/**
 * GET /api/v1/workflow/reviewers/workload
 * Retrieve reviewer workload profiles, active case queues, and SLA adherence.
 */
router.get('/reviewers/workload', (_req: Request, res: Response) => {
  try {
    const profiles = workflowService.getReviewerWorkload();
    return res.status(200).json({
      success: true,
      data: {
        totalReviewers: profiles.length,
        profiles,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'WorkloadRetrievalError',
      message: err.message || 'Failed to retrieve reviewer workloads.',
    });
  }
});

/**
 * POST /api/v1/workflow/notifications/dispatch
 * Dispatch multi-channel notification.
 */
router.post('/notifications/dispatch', async (req: Request, res: Response) => {
  try {
    const validated = DispatchNotificationSchema.parse(req.body);
    const dispatched = await notificationDispatcher.dispatchNotification(validated);

    return res.status(200).json({
      success: true,
      message: `Dispatched ${dispatched.length} notification record(s).`,
      data: dispatched,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: 'NotificationDispatchError',
      message: err.message || 'Failed to dispatch notification.',
    });
  }
});

/**
 * GET /api/v1/workflow/notifications/:recipientId
 * Retrieve notifications for a specific user or institution.
 */
router.get('/notifications/:recipientId', (req: Request, res: Response) => {
  try {
    const recipientId = String(req.params.recipientId);
    const unreadOnly = req.query.unreadOnly === 'true';
    const list = notificationDispatcher.getNotifications(recipientId, unreadOnly);

    return res.status(200).json({
      success: true,
      data: {
        recipientId,
        total: list.length,
        unreadCount: list.filter((n) => !n.read).length,
        notifications: list,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'NotificationRetrievalError',
      message: err.message || 'Failed to retrieve notifications.',
    });
  }
});

/**
 * PATCH /api/v1/workflow/notifications/:id/read
 * Mark a notification as read.
 */
router.patch('/notifications/:id/read', (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const success = notificationDispatcher.markAsRead(id);

    return res.status(200).json({
      success,
      message: success ? 'Notification marked as read.' : 'Notification not found.',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'NotificationUpdateError',
      message: err.message || 'Failed to update notification.',
    });
  }
});

export default router;
