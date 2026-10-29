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

        {/* Global simulated notice banner - Theme Royal Blue */}
        <div className="bg-blue-50/70 text-blue-950 px-4 py-2 text-xs flex items-center justify-between border-b border-blue-100/80 no-print transition-all">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
            <span className="font-bold text-blue-950">SIMULATED ENVIRONMENT:</span>
            <span className="truncate text-blue-900 font-medium">
              All OCR extractions, compliance findings, and approval decisions are deterministic simulations.
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-blue-800 shrink-0 ml-4 font-mono font-semibold px-2.5 py-0.5 rounded-full bg-blue-100/80 border border-blue-200/60">
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
