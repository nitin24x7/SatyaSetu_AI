export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Verification'
  | 'Action Required'
  | 'Resubmitted'
  | 'Verified'
  | 'Rejected';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export type CheckResult = 'Pass' | 'Warning' | 'Fail' | 'Not Checked';

export type FindingSeverity = 'Info' | 'Low' | 'Medium' | 'High' | 'Critical';

export type InstitutionType =
  | 'Central University'
  | 'State University'
  | 'Deemed University'
  | 'Autonomous Engineering College'
  | 'Affiliated Technical Institute'
  | 'Polytechnic Institute'
  | 'Management Institute';

export type ApplicationType =
  | 'Institutional Recognition'
  | 'Compliance Review'
  | 'Document Verification'
  | 'Renewal / Extension'
  | 'Capacity Expansion Approval';

export type DocumentCategory =
  | 'Institutional Registration Certificate'
  | 'Affiliation / Recognition Certificate'
  | 'Accreditation Certificate'
  | 'Faculty Information'
  | 'Infrastructure Information'
  | 'Supporting Declaration'
  | 'Other Supporting Documents';

export type DocumentReviewStatus = 'Pending' | 'Verified' | 'Flagged' | 'Rejected' | 'Missing';

export interface Institution {
  id: string;
  name: string;
  institutionType: InstitutionType;
  registrationNumber: string;
  aisheCode: string;
  state: string;
  district: string;
  address: string;
  officialEmail: string;
  contactNumber: string;
  representativeName: string;
  representativeDesignation: string;
  createdAt: string;
  status: 'Active' | 'Pending Review' | 'Flagged' | 'Suspended';
}

export interface DocumentItem {
  id: string;
  applicationId: string;
  category: DocumentCategory;
  fileName: string;
  mimeType: string;
  fileSize: number; // in bytes
  uploadedAt: string;
  required: boolean;
  reviewStatus: DocumentReviewStatus;
  extractedFields: Record<string, string | number | boolean | null>;
  previewType?: 'pdf' | 'image' | 'text' | 'unsupported';
  mockPreviewData?: {
    title: string;
    issuer: string;
    issueDate: string;
    validUntil?: string;
    referenceNo: string;
    sealPresent: boolean;
    qrValid: boolean;
    sampleText?: string;
  };
  fileDataUrl?: string; // in-memory temporary base64
  findings?: VerificationFinding[];
}

export interface VerificationFinding {
  id: string;
  applicationId: string;
  documentId?: string;
  documentCategory?: DocumentCategory;
  checkType:
    | 'Mandatory Document Check'
    | 'Institution Name Match'
    | 'Registration Validity'
    | 'Date & Period Verification'
    | 'Duplicate Detection'
    | 'Visual Integrity'
    | 'Authority Signature'
    | 'Regulatory Norms'
    | 'Faculty Ratio Compliance';
  title: string;
  description: string;
  severity: FindingSeverity;
  status: CheckResult;
  evidence: string;
  recommendedAction: string;
  reviewerComment?: string;
  selectedForCorrection?: boolean;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  applicationId: string;
  institutionId?: string;
  institutionName?: string;
  actorId: string;
  actorName: string;
  actorRole: 'Applicant' | 'Administrator' | 'System';
  action: string;
  description: string;
  previousStatus?: ApplicationStatus;
  newStatus?: ApplicationStatus;
  timestamp: string;
  comment?: string;
}

export interface Application {
  id: string;
  institutionId: string;
  institutionName: string;
  institutionType: InstitutionType;
  state: string;
  applicationType: ApplicationType;
  academicYear: string;
  purpose: string;
  referenceNumber?: string;
  remarks?: string;
  status: ApplicationStatus;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  riskLevel: RiskLevel;
  documents: DocumentItem[];
  findings: VerificationFinding[];
  reviewerComments?: string;
  rejectionReason?: string;
  correctionDueDate?: string;
  applicantResponse?: string;
  decisionDate?: string;
  activityLog: ActivityEvent[];
}

export interface NotificationItem {
  id: string;
  recipientRole: 'applicant' | 'admin' | 'all';
  institutionId?: string;
  applicationId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface Reviewer {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  activeCasesCount: number;
}

export interface ComplianceRule {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  enabled: boolean;
  severity: FindingSeverity;
}

export interface DocumentCategoryConfig {
  category: DocumentCategory;
  required: boolean;
  maxSizeBytes: number;
  allowedTypes: string[];
  description: string;
}

export interface PlatformConfig {
  applicationTypes: ApplicationType[];
  documentCategories: DocumentCategoryConfig[];
  maxFileSizeMB: number;
  complianceRules: ComplianceRule[];
  reviewers: Reviewer[];
}
