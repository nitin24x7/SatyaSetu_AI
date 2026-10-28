/**
 * SatyaSetu AI — Phase 8: Workflow Orchestration & Statutory SLA Engine Verification
 * Production Test Suite verifying FSM Transitions, Preconditions, Overrides, SLAs & Notifications
 */

import { workflowService } from '../workflow/workflowService';
import { workflowStateMachine } from '../workflow/stateMachine';
import { statutorySlaEngine } from '../workflow/slaEngine';
import { workloadRouter } from '../workflow/workloadRouter';
import { notificationDispatcher } from '../workflow/notificationDispatcher';
import { applicationService } from '../services/applicationService';

async function runWorkflowVerificationTests(): Promise<void> {
  console.log('================================================================');
  console.log('  SATYASETU AI — PHASE 8 WORKFLOW & STATUTORY SLA VERIFICATION  ');
  console.log('================================================================\n');

  // --- 1. Testing Finite State Machine (FSM) Transitions & Preconditions ---
  console.log('--- 1. Testing Finite State Machine (FSM) Transitions & Guards ---');
  
  // Create a clean application for testing
  const createdApp = await applicationService.createOrSubmit({
    appData: {
      institutionId: 'INST-001',
      institutionName: 'Karnataka Regional Engineering College (Autonomous)',
      institutionType: 'Autonomous Engineering College',
      state: 'Karnataka',
      applicationType: 'Renewal / Extension',
      purpose: 'Technical & Engineering',
      status: 'Draft',
    },
    documents: [],
    isSubmit: false,
    actorName: 'Dr. Suresh Kumar Nayak',
    actorRole: 'Applicant',
  });

  const testAppId = createdApp.id;
  console.log(`[App Created] ID: ${testAppId}, Initial Status: ${createdApp.status}`);

  // Test Allowed Transitions Query
  const allowedInitial = await workflowService.getAllowedTransitions(testAppId);
  console.log(`[Allowed Actions from Draft] ${allowedInitial.allowedTransitions.map((t) => t.action).join(', ')}`);
  if (!allowedInitial.allowedTransitions.some((t) => t.action === 'SUBMIT')) {
    throw new Error('Expected SUBMIT action to be available from Draft.');
  }

  // Test Illegal Transition Prevention
  let illegalCaught = false;
  try {
    await workflowService.executeTransition({
      applicationId: testAppId,
      action: 'APPROVE',
      targetState: 'Verified',
      actorId: 'REV-001',
      actorName: 'Dr. Amitabh Sengupta',
      actorRole: 'TechnicalAssessor',
    });
  } catch (err: any) {
    illegalCaught = true;
    console.log(`[Security Guard] Illegal transition Draft -> Verified correctly blocked: "${err.message}"`);
  }
  if (!illegalCaught) throw new Error('Security failure: Direct Draft -> Verified transition was not blocked.');

  // Add a document so preconditions for SUBMIT are met
  createdApp.documents = [
    {
      id: `DOC-TEST-${Date.now()}`,
      applicationId: testAppId,
      category: 'Institutional Registration Certificate',
      fileName: 'Statutory_Charter_2026.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024 * 500,
      uploadedAt: new Date().toISOString(),
      required: true,
      reviewStatus: 'Pending',
      extractedFields: { registrationNumber: 'KREC-1965-KA' },
    },
  ];

  // Execute Legal SUBMIT transition
  const submitResult = await workflowService.executeTransition({
    applicationId: testAppId,
    action: 'SUBMIT',
    targetState: 'Submitted',
    actorId: 'INST-001',
    actorName: 'Dr. Suresh Kumar Nayak',
    actorRole: 'Applicant',
    comment: 'Formal submission of annual institutional compliance dossier.',
  });
  console.log(`[Transition Executed] Draft -> ${submitResult.application.status} (Event ID: ${submitResult.transitionEvent.id})`);
  if (submitResult.application.status !== 'Submitted') throw new Error('Failed to transition to Submitted.');

  // Execute Legal START_VERIFICATION transition
  const verifyResult = await workflowService.executeTransition({
    applicationId: testAppId,
    action: 'START_VERIFICATION',
    targetState: 'Under Verification',
    actorId: 'REV-001',
    actorName: 'Dr. Amitabh Sengupta',
    actorRole: 'TechnicalAssessor',
    comment: 'Triage complete. Verification audit initiated.',
  });
  console.log(`[Transition Executed] Submitted -> ${verifyResult.application.status}`);

  // Test Precondition for REQUEST_CORRECTIONS (Reject if comment too short)
  let shortCommentBlocked = false;
  try {
    await workflowService.executeTransition({
      applicationId: testAppId,
      action: 'REQUEST_CORRECTIONS',
      targetState: 'Action Required',
      actorId: 'REV-001',
      actorName: 'Dr. Amitabh Sengupta',
      actorRole: 'TechnicalAssessor',
      comment: 'Fix docs', // Only 8 chars, min is 10
    });
  } catch (err: any) {
    shortCommentBlocked = true;
    console.log(`[Precondition Guard] Short correction comment blocked: "${err.message}"`);
  }
  if (!shortCommentBlocked) throw new Error('Expected short correction comment to be rejected.');

  // Execute Legal REQUEST_CORRECTIONS
  const correctionsResult = await workflowService.executeTransition({
    applicationId: testAppId,
    action: 'REQUEST_CORRECTIONS',
    targetState: 'Action Required',
    actorId: 'REV-001',
    actorName: 'Dr. Amitabh Sengupta',
    actorRole: 'TechnicalAssessor',
    comment: 'Please upload updated Fire Safety NOC with current validity period (2026-2027).',
  });
  console.log(`[Transition Executed] Under Verification -> ${correctionsResult.application.status}`);

  // Execute Legal RESUBMIT
  const resubmitResult = await workflowService.executeTransition({
    applicationId: testAppId,
    action: 'RESUBMIT',
    targetState: 'Resubmitted',
    actorId: 'INST-001',
    actorName: 'Dr. Suresh Kumar Nayak',
    actorRole: 'Applicant',
    comment: 'Updated Fire Safety Certificate issued by State Disaster Response Force uploaded.',
  });
  console.log(`[Transition Executed] Action Required -> ${resubmitResult.application.status}`);

  // Test Precondition for APPROVE (Block if score below 75)
  let lowScoreBlocked = false;
  try {
    await workflowService.executeTransition({
      applicationId: testAppId,
      action: 'APPROVE',
      targetState: 'Verified',
      actorId: 'REV-001',
      actorName: 'Dr. Amitabh Sengupta',
      actorRole: 'TechnicalAssessor',
      complianceScore: 62, // Below 75 ceiling
      comment: 'Attempting premature approval with substandard compliance score.',
    });
  } catch (err: any) {
    lowScoreBlocked = true;
    console.log(`[Compliance Guard] Low compliance score approval blocked: "${err.message}"`);
  }
  if (!lowScoreBlocked) throw new Error('Expected low score approval to be blocked.');

  // Execute Legal APPROVE with valid compliance score
  const approveResult = await workflowService.executeTransition({
    applicationId: testAppId,
    action: 'APPROVE',
    targetState: 'Verified',
    actorId: 'REV-001',
    actorName: 'Dr. Amitabh Sengupta',
    actorRole: 'TechnicalAssessor',
    complianceScore: 92,
    comment: 'All statutory cadre ratios and municipal NOCs verified. Verification approved.',
  });
  console.log(`[Transition Executed] Resubmitted -> ${approveResult.application.status} (Score: 92%)`);

  // Verify Chronological Transition History
  const history = await workflowService.getTransitionHistory(testAppId);
  console.log(`[Audit History] Total Transition Events Recorded: ${history.length}`);
  if (history.length < 5) throw new Error('Expected at least 5 transition events in history.');

  // --- 2. Testing Executive Administrative Override ---
  console.log('\n--- 2. Testing Executive Administrative Override ---');
  
  // Reopening finalized case via ADMIN_OVERRIDE
  const overrideJustification = 'State High Court Interim Directive WP-2026-9042 ordering appellate document reconsideration.';
  const overrideResult = await workflowService.executeAdminOverride({
    applicationId: testAppId,
    justification: overrideJustification,
    actorId: 'DIR-001',
    actorName: 'Prof. R. C. Sharma',
    actorRole: 'ComplianceDirector',
  });
  console.log(`[Admin Override] Finalized case reopened to: '${overrideResult.application.status}'`);
  console.log(`  * Justification: "${overrideResult.transitionEvent.justification}"`);
  console.log(`  * Event Role: ${overrideResult.transitionEvent.actorRole}`);
  if (overrideResult.application.status !== 'Under Verification') {
    throw new Error('Administrative override failed to transition case to Under Verification.');
  }

  // --- 3. Testing Statutory SLA Turnaround Timers & Escalations ---
  console.log('\n--- 3. Testing Statutory SLA Turnaround Timers & Escalations ---');

  // Test Sla Record Initialization
  const initialSla = statutorySlaEngine.createTrackingRecord('TEST-SLA-001', 'INITIAL_SCRUTINY');
  console.log(`[SLA Initialized] Policy: ${initialSla.policyType}, Allowed Hours: ${initialSla.remainingHours}h, Status: ${initialSla.status}`);

  // Test SLA Warning threshold (simulate 82% elapsed)
  const simulatedWarningTime = new Date(Date.now() + (168 * 0.82) * 60 * 60 * 1000).toISOString();
  const warningSla = statutorySlaEngine.evaluateSla(initialSla, simulatedWarningTime);
  console.log(`[SLA Warning State] Elapsed: ${warningSla.percentageElapsed}%, Status: ${warningSla.status}, Escalation: ${warningSla.escalationLevel}`);
  if (warningSla.status !== 'WARNING') throw new Error('Expected SLA status to be WARNING at 82% elapsed.');
  if (warningSla.escalationLevel !== 'LEVEL_1_LEAD_NOTIFIED') throw new Error('Expected Level 1 escalation.');

  // Test SLA Breach threshold (simulate 105% elapsed)
  const simulatedBreachTime = new Date(Date.now() + (168 * 1.05) * 60 * 60 * 1000).toISOString();
  const breachSla = statutorySlaEngine.evaluateSla(initialSla, simulatedBreachTime);
  console.log(`[SLA Breach State] Elapsed: ${breachSla.percentageElapsed}%, Status: ${breachSla.status}, Escalation: ${breachSla.escalationLevel}`);
  if (breachSla.status !== 'BREACHED') throw new Error('Expected SLA status to be BREACHED at 105% elapsed.');
  if (breachSla.escalationLevel !== 'LEVEL_2_DIRECTOR_ESCALATED') throw new Error('Expected Level 2 Director escalation.');

  // Test Batch SLA Evaluation across all active cases
  const batchSla = await workflowService.evaluateAllSlas();
  console.log(`[Batch SLA Evaluation] Total Evaluated: ${batchSla.totalEvaluated}, On Track: ${batchSla.onTrackCount}, Warnings: ${batchSla.warningCount}, Breached: ${batchSla.breachedCount}`);

  // --- 4. Testing Workload Balancing & Automated Case Routing ---
  console.log('\n--- 4. Testing Workload Balancing & Automated Case Routing ---');

  const reviewerProfiles = workloadRouter.getReviewerProfiles();
  console.log(`[Reviewer Roster] Total Active Assessors: ${reviewerProfiles.length}`);
  reviewerProfiles.forEach((rev) => {
    console.log(`  * [${rev.reviewerId}] ${rev.name} | Dept: ${rev.department} | Queue: ${rev.currentActiveCases}/${rev.maxCapacity} (${(rev.utilizationRate * 100).toFixed(0)}%) | SLA Adherence: ${(rev.slaAdherenceScore * 100).toFixed(0)}%`);
  });

  // Execute Auto-Assignment
  const assignment = await workflowService.autoAssignReviewer(testAppId);
  console.log(`[Auto-Assignment Result] Assigned Case: ${assignment.applicationId}`);
  console.log(`  * Selected Reviewer: ${assignment.assignedReviewerName} (${assignment.department})`);
  console.log(`  * Match Score: ${assignment.matchScore}/100`);
  console.log(`  * Routing Reason: "${assignment.assignmentReason}"`);
  if (!assignment.assignedReviewerId) throw new Error('Auto assignment failed to select a reviewer.');

  // --- 5. Testing Multi-Channel Notification Dispatcher ---
  console.log('\n--- 5. Testing Multi-Channel Notification Dispatcher ---');

  const dispatched = await notificationDispatcher.dispatchNotification({
    recipientId: 'INST-001',
    recipientRole: 'applicant',
    eventType: 'CORRECTIONS_REQUESTED',
    applicationId: testAppId,
    channels: ['IN_APP', 'EMAIL', 'SMS', 'WEBHOOK'],
    customTitle: 'Statutory Notice: Discrepancy Clarification Required',
    customMessage: 'Please submit certified encumbrance certificate within 10 statutory working days.',
    recipientEmail: 'registrar@nitk.edu.in',
    recipientPhone: '+91-9876543210',
  });

  console.log(`[Notifications Dispatched] Channels Active: ${dispatched.map((d) => d.channel).join(', ')}`);
  if (dispatched.length !== 4) throw new Error('Expected 4 multi-channel notification records.');

  // Query notifications
  const userNotifs = notificationDispatcher.getNotifications('INST-001');
  console.log(`[Notification Inbox] Total for INST-001: ${userNotifs.length}`);
  const unreadTarget = userNotifs.find((n) => !n.read);
  if (unreadTarget) {
    const markSuccess = notificationDispatcher.markAsRead(unreadTarget.id);
    console.log(`[Notification Read] Marked ${unreadTarget.id} as read: ${markSuccess}`);
  }

  console.log('\n================================================================');
  console.log('   ALL PHASE 8 WORKFLOW & STATUTORY SLA TESTS PASSED            ');
  console.log('================================================================');
  process.exit(0);
}

runWorkflowVerificationTests().catch((err) => {
  console.error('[Verification Failure]', err);
  process.exit(1);
});
