import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import {
  FileText,
  FileEdit,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { MetricCard } from '../../../components/ui/MetricCard';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { formatDate, formatDateShort } from '../../../lib/formatters';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';

export const ApplicantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { applications, currentInstitution } = useApp();

  // Filter applications for current institution
  const myApplications = applications.filter(
    (a) => a.institutionId === currentInstitution.id
  );

  // Status Filter State
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate metrics for current institution
  const total = myApplications.length;
  const drafts = myApplications.filter((a) => a.status === 'Draft').length;
  const underVerification = myApplications.filter(
    (a) => a.status === 'Under Verification' || a.status === 'Submitted' || a.status === 'Resubmitted'
  ).length;
  const actionRequired = myApplications.filter((a) => a.status === 'Action Required').length;
  const verified = myApplications.filter((a) => a.status === 'Verified').length;

  // Chart Data
  const chartData = [
    { name: 'Drafts', value: drafts, color: '#94A3B8' },
    { name: 'Under Verification', value: underVerification, color: '#315FEA' },
    { name: 'Action Required', value: actionRequired, color: '#F97316' },
    { name: 'Verified', value: verified, color: '#10B981' },
    {
      name: 'Rejected',
      value: myApplications.filter((a) => a.status === 'Rejected').length,
      color: '#EF4444',
    },
  ].filter((d) => d.value > 0);

  // Filtered table list
  const filteredApps = myApplications.filter((app) => {
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesSearch =
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicationType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Action Required Applications
  const actionRequiredApps = myApplications.filter((a) => a.status === 'Action Required');

  // Recent activity aggregated from all my applications
  const recentActivities = myApplications
    .flatMap((a) => a.activityLog.map((act) => ({ ...act, appId: a.id })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
              Institution Portal
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-muted">{currentInstitution.aisheCode}</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-deep mt-1">
            {currentInstitution.name}
          </h1>
          <p className="text-xs text-slate-muted mt-1">
            Manage institutional recognition dossiers, track regulatory validations, and resolve compliance notices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/applicant/applications/new')}
            className="px-4 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            <PlusCircle size={18} />
            <span>Create New Application</span>
          </button>
        </div>
      </div>

      {/* Action Required Alert Banner if any cases need attention */}
      {actionRequiredApps.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-orange-950 animate-in fade-in duration-200">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600 shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="font-semibold text-sm">
                Action Required on {actionRequiredApps.length} Application{actionRequiredApps.length > 1 ? 's' : ''}
              </div>
              <p className="text-xs text-orange-800 mt-0.5">
                The regulatory review panel has requested corrections or replacement documents before verification can proceed.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/applicant/applications/${actionRequiredApps[0].id}`)}
            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors"
          >
            Resolve Case {actionRequiredApps[0].id}
          </button>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard
          title="Total Applications"
          value={total}
          subtitle="All cycle submissions"
          icon={FileText}
          onClick={() => setStatusFilter('ALL')}
          active={statusFilter === 'ALL'}
        />
        <MetricCard
          title="Drafts"
          value={drafts}
          subtitle="Unsubmitted forms"
          icon={FileEdit}
          iconColor="text-slate-600"
          iconBg="bg-slate-100"
          onClick={() => setStatusFilter('Draft')}
          active={statusFilter === 'Draft'}
        />
        <MetricCard
          title="Under Verification"
          value={underVerification}
          subtitle="Under reviewer audit"
          icon={Clock}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          onClick={() => setStatusFilter('Under Verification')}
          active={statusFilter === 'Under Verification'}
        />
        <MetricCard
          title="Action Required"
          value={actionRequired}
          subtitle="Corrections pending"
          icon={AlertTriangle}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
          badge={
            actionRequired > 0
              ? { text: 'Needs Action', variant: 'warning' }
              : undefined
          }
          onClick={() => setStatusFilter('Action Required')}
          active={statusFilter === 'Action Required'}
        />
        <MetricCard
          title="Verified / Approved"
          value={verified}
          subtitle="Approved applications"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          onClick={() => setStatusFilter('Verified')}
          active={statusFilter === 'Verified'}
        />
      </div>

      {/* Split layout: Recent Applications Table & Distribution Chart + Timeline */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Applications Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-border p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-base text-navy-deep">
                  Recent Applications
                </h3>
                <p className="text-xs text-slate-muted">
                  Showing {filteredApps.length} of {total} applications
                </p>
              </div>

              {/* Table search & filter controls */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search my cases..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-border focus:outline-hidden focus:ring-1 focus:ring-brand-blue"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-border bg-white text-slate-text font-medium"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Draft">Drafts</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Verification">Under Verification</option>
                  <option value="Action Required">Action Required</option>
                  <option value="Resubmitted">Resubmitted</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-border text-slate-muted font-medium bg-surface-subtle">
                    <th className="py-2.5 px-3">Application ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Submitted</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Required Action</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-muted">
                        No applications match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.slice(0, 6).map((app) => (
                      <tr
                        key={app.id}
                        onClick={() => navigate(`/applicant/applications/${app.id}`)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-3 font-semibold text-brand-blue">
                          {app.id}
                        </td>
                        <td className="py-3 px-3 text-slate-text font-medium">
                          {app.applicationType}
                        </td>
                        <td className="py-3 px-3 text-slate-muted">
                          {formatDateShort(app.submittedAt || app.createdAt)}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={app.status} size="sm" />
                        </td>
                        <td className="py-3 px-3">
                          {app.status === 'Action Required' ? (
                            <span className="text-orange-700 font-semibold flex items-center gap-1">
                              <AlertTriangle size={12} /> Resolve Findings
                            </span>
                          ) : app.status === 'Draft' ? (
                            <span className="text-slate-500">Continue Draft</span>
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            to={`/applicant/applications/${app.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs text-brand-blue hover:underline font-semibold"
                          >
                            <span>Details</span>
                            <ChevronRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-muted">
            <span>Showing top recent submissions</span>
            <Link
              to="/applicant/applications"
              className="text-brand-blue font-semibold hover:underline flex items-center gap-1"
            >
              <span>View All Applications</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Status Distribution & Recent Activity */}
        <div className="space-y-6">
          {/* Status Distribution Pie */}
          <div className="bg-white rounded-xl border border-slate-border p-5 shadow-xs">
            <h3 className="font-semibold text-sm text-navy-deep mb-3">
              Application Status Distribution
            </h3>
            {chartData.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-xs text-slate-muted">
                No active records
              </div>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E4E9F1',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                      iconSize={8}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-white rounded-xl border border-slate-border p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-navy-deep">
                Recent Case Timeline
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">ACTIVITY</span>
            </div>
            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-muted">No recent events recorded.</p>
            ) : (
              <div className="space-y-3.5 relative before:absolute before:inset-0 before:left-2.5 before:w-0.5 before:bg-slate-100">
                {recentActivities.map((act) => (
                  <div key={act.id} className="relative flex items-start gap-3 pl-6 text-xs">
                    <span className="absolute left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-brand-blue ring-4 ring-white" />
                    <div>
                      <div className="font-semibold text-slate-text flex items-center gap-1.5">
                        <span>{act.action}</span>
                        <span className="text-[10px] text-brand-blue font-mono">[{act.appId}]</span>
                      </div>
                      <p className="text-slate-muted text-[11px] mt-0.5 line-clamp-2">
                        {act.description}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {formatDate(act.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
