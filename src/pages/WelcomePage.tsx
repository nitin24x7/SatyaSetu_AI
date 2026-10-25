import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Building2,
  FileCheck2,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  History,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export const WelcomePage: React.FC<WelcomePageProps> = () => {
  const navigate = useNavigate();
  const { setRole, currentInstitution, currentReviewer, resetDemoData, applications } = useApp();

  const handleEnterApplicant = () => {
    setRole('applicant');
    navigate('/applicant/dashboard');
  };

  const handleEnterAdmin = () => {
    setRole('admin');
    navigate('/admin/dashboard');
  };

  const totalApplications = applications.length;
  const verifiedCount = applications.filter((a) => a.status === 'Verified').length;
  const underVerificationCount = applications.filter(
    (a) => a.status === 'Under Verification' || a.status === 'Action Required'
  ).length;

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-border bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center text-white shadow-sm">
            <Shield size={24} className="text-brand-blue" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-navy-deep tracking-wider">SatyaSetu AI</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-blue-light text-brand-blue uppercase">
                Prototype v1.0
              </span>
            </div>
            <p className="text-xs text-slate-muted">
              Regulatory Application Validation & Institutional Document Verification Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              resetDemoData();
              alert('Demo dataset has been reset to default state.');
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-muted hover:text-slate-text border border-slate-border rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset Demo Baseline</span>
          </button>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="max-w-5xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center">
        {/* Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-brand-blue text-xs font-semibold mb-4">
            <Lock size={12} />
            <span>Interactive Governance & Document Authentication Sandbox</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-deep tracking-tight">
            Institutional Regulatory Compliance & Document Verification
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-muted leading-relaxed">
            Experience the bidirectional compliance verification workflow connecting colleges and institutional applicants with statutory regulatory evaluators.
          </p>
        </div>

        {/* Dual Portal Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          {/* Card 1: Institutional Applicant Portal */}
          <div className="bg-white rounded-2xl border border-slate-border p-8 shadow-xs hover:shadow-md hover:border-brand-blue transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-blue mb-5 group-hover:scale-105 transition-transform">
                <Building2 size={26} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
                Applicant Role
              </span>
              <h2 className="text-xl font-bold text-navy-deep mt-1 mb-2">
                Institutional Applicant Portal
              </h2>
              <p className="text-xs text-slate-muted leading-relaxed mb-6">
                Designed for universities, colleges, and polytechnics to draft new recognition applications, upload required statutory certificates, track verification status, and respond to reviewer correction notices.
              </p>

              <div className="space-y-2.5 mb-8 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 text-xs text-slate-text">
                  <CheckCircle2 size={14} className="text-status-success shrink-0" />
                  <span>4-Step Application Creation Wizard with File Validation</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-text">
                  <CheckCircle2 size={14} className="text-status-success shrink-0" />
                  <span>Interactive Correction & Document Resubmission Loop</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-text">
                  <CheckCircle2 size={14} className="text-status-success shrink-0" />
                  <span>Institution Document Library & Real-time Event Alerts</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-600">Simulated Profile: </span>
                {currentInstitution.name}
              </div>
              <button
                onClick={handleEnterApplicant}
                className="w-full py-3 px-4 bg-navy hover:bg-navy-light text-white font-medium text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 group-hover:bg-brand-blue"
              >
                <span>Enter Institutional Portal</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Card 2: Administrative Verification Console */}
          <div className="bg-white rounded-2xl border border-slate-border p-8 shadow-xs hover:shadow-md hover:border-amber-500 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-5 group-hover:scale-105 transition-transform">
                <FileCheck2 size={26} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Regulatory Authority Role
              </span>
              <h2 className="text-xl font-bold text-navy-deep mt-1 mb-2">
                Admin Verification Console
              </h2>
              <p className="text-xs text-slate-muted leading-relaxed mb-6">
                Designed for authorized statutory reviewers and regulatory administrators to inspect applicant dossiers in a 3-panel review workspace, evaluate simulated OCR findings, issue correction requests, and record decisions.
              </p>

              <div className="space-y-2.5 mb-8 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 text-xs text-slate-text">
                  <CheckCircle2 size={14} className="text-status-success shrink-0" />
                  <span>Professional 3-Panel Verification Workspace with Previews</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-text">
                  <CheckCircle2 size={14} className="text-status-success shrink-0" />
                  <span>Structured Compliance Checklist & Mismatch Concordance</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-text">
                  <CheckCircle2 size={14} className="text-status-success shrink-0" />
                  <span>Audit Trail, Printable Reports & Exportable Datasets</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-600">Simulated Reviewer: </span>
                {currentReviewer.name} ({currentReviewer.role})
              </div>
              <button
                onClick={handleEnterAdmin}
                className="w-full py-3 px-4 bg-navy-deep hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 group-hover:bg-amber-600"
              >
                <span>Enter Admin Console</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Live Seed Data Metrics Bar */}
        <div className="mt-10 bg-white rounded-xl border border-slate-border p-4 max-w-4xl mx-auto w-full grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xs text-slate-muted font-medium">Preloaded Applications</div>
            <div className="text-lg font-bold text-navy-deep mt-0.5">{totalApplications} Cases</div>
          </div>
          <div>
            <div className="text-xs text-slate-muted font-medium">In Verification Pipeline</div>
            <div className="text-lg font-bold text-amber-700 mt-0.5">{underVerificationCount} Active</div>
          </div>
          <div>
            <div className="text-xs text-slate-muted font-medium">Completed & Verified</div>
            <div className="text-lg font-bold text-status-success mt-0.5">{verifiedCount} Closed</div>
          </div>
          <div>
            <div className="text-xs text-slate-muted font-medium">State Persistence</div>
            <div className="text-lg font-bold text-brand-blue mt-0.5">Active (Local)</div>
          </div>
        </div>

        {/* Disclaimers & Technical Notice */}
        <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs text-center max-w-3xl mx-auto flex items-center justify-center gap-2">
          <AlertTriangle size={15} className="text-amber-600 shrink-0" />
          <span>
            <strong>Simulation Notice:</strong> This software is an architectural frontend demonstration. All optical extractions, verification checks, and institutional ratings are deterministically simulated. No official regulatory database or legal approval is involved.
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-border bg-white py-4 px-6 text-center text-xs text-slate-muted">
        SatyaSetu AI — Institutional Application Validation & Regulatory Verification Prototype • Strictly Frontend Development
      </footer>
    </div>
  );
};

interface WelcomePageProps {}

