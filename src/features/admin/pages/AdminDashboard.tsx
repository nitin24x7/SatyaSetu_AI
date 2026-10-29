import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
  ListTodo,
  TrendingUp,
  UserCheck,
  Building2,
  Calendar,
  Sparkles,
  Compass,
} from 'lucide-react';
import { MetricCard } from '../../../components/ui/MetricCard';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { RiskBadge } from '../../../components/ui/RiskBadge';
import { formatDateShort, formatDate } from '../../../lib/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { applications, institutions, config, currentReviewer } = useApp();

  // Dynamic Metrics calculated from applications state
  const total = applications.length;
  const pending = applications.filter((a) => a.status === 'Submitted').length;
  const underVerification = applications.filter((a) => a.status === 'Under Verification').length;
  const resubmitted = applications.filter((a) => a.status === 'Resubmitted').length;
  const actionRequired = applications.filter((a) => a.status === 'Action Required').length;
  const verified = applications.filter((a) => a.status === 'Verified').length;
  const rejected = applications.filter((a) => a.status === 'Rejected').length;

  // Priority queue: High risk or Action Required or Resubmitted awaiting review
  const priorityQueue = useMemo(() => {
    return applications
      .filter(
        (a) =>
          a.status === 'Submitted' ||
          a.status === 'Resubmitted' ||
          a.riskLevel === 'High' ||
          a.status === 'Under Verification'
      )
      .slice(0, 5);
  }, [applications]);

  // Aggregate recent administrative activities
  const recentActivities = useMemo(() => {
    return applications
      .flatMap((a) =>
        a.activityLog.map((act) => ({
          ...act,
          appId: a.id,
          instName: a.institutionName,
        }))
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);
  }, [applications]);

  // Status Distribution Chart Data
  const statusChartData = [
    { name: 'Submitted (New)', count: pending, color: '#0D9488' },
    { name: 'Under Verification', count: underVerification, color: '#F59E0B' },
    { name: 'Resubmitted', count: resubmitted, color: '#8B5CF6' },
    { name: 'Action Required', count: actionRequired, color: '#F97316' },
    { name: 'Verified', count: verified, color: '#10B981' },
    { name: 'Rejected', count: rejected, color: '#EF4444' },
  ].filter((d) => d.count > 0);

  // Institution Type Breakdown Data
  const institutionTypeData = useMemo(() => {
    const map: Record<string, number> = {};
    applications.forEach((a) => {
      const shortType = a.institutionType.split(' ')[0];
      map[shortType] = (map[shortType] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [applications]);

  return (
    <div className="space-y-6 antialiased">
      {/* Top Greeting & Date */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Welcome back, {currentReviewer.name.split(' ')[0]}
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })} • {currentReviewer.role} ({currentReviewer.department})
        </p>
      </div>

      {/* Hero Decks - Pastel Gradient & Glassmorphism */}
      <div className="grid md:grid-cols-3 gap-5">
        {/* Main Deck (2 cols): Soft Pink/Rose Gradient Deck */}
        <div className="md:col-span-2 rounded-3xl p-7 bg-gradient-to-br from-[#FFE5EC]/90 via-[#FFF0F4]/75 to-white/80 border border-rose-200/70 backdrop-blur-md shadow-[0_4px_20px_rgba(244,63,94,0.06)] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/90 border border-rose-200/80 flex items-center justify-center text-rose-600 shadow-2xs">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-200/60 text-rose-800 text-[10px] font-extrabold uppercase tracking-wider mb-2 font-mono">
                AICTE EOA 2026-27 CYCLE
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Regulatory Decision Support & Approval Scrutiny
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mt-1.5 max-w-xl">
                Automated compliance checking against the AICTE Approval Process Handbook. Real-time document forensics, Cadre SFR ratios, instructional carpet area calculus, and TER payment reconciliation.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/review-queue')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-2xl transition-all shadow-sm shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
            >
              <span>Open Review Queue ({pending + resubmitted})</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate('/admin/applications')}
              className="px-4 py-2.5 bg-white/80 hover:bg-white text-slate-700 text-xs font-semibold rounded-2xl border border-rose-200/60 transition-all shadow-2xs cursor-pointer"
            >
              All Applications ({total})
            </button>
          </div>
        </div>

        {/* Side Deck (1 col): Glassmorphic Card */}
        <div className="rounded-3xl p-7 bg-white/75 backdrop-blur-md border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <Compass size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                EVC On-Site Inspection Triage
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Review cases flagged for physical inspection by the Expert Visit Committee due to infrastructure or space deficits.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100/80 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-blue-700">
                {applications.filter((a) => a.physicalInspectionRequired).length} Institutions
              </span>
              <span className="text-[11px] text-slate-400 block">Flagged for EVC Visit</span>
            </div>
            <button
              onClick={() => navigate('/admin/review-queue?tab=evc')}
              className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold rounded-xl border border-blue-200/60 transition-colors cursor-pointer"
            >
              View Triage
            </button>
          </div>
        </div>
      </div>

      {/* Colorful Light Gradient Decks Row */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          Active Adjudication Decks
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5">
          <MetricCard
            title="Total Cases"
            value={total}
            subtitle="All active records"
            icon={FileText}
            colorScheme="rose"
            onClick={() => navigate('/admin/applications')}
          />
          <MetricCard
            title="Pending Review"
            value={pending}
            subtitle="Awaiting triage"
            icon={Clock}
            colorScheme="blue"
            badge={pending > 0 ? { text: 'New', variant: 'warning' } : undefined}
            onClick={() => navigate('/admin/applications?status=Submitted')}
          />
          <MetricCard
            title="Under Scrutiny"
            value={underVerification + resubmitted}
            subtitle="Active audit"
            icon={TrendingUp}
            colorScheme="indigo"
            onClick={() => navigate('/admin/applications?status=Under Verification')}
          />
          <MetricCard
            title="Action Req."
            value={actionRequired}
            subtitle="Applicant fixing"
            icon={AlertTriangle}
            colorScheme="yellow"
            onClick={() => navigate('/admin/applications?status=Action Required')}
          />
          <MetricCard
            title="Verified"
            value={verified}
            subtitle="Approved cases"
            icon={CheckCircle2}
            colorScheme="green"
            onClick={() => navigate('/admin/applications?status=Verified')}
          />
          <MetricCard
            title="EVC Flagged"
            value={applications.filter((a) => a.physicalInspectionRequired).length}
            subtitle="Physical scrutiny"
            icon={Compass}
            colorScheme="teal"
            onClick={() => navigate('/admin/review-queue')}
          />
        </div>
      </div>

      {/* Charts Section - Smooth Squircles */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <h3 className="font-bold text-sm text-slate-900 mb-3 tracking-tight">
            Application Status Breakdown
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '16px',
                    fontSize: '11px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Institution Type Bar Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <h3 className="font-bold text-sm text-slate-900 mb-3 tracking-tight">
            Applications by Institution Classification
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={institutionTypeData}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '16px',
                    fontSize: '11px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  }}
                />
                <Bar dataKey="count" fill="#0D9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Priority Review Queue & Recent Admin Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Priority Queue (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ListTodo size={16} className="text-teal-600" />
                <span>Priority Verification Queue</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cases requiring immediate assessor attention, resubmitted fixes, or high risk scores.
              </p>
            </div>
            <Link
              to="/admin/review-queue"
              className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1"
            >
              <span>View Full Queue</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Institution</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Risk</th>
                  <th className="py-2.5 px-3">Assigned Reviewer</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {priorityQueue.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/admin/applications/${app.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-teal-700">
                      {app.id}
                    </td>
                    <td className="py-3 px-3 text-slate-800 font-semibold truncate max-w-[180px]">
                      {app.institutionName}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge risk={app.riskLevel} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-slate-500 truncate max-w-[130px]">
                      {app.assignedReviewerName || 'Unassigned'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/admin/applications/${app.id}`}
                        className="px-3 py-1 text-xs bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 shadow-2xs"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Activity Stream (1 Col) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900">
              Recent Activity
            </h3>
            <Link
              to="/admin/audit-logs"
              className="text-xs text-teal-700 hover:underline font-semibold"
            >
              Full Log
            </Link>
          </div>

          <div className="space-y-3.5 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-slate-100">
            {recentActivities.map((act) => (
              <div key={act.id} className="relative flex items-start gap-2.5 pl-5 text-xs">
                <span className="absolute left-1 top-1 w-2 h-2 rounded-full bg-teal-500 ring-4 ring-white" />
                <div>
                  <div className="font-semibold text-slate-800">{act.action}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {act.actorName} • {formatDateShort(act.timestamp)}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
