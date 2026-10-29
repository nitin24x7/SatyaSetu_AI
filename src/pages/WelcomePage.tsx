import React, { useState } from 'react';
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
  Zap,
  Scale,
  ShieldCheck,
  Search,
  Eye,
  FileText,
  LandPlot,
  Flame,
  GraduationCap,
  Users,
  Fingerprint,
  Coins,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { RegulatoryChatbot } from '../components/chat/RegulatoryChatbot';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setRole, currentInstitution, currentReviewer, resetDemoData, applications } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'aph' | 'gateways' | 'forensics'>('overview');

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

  // Reviewer portraits for social proof row
  const reviewerAvatars = [
    { name: 'Dr. Priyadarshini Rao', role: 'Compliance Director', bg: 'bg-teal-500' },
    { name: 'Prof. S. Narayanan', role: 'EVC Committee Chair', bg: 'bg-indigo-500' },
    { name: 'Dr. Anita Sharma', role: 'Senior Scrutiny Officer', bg: 'bg-rose-500' },
    { name: 'Dr. Rajesh Gupta', role: 'Forensic Document Lead', bg: 'bg-amber-500' },
    { name: 'Col. V. Raman', role: 'Regulatory Evaluator', bg: 'bg-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFCFF] flex flex-col justify-between antialiased overflow-x-hidden selection:bg-teal-100 selection:text-teal-900">
      {/* Top Header with Floating Pill Navigation (matching reference screenshot) */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-slate-200/60 px-4 lg:px-10 py-3.5 flex items-center justify-between transition-all">
        {/* Left: Brand Logo */}
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <img
            src="/logo.png"
            alt="SatyaSetu AI"
            className="h-10 sm:h-11 w-auto max-w-[210px] object-contain transition-transform hover:scale-102"
          />
        </div>

        {/* Center: Floating Pill Navigation Bar */}
        <nav className="hidden md:flex items-center gap-7 px-7 py-2 rounded-full border border-slate-200/80 bg-white/80 backdrop-blur-md shadow-xs text-xs font-semibold text-slate-700">
          <button
            onClick={() => {
              setActiveTab('overview');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`transition-colors hover:text-slate-950 ${activeTab === 'overview' ? 'text-blue-600 font-bold' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => {
              setActiveTab('aph');
              document.getElementById('portals-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`transition-colors hover:text-slate-950 ${activeTab === 'aph' ? 'text-blue-600 font-bold' : ''}`}
          >
            APH 2026-27 Norms
          </button>
          <button
            onClick={() => {
              setActiveTab('gateways');
              document.getElementById('gateways-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`transition-colors hover:text-slate-950 ${activeTab === 'gateways' ? 'text-blue-600 font-bold' : ''}`}
          >
            Gateways
          </button>
          <button
            onClick={() => {
              setActiveTab('forensics');
              document.getElementById('forensics-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`transition-colors hover:text-slate-950 ${activeTab === 'forensics' ? 'text-blue-600 font-bold' : ''}`}
          >
            Forensics
          </button>
        </nav>

        {/* Right: Quick Action Pills & Circular Accent Dots (matching reference screenshot) */}
        <div className="flex items-center gap-3">
          {/* Circular Accent Dots matching screenshot top-right */}
          <div className="hidden sm:flex items-center gap-1.5 mr-1">
            <span className="w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs" title="Institutional Gateway" />
            <span className="w-6 h-6 rounded-full bg-sky-500 hover:bg-sky-600 transition-colors shadow-xs" title="Digital Verification API" />
            <span className="w-6 h-6 rounded-full bg-cyan-500 hover:bg-cyan-600 transition-colors shadow-xs" title="Merkle Audit Ledger" />
          </div>

          <button
            onClick={() => {
              resetDemoData();
              alert('Demo dataset has been reset to default baseline.');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs font-medium cursor-pointer"
            title="Reset Demo Dataset"
          >
            <RotateCcw size={12} className="text-blue-600" />
            <span className="hidden sm:inline">Reset Baseline</span>
          </button>
        </div>
      </header>

      {/* Main Hero Container with Floating Orbs & Iridescent Aurora */}
      <main className="relative flex-1 flex flex-col items-center justify-center pt-8 pb-16 px-4 sm:px-6 overflow-hidden">
        {/* Iridescent Aurora Gradient Blurs in Background */}
        <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center overflow-hidden">
          {/* Soft magenta/pink glow */}
          <div className="w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-pink-300/35 via-rose-200/30 to-purple-300/25 blur-[120px] absolute -top-12 -left-20 transform -rotate-12 pointer-events-none" />
          {/* Soft cyan/teal glow */}
          <div className="w-[560px] h-[560px] rounded-full bg-gradient-to-bl from-teal-200/40 via-cyan-200/30 to-sky-200/25 blur-[130px] absolute -top-16 -right-24 pointer-events-none" />
          {/* Soft violet center glow */}
          <div className="w-[480px] h-[360px] rounded-full bg-gradient-to-r from-indigo-100/40 via-purple-100/30 to-pink-100/30 blur-[110px] absolute top-36 pointer-events-none" />
        </div>

        {/* ============================================================== */}
        {/* Floating Ecosystem Orbs (Left & Right) matching reference       */}
        {/* ============================================================== */}

        {/* LEFT FLOATING ORBS (Issuing Authorities & Statutory Registries) */}
        <div className="hidden xl:block absolute left-4 lg:left-12 2xl:left-24 top-24 bottom-24 w-52 pointer-events-none select-none z-10">
          {/* Orb 1: AICTE Statutory Council (Royal Blue Halo) */}
          <div className="absolute top-4 left-6 animate-float-slow pointer-events-auto group cursor-pointer" title="AICTE Regulatory Council">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-blue-400/60 shadow-[0_10px_25px_rgba(37,99,235,0.2)] flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
              <Building2 size={24} />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-slate-700 bg-white/95 px-2 py-0.5 rounded-full border border-slate-200/70 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity">
              AICTE Council
            </span>
          </div>

          {/* Orb 2: DigiLocker National Gateway (Cyan/Sky Blue Halo) */}
          <div className="absolute top-36 -left-3 animate-float-reverse pointer-events-auto group cursor-pointer" title="DigiLocker National API">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-cyan-400/60 shadow-[0_10px_25px_rgba(6,182,212,0.22)] flex items-center justify-center text-cyan-600 transition-transform group-hover:scale-110">
              <Lock size={22} />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-slate-700 bg-white/95 px-2 py-0.5 rounded-full border border-slate-200/70 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity">
              DigiLocker API
            </span>
          </div>

          {/* Orb 3: State Land Records / Bhoomi (Rose/Pink Halo) */}
          <div className="absolute top-72 -left-4 animate-float-slow pointer-events-auto group cursor-pointer" title="Bhoomi / Revenue Land Deeds">
            <div className="w-15 h-15 rounded-full bg-white border-2 border-rose-400/60 shadow-[0_10px_25px_rgba(244,63,94,0.2)] flex items-center justify-center text-rose-600 transition-transform group-hover:scale-110">
              <LandPlot size={22} />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-slate-700 bg-white/95 px-2 py-0.5 rounded-full border border-slate-200/70 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity">
              State Land Records
            </span>
          </div>

          {/* Orb 4: State Fire Services NOC (Teal/Mint Halo) */}
          <div className="absolute top-[27rem] left-8 animate-float-reverse pointer-events-auto group cursor-pointer" title="Fire Services Directorate">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-teal-400/60 shadow-[0_10px_25px_rgba(20,184,166,0.22)] flex items-center justify-center text-teal-600 transition-transform group-hover:scale-110">
              <Flame size={22} />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-slate-700 bg-white/95 px-2 py-0.5 rounded-full border border-slate-200/70 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity">
              Fire Safety Directorate
            </span>
          </div>

          {/* Orb 5: Affiliating University / UGC (Purple Halo) */}
          <div className="absolute top-[35rem] left-1 animate-float-slow pointer-events-auto group cursor-pointer" title="Affiliating University Repository">
            <div className="w-14 h-14 rounded-full bg-white border-2 border-purple-400/60 shadow-[0_10px_25px_rgba(168,85,247,0.2)] flex items-center justify-center text-purple-600 transition-transform group-hover:scale-110">
              <GraduationCap size={20} />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-slate-700 bg-white/95 px-2 py-0.5 rounded-full border border-slate-200/70 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity">
              University Affiliation
            </span>
          </div>

          {/* Orb 6: EPFO Unified Roster (Lime/Green Halo) */}
          <div className="absolute top-[20rem] left-24 animate-float-slow pointer-events-auto group cursor-pointer" title="EPFO Faculty Roster Verification">
            <div className="w-14 h-14 rounded-full bg-white border-2 border-lime-400/60 shadow-[0_10px_25px_rgba(132,204,22,0.2)] flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110">
              <Users size={20} />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-slate-700 bg-white/95 px-2 py-0.5 rounded-full border border-slate-200/70 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity">
              EPFO Roster Portal
            </span>
          </div>
        </div>

        {/* RIGHT FLOATING ORBS (AI Scrutiny & Forensics Engines) */}
        <div className="hidden xl:block absolute right-4 lg:right-12 2xl:right-24 top-24 bottom-24 w-52 pointer-events-none select-none z-10">
          {/* Orb 7: Cadre SFR Calculus (Sky Blue Halo) */}
          <div className="absolute top-8 right-6 animate-float-reverse pointer-events-auto group cursor-pointer" title="Cadre SFR Engine (1:15 & 1:20)">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-blue-400/60 shadow-[0_10px_25px_rgba(59,130,246,0.2)] flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
              <Scale size={24} />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-slate-700 bg-white/95 px-2 py-0.5 rounded-full border border-slate-200/70 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity">
              Cadre SFR Calculus
            </span>
          </div>

          {/* Orb 8: ELA Forensic Vision (Dark Slate Halo) */}
          <div className="absolute top-40 -right-2 animate-float-slow pointer-events-auto group cursor-pointer" title="Error Level Analysis Forensics">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-400/60 shadow-[0_10px_25px_rgba(30,41,59,0.2)] flex items-center justify-center text-slate-900 transition-transform group-hover:scale-110">
              <Eye size={22} />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-slate-700 bg-white/95 px-2 py-0.5 rounded-full border border-slate-200/70 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity">
              ELA Forensic Vision
            </span>
          </div>

          {/* Orb 9: Document Tampering Scanner (Indigo Halo) */}
          <div className="absolute top-72 -right-3 animate-float-reverse pointer-events-auto group cursor-pointer" title="Optical Character Recognition">
            <div className="w-15 h-15 rounded-full bg-white border-2 border-indigo-400/60 shadow-[0_10px_25px_rgba(99,102,241,0.2)] flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110">
              <FileCheck2 size={22} />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-slate-700 bg-white/95 px-2 py-0.5 rounded-full border border-slate-200/70 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity">
              OCR Field Matcher
            </span>
          </div>

          {/* Orb 10: Merkle Chain Ledger (Violet/Purple Halo) */}
          <div className="absolute top-[27rem] right-10 animate-float-slow pointer-events-auto group cursor-pointer" title="Immutable Merkle Chain Audit">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-violet-400/60 shadow-[0_10px_25px_rgba(139,92,246,0.22)] flex items-center justify-center text-violet-600 transition-transform group-hover:scale-110">
              <History size={22} />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-slate-700 bg-white/95 px-2 py-0.5 rounded-full border border-slate-200/70 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity">
              Merkle Audit Ledger
            </span>
          </div>

          {/* Orb 11: Biometric Ghost Faculty Scrutiny (Teal Halo) */}
          <div className="absolute top-[35rem] right-2 animate-float-reverse pointer-events-auto group cursor-pointer" title="Biometric Aadhaar Scrutiny">
            <div className="w-14 h-14 rounded-full bg-white border-2 border-emerald-400/60 shadow-[0_10px_25px_rgba(16,185,129,0.2)] flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110">
              <Fingerprint size={20} />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-slate-700 bg-white/95 px-2 py-0.5 rounded-full border border-slate-200/70 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity">
              Biometric Scrutiny
            </span>
          </div>

          {/* Orb 12: TER Fee Payment Reconciliation (Blue/Indigo Halo) */}
          <div className="absolute top-[20rem] right-24 animate-float-slow pointer-events-auto group cursor-pointer" title="Bharatkosh / TER Gateway">
            <div className="w-14 h-14 rounded-full bg-white border-2 border-blue-400/60 shadow-[0_10px_25px_rgba(37,99,235,0.2)] flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
              <Coins size={20} />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-slate-700 bg-white/95 px-2 py-0.5 rounded-full border border-slate-200/70 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity">
              TER Fee Reconciliation
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Main Central Hero Block (matching reference typography)        */}
        {/* ============================================================== */}
        <div className="text-center max-w-3xl mx-auto z-20 flex flex-col items-center">
          {/* Top Pill Announcement */}
          <div
            onClick={() => document.getElementById('portals-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-800 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer mb-7 group"
          >
            <span className="text-blue-600">✨</span>
            <span className="text-slate-300 font-light">|</span>
            <span className="text-slate-800">Introducing APH 2026-27 Scrutiny Engine</span>
            <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Massive Uppercase Headline - Exact Match to Reference Screenshot */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-[1.05] uppercase">
            All Your Institutional<br />
            Compliance <span className="text-blue-600">IN ONE</span>{' '}
            <span className="text-cyan-500">PLACE!</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed font-normal">
            AI-powered statutory scrutiny, issuing authority API verification, and forensic anomaly detection for technical institutions and regulatory evaluators.
          </p>

          {/* Feature Capsule / Pill Bar (matching reference screenshot) */}
          <div className="mt-7 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-5 sm:px-7 py-2.5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Zap size={14} className="text-blue-600" />
              <span>Automated Scrutiny</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <Lock size={14} className="text-blue-600" />
              <span>6-State Gateways</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <Scale size={14} className="text-indigo-600" />
              <span>Cadre SFR Calculus</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Merkle Audit Trail</span>
            </span>
          </div>

          {/* Primary CTA Buttons (matching reference screenshot) */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={handleEnterApplicant}
              className="px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Get Started
            </button>
            <button
              onClick={handleEnterAdmin}
              className="text-xs font-semibold text-slate-600 hover:text-slate-950 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Get Direct Access to <strong>Admin Scrutiny Console</strong></span>
              <ArrowRight size={13} className="text-slate-400" />
            </button>
          </div>

          {/* Social Proof & Trust Bar (matching reference screenshot) */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            {/* Overlapping Reviewer Avatars */}
            <div className="flex -space-x-2.5">
              {reviewerAvatars.map((r, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full ${r.bg} text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-xs`}
                  title={`${r.name} (${r.role})`}
                >
                  {r.name.split(' ')[1]?.[0] || r.name[0]}
                </div>
              ))}
            </div>

            {/* 5 Yellow Stars & Text */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex text-amber-400 text-sm tracking-tighter">
                ★★★★★
              </div>
              <span className="text-slate-600 font-medium">
                Trusted by <strong className="text-slate-900 font-bold">10,000+</strong> Technical Institutions & Evaluators
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Dual Portal Selection Decks (Below the Hero fold)              */}
        {/* ============================================================== */}
        <section id="portals-section" className="w-full max-w-5xl mx-auto mt-20 z-20 pt-8 border-t border-slate-200/60">
          <div className="text-center mb-8">
            <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider font-mono">
              DIRECT PORTAL ACCESS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Select Your Operational Role
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
              Test end-to-end workflows from the perspective of either an educational applicant or an authorized AICTE evaluator.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1: Institutional Applicant Portal */}
            <div className="bg-gradient-to-br from-[#EEF4FF]/90 via-[#F5F8FF]/70 to-white/80 rounded-3xl border border-blue-200/80 p-8 backdrop-blur-md shadow-[0_4px_24px_rgba(37,99,235,0.04)] hover:shadow-xl hover:border-blue-400 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-blue-200 flex items-center justify-center text-blue-600 mb-5 group-hover:scale-105 transition-transform shadow-xs">
                  <Building2 size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  Institutional Role
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">
                  Institutional Applicant Portal
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  For colleges, universities, and polytechnics to file Extension of Approval (EoA), upload statutory certificates, track live verification statuses, and rectify flagged deficiencies.
                </p>

                <div className="space-y-2 mb-6 border-t border-blue-100/80 pt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                    <span>4-Step Application Wizard with Pre-upload File Checks</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                    <span>Document Library with Real-time Expiry & Forensic Badges</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                    <span>Active Session: <strong>{currentInstitution.name}</strong></span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleEnterApplicant}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 group-hover:shadow-md cursor-pointer"
              >
                <span>Launch Applicant Portal</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Card 2: AICTE Admin Verification Console */}
            <div className="bg-gradient-to-br from-[#F5F3FF]/90 via-[#FAF9FF]/70 to-white/80 rounded-3xl border border-indigo-200/80 p-8 backdrop-blur-md shadow-[0_4px_24px_rgba(99,102,241,0.04)] hover:shadow-xl hover:border-indigo-400 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-200 flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-105 transition-transform shadow-xs">
                  <FileCheck2 size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">
                  Regulatory Evaluator Role
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">
                  Admin Verification Console
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  For AICTE Regional Officers and Scrutiny Committees to triage applications, review evidence-linked anomaly findings, trigger issuing authority re-queries, and record official regulatory decisions.
                </p>

                <div className="space-y-2 mb-6 border-t border-indigo-100/80 pt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 size={14} className="text-indigo-600 shrink-0" />
                    <span>Prioritized Scrutiny Queue with Risk Tier Badges</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 size={14} className="text-indigo-600 shrink-0" />
                    <span>Side-by-side Document Forensics & Cadre SFR Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 size={14} className="text-indigo-600 shrink-0" />
                    <span>Active Session: <strong>{currentReviewer.name}</strong></span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleEnterAdmin}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 group-hover:shadow-md cursor-pointer"
              >
                <span>Launch Admin Console</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Live Seed Applications Metrics Bar (No Orange Sections) */}
          <div className="mt-8 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center shadow-xs">
            <div>
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Preloaded Cases</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">{totalApplications} Applications</div>
            </div>
            <div>
              <div className="text-[11px] text-blue-700 font-medium uppercase tracking-wider">In Verification</div>
              <div className="text-lg font-black text-blue-700 mt-0.5">{underVerificationCount} Cases</div>
            </div>
            <div>
              <div className="text-[11px] text-emerald-700 font-medium uppercase tracking-wider">Verified & Closed</div>
              <div className="text-lg font-black text-emerald-700 mt-0.5">{verifiedCount} Cases</div>
            </div>
            <div>
              <div className="text-[11px] text-blue-700 font-medium uppercase tracking-wider">Auditing Engine</div>
              <div className="text-lg font-black text-blue-700 mt-0.5">100% Deterministic</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/90 backdrop-blur-md py-4 px-6 text-center text-xs text-slate-500 font-medium flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <span>SatyaSetu AI — Institutional Application Validation & Regulatory Verification Platform</span>
        <span className="text-[11px] text-slate-400">Compliant with AICTE Approval Process Handbook (APH 2026-27)</span>
      </footer>

      {/* Floating Groq-Powered AICTE Regulatory Chatbot */}
      <RegulatoryChatbot />
    </div>
  );
};
