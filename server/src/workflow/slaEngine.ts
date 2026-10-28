/**
 * SatyaSetu AI — Phase 8: Statutory SLA Management & Escalation Engine
 * Tracks Turnaround Timers, Breach Risk & Automated Director Escalations
 */

import {
  SlaPolicyType,
  SlaPolicyConfig,
  SlaTrackingRecord,
  SlaStatus,
  EscalationLevel,
  ApplicationWorkflowState,
} from './types';

export class StatutorySlaEngine {
  /**
   * Preconfigured Statutory SLA Policies mandated by Council Approval Handbooks.
   */
  private readonly policies: Record<SlaPolicyType, SlaPolicyConfig> = {
    INITIAL_SCRUTINY: {
      policyType: 'INITIAL_SCRUTINY',
      allowedHours: 168, // 7 calendar days
      warningThresholdPercent: 80,
      escalationRole: 'LeadScrutinyOfficer',
      description: 'Initial intake scrutiny and mandatory document completeness audit.',
    },
    TECHNICAL_ASSESSMENT: {
      policyType: 'TECHNICAL_ASSESSMENT',
      allowedHours: 336, // 14 calendar days
      warningThresholdPercent: 80,
      escalationRole: 'ChiefTechnicalAssessor',
      description: 'Technical evaluation of cadre ratios, infrastructure, and statutory certificates.',
    },
    APPLICANT_REMEDIATION: {
      policyType: 'APPLICANT_REMEDIATION',
      allowedHours: 240, // 10 calendar days
      warningThresholdPercent: 75,
      escalationRole: 'InstitutionalRegistrar',
      description: 'Applicant window to provide clarifications and upload replacement documents.',
    },
    EXPEDITED_REVIEW: {
      policyType: 'EXPEDITED_REVIEW',
      allowedHours: 72, // 3 calendar days
      warningThresholdPercent: 75,
      escalationRole: 'ComplianceDirector',
      description: 'Priority review for resubmissions and court-ordered expedited hearings.',
    },
  };

  /**
   * Determine policy type from current application workflow state.
   */
  determinePolicyForState(state: ApplicationWorkflowState): SlaPolicyType | null {
    switch (state) {
      case 'Submitted':
        return 'INITIAL_SCRUTINY';
      case 'Under Verification':
        return 'TECHNICAL_ASSESSMENT';
      case 'Action Required':
        return 'APPLICANT_REMEDIATION';
      case 'Resubmitted':
        return 'EXPEDITED_REVIEW';
      default:
        return null; // Terminal states (Draft, Verified, Rejected) have no active SLA clock
    }
  }

  /**
   * Initialize a new SLA tracking record when an application enters a state.
   */
  createTrackingRecord(
    applicationId: string,
    policyType: SlaPolicyType,
    startTimestamp?: string
  ): SlaTrackingRecord {
    const policy = this.policies[policyType];
    const start = startTimestamp ? new Date(startTimestamp) : new Date();
    const deadline = new Date(start.getTime() + policy.allowedHours * 60 * 60 * 1000);

    return {
      applicationId,
      policyType,
      startTimestamp: start.toISOString(),
      deadlineTimestamp: deadline.toISOString(),
      elapsedHours: 0,
      remainingHours: policy.allowedHours,
      percentageElapsed: 0,
      status: 'ON_TRACK',
      escalationLevel: 'NORMAL',
      lastEvaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * Evaluate a tracking record against the current wall clock time.
   */
  evaluateSla(record: SlaTrackingRecord, evaluationTime?: string): SlaTrackingRecord {
    const policy = this.policies[record.policyType];
    const now = evaluationTime ? new Date(evaluationTime).getTime() : Date.now();
    const start = new Date(record.startTimestamp).getTime();
    const totalAllowedMs = policy.allowedHours * 60 * 60 * 1000;

    const elapsedMs = Math.max(0, now - start);
    const elapsedHours = Number((elapsedMs / (1000 * 60 * 60)).toFixed(1));
    const remainingHours = Number(Math.max(0, (totalAllowedMs - elapsedMs) / (1000 * 60 * 60)).toFixed(1));
    const percentageElapsed = Math.min(100, Number(((elapsedMs / totalAllowedMs) * 100).toFixed(1)));

    let status: SlaStatus = 'ON_TRACK';
    let escalationLevel: EscalationLevel = record.escalationLevel;
    let escalatedAt = record.escalatedAt;
    let escalatedTo = record.escalatedTo;

    if (percentageElapsed >= 100) {
      status = 'BREACHED';
      if (escalationLevel !== 'LEVEL_2_DIRECTOR_ESCALATED') {
        escalationLevel = 'LEVEL_2_DIRECTOR_ESCALATED';
        escalatedAt = new Date().toISOString();
        escalatedTo = 'ComplianceDirector';
      }
    } else if (percentageElapsed >= policy.warningThresholdPercent) {
      status = 'WARNING';
      if (escalationLevel === 'NORMAL') {
        escalationLevel = 'LEVEL_1_LEAD_NOTIFIED';
        escalatedAt = new Date().toISOString();
        escalatedTo = policy.escalationRole;
      }
    }

    return {
      ...record,
      elapsedHours,
      remainingHours,
      percentageElapsed,
      status,
      escalationLevel,
      escalatedAt,
      escalatedTo,
      lastEvaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * Evaluate SLA status for an application based on its state and creation/update dates.
   */
  evaluateApplicationSla(application: any, currentTime?: string): SlaTrackingRecord | null {
    const policyType = this.determinePolicyForState(application.status);
    if (!policyType) return null;

    const startTimestamp = application.updatedAt || application.submittedAt || application.createdAt;
    const initial = this.createTrackingRecord(application.id, policyType, startTimestamp);
    return this.evaluateSla(initial, currentTime);
  }

  /**
   * Get policy configuration.
   */
  getPolicy(policyType: SlaPolicyType): SlaPolicyConfig {
    return this.policies[policyType];
  }
}

export const statutorySlaEngine = new StatutorySlaEngine();

