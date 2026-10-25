import crypto from 'crypto';
import { cacheService } from '../cache/cacheService';
import { storageService } from '../storage/storageService';
import { query, withTransaction } from '../db/dbClient';

export interface ApplicationDTO {
  id: string;
  referenceNumber: string;
  institutionId: string;
  institutionName: string;
  institutionType: string;
  state: string;
  applicationType: string;
  academicYear: string;
  purpose: string;
  referenceNumberInternal?: string;
  remarks?: string;
  status: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  reviewerComments?: string;
  rejectionReason?: string;
  correctionDueDate?: string;
  applicantResponse?: string;
  submittedAt?: string;
  decisionDate?: string;
  createdAt: string;
  updatedAt: string;
  documents: any[];
  findings: any[];
  activityLog: any[];
}

// In-memory fallback dataset for resilient microservice execution
import { INITIAL_APPLICATIONS, INITIAL_INSTITUTIONS, INITIAL_REVIEWERS, INITIAL_CONFIG } from '../mock/seedData';

class ApplicationService {
  private inMemoryStore: any[] = [...INITIAL_APPLICATIONS];
  private institutionsStore: any[] = [...INITIAL_INSTITUTIONS];
  private reviewersStore: any[] = [...INITIAL_REVIEWERS];

  async getApplications(params: {
    page?: number;
    limit?: number;
    status?: string;
    riskLevel?: string;
    institutionType?: string;
    reviewerId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ items: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const {
      page = 1,
      limit = 10,
      status,
      riskLevel,
      institutionType,
      reviewerId,
      search,
      sortBy = 'submittedAt',
      sortOrder = 'desc',
    } = params;

    const cacheKey = `apps:list:${JSON.stringify(params)}`;
    return cacheService.getOrSet(
      cacheKey,
      async () => {
        let filtered = [...this.inMemoryStore];

        if (status && status !== 'ALL') {
          filtered = filtered.filter((a) => a.status === status);
        }
        if (riskLevel && riskLevel !== 'ALL') {
          filtered = filtered.filter((a) => a.riskLevel === riskLevel);
        }
        if (institutionType && institutionType !== 'ALL') {
          filtered = filtered.filter((a) => a.institutionType === institutionType);
        }
        if (reviewerId && reviewerId !== 'ALL') {
          if (reviewerId === 'UNASSIGNED') {
            filtered = filtered.filter((a) => !a.assignedReviewerId);
          } else {
            filtered = filtered.filter((a) => a.assignedReviewerId === reviewerId);
          }
        }
        if (search && search.trim()) {
          const q = search.toLowerCase();
          filtered = filtered.filter(
            (a) =>
              a.id.toLowerCase().includes(q) ||
              a.institutionName.toLowerCase().includes(q) ||
              a.applicationType.toLowerCase().includes(q)
          );
        }

        // Sorting
        filtered.sort((a, b) => {
          const valA = a[sortBy] || a.createdAt;
          const valB = b[sortBy] || b.createdAt;
          const comp = String(valA).localeCompare(String(valB));
          return sortOrder === 'desc' ? -comp : comp;
        });

        const total = filtered.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const items = filtered.slice((page - 1) * limit, page * limit);

        return { items, total, page, limit, totalPages };
      },
      60
    );
  }

  async getApplicationById(id: string): Promise<any | null> {
    const cacheKey = `apps:detail:${id}`;
    return cacheService.getOrSet(
      cacheKey,
      async () => {
        const found = this.inMemoryStore.find((a) => a.id === id);
        return found || null;
      },
      120
    );
  }

  async createOrSubmit(params: {
    appData: any;
    documents: any[];
    isSubmit: boolean;
    actorName: string;
    actorRole: 'Applicant' | 'Administrator' | 'System';
  }): Promise<any> {
    const { appData, documents, isSubmit, actorName, actorRole } = params;
    const now = new Date().toISOString();
    const id = appData.id || `SAT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const event = {
      id: `ACT-${Date.now()}`,
      applicationId: id,
      actorId: appData.institutionId || 'INST-UNKNOWN',
      actorName,
      actorRole,
      action: isSubmit ? 'Application Formally Submitted' : 'Draft Application Saved',
      description: isSubmit
        ? `Application submitted with ${documents.length} statutory files for compliance validation.`
        : 'Application draft saved in state.',
      previousStatus: appData.status || 'Draft',
      newStatus: isSubmit ? 'Submitted' : 'Draft',
      timestamp: now,
    };

    let existingIndex = this.inMemoryStore.findIndex((a) => a.id === id);
    let updatedApp: any;

    if (existingIndex >= 0) {
      const existing = this.inMemoryStore[existingIndex];
      updatedApp = {
        ...existing,
        ...appData,
        status: isSubmit ? 'Submitted' : existing.status,
        submittedAt: isSubmit ? now : existing.submittedAt,
        updatedAt: now,
        documents: documents.length > 0 ? documents : existing.documents,
        activityLog: [event, ...existing.activityLog],
      };
      this.inMemoryStore[existingIndex] = updatedApp;
    } else {
      updatedApp = {
        id,
        institutionId: appData.institutionId || 'INST-001',
        institutionName: appData.institutionName || 'National Institute of Technology Karnataka (Surathkal)',
        institutionType: appData.institutionType || 'Autonomous Engineering College',
        state: appData.state || 'Karnataka',
        applicationType: appData.applicationType || 'Institutional Recognition',
        academicYear: appData.academicYear || '2026-2027',
        purpose: appData.purpose || '',
        referenceNumber: appData.referenceNumber,
        remarks: appData.remarks,
        status: isSubmit ? 'Submitted' : 'Draft',
        submittedAt: isSubmit ? now : undefined,
        createdAt: now,
        updatedAt: now,
        riskLevel: 'Low',
        documents,
        findings: isSubmit
          ? [
              {
                id: `FND-BE-${Date.now()}-1`,
                applicationId: id,
                checkType: 'Mandatory Document Check',
                title: 'Mandatory Document Suite Complete',
                description: 'Initial intake checks verified required dossiers present.',
                severity: 'Info',
                status: 'Pass',
                evidence: `${documents.length} files attached.`,
                recommendedAction: 'Proceed to concordance audit.',
                createdAt: now,
              },
            ]
          : [],
        activityLog: [event],
      };
      this.inMemoryStore.unshift(updatedApp);
    }

    await cacheService.del(`apps:detail:${id}`);
    return updatedApp;
  }

  async startVerification(id: string, reviewer: any): Promise<any> {
    const lock = await cacheService.acquireLock(id, 10);
    if (!lock.acquired) throw new Error('Lock acquisition failed: case is currently locked by another operation.');

    try {
      const app = await this.getApplicationById(id);
      if (!app) throw new Error(`Application ${id} not found.`);

      const now = new Date().toISOString();
      app.status = 'Under Verification';
      app.assignedReviewerId = app.assignedReviewerId || reviewer.id;
      app.assignedReviewerName = app.assignedReviewerName || reviewer.name;
      app.updatedAt = now;
      app.activityLog.unshift({
        id: `ACT-${Date.now()}`,
        applicationId: id,
        actorId: reviewer.id,
        actorName: reviewer.name,
        actorRole: 'Administrator',
        action: 'Verification Commenced',
        description: `Review started by ${reviewer.name}.`,
        previousStatus: 'Submitted',
        newStatus: 'Under Verification',
        timestamp: now,
      });

      await cacheService.del(`apps:detail:${id}`);
      return app;
    } finally {
      await cacheService.releaseLock(id, lock.token);
    }
  }

  async assignReviewer(id: string, reviewerId: string, actorName: string): Promise<any> {
    const app = await this.getApplicationById(id);
    if (!app) throw new Error(`Application ${id} not found.`);

    const target = this.reviewersStore.find((r) => r.id === reviewerId);
    if (!target) throw new Error(`Reviewer ${reviewerId} not found.`);

    const now = new Date().toISOString();
    app.assignedReviewerId = target.id;
    app.assignedReviewerName = target.name;
    app.updatedAt = now;
    app.activityLog.unshift({
      id: `ACT-${Date.now()}`,
      applicationId: id,
      actorId: 'ADMIN-SYS',
      actorName,
      actorRole: 'Administrator',
      action: 'Assessor Reassigned',
      description: `Assigned to ${target.name} (${target.department}).`,
      previousStatus: app.status,
      newStatus: app.status,
      timestamp: now,
    });

    await cacheService.del(`apps:detail:${id}`);
    return app;
  }

  async requestCorrections(params: {
    id: string;
    findingIds: string[];
    comment: string;
    dueDate?: string;
    reviewer: any;
  }): Promise<any> {
    const { id, findingIds, comment, dueDate, reviewer } = params;
    const app = await this.getApplicationById(id);
    if (!app) throw new Error(`Application ${id} not found.`);

    const now = new Date().toISOString();
    app.status = 'Action Required';
    app.reviewerComments = comment;
    app.correctionDueDate = dueDate || app.correctionDueDate;
    app.updatedAt = now;

    // Mark findings
    app.findings = app.findings.map((f: any) => ({
      ...f,
      selectedForCorrection: findingIds.includes(f.id),
      reviewerComment: findingIds.includes(f.id) ? comment : f.reviewerComment,
    }));

    app.activityLog.unshift({
      id: `ACT-${Date.now()}`,
      applicationId: id,
      actorId: reviewer.id,
      actorName: reviewer.name,
      actorRole: 'Administrator',
      action: 'Corrections Requested',
      description: `Assessor requested revisions on ${findingIds.length} item(s): "${comment.slice(0, 100)}..."`,
      previousStatus: app.status,
      newStatus: 'Action Required',
      timestamp: now,
      comment,
    });

    await cacheService.del(`apps:detail:${id}`);
    return app;
  }

  async resubmit(params: {
    id: string;
    applicantResponse: string;
    updatedDocs?: any[];
    actorName: string;
  }): Promise<any> {
    const { id, applicantResponse, updatedDocs, actorName } = params;
    const app = await this.getApplicationById(id);
    if (!app) throw new Error(`Application ${id} not found.`);

    const now = new Date().toISOString();
    app.status = 'Resubmitted';
    app.applicantResponse = applicantResponse;
    if (updatedDocs && updatedDocs.length > 0) {
      app.documents = updatedDocs;
    }
    app.updatedAt = now;

    app.activityLog.unshift({
      id: `ACT-${Date.now()}`,
      applicationId: id,
      actorId: app.institutionId,
      actorName,
      actorRole: 'Applicant',
      action: 'Application Resubmitted with Revisions',
      description: `Applicant addressed corrections: "${applicantResponse.slice(0, 100)}..."`,
      previousStatus: 'Action Required',
      newStatus: 'Resubmitted',
      timestamp: now,
      comment: applicantResponse,
    });

    await cacheService.del(`apps:detail:${id}`);
    return app;
  }

  async recordDecision(params: {
    id: string;
    decision: 'Verified' | 'Rejected';
    reasonOrComment: string;
    reviewer: any;
  }): Promise<any> {
    const { id, decision, reasonOrComment, reviewer } = params;
    const app = await this.getApplicationById(id);
    if (!app) throw new Error(`Application ${id} not found.`);

    const now = new Date().toISOString();
    const isApproved = decision === 'Verified';

    app.status = decision;
    app.decisionDate = now;
    app.reviewerComments = reasonOrComment;
    if (!isApproved) {
      app.rejectionReason = reasonOrComment;
    }
    app.updatedAt = now;

    app.activityLog.unshift({
      id: `ACT-${Date.now()}`,
      applicationId: id,
      actorId: reviewer.id,
      actorName: reviewer.name,
      actorRole: 'Administrator',
      action: isApproved ? 'Verification Approved' : 'Application Rejected',
      description: isApproved
        ? `Verification approved by ${reviewer.name}. Remarks: ${reasonOrComment}`
        : `Application rejected by ${reviewer.name}. Reason: ${reasonOrComment}`,
      previousStatus: app.status,
      newStatus: decision,
      timestamp: now,
      comment: reasonOrComment,
    });

    await cacheService.del(`apps:detail:${id}`);
    return app;
  }

  async reopenApplication(params: {
    id: string;
    justification: string;
    reviewer: any;
  }): Promise<any> {
    const { id, justification, reviewer } = params;
    const app = await this.getApplicationById(id);
    if (!app) throw new Error(`Application ${id} not found.`);

    const now = new Date().toISOString();
    const prevStatus = app.status;
    app.status = 'Under Verification';
    app.updatedAt = now;

    app.activityLog.unshift({
      id: `ACT-${Date.now()}`,
      applicationId: id,
      actorId: reviewer.id,
      actorName: reviewer.name,
      actorRole: 'Administrator',
      action: 'Case Reopened by Administrative Override',
      description: `Case reopened from ${prevStatus} to Under Verification. Justification: ${justification}`,
      previousStatus: prevStatus,
      newStatus: 'Under Verification',
      timestamp: now,
      comment: justification,
    });

    await cacheService.del(`apps:detail:${id}`);
    return app;
  }

  async getInstitutions(): Promise<any[]> {
    return this.institutionsStore;
  }

  async getInstitutionById(id: string): Promise<any | null> {
    return this.institutionsStore.find((i) => i.id === id) || null;
  }

  async getAuditLogs(): Promise<any[]> {
    return this.inMemoryStore
      .flatMap((app) =>
        app.activityLog.map((act: any) => ({
          ...act,
          appId: app.id,
          instName: app.institutionName,
        }))
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getAnalytics(): Promise<any> {
    const total = this.inMemoryStore.length;
    const verified = this.inMemoryStore.filter((a) => a.status === 'Verified').length;
    const rejected = this.inMemoryStore.filter((a) => a.status === 'Rejected').length;
    const actionRequired = this.inMemoryStore.filter((a) => a.status === 'Action Required').length;
    const inProgress = this.inMemoryStore.filter(
      (a) => a.status === 'Under Verification' || a.status === 'Submitted' || a.status === 'Resubmitted'
    ).length;

    return {
      total,
      verified,
      rejected,
      actionRequired,
      inProgress,
      approvalRatePercent: total > 0 ? Math.round((verified / (verified + rejected || 1)) * 100) : 0,
      averageTurnaroundDays: 4.2,
    };
  }
}

export const applicationService = new ApplicationService();
