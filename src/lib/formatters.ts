import { format, parseISO } from 'date-fns';
import { ApplicationStatus, RiskLevel, CheckResult, FindingSeverity } from '../types';

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    return format(parseISO(dateString), 'dd MMM yyyy, HH:mm');
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString?: string): string {
  if (!dateString) return '—';
  try {
    return format(parseISO(dateString), 'dd MMM yyyy');
  } catch {
    return dateString;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getStatusColor(status: ApplicationStatus): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'Draft':
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      };
    case 'Submitted':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'Under Verification':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'Action Required':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-800',
        border: 'border-orange-200',
        dot: 'bg-orange-500',
      };
    case 'Resubmitted':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
      };
    case 'Verified':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'Rejected':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      };
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

export function getRiskBadgeColor(risk: RiskLevel): {
  bg: string;
  text: string;
  border: string;
} {
  switch (risk) {
    case 'Low':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'Medium':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };
    case 'High':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  }
}

export function getCheckResultColor(result: CheckResult): {
  bg: string;
  text: string;
  border: string;
} {
  switch (result) {
    case 'Pass':
      return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' };
    case 'Warning':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };
    case 'Fail':
      return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' };
    case 'Not Checked':
      return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
  }
}

export function getSeverityColor(sev: FindingSeverity): {
  bg: string;
  text: string;
} {
  switch (sev) {
    case 'Critical':
      return { bg: 'bg-red-100 text-red-800', text: 'text-red-700' };
    case 'High':
      return { bg: 'bg-orange-100 text-orange-800', text: 'text-orange-700' };
    case 'Medium':
      return { bg: 'bg-amber-100 text-amber-800', text: 'text-amber-700' };
    case 'Low':
      return { bg: 'bg-blue-100 text-blue-800', text: 'text-blue-700' };
    case 'Info':
      return { bg: 'bg-slate-100 text-slate-700', text: 'text-slate-600' };
  }
}
