import { applicationService } from '../services/applicationService';
import { idpService } from '../idp/idpService';
import { complianceService } from '../compliance/complianceService';
import { authService } from '../auth/authService';
import { digiLockerService } from '../integrations/digiLockerService';
import { aadhaarESignService } from '../integrations/aadhaarESignService';
import { nadAisheSyncService } from '../integrations/nadAisheSyncService';
import { forensicService } from '../forensics/forensicService';
import { workflowService } from '../workflow/workflowService';
import { notificationDispatcher } from '../workflow/notificationDispatcher';

export const graphqlResolvers = {
  applications: async (args: any) => {
    return applicationService.getApplications(args);
  },

  application: async ({ id }: { id: string }) => {
    return applicationService.getApplicationById(id);
  },

  institutions: async () => {
    return applicationService.getInstitutions();
  },

  institution: async ({ id }: { id: string }) => {
    return applicationService.getInstitutionById(id);
  },

  analytics: async () => {
    return applicationService.getAnalytics();
  },

  auditLogs: async () => {
    return applicationService.getAuditLogs();
  },

  createApplication: async ({ input }: { input: any }) => {
    return applicationService.createOrSubmit({
      appData: input,
      documents: [],
      isSubmit: input.isSubmit || false,
      actorName: input.institutionName,
      actorRole: 'Applicant',
    });
  },

  startVerification: async ({ id }: { id: string }) => {
    return applicationService.startVerification(id, {
      id: 'REV-01',
      name: 'Dr. Priyadarshini Rao',
    });
  },

  requestCorrections: async ({
    id,
    findingIds,
    comment,
    dueDate,
  }: {
    id: string;
    findingIds: string[];
    comment: string;
    dueDate?: string;
  }) => {
    return applicationService.requestCorrections({
      id,
      findingIds,
      comment,
      dueDate,
      reviewer: { id: 'REV-01', name: 'Compliance Reviewer' },
    });
  },

  resubmitApplication: async ({
    id,
    applicantResponse,
  }: {
    id: string;
    applicantResponse: string;
  }) => {
    return applicationService.resubmit({
      id,
      applicantResponse,
      actorName: 'Authorized Representative',
    });
  },

  recordDecision: async ({
    id,
    decision,
    reasonOrComment,
  }: {
    id: string;
    decision: 'Verified' | 'Rejected';
    reasonOrComment: string;
  }) => {
    return applicationService.recordDecision({
      id,
      decision,
      reasonOrComment,
      reviewer: { id: 'REV-01', name: 'Compliance Director' },
    });
  },

  idpJob: async ({ jobId }: { jobId: string }) => {
    return idpService.getJob(jobId);
  },

  idpJobs: async ({ limit }: { limit?: number }) => {
    return idpService.listJobs(limit);
  },

  idpCategories: async () => {
    return idpService.getSupportedCategories();
  },

  enqueueIdpProcessing: async (args: {
    documentId: string;
    applicationId: string;
    fileName: string;
    category: string;
    institutionName?: string;
    registrationNumber?: string;
  }) => {
    return idpService.enqueueDocumentProcessing(args);
  },

  complianceRules: async () => {
    return complianceService.getRegisteredRules();
  },

  evaluateApplicationCompliance: async ({ applicationId }: { applicationId: string }) => {
    return complianceService.evaluateApplication(applicationId);
  },

  checkConcordance: async ({
    declaredName,
    extractedName,
  }: {
    declaredName: string;
    extractedName: string;
  }) => {
    return complianceService.checkConcordance(
      { institutionName: declaredName },
      { institution_name: { extractedValue: extractedName } }
    );
  },

  integrationStatuses: async () => {
    return nadAisheSyncService.getGatewayStatus();
  },

  syncAisheRegistry: async ({ aisheCode }: { aisheCode: string }) => {
    return nadAisheSyncService.syncAishe({ aisheCode });
  },

  loginUser: async ({ email, password }: { email: string; password?: string }) => {
    const res = await authService.login(email, password);
    if (res.tokens) return res.tokens;
    throw new Error('MFA required. Use verifyMfaSession with mfaSessionId.');
  },

  verifyMfaSession: async ({ mfaSessionId, code }: { mfaSessionId: string; code: string }) => {
    return authService.verifyMfa(mfaSessionId, code);
  },

  refreshUserToken: async ({ refreshToken }: { refreshToken: string }) => {
    return authService.refreshToken(refreshToken);
  },

  pullDigiLockerDocument: async (args: {
    docUri: string;
    docType: 'CHARTER' | 'AFFILIATION_ORDER' | 'ACCREDITATION_CERT' | 'DEGREE' | 'LAND_TITLE';
    consent: boolean;
    institutionAisheCode: string;
  }) => {
    return digiLockerService.pullDocument(args);
  },

  verifyAadhaarESign: async (args: {
    documentId: string;
    fileName: string;
    signatureHex?: string;
  }) => {
    return aadhaarESignService.verifyDigitalSignature(args);
  },

  forensicReport: async ({ documentId }: { documentId: string }) => {
    return forensicService.getForensicReport(documentId);
  },

  recentForensicReports: async () => {
    return forensicService.listReports();
  },

  analyzeDocumentForensics: async (args: {
    documentId: string;
    applicationId: string;
    fileName: string;
    category?: string;
    isSimulatedTampered?: boolean;
    isSimulatedCloned?: boolean;
    isSimulatedRecycled?: boolean;
  }) => {
    return forensicService.analyzeDocument(args);
  },

  workflowHistory: async ({ applicationId }: { applicationId: string }) => {
    return workflowService.getTransitionHistory(applicationId);
  },

  applicationSla: async ({ applicationId }: { applicationId: string }) => {
    return workflowService.getApplicationSla(applicationId);
  },

  reviewerWorkloads: async () => {
    return workflowService.getReviewerWorkload();
  },

  userNotifications: async ({ recipientId, unreadOnly }: { recipientId: string; unreadOnly?: boolean }) => {
    return notificationDispatcher.getNotifications(recipientId, Boolean(unreadOnly));
  },

  transitionWorkflow: async (args: any) => {
    return workflowService.executeTransition(args);
  },

  adminWorkflowOverride: async (args: any) => {
    return workflowService.executeAdminOverride({
      applicationId: args.applicationId,
      justification: args.justification,
      actorId: args.actorId,
      actorName: args.actorName,
      actorRole: 'ComplianceDirector',
    });
  },

  autoAssignWorkflowReviewer: async ({ applicationId }: { applicationId: string }) => {
    return workflowService.autoAssignReviewer(applicationId);
  },
};

