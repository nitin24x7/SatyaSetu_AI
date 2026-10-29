import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Building2,
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  FileText,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { Institution, InstitutionType } from '../../../types';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useNavigate } from 'react-router-dom';

export const AdminInstitutionsPage: React.FC = () => {
  const { institutions, applications } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedInst, setSelectedInst] = useState<Institution | null>(null);

  // Compute application counts per institution
  const filteredInstitutions = useMemo(() => {
    return institutions.filter((inst) => {
      const matchesSearch =
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.aisheCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.state.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'ALL' || inst.institutionType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [institutions, searchQuery, typeFilter]);

  // Applications for selected institution
  const selectedInstApps = selectedInst
    ? applications.filter((a) => a.institutionId === selectedInst.id)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-deep">
            Institution Directory & Master Records
          </h1>
          <p className="text-xs text-slate-muted">
            Authenticated educational institutions registered in the simulated regulatory master directory.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by college name, AISHE code, or state..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-2xl border border-slate-200/80 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-xs p-2 rounded-2xl border border-slate-200/80 bg-white text-slate-700 font-medium w-full sm:w-auto"
        >
          <option value="ALL">All Classifications</option>
          <option value="Central University">Central University</option>
          <option value="State University">State University</option>
          <option value="Deemed University">Deemed University</option>
          <option value="Autonomous Engineering College">Autonomous Engineering College</option>
          <option value="Affiliated Technical Institute">Affiliated Technical Institute</option>
          <option value="Polytechnic Institute">Polytechnic Institute</option>
          <option value="Management Institute">Management Institute</option>
        </select>
      </div>

      {/* Institutions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-border bg-surface-subtle text-slate-muted font-semibold">
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">AISHE Code</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">State Jurisdiction</th>
                <th className="py-3 px-4">Registration Code</th>
                <th className="py-3 px-4">Total Filings</th>
                <th className="py-3 px-4">Standing Status</th>
                <th className="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInstitutions.map((inst) => {
                const appCount = applications.filter((a) => a.institutionId === inst.id).length;
                return (
                  <tr
                    key={inst.id}
                    onClick={() => setSelectedInst(inst)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <div>{inst.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{inst.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-brand-blue">
                      {inst.aisheCode}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {inst.institutionType}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {inst.state}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {inst.registrationNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {appCount} case(s)
                    </td>
                    <td className="py-3.5 px-4">
                      {inst.status === 'Active' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                          Active
                        </span>
                      ) : inst.status === 'Flagged' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                          Flagged
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                          Under Review
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInst(inst);
                        }}
                        className="px-2.5 py-1 text-xs text-brand-blue hover:bg-brand-blue-light font-semibold rounded-md"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Institution Details Lightbox / Sheet */}
      {selectedInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-border max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-blue tracking-wider">
                  INSTITUTIONAL DOSSIER RECORD
                </span>
                <h3 className="font-bold text-base text-navy-deep mt-0.5">{selectedInst.name}</h3>
                <p className="text-xs text-slate-500">
                  {selectedInst.institutionType} • {selectedInst.aisheCode}
                </p>
              </div>
              <button
                onClick={() => setSelectedInst(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs bg-surface-subtle p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">Statutory Registration</span>
                <span className="font-mono font-semibold">{selectedInst.registrationNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Authorized Representative</span>
                <span className="font-semibold">{selectedInst.representativeName} ({selectedInst.representativeDesignation})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Official Registry Email</span>
                <span className="font-semibold">{selectedInst.officialEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Registry Phone</span>
                <span className="font-semibold">{selectedInst.contactNumber}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[10px]">Address</span>
                <span>{selectedInst.address}</span>
              </div>
            </div>

            {/* Application Filings History */}
            <div>
              <h4 className="font-bold text-xs text-navy-deep mb-2">
                Submitted Applications ({selectedInstApps.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedInstApps.length === 0 ? (
                  <p className="text-xs text-slate-400">No applications filed by this entity.</p>
                ) : (
                  selectedInstApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => {
                        setSelectedInst(null);
                        navigate(`/admin/applications/${app.id}`);
                      }}
                      className="p-2.5 rounded-lg border border-slate-200 hover:border-brand-blue flex items-center justify-between text-xs cursor-pointer bg-white"
                    >
                      <div>
                        <span className="font-mono font-bold text-brand-blue">{app.id}</span>
                        <span className="text-slate-600 ml-2">{app.applicationType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={app.status} size="sm" />
                        <ChevronRight size={14} className="text-slate-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedInst(null)}
                className="px-4 py-2 bg-navy-deep text-white text-xs font-semibold rounded-lg"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
