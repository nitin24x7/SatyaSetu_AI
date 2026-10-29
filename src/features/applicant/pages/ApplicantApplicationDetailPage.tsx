import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/ui/Toast';
import {
  ArrowLeft,
  Calendar,
  Building2,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck,
  UploadCloud,
  RotateCcw,
  Printer,
  ChevronRight,
  ExternalLink,
  Shield,
  Send,
  Eye,
  FileCode,
  Landmark,
  Compass,
  BadgeCheck,
} from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { RiskBadge } from '../../../components/ui/RiskBadge';
import { CheckResultBadge } from '../../../components/ui/CheckResultBadge';
import { formatDate, formatDateShort, formatFileSize } from '../../../lib/formatters';
import { DocumentItem } from '../../../types';

export const ApplicantApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applications, resubmitApplication, replaceDocument, currentInstitution } = useApp();
  const { success, warning, error } = useToast();

  const application = applications.find((a) => a.id === id);

  // Resubmission modal state
  const [isResubmitOpen, setIsResubmitOpen] = useState(false);
  const [applicantResponse, setApplicantResponse] = useState('');
  const [selectedReplacementDoc, setSelectedReplacementDoc] = useState<{
    docId: string;
    category: string;
  } | null>(null);

  // Document preview modal
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  if (!application) {
    return (
      <div className="bg-white p-12 text-center rounded-xl border border-slate-border">
        <AlertTriangle size={36} className="mx-auto text-amber-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Application Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          The requested application identifier {id} does not exist in local storage.
        </p>
        <button
          onClick={() => navigate('/applicant/applications')}
          className="mt-4 px-4 py-2 bg-brand-blue text-white text-xs font-semibold rounded-lg"
        >
          Return to Applications List
        </button>
      </div>
    );
  }

  // Handle document replacement in Action Required mode
  const handleFileReplace = (docId: string, category: any, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const updatedDoc: DocumentItem = {
        id: `DOC-REPL-${Date.now()}`,
        applicationId: application.id,
        category,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        required: true,
        reviewStatus: 'Pending',
        fileDataUrl: dataUrl,
        previewType: file.type === 'application/pdf' ? 'pdf' : 'image',
        mockPreviewData: {
          title: category,
          issuer: application.institutionName,
          issueDate: new Date().toISOString().split('T')[0],
          referenceNo: `REPL-${Math.floor(1000 + Math.random() * 9000)}`,
          sealPresent: true,
          qrValid: true,
          sampleText: `Replaced file ${file.name}. Corrected submission.`,
        },
        extractedFields: {
          'Document State': 'Replaced by Applicant',
          'Filename': file.name,
          'Timestamp': new Date().toLocaleDateString(),
        },
      };

      replaceDocument(application.id, docId, updatedDoc);
      setSelectedReplacementDoc(null);
      success('Document Replaced', `${file.name} uploaded to replace flagged document.`);
    };
    reader.readAsDataURL(file);
  };

  // Handle final resubmission
  const handleFinalResubmit = () => {
    if (!applicantResponse.trim()) {
      warning('Response required', 'Please provide an explanatory response message to the reviewer.');
      return;
    }

    resubmitApplication(application.id, applicantResponse);
    setIsResubmitOpen(false);
    success('Application Resubmitted', 'Your dossier has been resubmitted to the administrative review queue.');
  };

  const flaggedFindings = application.findings.filter(
    (f) => f.status === 'Fail' || f.status === 'Warning' || f.selectedForCorrection
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/applicant/applications"
            className="inline-flex items-center gap-1.5 text-xs text-slate-muted hover:text-slate-text font-medium mb-1"
          >
            <ArrowLeft size={14} /> Back to Applications List
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-navy-deep font-mono">
              {application.id}
            </h1>
            <StatusBadge status={application.status} size="md" />
            <RiskBadge risk={application.riskLevel} size="sm" />
          </div>
          <p className="text-xs text-slate-muted mt-1">
            {application.institutionName} • {application.applicationType} • Cycle: {application.academicYear}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Print/Download Simulated Report */}
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 border border-slate-border text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>

          {/* Resubmit button if Action Required */}
          {application.status === 'Action Required' && (
            <button
              onClick={() => setIsResubmitOpen(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RotateCcw size={15} />
              <span>Resolve & Resubmit</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Required Banner */}
      {application.status === 'Action Required' && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 text-orange-950">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-orange-100 rounded-xl text-orange-600 shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-base font-bold text-orange-900">
                  Action Required: Regulatory Corrections Requested
                </h3>
                {application.correctionDueDate && (
                  <span className="text-xs font-medium text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full">
                    Due Date: {formatDateShort(application.correctionDueDate)}
                  </span>
                )}
              </div>
              <p className="text-xs text-orange-800 mt-1">
                The regulatory assessor has identified discrepancies or missing items that require correction before statutory review can be approved.
              </p>

              {application.reviewerComments && (
                <div className="mt-3 p-3 bg-white/80 rounded-xl border border-orange-200 text-xs text-slate-800">
                  <span className="font-bold text-orange-900">Reviewer Remarks: </span>
                  {application.reviewerComments}
                </div>
              )}

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => setIsResubmitOpen(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <RotateCcw size={14} /> Open Resubmission Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verified Status Banner */}
      {application.status === 'Verified' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-950 flex items-start gap-3">
          <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600 shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-900">
              Verification Successfully Completed (Simulated Approval)
            </h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              All statutory documents, concordance checks, and institutional ratios have completed verification with simulated regulatory clearance.
            </p>
            {application.reviewerComments && (
              <p className="text-xs text-slate-700 mt-2 italic bg-white/70 p-2.5 rounded-lg border border-emerald-200">
                "{application.reviewerComments}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* EVC Physical Inspection Notice for Applicant */}
      {application.physicalInspectionRequired && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 text-amber-950 flex items-start gap-3">
          <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shrink-0">
            <Compass size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-amber-900">
                Notice: Expert Visit Committee (EVC) Physical Inspection Recommended
              </h3>
              <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
                PENDING EVC SCHEDULE
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-1">
              The AICTE scrutiny committee has flagged specific infrastructure or documentary parameters for ground-truth physical verification. An authorized EVC inspection team will visit the campus in accordance with the Approval Process Handbook.
            </p>
            <div className="mt-2 text-xs bg-white/80 p-2.5 rounded-lg border border-amber-200 text-amber-900">
              <strong>Grounds: </strong> {application.inspectionRecommendationReason}
            </div>
          </div>
        </div>
      )}

      {/* Grid: Details Left (2 Cols) & Timeline Right (1 Col) */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Dossier Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application & Institution Overview Cards */}
          <div className="bg-white rounded-xl border border-slate-border p-5 shadow-xs">
            <h3 className="text-sm font-bold text-navy-deep mb-3 flex items-center gap-2">
              <Building2 size={16} className="text-brand-blue" />
              <span>Institutional Information</span>
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Institution Name</span>
                <span className="font-semibold text-slate-800">{application.institutionName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Classification</span>
                <span className="font-semibold text-slate-800">{application.institutionType}</span>
              </div>
              <div>
                <span className="text-slate-400 block">State Jurisdiction</span>
                <span className="font-semibold text-slate-800">{application.state}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Assigned Evaluator</span>
                <span className="font-semibold text-slate-800">
                  {application.assignedReviewerName || 'Under Initial Queue Triage'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-slate-400 block text-xs">Stated Purpose</span>
              <p className="text-xs text-slate-700 mt-0.5 leading-relaxed bg-surface-subtle p-3 rounded-lg border border-slate-100">
                {application.purpose}
              </p>
            </div>
          </div>

          {/* AICTE Sanctioned Intake & TER Payment Card */}
          <div className="bg-white rounded-xl border border-slate-border p-5 shadow-xs">
            <h3 className="text-sm font-bold text-navy-deep mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Landmark size={16} className="text-indigo-600" />
                <span>AICTE Central Approval & TER Regulatory Fee Status</span>
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono font-semibold">
                ✓ AICTE CONNECTED
              </span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Previous Academic Year EoA Letter</span>
                <span className="font-mono font-bold text-slate-900">
                  {application.previousEoaRecord?.previousEoaRef || 'AICTE/SWRO/1-931829101/2025/EOA'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Approved Intake vs Proposed</span>
                <span className="font-bold text-slate-900">
                  {application.previousEoaRecord?.approvedIntake || 940} Seats (Proposed: {application.proposedIntake || 940})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">TER Regulatory Payment Status</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <BadgeCheck size={14} />
                  {application.terPaymentStatus || 'CONFIRMED'} (₹{(application.terAmountPaid || 200000).toLocaleString()})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">TER Challan / Bharatkosh Ref</span>
                <span className="font-mono text-slate-800">
                  {application.terTransactionRef || 'TER-2026-BK-918204'}
                </span>
              </div>
            </div>
          </div>

          {/* Submitted Documents Section */}
          <div className="bg-white rounded-xl border border-slate-border p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-navy-deep flex items-center gap-2">
                <FileText size={16} className="text-brand-blue" />
                <span>Submitted Statutory Documents ({application.documents.length})</span>
              </h3>
              <span className="text-xs text-slate-400">Click to preview document</span>
            </div>

            <div className="space-y-2.5">
              {application.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl border border-slate-border hover:border-brand-blue bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-brand-blue shrink-0">
                      <FileCheck size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{doc.category}</span>
                        {doc.reviewStatus === 'Flagged' ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                            Flagged
                          </span>
                        ) : doc.reviewStatus === 'Verified' ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            Verified
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                            Pending Review
                          </span>
                        )}
                        {doc.issuingAuthorityStatus && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                              doc.issuingAuthorityStatus === 'Verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : doc.issuingAuthorityStatus === 'Mismatch Detected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            Authority: {doc.issuingAuthorityStatus}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {doc.fileName} • {formatFileSize(doc.fileSize)} • Uploaded {formatDateShort(doc.uploadedAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="px-3 py-1.5 text-xs text-brand-blue hover:bg-brand-blue-light font-semibold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Eye size={13} />
                      <span>Preview</span>
                    </button>

                    {application.status === 'Action Required' && (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileReplace(doc.id, doc.category, file);
                          }}
                        />
                        <span className="px-3 py-1.5 text-xs text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 font-semibold rounded-lg inline-flex items-center gap-1 transition-colors">
                          <UploadCloud size={13} />
                          <span>Replace</span>
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Findings Section */}
          <div className="bg-white rounded-xl border border-slate-border p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-navy-deep flex items-center gap-2">
                  <Shield size={16} className="text-brand-blue" />
                  <span>Simulated Compliance Findings ({application.findings.length})</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Deterministic automated checks against statutory regulations.
                </p>
              </div>
            </div>

            {application.findings.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-surface-subtle rounded-xl">
                No simulated findings generated yet. Submit application to initiate rule engine.
              </div>
            ) : (
              <div className="space-y-3">
                {application.findings.map((fnd) => (
                  <div
                    key={fnd.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      fnd.status === 'Fail'
                        ? 'border-rose-200 bg-rose-50/20'
                        : fnd.status === 'Warning'
                        ? 'border-amber-200 bg-amber-50/20'
                        : 'border-slate-border bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <CheckResultBadge result={fnd.status} />
                          <span className="text-xs font-bold text-slate-800">{fnd.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">[{fnd.checkType}]</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {fnd.description}
                        </p>
                        <div className="mt-2 text-[11px] text-slate-500 bg-surface-subtle p-2 rounded-lg border border-slate-100">
                          <strong>Evidence: </strong> {fnd.evidence}
                        </div>
                        {fnd.recommendedAction && (
                          <div className="mt-1.5 text-[11px] text-brand-blue font-medium">
                            <strong>Recommended Action: </strong> {fnd.recommendedAction}
                          </div>
                        )}
                        {fnd.reviewerComment && (
                          <div className="mt-1.5 text-[11px] text-orange-800 bg-orange-50 p-2 rounded border border-orange-200">
                            <strong>Assessor Note: </strong> {fnd.reviewerComment}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Status & Activity Log */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white rounded-xl border border-slate-border p-5 shadow-xs text-xs space-y-3">
            <h3 className="font-bold text-sm text-navy-deep border-b border-slate-100 pb-2">
              Case Metadata
            </h3>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Application ID</span>
              <span className="font-mono font-bold text-slate-800">{application.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Status</span>
              <StatusBadge status={application.status} size="sm" />
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Created At</span>
              <span className="text-slate-700">{formatDate(application.createdAt)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Last Updated</span>
              <span className="text-slate-700">{formatDate(application.updatedAt)}</span>
            </div>
            {application.submittedAt && (
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Submitted At</span>
                <span className="text-slate-700">{formatDate(application.submittedAt)}</span>
              </div>
            )}
            {application.decisionDate && (
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Decision Date</span>
                <span className="text-slate-700">{formatDate(application.decisionDate)}</span>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-xl border border-slate-border p-5 shadow-xs">
            <h3 className="font-bold text-sm text-navy-deep mb-3">
              Application Workflow History
            </h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-slate-100">
              {application.activityLog.map((event) => (
                <div key={event.id} className="relative flex items-start gap-3 pl-5 text-xs">
                  <span className="absolute left-1 top-1 w-2 h-2 rounded-full bg-brand-blue ring-4 ring-white" />
                  <div>
                    <div className="font-semibold text-slate-800">{event.action}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      by {event.actorName} ({event.actorRole}) • {formatDate(event.timestamp)}
                    </div>
                    <p className="text-slate-600 text-[11px] mt-1 bg-surface-subtle p-2 rounded border border-slate-100">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resubmission Modal */}
      {isResubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-border max-w-lg w-full p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-navy-deep flex items-center gap-2">
                <RotateCcw size={18} className="text-orange-600" />
                <span>Resubmit Application {application.id}</span>
              </h3>
              <button
                onClick={() => setIsResubmitOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <p className="text-slate-600">
                Please provide an explanation of changes made to address the assessor's concerns. Replaced documents have been refreshed in your dossier.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Applicant Response to Regulatory Assessor *
                </label>
                <textarea
                  rows={4}
                  value={applicantResponse}
                  onChange={(e) => setApplicantResponse(e.target.value)}
                  placeholder="e.g. As requested, we have uploaded the municipal building safety certification and verified the faculty ratio roster with registrar seal..."
                  className="w-full text-xs p-3 rounded-lg border border-slate-border focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <span className="font-semibold">Workflow Update: </span>
                Clicking confirm will update the status to <strong>Resubmitted</strong> and notify the administrative assessor to resume verification.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsResubmitOpen(false)}
                className="px-4 py-2 border border-slate-border text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalResubmit}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Send size={14} />
                <span>Confirm & Resubmit Dossier</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Lightbox Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-border max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-border flex items-center justify-between bg-surface-subtle">
              <div>
                <h4 className="text-sm font-bold text-navy-deep">{previewDoc.category}</h4>
                <p className="text-xs text-slate-500">{previewDoc.fileName} • {formatFileSize(previewDoc.fileSize)}</p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* If actual uploaded image data exists */}
              {previewDoc.fileDataUrl && previewDoc.mimeType.startsWith('image/') ? (
                <div className="text-center">
                  <img
                    src={previewDoc.fileDataUrl}
                    alt={previewDoc.fileName}
                    className="max-h-80 mx-auto rounded-lg border border-slate-border shadow-xs"
                  />
                </div>
              ) : (
                /* Simulated Document Inspection Sheet */
                <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 font-sans shadow-inner">
                  <div className="border-b border-slate-300 pb-3 mb-4 flex justify-between items-start">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        OFFICIAL STATUTORY DOCUMENT PREVIEW (SIMULATED)
                      </div>
                      <div className="text-base font-bold text-navy-deep mt-1">
                        {previewDoc.mockPreviewData?.title || previewDoc.category}
                      </div>
                      <div className="text-xs text-slate-600">
                        Issuing Authority: {previewDoc.mockPreviewData?.issuer || application.institutionName}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono px-2 py-1 bg-white border border-slate-200 rounded font-semibold text-slate-700">
                        {previewDoc.mockPreviewData?.referenceNo || 'DOC-REF-VALID'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 space-y-2 mb-4">
                    <p>
                      {previewDoc.mockPreviewData?.sampleText ||
                        'Certified that this document has been authenticated under the statutory provisions of the regulatory council. All seal signatures and accreditation parameters stand registered.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Extracted Metadata</span>
                      <span className="font-semibold">{previewDoc.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Digital Seal Check</span>
                      <span className="font-semibold text-status-success">✓ Verified Valid</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-surface-subtle border-t border-slate-border flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 bg-brand-blue text-white text-xs font-semibold rounded-lg"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

