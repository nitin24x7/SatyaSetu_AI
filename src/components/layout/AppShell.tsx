import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ShieldCheck, Info } from 'lucide-react';
import { RegulatoryChatbot } from '../chat/RegulatoryChatbot';

interface AppShellProps {
  role: 'applicant' | 'admin';
}

export const AppShell: React.FC<AppShellProps> = ({ role }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-bg flex antialiased">
      {/* Sidebar navigation */}
      <Sidebar
        role={role}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        {/* Topbar navigation */}
        <Topbar
          role={role}
          onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
        />

        {/* Global simulated notice banner - Soft iOS Teal Style */}
        <div className="bg-teal-50/80 text-teal-900 px-4 py-2 text-xs flex items-center justify-between border-b border-teal-100/70 no-print transition-all">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
            <span className="font-bold text-teal-950">SIMULATED ENVIRONMENT:</span>
            <span className="truncate text-teal-800 font-medium">
              All OCR extractions, compliance findings, and approval decisions are deterministic simulations.
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-teal-700 shrink-0 ml-4 font-mono font-semibold px-2.5 py-0.5 rounded-full bg-teal-100/70 border border-teal-200/60">
            <span>LOCAL STATE PERSISTED</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Interactive AICTE Regulatory Assistant Chatbot (Groq Powered) */}
      <RegulatoryChatbot />
    </div>
  );
};
