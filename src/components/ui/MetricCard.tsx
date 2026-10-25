import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'error' | 'neutral';
  };
  onClick?: () => void;
  active?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-brand-blue',
  iconBg = 'bg-brand-blue-light',
  badge,
  onClick,
  active,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border p-5 transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-brand-blue hover:shadow-sm' : ''
      } ${active ? 'border-brand-blue ring-2 ring-brand-blue/20 bg-blue-50/20' : 'border-slate-border shadow-xs'}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-slate-muted">{title}</span>
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl font-bold text-slate-text tracking-tight">{value}</div>
        {badge && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              badge.variant === 'success'
                ? 'bg-status-success-bg text-status-success'
                : badge.variant === 'warning'
                ? 'bg-status-warning-bg text-status-warning'
                : badge.variant === 'error'
                ? 'bg-status-error-bg text-status-error'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-muted">{subtitle}</p>}
    </div>
  );
};
