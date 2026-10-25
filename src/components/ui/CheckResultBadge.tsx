import React from 'react';
import { CheckResult } from '../../types';
import { getCheckResultColor } from '../../lib/formatters';
import { Check, AlertCircle, X, HelpCircle } from 'lucide-react';

interface CheckResultBadgeProps {
  result: CheckResult;
}

export const CheckResultBadge: React.FC<CheckResultBadgeProps> = ({ result }) => {
  const colors = getCheckResultColor(result);

  const renderIcon = () => {
    switch (result) {
      case 'Pass':
        return <Check size={12} className="stroke-[3] text-emerald-600" />;
      case 'Warning':
        return <AlertCircle size={12} className="text-amber-600" />;
      case 'Fail':
        return <X size={12} className="stroke-[3] text-rose-600" />;
      case 'Not Checked':
        return <HelpCircle size={12} className="text-slate-400" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {renderIcon()}
      <span>{result}</span>
    </span>
  );
};

