import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../components/ui/Toast';
import {
  Settings,
  Shield,
  FileText,
  Sliders,
  Users,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { config, updatePlatformConfig, resetDemoData } = useApp();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState<'rules' | 'docs' | 'reviewers'>('rules');

  // Rules state
  const [rules, setRules] = useState(config.complianceRules);
  const [documentCategories, setDocumentCategories] = useState(config.documentCategories);
  const [maxFileSizeMB, setMaxFileSizeMB] = useState(config.maxFileSizeMB);

  const toggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const toggleDocRequired = (category: string) => {
    setDocumentCategories((prev) =>
      prev.map((d) => (d.category === category ? { ...d, required: !d.required } : d))
    );
  };

  const handleSaveSettings = () => {
    updatePlatformConfig({
      complianceRules: rules,
      documentCategories,
      maxFileSizeMB,
    });
    success('Settings Updated', 'Platform compliance policies saved to local storage.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-deep">
            Regulatory Configuration & Policies
          </h1>
          <p className="text-xs text-slate-muted">
            Configure automated compliance validation rules, mandatory document categories, and assessor rosters.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Save size={15} />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'rules'
              ? 'bg-navy-deep text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield size={14} />
          <span>Compliance Rules ({rules.filter((r) => r.enabled).length} Active)</span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'docs'
              ? 'bg-navy-deep text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText size={14} />
          <span>Document Requirements</span>
        </button>

        <button
          onClick={() => setActiveTab('reviewers')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'reviewers'
              ? 'bg-navy-deep text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users size={14} />
          <span>Regulatory Assessors</span>
        </button>
      </div>

      {/* TAB 1: Compliance Rules */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-xl border border-slate-border p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-navy-deep">
              Automated Verification Rule Engine
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These rules are executed upon applicant submission to simulate optical checks and cross-verification.
            </p>
          </div>

          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-3.5 rounded-xl border border-slate-border hover:border-slate-300 flex items-start justify-between gap-4 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                      {rule.code}
                    </span>
                    <h4 className="font-bold text-xs text-slate-800">{rule.name}</h4>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        rule.severity === 'Critical'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {rule.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {rule.description}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleRule(rule.id)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Document Requirements */}
      {activeTab === 'docs' && (
        <div className="bg-white rounded-xl border border-slate-border p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-navy-deep">
              Statutory Category Mandates
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Toggle which document categories are strictly mandatory for applicant submission.
            </p>
          </div>

          <div className="space-y-3">
            {documentCategories.map((doc) => (
              <div
                key={doc.category}
                className="p-3.5 rounded-xl border border-slate-border flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-slate-800">{doc.category}</h4>
                    {doc.required ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold">
                        Mandatory
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{doc.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleDocRequired(doc.category)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                    doc.required
                      ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {doc.required ? 'Make Optional' : 'Make Mandatory'}
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Maximum File Size Limit (MB)
            </label>
            <input
              type="number"
              value={maxFileSizeMB}
              onChange={(e) => setMaxFileSizeMB(Number(e.target.value))}
              min={1}
              max={50}
              className="w-32 p-2 text-xs border border-slate-border rounded-lg"
            />
          </div>
        </div>
      )}

      {/* TAB 3: Assessors Roster */}
      {activeTab === 'reviewers' && (
        <div className="bg-white rounded-xl border border-slate-border p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-navy-deep">
              Regulatory Assessor Team Directory
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorized evaluation officials eligible for case assignment.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {config.reviewers.map((rev) => (
              <div
                key={rev.id}
                className="p-3.5 rounded-xl border border-slate-border bg-surface-subtle text-xs"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-navy-deep text-white flex items-center justify-center font-bold text-[11px]">
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{rev.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{rev.id}</span>
                  </div>
                </div>
                <div className="mt-2 text-slate-600 space-y-0.5 text-[11px]">
                  <div><strong>Role:</strong> {rev.role}</div>
                  <div><strong>Cell:</strong> {rev.department}</div>
                  <div><strong>Email:</strong> {rev.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button Bar */}
      <div className="flex justify-end pt-3">
        <button
          onClick={handleSaveSettings}
          className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Save size={15} />
          <span>Save Configuration</span>
        </button>
      </div>
    </div>
  );
};

