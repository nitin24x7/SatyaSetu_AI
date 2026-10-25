import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ShieldCheck, Info } from 'lucide-react';

interface AppShellProps {
  role: 'applicant' | 'admin';
}

export const AppShell: React.FC<AppShellProps> = ({ role }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-bg flex">
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

        {/* Global simulated notice banner */}
        <div className="bg-navy-deep text-slate-300 px-4 py-1.5 text-xs flex items-center justify-between border-b border-navy-light/40 no-print">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-semibold text-white">SIMULATED ENVIRONMENT:</span>
            <span className="truncate text-slate-300">
              All OCR extractions, compliance findings, and approval decisions are deterministic mock simulations.
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0 ml-4 font-mono">
            <span>LOCAL STATE PERSISTED</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
