import { buildSchema } from 'graphql';

export const graphqlSchema = buildSchema(`
  enum ApplicationStatus {
    Draft
    Submitted
    Under_Verification
    Action_Required
    Resubmitted
    Verified
    Rejected
  }

  enum RiskLevel {
    Low
    Medium
    High
  }

  type Institution {
    id: ID!
    code: String
    name: String!
    institutionType: String!
    registrationNumber: String!
    aisheCode: String!
    state: String!
    district: String!
    address: String
    officialEmail: String!
    contactNumber: String!
    representativeName: String!
    representativeDesignation: String!
    status: String!
  }

  type DocumentItem {
    id: ID!
    category: String!
    fileName: String!
    mimeType: String!
    fileSize: Float!
    uploadedAt: String!
    required: Boolean!
    reviewStatus: String!
  }

  type VerificationFinding {
    id: ID!
    checkType: String!
    title: String!
    description: String!
    severity: String!
    status: String!
    evidence: String!
    recommendedAction: String
    reviewerComment: String
    selectedForCorrection: Boolean
  }

  type ActivityEvent {
    id: ID!
    actorName: String!
    actorRole: String!
    action: String!
    description: String!
    previousStatus: String
    newStatus: String
    timestamp: String!
  }

  type Application {
    id: ID!
    institutionId: String!
    institutionName: String!
    institutionType: String!
    state: String!
    applicationType: String!
    academicYear: String!
    purpose: String!
    referenceNumber: String
    status: String!
    riskLevel: String!
    assignedReviewerId: String
    assignedReviewerName: String
    reviewerComments: String
    rejectionReason: String
    correctionDueDate: String
    applicantResponse: String
    submittedAt: String
    decisionDate: String
    createdAt: String!
    updatedAt: String!
    documents: [DocumentItem!]!
    findings: [VerificationFinding!]!
    activityLog: [ActivityEvent!]!
  }

  type ApplicationPagination {
    items: [Application!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type AnalyticsReport {
    total: Int!
    verified: Int!
    rejected: Int!
    actionRequired: Int!
    inProgress: Int!
    approvalRatePercent: Float!
    averageTurnaroundDays: Float!
  }

  input ApplicationInput {
    institutionId: String
    institutionName: String!
    institutionType: String!
    state: String!
    applicationType: String!
    academicYear: String
    purpose: String!
    referenceNumber: String
    remarks: String
    isSubmit: Boolean
  }

  type Query {
    applications(
      page: Int
      limit: Int
      status: String
      riskLevel: String
      institutionType: String
      search: String
    ): ApplicationPagination!

    application(id: ID!): Application

    institutions: [Institution!]!
    institution(id: ID!): Institution

    analytics: AnalyticsReport!
    auditLogs: [ActivityEvent!]!
  }

  type Mutation {
    createApplication(input: ApplicationInput!): Application!
    startVerification(id: ID!): Application!
    requestCorrections(id: ID!, findingIds: [String!]!, comment: String!, dueDate: String): Application!
    resubmitApplication(id: ID!, applicantResponse: String!): Application!
    recordDecision(id: ID!, decision: String!, reasonOrComment: String!): Application!
  }
`);

