import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { formatDateShort, formatFileSize } from '../../../lib/formatters';
import {
  FolderOpen,
  Search,
  Filter,
  FileCheck,
  Eye,
  ExternalLink,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { DocumentItem } from '../../../types';

export const ApplicantDocumentsPage: React.FC = () => {
  const { applications, currentInstitution } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Extract all documents for current institution only
  const myApplications = applications.filter((a) => a.institutionId === currentInstitution.id);
  const allDocs = myApplications.flatMap((a) =>
    a.documents.map((d) => ({ ...d, appRef: a.id, appType: a.applicationType }))
  );

  const filteredDocs = allDocs.filter((doc) => {
    const matchesSearch =
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.appRef.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-deep">
            Institution Document Library
          </h1>
          <p className="text-xs text-slate-muted">
            All statutory documents uploaded across applications for {currentInstitution.name}.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-border p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by name, category, or case ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-border focus:ring-1 focus:ring-brand-blue"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs p-2 rounded-lg border border-slate-border bg-white w-full sm:w-auto"
        >
          <option value="ALL">All Categories</option>
          <option value="Institutional Registration Certificate">Institutional Registration</option>
          <option value="Affiliation / Recognition Certificate">Affiliation / Recognition</option>
          <option value="Accreditation Certificate">Accreditation</option>
          <option value="Faculty Information">Faculty Information</option>
          <option value="Infrastructure Information">Infrastructure Information</option>
          <option value="Supporting Declaration">Supporting Declaration</option>
        </select>
      </div>

      {/* Documents Grid / Table */}
      <div className="bg-white rounded-xl border border-slate-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-border bg-surface-subtle text-slate-muted font-semibold">
                <th className="py-3 px-4">Document Category</th>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Associated Case</th>
                <th className="py-3 px-4">Uploaded Date</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-muted">
                    <FolderOpen size={32} className="mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-semibold text-slate-700">No documents found</p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {doc.category}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 flex items-center gap-1.5 font-mono text-[11px]">
                      <FileCheck size={14} className="text-brand-blue shrink-0" />
                      <span className="truncate max-w-[180px]">{doc.fileName}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-brand-blue">
                      {doc.appRef}
                    </td>
                    <td className="py-3.5 px-4 text-slate-muted">
                      {formatDateShort(doc.uploadedAt)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="py-3.5 px-4">
                      {doc.reviewStatus === 'Verified' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                          Verified
                        </span>
                      ) : doc.reviewStatus === 'Flagged' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                          Flagged
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="px-2.5 py-1 text-xs text-brand-blue hover:bg-brand-blue-light font-semibold rounded-md transition-colors"
                      >
                        Preview
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox Preview */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-border max-w-xl w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-navy-deep">{previewDoc.category}</h3>
                <p className="text-xs text-slate-400">{previewDoc.fileName}</p>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="py-6 text-xs text-slate-600 space-y-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-800 mb-1">OCR Extracted Data:</div>
                <div className="space-y-1 font-mono text-[11px]">
                  {Object.entries(previewDoc.extractedFields || {}).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-400">{k}:</span>
                      <span className="font-medium text-slate-700">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 bg-brand-blue text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

