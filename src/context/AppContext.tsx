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

