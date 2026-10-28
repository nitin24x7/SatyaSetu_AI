import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Application,
  ApplicationStatus,
  DocumentCategory,
  DocumentItem,
  Institution,
  NotificationItem,
  PlatformConfig,
  Reviewer,
  VerificationFinding,
  ActivityEvent,
  IssuingAuthorityStatus,
} from '../types';
import {
  INITIAL_APPLICATIONS,
  INITIAL_CONFIG,
  INITIAL_INSTITUTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REVIEWERS,
} from '../mock/seedData';
import { clearStorage, loadFromStorage, saveToStorage } from '../lib/storage';
import { runDeterministicVerification } from '../mock/simulationEngine';

interface AppContextType {
  applications: Application[];
  institutions: Institution[];
  notifications: NotificationItem[];
  config: PlatformConfig;
  currentRole: 'applicant' | 'admin';
  currentInstitutionId: string;
  currentInstitution: Institution;
  currentReviewerId: string;
  currentReviewer: Reviewer;
  setRole: (role: 'applicant' | 'admin') => void;
  setCurrentInstitutionId: (id: string) => void;
  setCurrentReviewerId: (id: string) => void;
  saveDraftApplication: (appData: Partial<Application>, documents: DocumentItem[]) => string;
  submitApplication: (appData: Partial<Application>, documents: DocumentItem[]) => string;
  startVerification: (applicationId: string) => void;
  assignReviewer: (applicationId: string, reviewerId: string) => void;
  requestCorrections: (
    applicationId: string,
    selectedFindingIds: string[],
    reviewerComment: string,
    dueDate?: string
  ) => void;
  resubmitApplication: (
    applicationId: string,
    applicantResponse: string,
    updatedDocs?: DocumentItem[]
  ) => void;
  recordDecision: (
    applicationId: string,
    decision: 'Verified' | 'Rejected',
    reasonOrComment: string
  ) => void;
  reopenApplication: (applicationId: string, justification: string) => void;
  flagForInvestigation: (applicationId: string, note: string) => void;
  replaceDocument: (
    applicationId: string,
    oldDocId: string,
    newDoc: DocumentItem
  ) => void;
  updateInstitutionProfile: (updated: Partial<Institution>) => void;
  updatePlatformConfig: (newConfig: Partial<PlatformConfig>) => void;
  togglePhysicalInspection: (applicationId: string, required: boolean, reason?: string) => void;
  verifyDocumentAuthority: (applicationId: string, docId: string) => void;
  verifyAllDocumentAuthorities: (applicationId: string) => void;
  syncAicteMasterData: (applicationId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (role?: 'applicant' | 'admin') => void;
  resetDemoData: () => void;
  unreadCount: (role: 'applicant' | 'admin') => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>(() =>
    loadFromStorage<Application[]>('applications', INITIAL_APPLICATIONS)
  );

  const [institutions, setInstitutions] = useState<Institution[]>(() =>
    loadFromStorage<Institution[]>('institutions', INITIAL_INSTITUTIONS)
  );

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadFromStorage<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS)
  );

  const [config, setConfig] = useState<PlatformConfig>(() =>
    loadFromStorage<PlatformConfig>('config', INITIAL_CONFIG)
  );

  const [currentRole, setCurrentRole] = useState<'applicant' | 'admin'>(() =>
    loadFromStorage<'applicant' | 'admin'>('currentRole', 'applicant')
  );

  const [currentInstitutionId, setCurrentInstitutionIdState] = useState<string>(() =>
    loadFromStorage<string>('currentInstitutionId', 'INST-001')
  );

  const [currentReviewerId, setCurrentReviewerIdState] = useState<string>(() =>
    loadFromStorage<string>('currentReviewerId', 'REV-01')
  );

  // Sync to localStorage
  useEffect(() => {
    saveToStorage('applications', applications);
  }, [applications]);

  useEffect(() => {
    saveToStorage('institutions', institutions);
  }, [institutions]);

  useEffect(() => {
    saveToStorage('notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    saveToStorage('config', config);
  }, [config]);

  useEffect(() => {
    saveToStorage('currentRole', currentRole);
  }, [currentRole]);

  useEffect(() => {
    saveToStorage('currentInstitutionId', currentInstitutionId);
  }, [currentInstitutionId]);

  useEffect(() => {
    saveToStorage('currentReviewerId', currentReviewerId);
  }, [currentReviewerId]);

  const currentInstitution =
    institutions.find((i) => i.id === currentInstitutionId) || institutions[0];

  const currentReviewer =
    config.reviewers.find((r) => r.id === currentReviewerId) || config.reviewers[0];

  const setRole = (role: 'applicant' | 'admin') => {
    setCurrentRole(role);
  };

  const setCurrentInstitutionId = (id: string) => {
    setCurrentInstitutionIdState(id);
  };

  const setCurrentReviewerId = (id: string) => {
    setCurrentReviewerIdState(id);
  };

  // Helper to add notification
  const addNotification = (notif: Omit<NotificationItem, 'id' | 'createdAt'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // 1. Save Draft
  const saveDraftApplication = (
    appData: Partial<Application>,
    documents: DocumentItem[]
  ): string => {
    const existingIndex = applications.findIndex((a) => a.id === appData.id);
    const appId =
      appData.id || `PRM-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const now = new Date().toISOString();
    let updatedApp: Application;

    if (existingIndex >= 0) {
      const existing = applications[existingIndex];
      updatedApp = {
        ...existing,
        ...appData,
        documents,
        updatedAt: now,
      };
      setApplications((prev) => {
        const copy = [...prev];
        copy[existingIndex] = updatedApp;
        return copy;
      });
    } else {
      updatedApp = {
        id: appId,
        institutionId: currentInstitution.id,
        institutionName: currentInstitution.name,
        institutionType: currentInstitution.institutionType,
        state: currentInstitution.state,
        applicationType: appData.applicationType || 'Institutional Recognition',
        academicYear: appData.academicYear || '2026-2027',
        purpose: appData.purpose || '',
        referenceNumber: appData.referenceNumber,
        remarks: appData.remarks,
        status: 'Draft',
        createdAt: now,
        updatedAt: now,
        riskLevel: 'Low',
        documents,
        findings: [],
        activityLog: [
          {
            id: `ACT-${Date.now()}`,
            applicationId: appId,
            actorId: currentInstitution.id,
            actorName: currentInstitution.representativeName,
            actorRole: 'Applicant',
            action: 'Draft Created',
            description: 'Application saved as draft.',
            newStatus: 'Draft',
            timestamp: now,
          },
        ],
      };
      setApplications((prev) => [updatedApp, ...prev]);
    }

    return appId;
  };

  // 2. Submit Application
  const submitApplication = (
    appData: Partial<Application>,
    documents: DocumentItem[]
  ): string => {
    const existingIndex = applications.findIndex((a) => a.id === appData.id);
    const appId =
      appData.id || `PRM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const requiredCats = config.documentCategories
      .filter((c) => c.required)
      .map((c) => c.category);

    const { findings, riskLevel } = runDeterministicVerification(
      appId,
      currentInstitution,
      documents,
      requiredCats
    );

    const submissionEvent = {
      id: `ACT-${Date.now()}`,
      applicationId: appId,
      institutionId: currentInstitution.id,
      institutionName: currentInstitution.name,
      actorId: currentInstitution.id,
      actorName: currentInstitution.representativeName,
      actorRole: 'Applicant' as const,
      action: 'Application Submitted',
      description: `Application submitted with ${documents.length} supporting documents. Deterministic validation initialized.`,
      previousStatus: (appData.status || 'Draft') as ApplicationStatus,
      newStatus: 'Submitted' as ApplicationStatus,
      timestamp: now,
    };

    let newApp: Application;

    if (existingIndex >= 0) {
      const existing = applications[existingIndex];
      newApp = {
        ...existing,
        ...appData,
        status: 'Submitted',
        submittedAt: now,
        updatedAt: now,
        riskLevel,
        documents,
        findings,
        activityLog: [submissionEvent, ...existing.activityLog],
      };
      setApplications((prev) => {
        const copy = [...prev];
        copy[existingIndex] = newApp;
        return copy;
      });
    } else {
      newApp = {
        id: appId,
        institutionId: currentInstitution.id,
        institutionName: currentInstitution.name,
        institutionType: currentInstitution.institutionType,
        state: currentInstitution.state,
        applicationType: appData.applicationType || 'Institutional Recognition',
        academicYear: appData.academicYear || '2026-2027',
        purpose: appData.purpose || '',
        referenceNumber: appData.referenceNumber,
        remarks: appData.remarks,
        status: 'Submitted',
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
        riskLevel,
        documents,
        findings,
        activityLog: [submissionEvent],
      };
      setApplications((prev) => [newApp, ...prev]);
    }

    // Add admin notification
    addNotification({
      recipientRole: 'admin',
      applicationId: appId,
      title: 'New Application Submitted',
      message: `${currentInstitution.name} submitted application ${appId} (${newApp.applicationType}).`,
      type: 'info',
      read: false,
    });

    return appId;
  };

  // 3. Admin Start Verification
  const startVerification = (applicationId: string) => {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) return;

    const now = new Date().toISOString();
    const event = {
      id: `ACT-${Date.now()}`,
      applicationId,
      institutionId: app.institutionId,
      institutionName: app.institutionName,
      actorId: currentReviewer.id,
      actorName: currentReviewer.name,
      actorRole: 'Administrator' as const,
      action: 'Verification Commenced',
      description: `Verification initiated by ${currentReviewer.name} (${currentReviewer.role}).`,
      previousStatus: app.status,
      newStatus: 'Under Verification' as ApplicationStatus,
      timestamp: now,
    };

    setApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: 'Under Verification',
              assignedReviewerId: a.assignedReviewerId || currentReviewer.id,
              assignedReviewerName: a.assignedReviewerName || currentReviewer.name,
              updatedAt: now,
              activityLog: [event, ...a.activityLog],
            }
          : a
      )
    );

    addNotification({
      recipientRole: 'applicant',
      institutionId: app.institutionId,
      applicationId,
      title: 'Verification In Progress',
      message: `Your application ${applicationId} is currently being verified by ${currentReviewer.name}.`,
      type: 'info',
      read: false,
    });
  };

  // 4. Admin Assign Reviewer
  const assignReviewer = (applicationId: string, reviewerId: string) => {
    const app = applications.find((a) => a.id === applicationId);
    const targetReviewer = config.reviewers.find((r) => r.id === reviewerId);
    if (!app || !targetReviewer) return;

    const now = new Date().toISOString();
    const event = {
      id: `ACT-${Date.now()}`,
      applicationId,
      institutionId: app.institutionId,
      institutionName: app.institutionName,
      actorId: currentReviewer.id,
      actorName: currentReviewer.name,
      actorRole: 'Administrator' as const,
      action: 'Reviewer Reassigned',
      description: `Application assigned to ${targetReviewer.name} (${targetReviewer.department}).`,
      previousStatus: app.status,
      newStatus: app.status,
      timestamp: now,
    };

    setApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              assignedReviewerId: targetReviewer.id,
              assignedReviewerName: targetReviewer.name,
              updatedAt: now,
              activityLog: [event, ...a.activityLog],
            }
          : a
      )
    );
  };

  // 5. Admin Request Corrections
  const requestCorrections = (
    applicationId: string,
    selectedFindingIds: string[],
    reviewerComment: string,
    dueDate?: string
  ) => {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) return;

    const now = new Date().toISOString();
    const event = {
      id: `ACT-${Date.now()}`,
      applicationId,
      institutionId: app.institutionId,
      institutionName: app.institutionName,
      actorId: currentReviewer.id,
      actorName: currentReviewer.name,
      actorRole: 'Administrator' as const,
      action: 'Corrections Requested',
      description: `Administrator requested corrections on ${selectedFindingIds.length} item(s). Note: ${reviewerComment}`,
      previousStatus: app.status,
      newStatus: 'Action Required' as ApplicationStatus,
      timestamp: now,
      comment: reviewerComment,
    };

    const updatedFindings = app.findings.map((f) => ({
      ...f,
      selectedForCorrection: selectedFindingIds.includes(f.id),
      reviewerComment: selectedFindingIds.includes(f.id)
        ? reviewerComment
        : f.reviewerComment,
    }));

    setApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: 'Action Required',
              findings: updatedFindings,
              reviewerComments: reviewerComment,
              correctionDueDate: dueDate || a.correctionDueDate,
              updatedAt: now,
              activityLog: [event, ...a.activityLog],
            }
          : a
      )
    );

    addNotification({
      recipientRole: 'applicant',
      institutionId: app.institutionId,
      applicationId,
      title: 'Action Required: Corrections Requested',
      message: `Reviewer requested corrections for ${app.id}: "${reviewerComment.slice(0, 100)}..."`,
      type: 'warning',
      read: false,
    });
  };

  // 6. Applicant Resubmit
  const resubmitApplication = (
    applicationId: string,
    applicantResponse: string,
    updatedDocs?: DocumentItem[]
  ) => {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) return;

    const now = new Date().toISOString();
    const event = {
      id: `ACT-${Date.now()}`,
      applicationId,
      institutionId: app.institutionId,
      institutionName: app.institutionName,
      actorId: currentInstitution.id,
      actorName: currentInstitution.representativeName,
      actorRole: 'Applicant' as const,
      action: 'Application Resubmitted',
      description: `Applicant responded to correction requests: "${applicantResponse.slice(0, 120)}..."`,
      previousStatus: app.status,
      newStatus: 'Resubmitted' as ApplicationStatus,
      timestamp: now,
      comment: applicantResponse,
    };

    // If documents were updated, reflect that
    const docs = updatedDocs || app.documents;

    setApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: 'Resubmitted',
              applicantResponse,
              documents: docs,
              updatedAt: now,
              activityLog: [event, ...a.activityLog],
            }
          : a
      )
    );

    addNotification({
      recipientRole: 'admin',
      applicationId,
      title: 'Application Resubmitted',
      message: `${app.institutionName} resubmitted application ${app.id} with corrections.`,
      type: 'info',
      read: false,
    });
  };

  // 7. Admin Record Decision (Verified or Rejected)
  const recordDecision = (
    applicationId: string,
    decision: 'Verified' | 'Rejected',
    reasonOrComment: string
  ) => {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) return;

    const now = new Date().toISOString();
    const isApproved = decision === 'Verified';

    const event = {
      id: `ACT-${Date.now()}`,
      applicationId,
      institutionId: app.institutionId,
      institutionName: app.institutionName,
      actorId: currentReviewer.id,
      actorName: currentReviewer.name,
      actorRole: 'Administrator' as const,
      action: isApproved ? 'Verification Approved' : 'Application Rejected',
      description: isApproved
        ? `Verification approved by ${currentReviewer.name}. Remarks: ${reasonOrComment}`
        : `Application rejected by ${currentReviewer.name}. Reason: ${reasonOrComment}`,
      previousStatus: app.status,
      newStatus: decision,
      timestamp: now,
      comment: reasonOrComment,
    };

    setApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: decision,
              decisionDate: now,
              reviewerComments: reasonOrComment,
              rejectionReason: !isApproved ? reasonOrComment : undefined,
              updatedAt: now,
              activityLog: [event, ...a.activityLog],
            }
          : a
      )
    );

    addNotification({
      recipientRole: 'applicant',
      institutionId: app.institutionId,
      applicationId,
      title: isApproved
        ? 'Application Verified Successfully'
        : 'Application Rejected',
      message: isApproved
        ? `Your application ${app.id} has completed verification and is officially verified.`
        : `Your application ${app.id} was rejected. Reason: ${reasonOrComment}`,
      type: isApproved ? 'success' : 'error',
      read: false,
    });
  };

  // 8. Reopen Application
  const reopenApplication = (applicationId: string, justification: string) => {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) return;

    const now = new Date().toISOString();
    const event = {
      id: `ACT-${Date.now()}`,
      applicationId,
      institutionId: app.institutionId,
      institutionName: app.institutionName,
      actorId: currentReviewer.id,
      actorName: currentReviewer.name,
      actorRole: 'Administrator' as const,
      action: 'Case Reopened for Review',
      description: `Administrative override: case reopened from ${app.status} to Under Verification. Justification: ${justification}`,
      previousStatus: app.status,
      newStatus: 'Under Verification' as ApplicationStatus,
      timestamp: now,
      comment: justification,
    };

    setApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: 'Under Verification',
              updatedAt: now,
              activityLog: [event, ...a.activityLog],
            }
          : a
      )
    );
  };

  // 9. Flag for Further Investigation
  const flagForInvestigation = (applicationId: string, note: string) => {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) return;

    const now = new Date().toISOString();
    const event = {
      id: `ACT-${Date.now()}`,
      applicationId,
      institutionId: app.institutionId,
      institutionName: app.institutionName,
      actorId: currentReviewer.id,
      actorName: currentReviewer.name,
      actorRole: 'Administrator' as const,
      action: 'Flagged for High-Risk Investigation',
      description: `Elevated to specialized scrutiny queue. Note: ${note}`,
      previousStatus: app.status,
      newStatus: app.status,
      timestamp: now,
      comment: note,
    };

    setApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              riskLevel: 'High',
              updatedAt: now,
              activityLog: [event, ...a.activityLog],
            }
          : a
      )
    );
  };

  // 10. Replace Document
  const replaceDocument = (
    applicationId: string,
    oldDocId: string,
    newDoc: DocumentItem
  ) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id !== applicationId) return a;
        const updatedDocs = a.documents.map((d) => (d.id === oldDocId ? newDoc : d));
        return {
          ...a,
          documents: updatedDocs,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // 11. Profile Update
  const updateInstitutionProfile = (updated: Partial<Institution>) => {
    setInstitutions((prev) =>
      prev.map((inst) =>
        inst.id === currentInstitutionId ? { ...inst, ...updated } : inst
      )
    );
  };

  // 12. Config Update
  const updatePlatformConfig = (newConfig: Partial<PlatformConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  // 13. Physical Inspection (EVC) Toggle
  const togglePhysicalInspection = (
    applicationId: string,
    required: boolean,
    reason?: string
  ) => {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) return;
    const now = new Date().toISOString();
    const actionDesc = required
      ? `Expert Visit Committee (EVC) physical inspection recommended by ${currentReviewer.name}. Reason: ${reason || 'Infrastructure or documentary discrepancies noted.'}`
      : `Physical inspection recommendation cleared by ${currentReviewer.name}.`;

    const event: ActivityEvent = {
      id: `ACT-${Date.now()}`,
      applicationId,
      institutionId: app.institutionId,
      institutionName: app.institutionName,
      actorId: currentReviewer.id,
      actorName: currentReviewer.name,
      actorRole: 'Administrator',
      action: required ? 'EVC Physical Inspection Flagged' : 'EVC Physical Inspection Cleared',
      description: actionDesc,
      timestamp: now,
      comment: reason,
    };

    setApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              physicalInspectionRequired: required,
              inspectionRecommendationReason: required ? reason : undefined,
              updatedAt: now,
              activityLog: [event, ...a.activityLog],
            }
          : a
      )
    );

    addNotification({
      recipientRole: 'admin',
      applicationId,
      title: required ? 'Physical Inspection Recommended' : 'Physical Inspection Flag Cleared',
      message: `${app.institutionName} (${applicationId}): ${actionDesc}`,
      type: required ? 'warning' : 'info',
      read: false,
    });
  };

  // 14. Verify Document with Issuing Authority
  const verifyDocumentAuthority = (applicationId: string, docId: string) => {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) return;
    const doc = app.documents.find((d) => d.id === docId);
    if (!doc) return;

    const now = new Date().toISOString();
    let authoritySource = 'National DigiLocker & State Repository';
    if (doc.category.includes('Affiliation')) authoritySource = 'Affiliating University Order Portal';
    else if (doc.category.includes('Accreditation')) authoritySource = 'NBA / NAAC Statutory Registry';
    else if (doc.category.includes('Infrastructure')) authoritySource = 'Municipal Fire & Safety Gateway';
    else if (doc.category.includes('Registration')) authoritySource = 'Registrar of Societies / MCA Portal';

    const isMismatch = doc.reviewStatus === 'Flagged' || doc.extractedFields?.['Mismatch Flag'] === 'Critical Discrepancy';
    const status: IssuingAuthorityStatus = isMismatch ? 'Mismatch Detected' : 'Verified';

    const updatedDocs = app.documents.map((d) =>
      d.id === docId
        ? {
            ...d,
            issuingAuthorityStatus: status,
            issuingAuthoritySource: authoritySource,
            verificationTimestamp: now,
            verificationMethod: 'API' as const,
            sourceEvidenceHash: `SHA256:${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
          }
        : d
    );

    const event: ActivityEvent = {
      id: `ACT-${Date.now()}`,
      applicationId,
      institutionId: app.institutionId,
      institutionName: app.institutionName,
      actorId: currentReviewer.id,
      actorName: currentReviewer.name,
      actorRole: 'Administrator',
      action: 'Issuing Authority Cross-Check',
      description: `Cross-checked ${doc.fileName} via ${authoritySource}. Result: ${status}.`,
      timestamp: now,
    };

    setApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              documents: updatedDocs,
              updatedAt: now,
              activityLog: [event, ...a.activityLog],
            }
          : a
      )
    );
  };

  // 15. Verify All Documents with Issuing Authorities
  const verifyAllDocumentAuthorities = (applicationId: string) => {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) return;
    const now = new Date().toISOString();

    const updatedDocs = app.documents.map((d) => {
      let authoritySource = 'National DigiLocker & State Repository';
      if (d.category.includes('Affiliation')) authoritySource = 'Affiliating University Order Portal';
      else if (d.category.includes('Accreditation')) authoritySource = 'NBA / NAAC Statutory Registry';
      else if (d.category.includes('Infrastructure')) authoritySource = 'Municipal Fire & Safety Gateway';
      else if (d.category.includes('Registration')) authoritySource = 'Registrar of Societies / MCA Portal';

      const isMismatch = d.reviewStatus === 'Flagged' || d.extractedFields?.['Mismatch Flag'] === 'Critical Discrepancy';
      const status: IssuingAuthorityStatus = isMismatch ? 'Mismatch Detected' : 'Verified';

      return {
        ...d,
        issuingAuthorityStatus: status,
        issuingAuthoritySource: authoritySource,
        verificationTimestamp: now,
        verificationMethod: 'API' as const,
        sourceEvidenceHash: `SHA256:${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
      };
    });

    const event: ActivityEvent = {
      id: `ACT-${Date.now()}`,
      applicationId,
      institutionId: app.institutionId,
      institutionName: app.institutionName,
      actorId: currentReviewer.id,
      actorName: currentReviewer.name,
      actorRole: 'Administrator',
      action: 'Batch Issuing Authority Verification',
      description: `Queried authorized external registries for all ${updatedDocs.length} documents.`,
      timestamp: now,
    };

    setApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              documents: updatedDocs,
              updatedAt: now,
              activityLog: [event, ...a.activityLog],
            }
          : a
      )
    );
  };

  // 16. Sync AICTE Master Record
  const syncAicteMasterData = (applicationId: string) => {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) return;
    const now = new Date().toISOString();

    const previousEoaRecord = app.previousEoaRecord || {
      previousAcademicYear: '2025-2026',
      previousEoaRef: `AICTE/REG/1-${Math.floor(100000000 + Math.random() * 900000000)}/2025/EOA`,
      approvedProgramsCount: 12,
      approvedIntake: 840,
      deficiencyCountPriorYear: 0,
      status: 'APPROVED' as const,
    };

    const event: ActivityEvent = {
      id: `ACT-${Date.now()}`,
      applicationId,
      institutionId: app.institutionId,
      institutionName: app.institutionName,
      actorId: currentReviewer.id,
      actorName: currentReviewer.name,
      actorRole: 'Administrator',
      action: 'AICTE Central Master Synchronized',
      description: `Retrieved historical approval records and TER payment status from AICTE central portal.`,
      timestamp: now,
    };

    setApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              previousEoaRecord,
              terPaymentStatus: a.terPaymentStatus || 'CONFIRMED',
              terTransactionRef: a.terTransactionRef || `TER-2026-BK-${Math.floor(100000 + Math.random() * 900000)}`,
              terAmountPaid: a.terAmountPaid || 200000,
              terPaymentDate: a.terPaymentDate || '2026-10-18T10:30:00Z',
              proposedIntake: a.proposedIntake || 840,
              updatedAt: now,
              activityLog: [event, ...a.activityLog],
            }
          : a
      )
    );
  };

  // 13. Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = (role?: 'applicant' | 'admin') => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (!role) return { ...n, read: true };
        if (role === 'admin' && (n.recipientRole === 'admin' || n.recipientRole === 'all')) {
          return { ...n, read: true };
        }
        if (role === 'applicant' && (n.recipientRole === 'applicant' || n.recipientRole === 'all')) {
          return { ...n, read: true };
        }
        return n;
      })
    );
  };

  const unreadCount = (role: 'applicant' | 'admin'): number => {
    return notifications.filter((n) => {
      if (n.read) return false;
      if (role === 'admin') return n.recipientRole === 'admin' || n.recipientRole === 'all';
      return (
        (n.recipientRole === 'applicant' || n.recipientRole === 'all') &&
        (!n.institutionId || n.institutionId === currentInstitutionId)
      );
    }).length;
  };

  // 14. Reset Demo Data
  const resetDemoData = () => {
    clearStorage();
    setApplications(INITIAL_APPLICATIONS);
    setInstitutions(INITIAL_INSTITUTIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setConfig(INITIAL_CONFIG);
    setCurrentRole('applicant');
    setCurrentInstitutionIdState('INST-001');
    setCurrentReviewerIdState('REV-01');
  };

  return (
    <AppContext.Provider
      value={{
        applications,
        institutions,
        notifications,
        config,
        currentRole,
        currentInstitutionId,
        currentInstitution,
        currentReviewerId,
        currentReviewer,
        setRole,
        setCurrentInstitutionId,
        setCurrentReviewerId,
        saveDraftApplication,
        submitApplication,
        startVerification,
        assignReviewer,
        requestCorrections,
        resubmitApplication,
        recordDecision,
        reopenApplication,
        flagForInvestigation,
        replaceDocument,
        updateInstitutionProfile,
        updatePlatformConfig,
        togglePhysicalInspection,
        verifyDocumentAuthority,
        verifyAllDocumentAuthorities,
        syncAicteMasterData,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoData,
        unreadCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

