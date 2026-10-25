import React from 'react';
import { RiskLevel } from '../../types';
import { getRiskBadgeColor } from '../../lib/formatters';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

interface RiskBadgeProps {
  risk: RiskLevel;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk, size = 'md' }) => {
  const colors = getRiskBadgeColor(risk);
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}`}
    >
      {risk === 'High' ? (
        <ShieldAlert size={13} className="text-rose-600" />
      ) : risk === 'Medium' ? (
        <Shield size={13} className="text-amber-600" />
      ) : (
        <ShieldCheck size={13} className="text-emerald-600" />
      )}
      <span>{risk} Risk</span>
    </span>
  );
};

