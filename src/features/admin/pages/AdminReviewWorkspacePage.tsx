import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/ui/Toast';
import {
  ArrowLeft,
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  UserCheck,
  Flag,
  FileText,
  Building2,
  Calendar,
  AlertCircle,
  HelpCircle,
  Send,
  Printer,
  ChevronRight,
  Maximize2,
  Sparkles,
  ExternalLink,
  Landmark,
  Camera,
  CreditCard,
  Link2,
  SearchCode,
  BadgeCheck,
  Compass,
} from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { RiskBadge } from '../../../components/ui/RiskBadge';
import { CheckResultBadge } from '../../../components/ui/CheckResultBadge';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { formatDate, formatDateShort, formatFileSize } from '../../../lib/formatters';
import { DocumentItem, VerificationFinding } from '../../../types';

export const AdminReviewWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    applications,
    config,
    startVerification,
    assignReviewer,
    requestCorrections,
    recordDecision,
    reopenApplication,
    flagForInvestigation,
    togglePhysicalInspection,
    verifyDocumentAuthority,
    verifyAllDocumentAuthorities,
    syncAicteMasterData,
    currentReviewer,
  } = useApp();
  const { success, warning, error } = useToast();

  const application = applications.find((a) => a.id === id);

  // Active Selected Document in Left Panel
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    application?.documents[0]?.id || null
  );

  // Center Preview Zoom State
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Right Panel Active Tab
  const [activeRightTab, setActiveRightTab] = useState<
    'findings' | 'extracted' | 'authorities' | 'infrastructure' | 'activity'
  >('findings');

  // Loading state for authority query
  const [isQueryingAuthorities, setIsQueryingAuthorities] = useState(false);

  // Dialog States
  const [isCorrectionsOpen, setIsCorrectionsOpen] = useState(false);
  const [selectedFindingIds, setSelectedFindingIds] = useState<string[]>([]);
  const [correctionComment, setCorrectionComment] = useState('');
  const [correctionDueDate, setCorrectionDueDate] = useState('2026-11-15');

  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [approvalRemarks, setApprovalRemarks] = useState(
    'All statutory document parameters, entity concordance, and regulatory ratios satisfy AICTE norms. Verified.'
  );

  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [isReopenOpen, setIsReopenOpen] = useState(false);
  const [reopenJustification, setReopenJustification] = useState('');

  const [isFlagOpen, setIsFlagOpen] = useState(false);
  const [flagNote, setFlagNote] = useState('');

  const [isEvcModalOpen, setIsEvcModalOpen] = useState(false);
  const [evcReason, setEvcReason] = useState(
    'Instructional carpet area deficit and unverified laboratory resources requiring Expert Visit Committee (EVC) on-site verification.'
  );

  if (!application) {
    return (
      <div className="bg-white p-12 text-center rounded-xl border border-slate-border">
        <AlertTriangle size={36} className="mx-auto text-amber-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Application Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          Dossier {id} could not be located in local persistence.
        </p>
        <button
          onClick={() => navigate('/admin/applications')}
          className="mt-4 px-4 py-2 bg-navy-deep text-white text-xs font-semibold rounded-lg"
        >
          Return to Applications Pipeline
        </button>
      </div>
    );
  }

  // Currently inspected document
  const activeDoc =
    application.documents.find((d) => d.id === selectedDocId) ||
    application.documents[0];

  // Missing mandatory categories calculation
  const attachedCategories = new Set(application.documents.map((d) => d.category));
  const missingCategories = config.documentCategories
    .filter((c) => c.required)
    .filter((c) => !attachedCategories.has(c.category));

  // Handle Corrections Submit
  const handleConfirmCorrections = () => {
    if (!correctionComment.trim()) {
      warning('Comment Required', 'Please provide a clear instruction comment for the applicant.');
      return;
    }

    requestCorrections(
      application.id,
      selectedFindingIds,
      correctionComment,
      correctionDueDate
    );
    setIsCorrectionsOpen(false);
    success('Corrections Requested', `Application marked as Action Required. Applicant has been notified.`);
  };

  // Handle Approval Submit
  const handleConfirmApproval = () => {
    recordDecision(application.id, 'Verified', approvalRemarks);
    setIsApproveOpen(false);
    success('Verification Recorded', `Application ${application.id} approved with simulated regulatory clearance.`);
  };

  // Handle Rejection Submit
  const handleConfirmRejection = () => {
    if (!rejectionReason.trim()) {
      error('Reason Required', 'Mandatory statutory reason required to reject an institutional application.');
      return;
    }

    recordDecision(application.id, 'Rejected', rejectionReason);
    setIsRejectOpen(false);
    success('Application Rejected', `Simulated decision recorded. Case ${application.id} marked as Rejected.`);
  };

  // Handle Reopen Submit
  const handleConfirmReopen = () => {
    if (!reopenJustification.trim()) {
      warning('Justification Required', 'Administrative override justification is required to reopen this case.');
      return;
    }

    reopenApplication(application.id, reopenJustification);
    setIsReopenOpen(false);
    success('Case Reopened', `Application ${application.id} reverted to Under Verification.`);
  };

  // Handle Flag Submit
  const handleConfirmFlag = () => {
    if (!flagNote.trim()) {
      warning('Note Required', 'Please provide an investigative note for the case record.');
      return;
    }

    flagForInvestigation(application.id, flagNote);
    setIsFlagOpen(false);
    success('Flagged for Investigation', `Application risk level elevated to High.`);
  };

  // Handle EVC Physical Inspection Submit
  const handleConfirmEvc = () => {
    togglePhysicalInspection(application.id, true, evcReason);
    setIsEvcModalOpen(false);
    warning('EVC Physical Inspection Flagged', 'Case flagged for Expert Visit Committee on-site inspection.');
  };

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Status Navigation Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <Link
              to="/admin/applications"
              className="p-2 border border-slate-200/80 hover:bg-slate-50 text-slate-600 rounded-2xl transition-colors shrink-0 shadow-2xs"
              title="Return to Pipeline"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-black text-lg text-slate-900">{application.id}</span>
                <StatusBadge status={application.status} size="sm" />
                <RiskBadge risk={application.riskLevel} size="sm" />
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-bold border border-teal-200/70">
                  {application.applicationType}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {application.institutionName} • Jurisdiction: {application.state} • Cycle: {application.academicYear}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Start verification if submitted */}
            {application.status === 'Submitted' && (
              <button
                onClick={() => {
                  startVerification(application.id);
                  success('Verification Started', `Case assigned to ${currentReviewer.name}.`);
                }}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-teal-600/20 flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Start Verification
              </button>
            )}

            {/* Reassign Reviewer Dropdown */}
            <select
              value={application.assignedReviewerId || ''}
              onChange={(e) => {
                if (e.target.value) {
                  assignReviewer(application.id, e.target.value);
                  success('Assessor Assigned', 'Case successfully reassigned.');
                }
              }}
              className="text-xs p-1.5 rounded-xl border border-slate-200/80 bg-white text-slate-700 font-medium"
            >
              <option value="">Assign Assessor...</option>
              {config.reviewers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.role})
                </option>
              ))}
            </select>

            {/* Request Corrections Button */}
            {(application.status === 'Under Verification' ||
              application.status === 'Submitted' ||
              application.status === 'Resubmitted') && (
              <button
                onClick={() => {
                  // Pre-select failing findings
                  setSelectedFindingIds(
                    application.findings
                      .filter((f) => f.status === 'Fail' || f.status === 'Warning')
                      .map((f) => f.id)
                  );
                  setIsCorrectionsOpen(true);
                }}
                className="px-3 py-1.5 border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs"
              >
                <AlertTriangle size={14} /> Request Corrections
              </button>
            )}

            {/* Sync AICTE Records */}
            <button
              onClick={() => {
                syncAicteMasterData(application.id);
                success('AICTE Master Synchronized', 'Historical approval records and TER payment status updated.');
              }}
              className="px-3 py-1.5 border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs"
              title="Retrieve relevant institutional records from central AICTE portal"
            >
              <Landmark size={14} /> Sync AICTE
            </button>

            {/* Query Issuing Authorities */}
            <button
              onClick={() => {
                setIsQueryingAuthorities(true);
                setTimeout(() => {
                  verifyAllDocumentAuthorities(application.id);
                  setIsQueryingAuthorities(false);
                  success('Issuing Authorities Queried', 'All documents verified against DigiLocker, University, and State gateways.');
                }, 600);
              }}
              disabled={isQueryingAuthorities}
              className="px-3 py-1.5 border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs"
              title="Query DigiLocker, State DTE, and Affiliating University APIs"
            >
              <Link2 size={14} className={isQueryingAuthorities ? 'animate-spin' : ''} />
              {isQueryingAuthorities ? 'Verifying...' : 'Verify Authorities'}
            </button>

            {/* EVC Physical Inspection Flag */}
            <button
              onClick={() => setIsEvcModalOpen(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs ${
                application.physicalInspectionRequired
                  ? 'bg-blue-100 border border-blue-300 text-blue-900 shadow-xs'
                  : 'border border-slate-200/80 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="Flag or review Expert Visit Committee (EVC) on-site physical inspection"
            >
              <Compass size={14} className={application.physicalInspectionRequired ? 'text-blue-700' : ''} />
              {application.physicalInspectionRequired ? 'EVC Flagged' : 'Recommend EVC'}
            </button>

            {/* Flag for investigation */}
            {application.riskLevel !== 'High' && (
              <button
                onClick={() => setIsFlagOpen(true)}
                className="px-3 py-1.5 border border-slate-200/80 text-slate-600 hover:text-slate-900 text-xs font-medium rounded-xl hover:bg-slate-50 flex items-center gap-1 shadow-2xs"
                title="Flag for specialized forensic investigation"
              >
                <Flag size={14} /> Flag High-Risk
              </button>
            )}

            {/* Approve button */}
            {(application.status === 'Under Verification' ||
              application.status === 'Resubmitted' ||
              application.status === 'Submitted') && (
              <button
                onClick={() => setIsApproveOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Record Approval
              </button>
            )}

            {/* Reject button */}
            {(application.status === 'Under Verification' ||
              application.status === 'Resubmitted' ||
              application.status === 'Action Required') && (
              <button
                onClick={() => setIsRejectOpen(true)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-rose-600/20 flex items-center gap-1.5"
              >
                <XCircle size={14} /> Record Rejection
              </button>
            )}

            {/* Reopen button for finalized cases */}
            {(application.status === 'Verified' || application.status === 'Rejected') && (
              <button
                onClick={() => setIsReopenOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-blue-600/20 flex items-center gap-1.5"
              >
                <RotateCcw size={14} /> Administrative Override / Reopen
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resubmitted Notice Banner if applicant provided updates */}
      {application.status === 'Resubmitted' && (
        <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-4 flex items-start gap-3 text-purple-950 text-xs animate-in fade-in duration-150 shadow-2xs">
          <RotateCcw size={16} className="text-purple-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Applicant Resubmission Received: </span>
            <span>"{application.applicantResponse || 'Corrections uploaded by applicant.'}"</span>
          </div>
        </div>
      )}

      {/* EVC Physical Inspection Banner (Theme Blue/Indigo) */}
      {application.physicalInspectionRequired && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-3xl p-4 flex items-start justify-between gap-3 text-blue-950 text-xs animate-in fade-in duration-150 shadow-xs">
          <div className="flex items-start gap-2.5">
            <Compass size={18} className="text-blue-700 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <div className="font-bold text-blue-900 flex items-center gap-2">
                <span>AICTE Expert Visit Committee (EVC) Physical Inspection Recommended</span>
                <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  EVC-ACTION-REQUIRED
                </span>
              </div>
              <p className="mt-0.5 text-blue-800">
                Grounds for on-site physical scrutiny: {application.inspectionRecommendationReason}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              togglePhysicalInspection(application.id, false);
              success('EVC Flag Cleared', 'Physical inspection requirement removed.');
            }}
            className="text-[11px] font-semibold text-blue-800 hover:text-blue-950 underline shrink-0 cursor-pointer"
          >
            Clear Flag
          </button>
        </div>
      )}

      {/* Statutory Advisory Decision-Support Notice */}
      <div className="bg-teal-50/70 border border-teal-200/70 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2 text-teal-950 text-[11px] shadow-2xs">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-teal-700 shrink-0" />
          <span>
            <strong>AICTE Decision Support Safeguard:</strong> All AI-generated flags, concordance markers, and compliance calculus are preliminary decision-support outputs. Statutory scrutiny, physical inspections where required, and final regulatory decisions remain strictly with competent AICTE authorities.
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono shrink-0">APH 2026/27 Reg. 4.2</span>
      </div>

      {/* THREE-PANEL REVIEW WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[680px]">
        {/* PANEL 1: LEFT PANEL — Document Checklist & Missing Items (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-5 flex flex-col justify-between overflow-y-auto max-h-[750px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-deep">
                Submitted Documents
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                {application.documents.length} Files
              </span>
            </div>

            {/* Document list */}
            <div className="space-y-2">
              {application.documents.map((doc) => {
                const isSelected = activeDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/40 shadow-xs ring-1 ring-teal-500/30'
                        : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-bold text-slate-800 line-clamp-1">
                        {doc.category}
                      </span>
                      {doc.reviewStatus === 'Flagged' ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold shrink-0">
                          FLAGGED
                        </span>
                      ) : doc.reviewStatus === 'Verified' ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold shrink-0">
                          VALID
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                          PENDING
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate font-mono">
                      {doc.fileName}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex justify-between">
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>{formatDateShort(doc.uploadedAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Missing documents indicator */}
            {missingCategories.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 mb-2">
                  <AlertCircle size={14} />
                  <span>Missing Mandatory Dossier Items ({missingCategories.length})</span>
                </div>
                <div className="space-y-1.5">
                  {missingCategories.map((m) => (
                    <div
                      key={m.category}
                      className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800"
                    >
                      • {m.category}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Selected document feeds OCR inspector in right panel.
          </div>
        </div>

        {/* PANEL 2: CENTER PANEL — Document Preview & Optical Inspection (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden max-h-[750px]">
          {/* Preview Toolbar */}
          <div className="p-3.5 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <FileText size={15} className="text-teal-600 shrink-0" />
              <span className="font-bold text-slate-800 truncate">
                {activeDoc?.category || 'Document Preview'}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                className="p-1.5 hover:bg-slate-200/80 rounded-xl text-slate-600 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-[10px] font-mono w-10 text-center font-bold text-slate-600">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
                className="p-1.5 hover:bg-slate-200/80 rounded-xl text-slate-600 transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
            </div>
          </div>

          {/* Main Document Inspection Canvas */}
          <div className="flex-1 bg-slate-100 p-4 overflow-y-auto flex items-center justify-center">
            {activeDoc ? (
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="transition-transform duration-150 w-full max-w-md bg-white rounded-xl shadow-md border border-slate-300 p-6 font-sans relative"
              >
                {/* Simulated Statutory Stamp Ribbon */}
                <div className="absolute top-4 right-4 text-center">
                  <div className="w-16 h-16 rounded-full border-2 border-emerald-600/70 text-emerald-700 flex flex-col items-center justify-center text-[8px] font-bold uppercase rotate-12 bg-emerald-50/50">
                    <span>DIGITALLY</span>
                    <span>VERIFIED</span>
                    <span className="text-[7px]">OCR PASS</span>
                  </div>
                </div>

                {/* Header */}
                <div className="border-b-2 border-slate-800 pb-3 mb-4">
                  <div className="text-[9px] uppercase font-bold tracking-widest text-slate-500">
                    GOVERNMENT OF INDIA • REGULATORY COMPLIANCE ARCHIVE
                  </div>
                  <h3 className="text-sm font-black text-navy-deep uppercase mt-1">
                    {activeDoc.mockPreviewData?.title || activeDoc.category}
                  </h3>
                  <div className="text-[10px] text-slate-600">
                    Issuing Authority: {activeDoc.mockPreviewData?.issuer || application.institutionName}
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                    Ref: {activeDoc.mockPreviewData?.referenceNo || 'DOC-REG-VERIF-2026'}
                  </div>
                </div>

                {/* Body Content */}
                <div className="text-xs text-slate-700 leading-relaxed space-y-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="font-serif">
                    {activeDoc.mockPreviewData?.sampleText ||
                      `This document certifies that ${application.institutionName} has submitted regulatory filings for ${application.applicationType}. Credentials and registered parameters match state directory records.`}
                  </p>
                </div>

                {/* Extracted optical field highlights */}
                <div className="space-y-1.5 text-[11px] border-t border-slate-200 pt-3">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Optical Character Recognition (OCR) Layer
                  </div>
                  {Object.entries(activeDoc.extractedFields || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-0.5 border-b border-slate-100">
                      <span className="text-slate-500">{key}:</span>
                      <span className="font-mono font-semibold text-slate-800">{String(val)}</span>
                    </div>
                  ))}
                </div>

                {/* Seal presence */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Signatory Seal: <strong>Authenticated</strong></span>
                  <span>Tamper Scan: <strong>Clear (0.01%)</strong></span>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-slate-400">
                Select a document from the left checklist to inspect preview.
              </div>
            )}
          </div>

          <div className="p-2.5 bg-surface-subtle border-t border-slate-border text-[11px] text-slate-500 text-center">
            Simulated high-fidelity optical view with forensic artifact scanning.
          </div>
        </div>

        {/* PANEL 3: RIGHT PANEL — Findings, Field Concordance & Compliance Checklist (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden max-h-[750px]">
          {/* Tab Navigation - Smooth iOS Squircles */}
          <div className="p-1.5 border-b border-slate-200/80 bg-slate-50/80 flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveRightTab('findings')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap ${
                activeRightTab === 'findings'
                  ? 'bg-white text-teal-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Findings ({application.findings.length})
            </button>
            <button
              onClick={() => setActiveRightTab('extracted')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap ${
                activeRightTab === 'extracted'
                  ? 'bg-white text-teal-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Concordance
            </button>
            <button
              onClick={() => setActiveRightTab('authorities')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
                activeRightTab === 'authorities'
                  ? 'bg-white text-teal-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Landmark size={12} /> Authorities & EoA
            </button>
            <button
              onClick={() => setActiveRightTab('infrastructure')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
                activeRightTab === 'infrastructure'
                  ? 'bg-white text-teal-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 size={12} /> Infrastructure
            </button>
            <button
              onClick={() => setActiveRightTab('activity')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap ${
                activeRightTab === 'activity'
                  ? 'bg-white text-teal-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              History
            </button>
          </div>

          {/* TAB 1: Verification Findings & Rules */}
          {activeRightTab === 'findings' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-navy-deep">
                  Deterministic Compliance Audit
                </span>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Simulated AI Rules
                </span>
              </div>

              {application.findings.map((fnd) => (
                <div
                  key={fnd.id}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    fnd.status === 'Fail'
                      ? 'border-rose-200 bg-rose-50/20'
                      : fnd.status === 'Warning'
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-slate-border bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <CheckResultBadge result={fnd.status} />
                    <span className="text-[10px] font-mono text-slate-400">
                      {fnd.checkType}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800">{fnd.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {fnd.description}
                  </p>
                  <div className="mt-2 text-[10px] bg-slate-50 p-2 rounded border border-slate-100 text-slate-600">
                    <strong>Evidence: </strong> {fnd.evidence}
                  </div>
                  {fnd.recommendedAction && (
                    <div className="mt-1 text-[10px] text-brand-blue font-semibold">
                      Action: {fnd.recommendedAction}
                    </div>
                  )}
                  {fnd.reviewerComment && (
                    <div className="mt-1.5 text-[10px] bg-orange-50 p-1.5 rounded border border-orange-200 text-orange-900">
                      <strong>Assessor Instruction: </strong> {fnd.reviewerComment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Field-Level Concordance / Mismatch Inspector */}
          {activeRightTab === 'extracted' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-navy-deep mb-1">
                  Entity Master Concordance Comparison
                </h4>
                <p className="text-[11px] text-slate-500">
                  Extracted certificate metadata cross-referenced against regulatory index records.
                </p>
              </div>

              <div className="space-y-2.5">
                {/* Field 1: Institution Name */}
                <div className="p-3 rounded-xl border border-slate-border bg-surface-subtle">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Entity Title</span>
                    <span className="text-emerald-700 font-semibold">✓ 100% Match</span>
                  </div>
                  <div className="text-[11px] space-y-0.5">
                    <div>
                      <span className="text-slate-400">Extracted: </span>
                      <span className="font-mono">{application.institutionName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Master Record: </span>
                      <span className="font-mono">{application.institutionName}</span>
                    </div>
                  </div>
                </div>

                {/* Field 2: Registration Identifier */}
                <div
                  className={`p-3 rounded-xl border ${
                    application.id === 'PRM-2026-1005'
                      ? 'border-rose-300 bg-rose-50/40'
                      : 'border-slate-border bg-surface-subtle'
                  }`}
                >
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Registration Code</span>
                    {application.id === 'PRM-2026-1005' ? (
                      <span className="text-rose-700 font-bold">⚠️ CRITICAL MISMATCH</span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">✓ Verified Match</span>
                    )}
                  </div>
                  <div className="text-[11px] space-y-0.5">
                    <div>
                      <span className="text-slate-400">Extracted: </span>
                      <span className="font-mono">
                        {application.id === 'PRM-2026-1005'
                          ? 'AGTC-UP-2019-SUB'
                          : 'NITK-KA-1960-GOI'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Master Record: </span>
                      <span className="font-mono">
                        {application.id === 'PRM-2026-1005'
                          ? 'AGTC-UP-2012-REG'
                          : 'NITK-KA-1960-GOI'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Field 3: Validity Period */}
                <div
                  className={`p-3 rounded-xl border ${
                    application.id === 'PRM-2026-1006'
                      ? 'border-rose-300 bg-rose-50/40'
                      : 'border-slate-border bg-surface-subtle'
                  }`}
                >
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Certificate Validity Period</span>
                    {application.id === 'PRM-2026-1006' ? (
                      <span className="text-rose-700 font-bold">⚠️ EXPIRED</span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">✓ Active</span>
                    )}
                  </div>
                  <div className="text-[11px] space-y-0.5">
                    <div>
                      <span className="text-slate-400">Expiration: </span>
                      <span className="font-mono">
                        {application.id === 'PRM-2026-1006' ? '2026-06-30' : '2027-06-30'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Current Cycle: </span>
                      <span className="font-mono">{application.academicYear}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AICTE EoA & Issuing Authority Verification */}
          {activeRightTab === 'authorities' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {/* Central AICTE Systems Cross-Check */}
              <div className="p-3.5 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                    <Landmark size={15} className="text-indigo-700" />
                    <span>AICTE Central Master Records</span>
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-mono px-2 py-0.5 rounded font-semibold">
                    CONNECTED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-indigo-100 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Previous EoA Ref:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {application.previousEoaRecord?.previousEoaRef || 'AICTE/SWRO/1-931829101/2025/EOA'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Approved Intake:</span>
                    <span className="font-semibold text-slate-900">
                      {application.previousEoaRecord?.approvedIntake || 940} Seats (Proposed: {application.proposedIntake || 940})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">TER Payment Status:</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <BadgeCheck size={13} />
                      {application.terPaymentStatus || 'CONFIRMED'} (₹{(application.terAmountPaid || 200000).toLocaleString()})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">TER Challan Ref:</span>
                    <span className="font-mono text-slate-800 text-[10px]">
                      {application.terTransactionRef || 'TER-2026-BK-918204'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    syncAicteMasterData(application.id);
                    success('AICTE Master Synchronized', 'Central approval records and TER payment status re-queried.');
                  }}
                  className="w-full mt-1 py-1.5 bg-white hover:bg-indigo-50 border border-indigo-300 text-indigo-900 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw size={13} /> Re-Sync AICTE Central Data
                </button>
              </div>

              {/* Issuing Authority Verification Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-xs font-bold text-navy-deep flex items-center gap-1.5">
                    <Link2 size={14} className="text-brand-blue" />
                    Issuing Authority Gateway Verification
                  </span>
                  <button
                    onClick={() => {
                      setIsQueryingAuthorities(true);
                      setTimeout(() => {
                        verifyAllDocumentAuthorities(application.id);
                        setIsQueryingAuthorities(false);
                        success('Issuing Authorities Verified', 'All documents queried against official external gateways.');
                      }, 500);
                    }}
                    disabled={isQueryingAuthorities}
                    className="text-[10px] text-brand-blue hover:text-brand-blue-dark font-semibold underline"
                  >
                    {isQueryingAuthorities ? 'Querying...' : 'Verify All'}
                  </button>
                </div>

                <div className="space-y-2">
                  {application.documents.map((doc) => {
                    const status = doc.issuingAuthorityStatus || (doc.reviewStatus === 'Flagged' ? 'Mismatch Detected' : 'Verified');
                    const source = doc.issuingAuthoritySource || (
                      doc.category.includes('Registration')
                        ? 'National DigiLocker & State Registrar'
                        : doc.category.includes('Affiliation')
                        ? 'Affiliating University Order Portal'
                        : doc.category.includes('Accreditation')
                        ? 'NBA / NAAC Statutory Registry'
                        : doc.category.includes('Infrastructure')
                        ? 'Municipal Fire & Safety Gateway'
                        : 'State DTE Portal'
                    );

                    return (
                      <div
                        key={doc.id}
                        className="p-2.5 rounded-xl border border-slate-border bg-white text-xs space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                            {doc.fileName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              status === 'Verified'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : status === 'Mismatch Detected'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : status === 'Expired'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : status === 'Verification Pending'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : status === 'Source Unavailable'
                                ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                : 'bg-purple-100 text-purple-800 border border-purple-300'
                            }`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span>Source: <strong>{source}</strong></span>
                          <span className="font-mono text-slate-400">Method: {doc.verificationMethod || 'API'}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                          <span className="text-slate-400 font-mono">
                            {doc.verificationTimestamp ? formatDateShort(doc.verificationTimestamp) : 'Live Authenticated'}
                          </span>
                          <button
                            onClick={() => {
                              verifyDocumentAuthority(application.id, doc.id);
                              success('Authority Queried', `${doc.fileName} checked via ${source}.`);
                            }}
                            className="text-brand-blue hover:text-brand-blue-dark font-semibold text-[10px]"
                          >
                            Query Gateway
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Infrastructure & Computer Vision Inspection */}
          {activeRightTab === 'infrastructure' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              {/* Floor Plan & Spatial Calculus */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between font-bold text-navy-deep">
                  <div className="flex items-center gap-1.5">
                    <Building2 size={15} className="text-brand-blue" />
                    <span>Architectural Floor Plans & Built Carpet Area</span>
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                    ✓ AICTE Area Norms Met
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Instructional Carpet Area:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {(application.infrastructureAudit?.totalAreaDeclared || 58500).toLocaleString()} sq.m
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Mandated: {((application.infrastructureAudit?.totalAreaDeclared || 58500) > 20000 ? 18900 : 12500).toLocaleString()} sq.m
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Student-to-Faculty Ratio:</span>
                    <span className="font-mono font-bold text-slate-900">1:14.8 SFR</span>
                    <span className="text-[10px] text-emerald-600 block">Ceiling: 1:20 Compliant</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Instructional Classrooms:</span>
                    <span className="font-bold text-slate-900">{application.infrastructureAudit?.classroomsCount || 64} Smart Classrooms</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Laboratories & Workshops:</span>
                    <span className="font-bold text-slate-900">{application.infrastructureAudit?.labsCount || 48} Laboratories</span>
                  </div>
                </div>
              </div>

              {/* Computing & Bandwidth Resources */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between font-bold text-navy-deep">
                  <div className="flex items-center gap-1.5">
                    <Compass size={15} className="text-brand-blue" />
                    <span>Computing, Software & Connectivity</span>
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                    ✓ Satisfied
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Terminal Computing Units:</span>
                    <span className="font-bold text-slate-900">{application.infrastructureAudit?.computingUnits || 1200} PCs</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Leased Line Bandwidth:</span>
                    <span className="font-bold text-slate-900">{application.infrastructureAudit?.internetBandwidthMbps || 1000} Mbps</span>
                  </div>
                </div>
              </div>

              {/* Computer Vision Evidence */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between font-bold text-navy-deep">
                  <div className="flex items-center gap-1.5">
                    <Camera size={15} className="text-brand-blue" />
                    <span>Computer-Vision Evidence Analysis</span>
                  </div>
                  <span className="text-[10px] text-brand-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    EXIF GPS Verified
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between py-1 border-b border-slate-200">
                    <span>Geo-Tagged Campus & Lab Photos:</span>
                    <span className="text-emerald-700 font-semibold">✓ GPS Matched (0 Anomaly)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-200">
                    <span>Barrier-Free Access (Ramps & Lifts):</span>
                    <span className="text-emerald-700 font-semibold">✓ Verified Active</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Municipal Fire & Life Safety NOC:</span>
                    <span className="text-emerald-700 font-semibold">✓ Validated via Gateway</span>
                  </div>
                </div>
              </div>

              {/* Expert Visit Committee (EVC) Physical Scrutiny Controller (Blue Theme) */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-blue-950 flex items-center gap-1.5">
                    <Compass size={16} className="text-blue-700" />
                    <span>Expert Visit Committee (EVC) Physical Inspection</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      application.physicalInspectionRequired
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {application.physicalInspectionRequired ? 'RECOMMENDED' : 'DESKTOP ADEQUATE'}
                  </span>
                </div>

                {application.physicalInspectionRequired ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-blue-900">
                      <strong>Flagged Grounds:</strong> {application.inspectionRecommendationReason}
                    </p>
                    <button
                      onClick={() => {
                        togglePhysicalInspection(application.id, false);
                        success('EVC Flag Cleared', 'Physical inspection requirement removed.');
                      }}
                      className="w-full py-1.5 bg-white border border-blue-200 hover:bg-blue-50 text-blue-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Clear Physical Inspection Flag
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-600">
                      If spatial, laboratory, or building documentation discrepancies require ground-truth validation, flag this case for an on-site physical visit.
                    </p>
                    <button
                      onClick={() => setIsEvcModalOpen(true)}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
                    >
                      Recommend EVC Physical Inspection
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: History & Activity Log */}
          {activeRightTab === 'activity' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <h4 className="font-bold text-xs text-navy-deep pb-2 border-b border-slate-100">
                Action Log & Audit Trail
              </h4>
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-slate-100">
                {application.activityLog.map((act) => (
                  <div key={act.id} className="relative flex items-start gap-2.5 pl-5 text-xs">
                    <span className="absolute left-1 top-1 w-2 h-2 rounded-full bg-brand-blue ring-4 ring-white" />
                    <div>
                      <span className="font-bold text-slate-800">{act.action}</span>
                      <div className="text-[10px] text-slate-400">
                        {act.actorName} ({act.actorRole}) • {formatDate(act.timestamp)}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 bg-surface-subtle p-2 rounded border border-slate-100">
                        {act.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Panel Notice */}
          <div className="p-3 bg-surface-subtle border-t border-slate-border text-[11px] text-slate-500 flex items-center justify-between">
            <span>Reviewer: <strong>{currentReviewer.name}</strong></span>
            <span className="font-mono text-[10px]">SatyaSetu AI v1.0</span>
          </div>
        </div>
      </div>

      {/* REQUEST CORRECTIONS DIALOG (B5) */}
      {isCorrectionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-border max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-navy-deep flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-600" />
                <span>Request Corrections from Applicant</span>
              </h3>
              <button
                onClick={() => setIsCorrectionsOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  1. Select Discrepancies / Findings to Return:
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-surface-subtle rounded-xl border border-slate-200">
                  {application.findings.map((fnd) => (
                    <label key={fnd.id} className="flex items-start gap-2 p-1.5 hover:bg-white rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFindingIds.includes(fnd.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFindingIds((prev) => [...prev, fnd.id]);
                          } else {
                            setSelectedFindingIds((prev) => prev.filter((i) => i !== fnd.id));
                          }
                        }}
                        className="mt-0.5 rounded text-orange-600"
                      />
                      <div className="text-[11px]">
                        <span className="font-bold text-slate-800">{fnd.title}</span>
                        <span className="text-slate-500 block">{fnd.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  2. Assessor Instructions to Applicant *
                </label>
                <textarea
                  rows={3}
                  value={correctionComment}
                  onChange={(e) => setCorrectionComment(e.target.value)}
                  placeholder="Detail exact statutory revisions required prior to resubmission..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-border focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  3. Resolution Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={correctionDueDate}
                  onChange={(e) => setCorrectionDueDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-border bg-white"
                />
              </div>

              {/* Message Preview */}
              <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 text-orange-900">
                <div className="font-bold text-[11px] mb-1">Applicant Notification Preview:</div>
                <div className="text-[11px] italic">
                  "{correctionComment || 'Action required: Please resolve the following issues before resubmission.'}"
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsCorrectionsOpen(false)}
                className="px-4 py-2 border border-slate-border text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCorrections}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Send size={14} /> Send Correction Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVAL CONFIRMATION MODAL */}
      <ConfirmDialog
        isOpen={isApproveOpen}
        title="Record Simulated Approval"
        variant="success"
        description={
          <div className="space-y-3 text-xs">
            <p>
              Are you sure you want to mark application <strong>{application.id}</strong> as{' '}
              <strong>Verified</strong>?
            </p>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Final Assessment Remarks:
              </label>
              <textarea
                rows={2}
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
                className="w-full p-2 text-xs rounded border border-slate-200"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              * Note: Simulated approval records a favorable evaluation in local storage.
            </p>
          </div>
        }
        confirmText="Confirm & Approve"
        onConfirm={handleConfirmApproval}
        onCancel={() => setIsApproveOpen(false)}
      />

      {/* REJECTION REASON MODAL */}
      <ConfirmDialog
        isOpen={isRejectOpen}
        title="Record Application Rejection"
        variant="danger"
        description={
          <div className="space-y-3 text-xs">
            <p>
              Please enter the mandatory statutory justification for rejecting case{' '}
              <strong>{application.id}</strong>.
            </p>
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Deficit / Rejection Reason *
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="State specific regulatory norms violated or deficiencies observed..."
                className="w-full p-2 text-xs rounded border border-rose-300 focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>
        }
        confirmText="Confirm Rejection"
        onConfirm={handleConfirmRejection}
        onCancel={() => setIsRejectOpen(false)}
      />

      {/* REOPEN MODAL */}
      <ConfirmDialog
        isOpen={isReopenOpen}
        title="Administrative Override / Reopen Case"
        variant="warning"
        description={
          <div className="space-y-3 text-xs">
            <p>
              Reopen <strong>{application.id}</strong> back to{' '}
              <strong>Under Verification</strong> status.
            </p>
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Administrative Justification *
              </label>
              <textarea
                rows={2}
                value={reopenJustification}
                onChange={(e) => setReopenJustification(e.target.value)}
                placeholder="e.g. Case reopened following submission of supplementary appellate evidence..."
                className="w-full p-2 text-xs rounded border border-amber-300"
              />
            </div>
          </div>
        }
        confirmText="Reopen Case"
        onConfirm={handleConfirmReopen}
        onCancel={() => setIsReopenOpen(false)}
      />

      {/* FLAG HIGH-RISK MODAL */}
      <ConfirmDialog
        isOpen={isFlagOpen}
        title="Flag Case for High-Risk Investigation"
        variant="danger"
        description={
          <div className="space-y-3 text-xs">
            <p>
              Elevate <strong>{application.id}</strong> risk level to <strong>High</strong>.
            </p>
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Investigative Note:
              </label>
              <textarea
                rows={2}
                value={flagNote}
                onChange={(e) => setFlagNote(e.target.value)}
                placeholder="Detail reasons for elevation..."
                className="w-full p-2 text-xs rounded border border-slate-300"
              />
            </div>
          </div>
        }
        confirmText="Flag Case"
        onConfirm={handleConfirmFlag}
        onCancel={() => setIsFlagOpen(false)}
      />

      {/* EVC PHYSICAL INSPECTION MODAL */}
      <ConfirmDialog
        isOpen={isEvcModalOpen}
        title="Recommend Expert Visit Committee (EVC) Inspection"
        variant="warning"
        description={
          <div className="space-y-3 text-xs">
            <p>
              Flag <strong>{application.id}</strong> ({application.institutionName}) for on-site physical verification by an authorized AICTE Expert Visit Committee (EVC).
            </p>
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Specific Statutory Deficiency / Grounds for On-Site Inspection *
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) setEvcReason(e.target.value);
                }}
                className="w-full p-2 text-xs rounded border border-slate-300 mb-2 bg-white text-slate-700"
              >
                <option value="Instructional carpet area deficit and unverified laboratory resources requiring Expert Visit Committee (EVC) on-site verification.">
                  Instructional carpet area deficit or spatial non-compliance
                </option>
                <option value="Discrepancy in municipal building approval or fire safety infrastructure requiring physical verification.">
                  Municipal building approval / Fire NOC discrepancy
                </option>
                <option value="Unverified computing facilities, internet bandwidth, or specialized research equipment.">
                  Computing facilities / Laboratory equipment unverified
                </option>
                <option value="Barrier-free access, disabled-friendly ramp or safety compliance unverified in blueprints.">
                  Barrier-free access / ramp / lift compliance unverified
                </option>
                <option value="Suspected alteration in statutory gazette or trust deed requiring ground truth scrutiny.">
                  Suspected alteration in registration charter / trust deed
                </option>
              </select>
              <textarea
                rows={3}
                value={evcReason}
                onChange={(e) => setEvcReason(e.target.value)}
                placeholder="Enter specific grounds and terms of reference for the inspection committee..."
                className="w-full p-2 text-xs rounded border border-amber-300 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              * Note: The AI recommendation remains advisory and will be routed to the Scrutiny Committee & Member Secretary for formal constitution of the EVC team.
            </p>
          </div>
        }
        confirmText="Confirm EVC Recommendation"
        onConfirm={handleConfirmEvc}
        onCancel={() => setIsEvcModalOpen(false)}
      />
    </div>
  );
};

