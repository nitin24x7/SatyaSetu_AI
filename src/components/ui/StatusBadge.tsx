import React from 'react';
import { ApplicationStatus } from '../../types';
import { getStatusColor } from '../../lib/formatters';
import { 
  FileEdit, 
  Send, 
  Search, 
  AlertTriangle, 
  RotateCcw, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const colors = getStatusColor(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  }[size];

  const renderIcon = () => {
    const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;
    switch (status) {
      case 'Draft':
        return <FileEdit size={iconSize} className="text-slate-500" />;
      case 'Submitted':
        return <Send size={iconSize} className="text-blue-600" />;
      case 'Under Verification':
        return <Search size={iconSize} className="text-amber-600 animate-pulse" />;
      case 'Action Required':
        return <AlertTriangle size={iconSize} className="text-orange-600" />;
      case 'Resubmitted':
        return <RotateCcw size={iconSize} className="text-purple-600" />;
      case 'Verified':
        return <CheckCircle2 size={iconSize} className="text-emerald-600" />;
      case 'Rejected':
        return <XCircle size={iconSize} className="text-rose-600" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses} whitespace-nowrap`}
    >
      {showIcon && renderIcon()}
      <span>{status}</span>
    </span>
  );
};

