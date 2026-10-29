import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import {
  ListTodo,
  Clock,
  RotateCcw,
  AlertTriangle,
  ChevronRight,
  Filter,
  CheckCircle2,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { RiskBadge } from '../../../components/ui/RiskBadge';
import { formatDateShort } from '../../../lib/formatters';

export const AdminReviewQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const { applications, config } = useApp();

  const [activeQueueTab, setActiveQueueTab] = useState<'all' | 'new' | 'resubmitted' | 'high_risk' | 'evc'>(
    'all'
  );

  const pendingApps = applications.filter((a) => a.status === 'Submitted');
  const resubmittedApps = applications.filter((a) => a.status === 'Resubmitted');
  const highRiskApps = applications.filter(
    (a) => a.riskLevel === 'High' && a.status !== 'Verified' && a.status !== 'Rejected'
  );
  const evcApps = applications.filter((a) => a.physicalInspectionRequired);

  const displayedApps =
    activeQueueTab === 'new'
      ? pendingApps
      : activeQueueTab === 'resubmitted'
      ? resubmittedApps
      : activeQueueTab === 'high_risk'
      ? highRiskApps
      : activeQueueTab === 'evc'
      ? evcApps
      : applications.filter(
          (a) =>
            a.status === 'Submitted' ||
            a.status === 'Resubmitted' ||
            a.status === 'Under Verification' ||
            a.status === 'Action Required'
        );

  return (
    <div className="space-y-6 antialiased">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Assessor Review Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Prioritized operational queue of active dossiers requiring regulatory triage or clearance.
          </p>
        </div>
      </div>

      {/* Queue Tabs - Smooth iOS Squircles */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveQueueTab('all')}
          className={`px-3.5 py-2 text-xs font-bold rounded-2xl transition-all flex items-center gap-1.5 whitespace-nowrap shadow-2xs ${
            activeQueueTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200/80'
          }`}
        >
          <span>All Active Cases</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">
            {applications.filter((a) => a.status !== 'Verified' && a.status !== 'Rejected').length}
          </span>
        </button>

        <button
          onClick={() => setActiveQueueTab('new')}
          className={`px-3.5 py-2 text-xs font-bold rounded-2xl transition-all flex items-center gap-1.5 whitespace-nowrap shadow-2xs ${
            activeQueueTab === 'new'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/25'
              : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200/80'
          }`}
        >
          <Clock size={13} />
          <span>New Submissions</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">{pendingApps.length}</span>
        </button>

        <button
          onClick={() => setActiveQueueTab('resubmitted')}
          className={`px-3.5 py-2 text-xs font-bold rounded-2xl transition-all flex items-center gap-1.5 whitespace-nowrap shadow-2xs ${
            activeQueueTab === 'resubmitted'
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/25'
              : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200/80'
          }`}
        >
          <RotateCcw size={13} />
          <span>Resubmissions</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">{resubmittedApps.length}</span>
        </button>

        <button
          onClick={() => setActiveQueueTab('high_risk')}
          className={`px-3.5 py-2 text-xs font-bold rounded-2xl transition-all flex items-center gap-1.5 whitespace-nowrap shadow-2xs ${
            activeQueueTab === 'high_risk'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/25'
              : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200/80'
          }`}
        >
          <ShieldAlert size={13} />
          <span>High Risk Discrepancies</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">{highRiskApps.length}</span>
        </button>

        <button
          onClick={() => setActiveQueueTab('evc')}
          className={`px-3.5 py-2 text-xs font-bold rounded-2xl transition-all flex items-center gap-1.5 whitespace-nowrap shadow-2xs ${
            activeQueueTab === 'evc'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
              : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200/80'
          }`}
        >
          <Compass size={13} />
          <span>EVC Physical Inspection Flagged</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">{evcApps.length}</span>
        </button>
      </div>

      {/* Queue List Table - iOS Squircle */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-border bg-surface-subtle text-slate-muted font-semibold">
                <th className="py-3 px-4">Priority / Case ID</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Application Category</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Risk Rating</th>
                <th className="py-3 px-4">Assigned Evaluator</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-muted">
                    <CheckCircle2 size={32} className="mx-auto mb-2 opacity-30 text-emerald-500" />
                    <p className="font-semibold text-slate-700">Queue is clear</p>
                    <p className="text-xs text-slate-400 mt-1">No applications pending this filter.</p>
                  </td>
                </tr>
              ) : (
                displayedApps.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/admin/applications/${app.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-blue">
                      {app.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div>{app.institutionName}</div>
                      <div className="text-[10px] text-slate-400">{app.institutionType}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{app.applicationType}</td>
                    <td className="py-3.5 px-4 text-slate-muted">
                      {formatDateShort(app.submittedAt || app.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge risk={app.riskLevel} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {app.assignedReviewerName || (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/admin/applications/${app.id}`}
                        className="px-3 py-1 bg-navy-deep text-white text-xs font-semibold rounded-md hover:bg-slate-800"
                      >
                        Evaluate
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

