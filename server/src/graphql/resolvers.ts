import { applicationService } from '../services/applicationService';

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
};

