import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { ApplicationStatus, ApplicationType, InstitutionType, RiskLevel } from '../../../types';
import {
  Search,
  Filter,
  Download,
  X,
  ChevronRight,
  Shield,
  UserCheck,
  CheckSquare,
  Square,
  ArrowUpDown,
  Building2,
  FileCheck2,
} from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { RiskBadge } from '../../../components/ui/RiskBadge';
import { formatDateShort } from '../../../lib/formatters';
import { useToast } from '../../../components/ui/Toast';

export const AdminApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const { applications, config, assignReviewer } = useApp();
  const { success } = useToast();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [instTypeFilter, setInstTypeFilter] = useState<string>('ALL');
  const [appTypeFilter, setAppTypeFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [reviewerFilter, setReviewerFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'id' | 'institution' | 'submitted' | 'risk'>('submitted');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bulk Selection
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [bulkReviewerId, setBulkReviewerId] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter logic
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        const matchesSearch =
          app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.purpose.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
        const matchesInstType = instTypeFilter === 'ALL' || app.institutionType === instTypeFilter;
        const matchesAppType = appTypeFilter === 'ALL' || app.applicationType === appTypeFilter;
        const matchesRisk = riskFilter === 'ALL' || app.riskLevel === riskFilter;
        const matchesReviewer =
          reviewerFilter === 'ALL'
            ? true
            : reviewerFilter === 'UNASSIGNED'
            ? !app.assignedReviewerId
            : app.assignedReviewerId === reviewerFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesInstType &&
          matchesAppType &&
          matchesRisk &&
          matchesReviewer
        );
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'id') {
          diff = a.id.localeCompare(b.id);
        } else if (sortBy === 'institution') {
          diff = a.institutionName.localeCompare(b.institutionName);
        } else if (sortBy === 'risk') {
          const riskWeight = { High: 3, Medium: 2, Low: 1 };
          diff = riskWeight[a.riskLevel] - riskWeight[b.riskLevel];
        } else {
          const dateA = new Date(a.submittedAt || a.createdAt).getTime();
          const dateB = new Date(b.submittedAt || b.createdAt).getTime();
          diff = dateA - dateB;
        }
        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [
    applications,
    searchQuery,
    statusFilter,
    instTypeFilter,
    appTypeFilter,
    riskFilter,
    reviewerFilter,
    sortBy,
    sortOrder,
  ]);

  // Pagination slice
  const totalPages = Math.ceil(filteredApplications.length / pageSize) || 1;
  const paginatedApps = filteredApplications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Bulk selection handlers
  const toggleSelectAll = () => {
    if (selectedAppIds.length === paginatedApps.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(paginatedApps.map((a) => a.id));
    }
  };

  const toggleSelectApp = (id: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkAssign = () => {
    if (!bulkReviewerId || selectedAppIds.length === 0) return;
    selectedAppIds.forEach((id) => assignReviewer(id, bulkReviewerId));
    success('Assigned Reviewer', `${selectedAppIds.length} application(s) reassigned successfully.`);
    setSelectedAppIds([]);
    setBulkReviewerId('');
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Application ID',
      'Institution Name',
      'Institution Type',
      'Application Type',
      'Academic Year',
      'Status',
      'Risk Level',
      'Assigned Reviewer',
      'Submitted Date',
    ];

    const rows = filteredApplications.map((app) => [
      app.id,
      `"${app.institutionName.replace(/"/g, '""')}"`,
      `"${app.institutionType}"`,
      `"${app.applicationType}"`,
      app.academicYear,
      app.status,
      app.riskLevel,
      `"${app.assignedReviewerName || 'Unassigned'}"`,
      app.submittedAt || app.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PRAMAAN_Applications_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    success('CSV Exported', `Exported ${filteredApplications.length} applications to CSV.`);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setInstTypeFilter('ALL');
    setAppTypeFilter('ALL');
    setRiskFilter('ALL');
    setReviewerFilter('ALL');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    statusFilter !== 'ALL' ||
    instTypeFilter !== 'ALL' ||
    appTypeFilter !== 'ALL' ||
    riskFilter !== 'ALL' ||
    reviewerFilter !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-deep">
            Regulatory Applications Pipeline
          </h1>
          <p className="text-xs text-slate-muted">
            Inspect dossiers, assign regulatory reviewers, evaluate OCR concordance, and execute compliance workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 border border-slate-border text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download size={15} />
            <span>Export Filtered CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-border p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID, college name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-border focus:ring-1 focus:ring-brand-blue"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs p-2 rounded-lg border border-slate-border bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Verification">Under Verification</option>
            <option value="Action Required">Action Required</option>
            <option value="Resubmitted">Resubmitted</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
            <option value="Draft">Draft</option>
          </select>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs p-2 rounded-lg border border-slate-border bg-white"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>

          {/* Reviewer Filter */}
          <select
            value={reviewerFilter}
            onChange={(e) => {
              setReviewerFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs p-2 rounded-lg border border-slate-border bg-white"
          >
            <option value="ALL">All Reviewers</option>
            <option value="UNASSIGNED">Unassigned Only</option>
            {config.reviewers.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          {/* Sort Control */}
          <div className="flex items-center gap-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs p-2 rounded-lg border border-slate-border bg-white flex-1"
            >
              <option value="submitted">Sort: Date</option>
              <option value="id">Sort: Case ID</option>
              <option value="institution">Sort: Institution</option>
              <option value="risk">Sort: Risk</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-slate-border rounded-lg bg-white text-slate-500 hover:text-slate-800"
              title="Toggle sort direction"
            >
              <ArrowUpDown size={14} />
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-muted">
              Displaying <strong>{filteredApplications.length}</strong> matching records.
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-brand-blue hover:underline flex items-center gap-1 font-semibold"
            >
              <X size={13} /> Reset Filters
            </button>
          </div>
        )}

        {/* Bulk Action Bar */}
        {selectedAppIds.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-brand-blue font-semibold">
              <CheckSquare size={16} />
              <span>{selectedAppIds.length} Application(s) Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={bulkReviewerId}
                onChange={(e) => setBulkReviewerId(e.target.value)}
                className="text-xs p-1.5 rounded-lg border border-slate-border bg-white"
              >
                <option value="">Select Assessor to Assign...</option>
                {config.reviewers.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <button
                disabled={!bulkReviewerId}
                onClick={handleBulkAssign}
                className="px-3 py-1.5 bg-brand-blue disabled:opacity-50 text-white rounded-lg font-semibold hover:bg-brand-blue-dark"
              >
                Apply Assignment
              </button>
              <button
                onClick={() => setSelectedAppIds([])}
                className="text-slate-500 hover:text-slate-800 ml-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-border bg-surface-subtle text-slate-muted font-semibold">
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      paginatedApps.length > 0 &&
                      selectedAppIds.length === paginatedApps.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded text-brand-blue"
                  />
                </th>
                <th className="py-3 px-3">Application ID</th>
                <th className="py-3 px-3">Institution Name</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Submitted</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Assigned Assessor</th>
                <th className="py-3 px-3">Risk</th>
                <th className="py-3 px-3 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedApps.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-muted">
                    <FileCheck2 size={32} className="mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-semibold text-slate-700">No applications match the criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Adjust search parameters or clear filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedApps.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/admin/applications/${app.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedAppIds.includes(app.id)}
                        onChange={() => toggleSelectApp(app.id)}
                        className="rounded text-brand-blue"
                      />
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-brand-blue">
                      {app.id}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-800 max-w-[200px] truncate">
                      <div>{app.institutionName}</div>
                      <div className="text-[10px] text-slate-400">{app.institutionType} • {app.state}</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {app.applicationType}
                    </td>
                    <td className="py-3.5 px-3 text-slate-muted">
                      {formatDateShort(app.submittedAt || app.createdAt)}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 max-w-[130px] truncate">
                      {app.assignedReviewerName || (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <RiskBadge risk={app.riskLevel} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/applications/${app.id}`);
                        }}
                        className="px-2.5 py-1 text-xs bg-navy-deep text-white rounded-md font-semibold hover:bg-slate-800 transition-colors"
                      >
                        Open Workspace
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-border flex items-center justify-between text-xs text-slate-muted bg-surface-subtle">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredApplications.length)} of{' '}
              {filteredApplications.length} cases
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 border border-slate-border rounded bg-white disabled:opacity-40"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded text-xs font-semibold ${
                    currentPage === i + 1
                      ? 'bg-navy-deep text-white'
                      : 'bg-white border border-slate-border text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 border border-slate-border rounded bg-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
