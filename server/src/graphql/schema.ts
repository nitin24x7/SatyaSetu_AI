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

  type IdpJobSummary {
    jobId: ID!
    documentId: String!
    applicationId: String!
    fileName: String!
    status: String!
    progressPercent: Int!
    currentStage: String!
    enqueuedAt: String!
    updatedAt: String!
  }

  type BoundingBox {
    x: Float!
    y: Float!
    width: Float!
    height: Float!
  }

  type LayoutSegment {
    id: ID!
    type: String!
    bbox: BoundingBox!
    confidence: Float!
    rawText: String!
  }

  type MathematicalValidation {
    checked: Boolean!
    valid: Boolean!
    summary: String!
  }

  type ExtractedTable {
    id: ID!
    caption: String!
    rowCount: Int!
    colCount: Int!
    headers: [String!]!
    mathematicalValidation: MathematicalValidation
  }

  type PreprocessingMetrics {
    originalDpi: Int!
    targetDpi: Int!
    deskewAngleDegrees: Float!
    noiseReductionApplied: Boolean!
    contrastRatio: Float!
    grayscaleBinarized: Boolean!
    pageCount: Int!
  }

  type TamperScan {
    tamperLikelihoodScore: Float!
    riskLevel: String!
    anomaliesDetected: [String!]!
  }

  type IdpProcessingResult {
    jobId: ID!
    documentId: String!
    applicationId: String!
    fileName: String!
    category: String!
    status: String!
    startedAt: String!
    completedAt: String
    durationMs: Int
    preprocessing: PreprocessingMetrics!
    layoutSegments: [LayoutSegment!]!
    ocrWordCount: Int!
    averageConfidence: Float!
    extractedTables: [ExtractedTable!]!
    tamperScan: TamperScan!
  }

  type IdpJobDetails {
    summary: IdpJobSummary
    result: IdpProcessingResult
  }

  type SimilarityResult {
    levenshteinDistance: Int!
    jaroSimilarity: Float!
    jaroWinklerSimilarity: Float!
    tokenSortRatio: Float!
    confidence: Float!
    matchLevel: String!
  }

  type ConcordanceItem {
    fieldKey: String!
    fieldLabel: String!
    declaredValue: String!
    extractedValue: String!
    sourceDocument: String!
    similarity: SimilarityResult!
    status: String!
    remediationAdvice: String
  }

  type ConcordanceReport {
    overallScore: Int!
    concordanceStatus: String!
    totalFieldsCompared: Int!
    concordantCount: Int!
    warningCount: Int!
    mismatchCount: Int!
    items: [ConcordanceItem!]!
  }

  type CadreCalculusResult {
    totalStudents: Int!
    totalFaculty: Int!
    calculatedSfr: Float!
    mandatedSfrCeiling: Float!
    isSfrCompliant: Boolean!
    summary: String!
  }

  type InfrastructureCalculusResult {
    totalBuiltAreaSqM: Float!
    mandatedMinimumSqM: Float!
    deficitSurplusPercent: Float!
    isCompliant: Boolean!
    summary: String!
  }

  type TemporalCheckResult {
    certificateType: String!
    issuanceDate: String
    expiryDate: String
    academicYear: String!
    isValid: Boolean!
    isExpired: Boolean!
    daysRemaining: Int
    status: String!
    details: String!
  }

  type ComplianceRuleInfo {
    id: ID!
    code: String!
    title: String!
    category: String!
    regulatoryStandard: String!
    description: String!
    weight: Int!
  }

  type RuleEvaluationFinding {
    ruleId: String!
    title: String!
    category: String!
    severity: String!
    status: String!
    scoreContribution: Int!
    maxScore: Int!
    evidence: String!
    recommendedAction: String
  }

  type ComplianceEvaluationSummary {
    applicationId: String!
    institutionName: String!
    evaluationTimestamp: String!
    overallScore: Int!
    riskLevel: String!
    findings: [RuleEvaluationFinding!]!
    concordanceReport: ConcordanceReport!
    cadreCheck: CadreCalculusResult
    infrastructureCheck: InfrastructureCalculusResult
    temporalChecks: [TemporalCheckResult!]!
    recommendedDecision: String!
  }

  type UserAuthProfile {
    id: ID!
    email: String!
    name: String!
    role: String!
    institutionId: String
    scopes: [String!]!
  }

  type AuthTokens {
    accessToken: String!
    refreshToken: String!
    tokenType: String!
    expiresIn: Int!
    user: UserAuthProfile!
  }

  type DigiLockerSignature {
    signerName: String!
    certifyingAuthority: String!
    verified: Boolean!
    timestamp: String!
    algorithm: String!
  }

  type DigiLockerDocument {
    docUri: String!
    docType: String!
    documentTitle: String!
    issuerName: String!
    issuedTo: String!
    issueDate: String!
    expiryDate: String
    digitalSignature: DigiLockerSignature!
    verificationStatus: String!
  }

  type ESignVerificationResult {
    documentId: String!
    fileName: String!
    isSignatureValid: Boolean!
    signerName: String!
    signerDesignation: String!
    signingTime: String!
    certifyingAuthority: String!
    certValidityStatus: String!
    isAadhaarVerified: Boolean!
    nonRepudiationGuaranteed: Boolean!
    auditTrailReference: String!
    summary: String!
  }

  type AisheSyncResult {
    aisheCode: String!
    legalName: String!
    institutionType: String!
    state: String!
    district: String!
    establishedYear: Int!
    accreditedProgramsCount: Int!
    totalSanctionedIntake: Int!
    statutoryStanding: String!
    lastSynchronizedAt: String!
    registrySource: String!
  }

  type IntegrationStatus {
    service: String!
    endpoint: String!
    status: String!
    responseTimeMs: Int!
    lastHeartbeat: String!
    securityStandard: String!
  }

  type AnomalyBoundingBox {
    x: Float!
    y: Float!
    width: Float!
    height: Float!
    pageNumber: Int
    confidence: Float!
    description: String!
  }

  type ForensicAnomaly {
    id: ID!
    type: String!
    severity: String!
    title: String!
    location: AnomalyBoundingBox
    evidence: String!
    remediationAction: String!
  }

  type ElaAnalysisResult {
    meanErrorRate: Float!
    variance: Float!
    highErrorRegionsCount: Int!
    hasInconsistentCompression: Boolean!
    suspiciousRegions: [AnomalyBoundingBox!]!
    summary: String!
  }

  type ClonedRegionPair {
    sourceBox: AnomalyBoundingBox!
    targetBox: AnomalyBoundingBox!
    featureSimilarity: Float!
    descriptorDistance: Float!
  }

  type CmfdAnalysisResult {
    keypointMatchesFound: Int!
    clonedPairs: [ClonedRegionPair!]!
    isCloned: Boolean!
    summary: String!
  }

  type PdfStructureAnalysisResult {
    incrementalUpdatesCount: Int!
    overlaidLayersDetected: Int!
    authoringTool: String!
    hasHiddenTextStreams: Boolean!
    suspiciousAnnotationsCount: Int!
    isTampered: Boolean!
    summary: String!
  }

  type PerceptualHashResult {
    sha256: String!
    dhash: String!
    ahash: String!
    isRecycled: Boolean!
    matchedPreviousApplicationId: String
    matchedPreviousInstitution: String
    hammingDistance: Int
    summary: String!
  }

  type MetadataForensicsResult {
    softwareFingerprint: String!
    creatorTool: String!
    creationDate: String!
    modificationDate: String!
    hasDiscrepantTimestamps: Boolean!
    isSuspiciousSoftware: Boolean!
    summary: String!
  }

  type ForensicReport {
    documentId: ID!
    applicationId: String!
    fileName: String!
    analysisTimestamp: String!
    tamperLikelihoodScore: Float!
    verdict: String!
    anomalies: [ForensicAnomaly!]!
    elaAnalysis: ElaAnalysisResult!
    cmfdAnalysis: CmfdAnalysisResult!
    pdfInspection: PdfStructureAnalysisResult!
    perceptualHash: PerceptualHashResult!
    metadataForensics: MetadataForensicsResult!
    summary: String!
  }

  type PreconditionCheckGQL {
    id: String!
    name: String!
    description: String!
    passed: Boolean!
    severity: String!
    details: String
  }

  type PreconditionEvaluationResultGQL {
    canTransition: Boolean!
    checks: [PreconditionCheckGQL!]!
    blockingReasons: [String!]!
    warnings: [String!]!
  }

  type TransitionEventGQL {
    id: String!
    applicationId: String!
    fromState: String!
    toState: String!
    action: String!
    actorId: String!
    actorName: String!
    actorRole: String!
    timestamp: String!
    comment: String
    justification: String
    preconditionsMet: Boolean!
  }

  type SlaTrackingRecordGQL {
    applicationId: String!
    policyType: String!
    startTimestamp: String!
    deadlineTimestamp: String!
    elapsedHours: Float!
    remainingHours: Float!
    percentageElapsed: Float!
    status: String!
    escalationLevel: String!
    escalatedAt: String
    escalatedTo: String
    lastEvaluatedAt: String!
  }

  type ReviewerWorkloadProfileGQL {
    reviewerId: String!
    name: String!
    email: String!
    department: String!
    disciplines: [String!]!
    currentActiveCases: Int!
    maxCapacity: Int!
    utilizationRate: Float!
    slaAdherenceScore: Float!
    isAvailable: Boolean!
  }

  type AutoAssignmentResultGQL {
    applicationId: String!
    assignedReviewerId: String!
    assignedReviewerName: String!
    department: String!
    matchScore: Int!
    assignmentReason: String!
    assignedAt: String!
  }

  type NotificationRecordGQL {
    id: String!
    recipientId: String!
    recipientRole: String!
    channel: String!
    eventType: String!
    title: String!
    message: String!
    applicationId: String
    status: String!
    read: Boolean!
    createdAt: String!
  }

  type WorkflowTransitionResultGQL {
    success: Boolean!
    application: Application!
    transitionEvent: TransitionEventGQL!
    sla: SlaTrackingRecordGQL
    evaluationResult: PreconditionEvaluationResultGQL!
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

    idpJob(jobId: ID!): IdpJobDetails
    idpJobs(limit: Int): [IdpJobSummary!]!
    idpCategories: [String!]!

    complianceRules: [ComplianceRuleInfo!]!
    evaluateApplicationCompliance(applicationId: ID!): ComplianceEvaluationSummary
    checkConcordance(declaredName: String!, extractedName: String!): ConcordanceReport

    integrationStatuses: [IntegrationStatus!]!
    syncAisheRegistry(aisheCode: String!): AisheSyncResult

    forensicReport(documentId: String!): ForensicReport
    recentForensicReports: [ForensicReport!]!

    workflowHistory(applicationId: ID!): [TransitionEventGQL!]!
    applicationSla(applicationId: ID!): SlaTrackingRecordGQL
    reviewerWorkloads: [ReviewerWorkloadProfileGQL!]!
    userNotifications(recipientId: ID!, unreadOnly: Boolean): [NotificationRecordGQL!]!
  }

  type Mutation {
    createApplication(input: ApplicationInput!): Application!
    startVerification(id: ID!): Application!
    requestCorrections(id: ID!, findingIds: [String!]!, comment: String!, dueDate: String): Application!
    resubmitApplication(id: ID!, applicantResponse: String!): Application!
    recordDecision(id: ID!, decision: String!, reasonOrComment: String!): Application!

    transitionWorkflow(
      applicationId: ID!
      action: String!
      targetState: String!
      actorId: String!
      actorName: String!
      actorRole: String!
      comment: String
      justification: String
      complianceScore: Float
    ): WorkflowTransitionResultGQL!

    adminWorkflowOverride(
      applicationId: ID!
      justification: String!
      actorId: String!
      actorName: String!
    ): WorkflowTransitionResultGQL!

    autoAssignWorkflowReviewer(applicationId: ID!): AutoAssignmentResultGQL!

    enqueueIdpProcessing(
      documentId: String!
      applicationId: String!
      fileName: String!
      category: String!
      institutionName: String
      registrationNumber: String
    ): IdpJobSummary!

    loginUser(email: String!, password: String): AuthTokens!
    verifyMfaSession(mfaSessionId: String!, code: String!): AuthTokens!
    refreshUserToken(refreshToken: String!): AuthTokens!
    pullDigiLockerDocument(docUri: String!, docType: String!, consent: Boolean!, institutionAisheCode: String!): DigiLockerDocument!
    verifyAadhaarESign(documentId: String!, fileName: String!, signatureHex: String): ESignVerificationResult!

    analyzeDocumentForensics(
      documentId: String!
      applicationId: String!
      fileName: String!
      category: String
      isSimulatedTampered: Boolean
      isSimulatedCloned: Boolean
      isSimulatedRecycled: Boolean
    ): ForensicReport!
  }
`);

