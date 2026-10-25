import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/ui/Toast';
import {
  ApplicationType,
  DocumentCategory,
  DocumentItem,
  InstitutionType,
} from '../../../types';
import {
  Building2,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Save,
  HelpCircle,
  ShieldAlert,
  Eye,
} from 'lucide-react';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { formatFileSize } from '../../../lib/formatters';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Delhi',
  'Gujarat',
  'Karnataka',
  'Kerala',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export const NewApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentInstitution, config, saveDraftApplication, submitApplication } = useApp();
  const { success, error, warning } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State - Step 1: Institution Info
  const [institutionName, setInstitutionName] = useState(currentInstitution.name);
  const [institutionType, setInstitutionType] = useState<InstitutionType>(currentInstitution.institutionType);
  const [registrationNumber, setRegistrationNumber] = useState(currentInstitution.registrationNumber);
  const [aisheCode, setAisheCode] = useState(currentInstitution.aisheCode);
  const [state, setState] = useState(currentInstitution.state);
  const [district, setDistrict] = useState(currentInstitution.district);
  const [address, setAddress] = useState(currentInstitution.address);
  const [officialEmail, setOfficialEmail] = useState(currentInstitution.officialEmail);
  const [contactNumber, setContactNumber] = useState(currentInstitution.contactNumber);
  const [representativeName, setRepresentativeName] = useState(currentInstitution.representativeName);
  const [representativeDesignation, setRepresentativeDesignation] = useState(currentInstitution.representativeDesignation);

  // Form State - Step 2: Application Details
  const [applicationType, setApplicationType] = useState<ApplicationType>('Institutional Recognition');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [purpose, setPurpose] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [remarks, setRemarks] = useState('');

  // Form State - Step 3: Uploaded Documents
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentItem[]>([]);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);

  // Form State - Step 4: Declaration Checkbox
  const [declarationChecked, setDeclarationChecked] = useState(false);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Categories config
  const documentCategories = config.documentCategories;

  // Handle simulated file upload with FileReader for in-session preview
  const handleFileUpload = (
    category: DocumentCategory,
    file: File,
    required: boolean
  ) => {
    // 1. Validate file size (10 MB)
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      error('File exceeds limit', `Maximum allowed size is 10 MB. Selected file is ${formatFileSize(file.size)}.`);
      return;
    }

    // 2. Validate MIME type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      error('Unsupported format', 'Only PDF, JPEG, and PNG files are supported for statutory submission.');
      return;
    }

    setUploadingCategory(category);

    // Read preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;

      const newDoc: DocumentItem = {
        id: `DOC-NEW-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        applicationId: '',
        category,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        required,
        reviewStatus: 'Pending',
        fileDataUrl: dataUrl,
        previewType: file.type === 'application/pdf' ? 'pdf' : 'image',
        mockPreviewData: {
          title: category,
          issuer: institutionName,
          issueDate: new Date().toISOString().split('T')[0],
          referenceNo: `REF-${Math.floor(10000 + Math.random() * 90000)}`,
          sealPresent: true,
          qrValid: true,
          sampleText: `Uploaded file ${file.name}. Verified valid format.`,
        },
        extractedFields: {
          'Institution Name': institutionName,
          'Document Category': category,
          'File Size': formatFileSize(file.size),
          'Uploaded At': new Date().toLocaleDateString(),
        },
      };

      setTimeout(() => {
        setUploadedDocuments((prev) => {
          // Replace if category already exists, or append
          const filtered = prev.filter((d) => d.category !== category);
          return [...filtered, newDoc];
        });
        setUploadingCategory(null);
        success('Document uploaded', `${file.name} attached successfully.`);
      }, 600);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (category: DocumentCategory) => {
    setUploadedDocuments((prev) => prev.filter((d) => d.category !== category));
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!institutionName.trim()) errs.institutionName = 'Institution name is required.';
    if (!registrationNumber.trim()) errs.registrationNumber = 'Registration number is required.';
    if (!aisheCode.trim()) errs.aisheCode = 'AISHE Code is required.';
    if (!officialEmail.trim() || !officialEmail.includes('@')) errs.officialEmail = 'Valid official email required.';
    if (!contactNumber.trim()) errs.contactNumber = 'Contact phone number required.';
    if (!representativeName.trim()) errs.representativeName = 'Authorized representative required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!purpose.trim()) errs.purpose = 'Please provide the purpose of this application.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 3 Validation (Check mandatory documents)
  const missingMandatoryDocs = documentCategories
    .filter((c) => c.required)
    .filter((c) => !uploadedDocuments.some((d) => d.category === c.category));

  const validateStep3 = () => {
    if (missingMandatoryDocs.length > 0) {
      warning(
        'Missing mandatory documents',
        `Please attach: ${missingMandatoryDocs.map((m) => m.category).join(', ')}`
      );
      return false;
    }
    return true;
  };

  // Save as Draft
  const handleSaveDraft = () => {
    const draftId = saveDraftApplication(
      {
        institutionName,
        institutionType,
        state,
        applicationType,
        academicYear,
        purpose: purpose || 'Draft application in progress',
        referenceNumber,
        remarks,
      },
      uploadedDocuments
    );

    success('Draft Saved', `Application draft saved under ID ${draftId}.`);
    navigate(`/applicant/applications/${draftId}`);
  };

  // Submit Application
  const handleConfirmSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const submittedId = submitApplication(
        {
          institutionName,
          institutionType,
          state,
          applicationType,
          academicYear,
          purpose,
          referenceNumber,
          remarks,
        },
        uploadedDocuments
      );
      setSubmitting(false);
      setShowSubmitModal(false);
      success('Application Submitted', `Application ${submittedId} submitted for regulatory verification.`);
      navigate(`/applicant/applications/${submittedId}`);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/applicant/applications')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-muted hover:text-slate-text font-medium mb-1"
          >
            <ArrowLeft size={14} /> Back to Applications
          </button>
          <h1 className="text-2xl font-bold text-navy-deep">
            Create Institutional Application
          </h1>
          <p className="text-xs text-slate-muted">
            Submit institutional dossier and supporting statutory credentials for AI-assisted regulatory review.
          </p>
        </div>

        <button
          onClick={handleSaveDraft}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-border hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Save size={15} />
          <span>Save as Draft</span>
        </button>
      </div>

      {/* Multi-Step Progress Stepper */}
      <div className="bg-white rounded-xl border border-slate-border p-4 shadow-xs">
        <div className="grid grid-cols-4 gap-2">
          {[
            { step: 1, title: 'Institution Info', icon: Building2 },
            { step: 2, title: 'Application Details', icon: FileText },
            { step: 3, title: 'Document Upload', icon: UploadCloud },
            { step: 4, title: 'Review & Submit', icon: CheckCircle2 },
          ].map(({ step, title, icon: Icon }) => (
            <div
              key={step}
              onClick={() => {
                if (step < currentStep) setCurrentStep(step);
              }}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                currentStep === step
                  ? 'bg-brand-blue-light text-brand-blue font-semibold'
                  : currentStep > step
                  ? 'text-status-success font-medium hover:bg-slate-50'
                  : 'text-slate-400 opacity-60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  currentStep === step
                    ? 'bg-brand-blue text-white'
                    : currentStep > step
                    ? 'bg-status-success-bg text-status-success'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {currentStep > step ? '✓' : step}
              </div>
              <div className="hidden md:block truncate text-xs">
                <div>{title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-slate-border p-6 shadow-xs">
        {/* STEP 1: Institution Information */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-navy-deep">
                Step 1: Institutional Profile & Signatory Verification
              </h2>
              <p className="text-xs text-slate-muted mt-0.5">
                Verify statutory entity details matching AISHE and Department of Higher Education registries.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Institution Name *
                </label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-border focus:ring-1 focus:ring-brand-blue"
                  placeholder="Official name of University / College"
                />
                {errors.institutionName && (
                  <p className="text-[11px] text-status-error mt-1">{errors.institutionName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Institution Classification *
                </label>
                <select
                  value={institutionType}
                  onChange={(e) => setInstitutionType(e.target.value as InstitutionType)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-border bg-white"
                >
                  <option value="Central University">Central University</option>
                  <option value="State University">State University</option>
                  <option value="Deemed University">Deemed University</option>
                  <option value="Autonomous Engineering College">Autonomous Engineering College</option>
                  <option value="Affiliated Technical Institute">Affiliated Technical Institute</option>
                  <option value="Polytechnic Institute">Polytechnic Institute</option>
                  <option value="Management Institute">Management Institute</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Registration / Trust Charter Code *
                </label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-border"
                  placeholder="e.g. NITK-KA-1960-GOI"
                />
                {errors.registrationNumber && (
                  <p className="text-[11px] text-status-error mt-1">{errors.registrationNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  AISHE Code *
                </label>
                <input
                  type="text"
                  value={aisheCode}
                  onChange={(e) => setAisheCode(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-border font-mono"
                  placeholder="e.g. C-26789 or U-04891"
                />
                {errors.aisheCode && (
                  <p className="text-[11px] text-status-error mt-1">{errors.aisheCode}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  State / UT *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-border bg-white"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-border"
                  placeholder="District"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Official Registry Email *
                </label>
                <input
                  type="email"
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-border"
                  placeholder="registrar@institution.edu.in"
                />
                {errors.officialEmail && (
                  <p className="text-[11px] text-status-error mt-1">{errors.officialEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Official Contact Phone *
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-border"
                  placeholder="+91 80 12345678"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Authorized Signatory / Representative *
                </label>
                <input
                  type="text"
                  value={representativeName}
                  onChange={(e) => setRepresentativeName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-border"
                  placeholder="Dr. Full Name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Designation *
                </label>
                <input
                  type="text"
                  value={representativeDesignation}
                  onChange={(e) => setRepresentativeDesignation(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-border"
                  placeholder="Dean / Registrar / Director"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Campus Address
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-border"
                  placeholder="Full physical campus address"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setCurrentStep(2);
                }}
                className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <span>Continue to Application Details</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Application Details */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-navy-deep">
                Step 2: Regulatory Application Specifics
              </h2>
              <p className="text-xs text-slate-muted mt-0.5">
                Specify approval category, target academic cycle, and formal administrative intent.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Application Category *
                </label>
                <select
                  value={applicationType}
                  onChange={(e) => setApplicationType(e.target.value as ApplicationType)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-border bg-white"
                >
                  {config.applicationTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Configurable demo categories for statutory approval.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Academic Year Cycle *
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-border bg-white font-mono"
                >
                  <option value="2026-2027">2026-2027 (Current Cycle)</option>
                  <option value="2027-2028">2027-2028 (Advance Planning)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Internal Institutional Reference No. (Optional)
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-border font-mono"
                  placeholder="e.g. INST/REG/2026/01"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Purpose of Application *
                </label>
                <textarea
                  rows={3}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-border"
                  placeholder="Detailed justification and scope of the recognition / extension / review request..."
                />
                {errors.purpose && (
                  <p className="text-[11px] text-status-error mt-1">{errors.purpose}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-text mb-1">
                  Additional Notes or Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-border"
                  placeholder="Any supplementary regulatory history or context for the assessor..."
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 border border-slate-border text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setCurrentStep(3);
                }}
                className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <span>Continue to Document Upload</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Document Upload */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-navy-deep">
                Step 3: Statutory Document Dossier Upload
              </h2>
              <p className="text-xs text-slate-muted mt-0.5">
                Attach mandatory and optional certifications. Files are processed locally with simulated OCR verification. Max 10 MB per file. PDF, JPG, PNG accepted.
              </p>
            </div>

            {/* Checklist items */}
            <div className="space-y-3">
              {documentCategories.map((catConfig) => {
                const attached = uploadedDocuments.find((d) => d.category === catConfig.category);
                const isUploading = uploadingCategory === catConfig.category;

                return (
                  <div
                    key={catConfig.category}
                    className={`p-4 rounded-xl border transition-all ${
                      attached
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : catConfig.required
                        ? 'border-slate-border bg-white'
                        : 'border-dashed border-slate-border bg-surface-subtle/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-text">
                            {catConfig.category}
                          </span>
                          {catConfig.required ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                              Required
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                              Optional
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-muted mt-0.5">
                          {catConfig.description}
                        </p>
                      </div>

                      {/* Upload status / controls */}
                      <div className="flex items-center gap-2">
                        {attached ? (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                              <FileCheck size={16} className="text-status-success" />
                              <div className="max-w-[140px] truncate">
                                <div className="font-semibold truncate">{attached.fileName}</div>
                                <div className="text-[10px] text-slate-500">{formatFileSize(attached.fileSize)}</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc(catConfig.category)}
                              className="p-1.5 text-slate-400 hover:text-status-error hover:bg-rose-50 rounded-lg transition-colors"
                              title="Remove document"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              className="hidden"
                              disabled={isUploading}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(catConfig.category, file, catConfig.required);
                                }
                              }}
                            />
                            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-brand-blue bg-brand-blue-light hover:bg-blue-100 rounded-lg transition-colors">
                              {isUploading ? (
                                <>
                                  <span className="w-3.5 h-3.5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                                  <span>Simulating OCR...</span>
                                </>
                              ) : (
                                <>
                                  <UploadCloud size={14} />
                                  <span>Select File</span>
                                </>
                              )}
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 border border-slate-border text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep3()) setCurrentStep(4);
                }}
                className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <span>Review & Finalize</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Review and Submit */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-navy-deep">
                Step 4: Final Verification & Formal Submission
              </h2>
              <p className="text-xs text-slate-muted mt-0.5">
                Review all declared information before triggering automated deterministic compliance validation.
              </p>
            </div>

            {/* Missing docs alert if any */}
            {missingMandatoryDocs.length > 0 && (
              <div className="p-4 rounded-xl bg-status-error-bg border border-rose-200 text-status-error text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Missing Mandatory Documents: </span>
                  You must attach all required documents before final submission: {missingMandatoryDocs.map((m) => m.category).join(', ')}.
                </div>
              </div>
            )}

            {/* Summary cards */}
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-border bg-surface-subtle">
                <div className="flex items-center justify-between font-bold text-navy-deep mb-2">
                  <span>Institution Summary</span>
                  <button onClick={() => setCurrentStep(1)} className="text-brand-blue hover:underline text-[11px]">Edit</button>
                </div>
                <div className="space-y-1 text-slate-600">
                  <div><strong>Name:</strong> {institutionName}</div>
                  <div><strong>Type:</strong> {institutionType}</div>
                  <div><strong>AISHE:</strong> {aisheCode}</div>
                  <div><strong>Registration:</strong> {registrationNumber}</div>
                  <div><strong>State:</strong> {state}</div>
                  <div><strong>Signatory:</strong> {representativeName} ({representativeDesignation})</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-border bg-surface-subtle">
                <div className="flex items-center justify-between font-bold text-navy-deep mb-2">
                  <span>Application Scope</span>
                  <button onClick={() => setCurrentStep(2)} className="text-brand-blue hover:underline text-[11px]">Edit</button>
                </div>
                <div className="space-y-1 text-slate-600">
                  <div><strong>Category:</strong> {applicationType}</div>
                  <div><strong>Cycle:</strong> {academicYear}</div>
                  <div><strong>Reference:</strong> {referenceNumber || 'N/A'}</div>
                  <div className="line-clamp-2"><strong>Purpose:</strong> {purpose}</div>
                </div>
              </div>
            </div>

            {/* Attached documents list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-navy-deep">
                  Attached Dossier Documents ({uploadedDocuments.length})
                </span>
                <button onClick={() => setCurrentStep(3)} className="text-brand-blue hover:underline text-[11px]">
                  Manage Documents
                </button>
              </div>
              <div className="border border-slate-border rounded-xl divide-y divide-slate-100 overflow-hidden">
                {uploadedDocuments.map((doc) => (
                  <div key={doc.id} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div className="flex items-center gap-2.5">
                      <FileCheck size={16} className="text-status-success" />
                      <div>
                        <span className="font-semibold text-slate-text">{doc.category}</span>
                        <div className="text-[11px] text-slate-muted">{doc.fileName} • {formatFileSize(doc.fileSize)}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium">
                      Ready for OCR
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Statutory Declaration Checkbox */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={declarationChecked}
                  onChange={(e) => setDeclarationChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-border text-brand-blue focus:ring-brand-blue"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I solemnly declare that the information stated above and all uploaded documents are true, authentic, and authorized by the Governing Council. I understand that simulated checks and forensic validations will be executed upon this submission.
                </span>
              </label>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 border border-slate-border text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2.5 border border-slate-border text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Save size={14} /> Save Draft
                </button>
                <button
                  type="button"
                  disabled={!declarationChecked || missingMandatoryDocs.length > 0}
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-dark disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <CheckCircle2 size={15} />
                  <span>Submit Application</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={showSubmitModal}
        title="Confirm Application Submission"
        description={
          <div>
            <p>
              Are you sure you want to formally submit application for <strong>{institutionName}</strong>?
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Upon submission, status will change to <strong>Submitted</strong> and deterministic verification rules will inspect extracted fields.
            </p>
          </div>
        }
        confirmText="Confirm & Submit"
        loading={submitting}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowSubmitModal(false)}
      />
    </div>
  );
};

