import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { ApplicationStatus, ApplicationType } from '../../../types';
import {
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  AlertTriangle,
  ChevronRight,
  PlusCircle,
  X,
  FileEdit,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { RiskBadge } from '../../../components/ui/RiskBadge';
import { formatDate, formatDateShort } from '../../../lib/formatters';

export const ApplicantApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { applications, currentInstitution } = useApp();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'updated'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter current institution applications
  const myApplications = useMemo(() => {
    return applications.filter((a) => a.institutionId === currentInstitution.id);
  }, [applications, currentInstitution.id]);

  // Apply filters and sort
  const filteredApplications = useMemo(() => {
    return myApplications
      .filter((app) => {
        const matchesSearch =
          app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.applicationType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.purpose.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
        const matchesType = typeFilter === 'ALL' || app.applicationType === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
      });
  }, [myApplications, searchQuery, statusFilter, typeFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / pageSize) || 1;
  const paginatedApps = filteredApplications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery !== '' || statusFilter !== 'ALL' || typeFilter !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-deep">
            Institutional Applications
          </h1>
          <p className="text-xs text-slate-muted">
            All submitted, in-verification, and completed dossiers for {currentInstitution.name}.
          </p>
        </div>

        <button
          onClick={() => navigate('/applicant/applications/new')}
          className="px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-xs"
        >
          <PlusCircle size={15} />
          <span>New Application</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-border p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID or keywords..."
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
            className="w-full text-xs p-2 rounded-lg border border-slate-border bg-white"
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

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs p-2 rounded-lg border border-slate-border bg-white"
          >
            <option value="ALL">All Application Types</option>
            <option value="Institutional Recognition">Institutional Recognition</option>
            <option value="Compliance Review">Compliance Review</option>
            <option value="Document Verification">Document Verification</option>
            <option value="Renewal / Extension">Renewal / Extension</option>
            <option value="Capacity Expansion Approval">Capacity Expansion Approval</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full text-xs p-2 rounded-lg border border-slate-border bg-white"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="updated">Sort: Recently Updated</option>
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-muted">
              Active filters found <strong>{filteredApplications.length}</strong> matching application(s).
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-brand-blue hover:underline flex items-center gap-1 font-semibold"
            >
              <X size={13} /> Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-slate-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-border bg-surface-subtle text-slate-muted font-semibold">
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Cycle</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-muted">
                    <FileText size={32} className="mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-semibold text-slate-700">No applications found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {hasActiveFilters
                        ? 'Try loosening your search terms or resetting filters.'
                        : 'You have not created any applications for this institution yet.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedApps.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/applicant/applications/${app.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-brand-blue">
                      {app.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-text font-medium">
                      {app.applicationType}
                    </td>
                    <td className="py-3.5 px-4 text-slate-muted font-mono">
                      {app.academicYear}
                    </td>
                    <td className="py-3.5 px-4 text-slate-muted">
                      {formatDateShort(app.submittedAt || app.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge risk={app.riskLevel} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {app.status === 'Action Required' && (
                          <Link
                            to={`/applicant/applications/${app.id}`}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200 rounded-md hover:bg-orange-100"
                          >
                            Resolve Issues
                          </Link>
                        )}
                        {app.status === 'Draft' && (
                          <Link
                            to={`/applicant/applications/${app.id}`}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200"
                          >
                            Edit Draft
                          </Link>
                        )}
                        <Link
                          to={`/applicant/applications/${app.id}`}
                          className="p-1 text-slate-400 hover:text-brand-blue rounded-md transition-colors"
                          title="View application dossier"
                        >
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-border flex items-center justify-between text-xs text-slate-muted bg-surface-subtle">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredApplications.length)} of{' '}
              {filteredApplications.length} entries
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
                      ? 'bg-brand-blue text-white'
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

