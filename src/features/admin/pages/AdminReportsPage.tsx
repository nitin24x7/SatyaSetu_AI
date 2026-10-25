import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  UserCheck,
} from 'lucide-react';
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

export const AdminReportsPage: React.FC = () => {
  const { applications, config } = useApp();

  const [dateRange, setDateRange] = useState('ALL');

  // Compute metrics from current applications
  const total = applications.length;
  const verified = applications.filter((a) => a.status === 'Verified').length;
  const rejected = applications.filter((a) => a.status === 'Rejected').length;
  const actionRequired = applications.filter((a) => a.status === 'Action Required').length;
  const underVerification = applications.filter(
    (a) => a.status === 'Under Verification' || a.status === 'Submitted' || a.status === 'Resubmitted'
  ).length;

  const clearanceRate = total > 0 ? Math.round((verified / (verified + rejected || 1)) * 100) : 0;

  // Outcome Chart Data
  const outcomeData = [
    { name: 'Simulated Approval (Verified)', count: verified, color: '#10B981' },
    { name: 'Under Scrutiny / Review', count: underVerification, color: '#315FEA' },
    { name: 'Corrections Required', count: actionRequired, color: '#F59E0B' },
    { name: 'Rejected (Deficit)', count: rejected, color: '#EF4444' },
  ].filter((d) => d.count > 0);

  // Common Failures Breakdown
  const failureBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((app) => {
      app.findings.forEach((fnd) => {
        if (fnd.status === 'Fail' || fnd.status === 'Warning') {
          counts[fnd.checkType] = (counts[fnd.checkType] || 0) + 1;
        }
      });
    });
    return Object.entries(counts).map(([name, count]) => ({
      name: name.replace('Check', '').trim(),
      count,
    }));
  }, [applications]);

  // Reviewer Workload Data
  const reviewerWorkload = useMemo(() => {
    return config.reviewers.map((rev) => {
      const activeCases = applications.filter(
        (a) =>
          a.assignedReviewerId === rev.id &&
          a.status !== 'Verified' &&
          a.status !== 'Rejected'
      ).length;
      return {
        name: rev.name.split(' ')[1] || rev.name,
        fullName: rev.name,
        cases: activeCases,
      };
    });
  }, [config.reviewers, applications]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Processed Applications', total],
      ['Simulated Verified Approvals', verified],
      ['Rejected Applications', rejected],
      ['Applications In Progress', underVerification],
      ['Action Required Cases', actionRequired],
      ['Regulatory Clearance Index (%)', `${clearanceRate}%`],
      ['Generated At', new Date().toISOString()],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `SatyaSetu_Regulatory_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-deep">
            Regulatory Analytics & Compliance Reports
          </h1>
          <p className="text-xs text-slate-muted">
            Aggregated institutional application throughput, validation clearance rates, and failure distributions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 border border-slate-border text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer size={15} />
            <span>Print Report View</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-navy-deep hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download size={15} />
            <span>Export Analytics CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-border shadow-xs">
          <span className="text-xs font-semibold text-slate-muted">Total Filings Handled</span>
          <div className="text-2xl font-bold text-navy-deep mt-1">{total} Cases</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Cycle 2026-2027</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-border shadow-xs">
          <span className="text-xs font-semibold text-slate-muted">Clearance Approval Ratio</span>
          <div className="text-2xl font-bold text-status-success mt-1">{clearanceRate}%</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Of adjudicated cases</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-border shadow-xs">
          <span className="text-xs font-semibold text-slate-muted">Average Turnaround (Simulated)</span>
          <div className="text-2xl font-bold text-brand-blue mt-1">4.2 Days</div>
          <span className="text-[11px] text-slate-400 mt-1 block">From submission to decision</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-border shadow-xs">
          <span className="text-xs font-semibold text-slate-muted">Active Corrections Loop</span>
          <div className="text-2xl font-bold text-orange-600 mt-1">{actionRequired} Cases</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting applicant resubmission</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Outcome Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-border shadow-xs">
          <h3 className="font-bold text-sm text-navy-deep mb-3">
            Adjudication Outcome Distribution
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  dataKey="count"
                  paddingAngle={4}
                >
                  {outcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E4E9F1',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Common Validation Failures */}
        <div className="bg-white p-5 rounded-xl border border-slate-border shadow-xs">
          <h3 className="font-bold text-sm text-navy-deep mb-3">
            Most Common Statutory Discrepancies
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={failureBreakdown} layout="vertical">
                <XAxis type="number" stroke="#69778D" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#69778D" fontSize={10} width={130} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E4E9F1',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" fill="#F97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Assessor Workload Distribution */}
      <div className="bg-white p-5 rounded-xl border border-slate-border shadow-xs">
        <h3 className="font-bold text-sm text-navy-deep mb-3">
          Assessor Workload & Case Distribution
        </h3>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reviewerWorkload}>
              <XAxis dataKey="name" stroke="#69778D" fontSize={11} />
              <YAxis stroke="#69778D" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E4E9F1',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="cases" fill="#315FEA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

