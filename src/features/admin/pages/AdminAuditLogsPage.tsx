import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { formatDate } from '../../../lib/formatters';
import { History, Search, Filter, Shield, User, FileText } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useNavigate } from 'react-router-dom';

export const AdminAuditLogsPage: React.FC = () => {
  const { applications } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Aggregate all audit events from all applications
  const allEvents = useMemo(() => {
    return applications
      .flatMap((app) =>
        app.activityLog.map((act) => ({
          ...act,
          appId: app.id,
          instName: app.institutionName,
        }))
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [applications]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      const matchesSearch =
        ev.appId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.instName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.comment && ev.comment.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole = roleFilter === 'ALL' || ev.actorRole === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [allEvents, searchQuery, roleFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-deep">
            Regulatory Audit Trail & Event Logs
          </h1>
          <p className="text-xs text-slate-muted">
            Append-only chronological record of all submission, triage, correction, and adjudication events.
          </p>
        </div>

        <div className="text-[11px] font-mono text-slate-500 bg-white border border-slate-border px-3 py-1.5 rounded-lg">
          APPEND-ONLY • IMMUTABLE RECORD (SIMULATED)
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-xl border border-slate-border p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Case ID, college, actor, or action..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-border focus:ring-1 focus:ring-brand-blue"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs p-2 rounded-lg border border-slate-border bg-white w-full sm:w-auto"
        >
          <option value="ALL">All Roles</option>
          <option value="Administrator">Administrators Only</option>
          <option value="Applicant">Applicants Only</option>
          <option value="System">System Automated</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-border bg-surface-subtle text-slate-muted font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Status Transition</th>
                <th className="py-3 px-4">Remarks / Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-muted">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {formatDate(ev.timestamp)}
                    </td>
                    <td
                      onClick={() => navigate(`/admin/applications/${ev.appId}`)}
                      className="py-3.5 px-4 font-mono font-bold text-brand-blue cursor-pointer hover:underline"
                    >
                      {ev.appId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium max-w-[180px] truncate">
                      {ev.instName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      <div className="font-semibold">{ev.actorName}</div>
                      <div className="text-[10px] text-slate-400">{ev.actorRole}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-navy-deep">
                      {ev.action}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {ev.previousStatus && ev.newStatus ? (
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={ev.previousStatus} size="sm" showIcon={false} />
                          <span className="text-slate-400">→</span>
                          <StatusBadge status={ev.newStatus} size="sm" showIcon={false} />
                        </div>
                      ) : ev.newStatus ? (
                        <StatusBadge status={ev.newStatus} size="sm" showIcon={false} />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[240px] truncate text-[11px]">
                      {ev.comment || ev.description}
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

