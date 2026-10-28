import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Building2,
  FileCheck2,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  History,
  AlertTriangle,
  RotateCcw,
  Sparkles,
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
    <div className="min-h-screen bg-surface-bg flex flex-col justify-between antialiased">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center p-1 shadow-xs">
            <img src="/logo.png" alt="SatyaSetu AI" className="w-full h-full object-contain rounded-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">SatyaSetu AI</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200/60 text-teal-700 uppercase">
                Platform v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500">
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
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs font-medium"
          >
            <RotateCcw size={13} className="text-teal-600" />
            <span>Reset Demo Baseline</span>
          </button>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="max-w-5xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center">
        {/* Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50/80 border border-teal-200/70 text-teal-800 text-xs font-semibold mb-4 shadow-2xs">
            <Sparkles size={13} className="text-teal-600" />
            <span>Interactive Governance & Document Authentication Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Institutional Regulatory Compliance & Document Verification
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-500 leading-relaxed">
            Experience the bidirectional compliance verification workflow connecting colleges and institutional applicants with statutory regulatory evaluators.
          </p>
        </div>

        {/* Dual Portal Selection Cards - Smooth iOS Squircles */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          {/* Card 1: Institutional Applicant Portal */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-teal-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-5 group-hover:scale-105 transition-transform shadow-xs">
                <Building2 size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Applicant Role
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1 mb-2">
                Institutional Applicant Portal
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Designed for universities, colleges, and polytechnics to draft new recognition applications, upload required statutory certificates, track verification status, and respond to reviewer correction notices.
              </p>

              <div className="space-y-2.5 mb-8 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>4-Step Application Creation Wizard with Pre-upload File Checks</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>One-Click AICTE Central Master Data & TER Fee Reconciliation</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>Interactive Correction & Document Resubmission Loop</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 mb-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60">
                <span className="font-semibold text-slate-700">Active Institution: </span>
                {currentInstitution.name}
              </div>
              <button
                onClick={handleEnterApplicant}
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-2xl transition-all shadow-sm shadow-teal-600/25 flex items-center justify-center gap-2 group-hover:gap-2.5"
              >
                <span>Enter Institutional Portal</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Card 2: Administrative Verification Console */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-amber-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-5 group-hover:scale-105 transition-transform shadow-xs">
                <FileCheck2 size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Regulatory Authority Role
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1 mb-2">
                Admin Verification Console
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Designed for authorized statutory reviewers and regulatory administrators to inspect applicant dossiers in a 3-panel review workspace, evaluate simulated OCR findings, issue correction requests, and record decisions.
              </p>

              <div className="space-y-2.5 mb-8 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>3-Panel Verification Workspace with Deep-Zoom Document Viewer</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>6-State Issuing Authority Gateway & EVC Physical Inspection Triage</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>Audit Trail, Printable Reports & Exportable Datasets</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 mb-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60">
                <span className="font-semibold text-slate-700">Simulated Reviewer: </span>
                {currentReviewer.name} ({currentReviewer.role})
              </div>
              <button
                onClick={handleEnterAdmin}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 group-hover:gap-2.5"
              >
                <span>Enter Admin Console</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Live Seed Data Metrics Bar */}
        <div className="mt-10 bg-white rounded-3xl border border-slate-200/80 p-5 max-w-4xl mx-auto w-full grid grid-cols-2 sm:grid-cols-4 gap-4 text-center shadow-xs">
          <div>
            <div className="text-xs text-slate-500 font-medium">Preloaded Applications</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">{totalApplications} Cases</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">In Verification Pipeline</div>
            <div className="text-lg font-extrabold text-amber-700 mt-0.5">{underVerificationCount} Active</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Completed & Verified</div>
            <div className="text-lg font-extrabold text-emerald-600 mt-0.5">{verifiedCount} Closed</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">State Persistence</div>
            <div className="text-lg font-extrabold text-teal-700 mt-0.5">Active (Local)</div>
          </div>
        </div>

        {/* Disclaimers & Technical Notice */}
        <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-500 text-xs text-center max-w-3xl mx-auto flex items-center justify-center gap-2 shadow-2xs">
          <AlertTriangle size={15} className="text-amber-600 shrink-0" />
          <span>
            <strong>Simulation Notice:</strong> This software is an architectural frontend demonstration. All optical extractions, verification checks, and institutional ratings are deterministically simulated.
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-400 font-medium">
        SatyaSetu AI — Institutional Application Validation & Regulatory Verification Platform
      </footer>
    </div>
  );
};

interface WelcomePageProps {}
