/**
 * SatyaSetu AI — Phase 8: Multi-Channel Notification Dispatcher
 * Dispatches In-App, Transactional Email, SMS (TRAI DLT), and Statutory Webhooks
 */

import crypto from 'crypto';
import {
  NotificationRecord,
  NotificationChannel,
  NotificationEventType,
} from './types';

export class NotificationDispatcher {
  private notifications: NotificationRecord[] = [];

  constructor() {
    this.seedInitialNotifications();
  }

  private seedInitialNotifications(): void {
    const now = new Date();
    this.notifications.push(
      {
        id: `NOTIF-${Date.now()}-001`,
        recipientId: 'INST-001',
        recipientRole: 'applicant',
        channel: 'IN_APP',
        eventType: 'APPLICATION_SUBMITTED',
        title: 'Statutory Application Submitted (PRM-2026-1001)',
        message: 'Your Extension of Approval application has been registered and enqueued for intake scrutiny.',
        applicationId: 'PRM-2026-1001',
        status: 'DELIVERED',
        read: true,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `NOTIF-${Date.now()}-002`,
        recipientId: 'REV-001',
        recipientRole: 'admin',
        channel: 'IN_APP',
        eventType: 'REVIEWER_ASSIGNED',
        title: 'New Case Assigned: PRM-2026-1001',
        message: 'You have been assigned as lead technical assessor for National Institute of Technology Karnataka.',
        applicationId: 'PRM-2026-1001',
        status: 'DELIVERED',
        read: false,
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      }
    );
  }

  /**
   * Dispatch a multi-channel notification.
   */
  async dispatchNotification(params: {
    recipientId: string;
    recipientRole: 'applicant' | 'admin' | 'director' | 'all';
    eventType: NotificationEventType;
    applicationId?: string;
    channels?: NotificationChannel[];
    customTitle?: string;
    customMessage?: string;
    recipientEmail?: string;
    recipientPhone?: string;
  }): Promise<NotificationRecord[]> {
    const channels = params.channels || ['IN_APP', 'EMAIL'];
    const results: NotificationRecord[] = [];

    const { title, message } = this.resolveContent(params.eventType, params.applicationId, params.customTitle, params.customMessage);

    for (const channel of channels) {
      const record: NotificationRecord = {
        id: `NOTIF-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        recipientId: params.recipientId,
        recipientRole: params.recipientRole,
        channel,
        eventType: params.eventType,
        title,
        message,
        applicationId: params.applicationId,
        status: 'DISPATCHED',
        read: false,
        createdAt: new Date().toISOString(),
        metadata: {
          emailTo: params.recipientEmail,
          phoneTo: params.recipientPhone,
          dltHeader: channel === 'SMS' ? 'GOV-SATYA' : undefined,
          deliveryTimestamp: new Date().toISOString(),
        },
      };

      // Execute simulated channel transport
      this.simulateTransport(record);
      record.status = 'DELIVERED';

      this.notifications.unshift(record);
      results.push(record);
    }

    return results;
  }

  /**
   * Format message content and subject lines based on statutory event type.
   */
  private resolveContent(
    eventType: NotificationEventType,
    applicationId?: string,
    customTitle?: string,
    customMessage?: string
  ): { title: string; message: string } {
    if (customTitle && customMessage) {
      return { title: customTitle, message: customMessage };
    }

    const appRef = applicationId || 'Regulatory Dossier';

    switch (eventType) {
      case 'APPLICATION_SUBMITTED':
        return {
          title: `Statutory Application Registered: ${appRef}`,
          message: `Your application ${appRef} has been formally recorded on the SatyaSetu National Gateway. Intake scrutiny is now active.`,
        };
      case 'REVIEWER_ASSIGNED':
        return {
          title: `Assessor Assigned to Case: ${appRef}`,
          message: `Technical assessor has been assigned to application ${appRef}. Audit review has commenced.`,
        };
      case 'CORRECTIONS_REQUESTED':
        return {
          title: `Action Required: Discrepancy Notice for ${appRef}`,
          message: `Regulatory scrutiny has identified items requiring clarification or document replacement for ${appRef}. Please resolve before statutory due date.`,
        };
      case 'RESUBMISSION_RECEIVED':
        return {
          title: `Application Resubmitted with Amendments: ${appRef}`,
          message: `Institutional applicant has submitted amended documents and clarifications for ${appRef}. Re-audit queue updated.`,
        };
      case 'SLA_WARNING':
        return {
          title: `Statutory Turnaround SLA Warning: ${appRef}`,
          message: `Application ${appRef} has reached 80% of allowed statutory scrutiny duration. Expedited triage recommended.`,
        };
      case 'SLA_BREACH_ESCALATED':
        return {
          title: `URGENT: Statutory SLA Breach Escalated: ${appRef}`,
          message: `Statutory audit deadline for ${appRef} has expired. Case escalated to Chief Compliance Director for immediate intervention.`,
        };
      case 'APPLICATION_APPROVED':
        return {
          title: `Statutory Verification Approved: ${appRef}`,
          message: `Congratulations. Application ${appRef} has received formal regulatory verification clearance under AICTE/UGC standards.`,
        };
      case 'APPLICATION_REJECTED':
        return {
          title: `Statutory Verification Decision: Rejected: ${appRef}`,
          message: `Application ${appRef} has been rejected following technical evaluation. You may submit a statutory appeal within 15 working days.`,
        };
      case 'ADMIN_OVERRIDE_APPLIED':
        return {
          title: `Executive Directorate Override: ${appRef}`,
          message: `Administrative override executed by Compliance Director. Case ${appRef} has been reopened for statutory re-examination.`,
        };
      default:
        return {
          title: `Regulatory Notice: ${appRef}`,
          message: `Update recorded on statutory case ${appRef}.`,
        };
    }
  }

  /**
   * Channel transport execution simulator.
   */
  private simulateTransport(record: NotificationRecord): void {
    if (record.channel === 'EMAIL') {
      // Formatted transactional email
      // console.log(`[Email Dispatcher] To: ${record.metadata?.emailTo || 'institution@edu.in'} | Subject: ${record.title}`);
    } else if (record.channel === 'SMS') {
      // Formatted TRAI DLT SMS
      // console.log(`[SMS Dispatcher] DLT Header: GOV-SATYA | To: ${record.metadata?.phoneTo || '+91-9876543210'} | Text: ${record.title}`);
    }
  }

  /**
   * Retrieve notifications for a given recipient.
   */
  getNotifications(recipientId: string, unreadOnly: boolean = false): NotificationRecord[] {
    return this.notifications.filter((n) => {
      const match = n.recipientId === recipientId || n.recipientRole === 'all';
      return unreadOnly ? match && !n.read : match;
    });
  }

  /**
   * Retrieve recent global notifications for regulatory administrators.
   */
  getRecentNotifications(limit: number = 20): NotificationRecord[] {
    return this.notifications.slice(0, limit);
  }

  /**
   * Mark a notification as read.
   */
  markAsRead(notificationId: string): boolean {
    const notif = this.notifications.find((n) => n.id === notificationId);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }
}

export const notificationDispatcher = new NotificationDispatcher();

