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
  iconColor = 'text-teal-600',
  iconBg = 'bg-teal-50',
  badge,
  onClick,
  active,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border p-5 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-teal-500 hover:shadow-md hover:-translate-y-0.5' : ''
      } ${
        active
          ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/20'
          : 'border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-2xl border border-teal-100/60 ${iconBg} transition-transform`}>
          <Icon size={19} className={iconColor} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        {badge && (
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
              badge.variant === 'success'
                ? 'bg-status-success-bg text-status-success border border-emerald-200/60'
                : badge.variant === 'warning'
                ? 'bg-status-warning-bg text-status-warning border border-amber-200/60'
                : badge.variant === 'error'
                ? 'bg-status-error-bg text-status-error border border-rose-200/60'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>}
    </div>
  );
};
