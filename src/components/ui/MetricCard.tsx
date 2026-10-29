import React from 'react';
import { LucideIcon } from 'lucide-react';

export type DeckColorScheme = 'rose' | 'orange' | 'green' | 'indigo' | 'yellow' | 'teal' | 'slate' | 'blue';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  colorScheme?: DeckColorScheme;
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
  iconColor,
  iconBg,
  colorScheme = 'blue',
  badge,
  onClick,
  active,
}) => {
  // Pastel glassmorphism themes matching iOS / modern design cards
  const themeStyles = {
    blue: {
      gradient: 'bg-gradient-to-br from-[#E0EFFF]/85 via-[#EEF5FF]/60 to-white/70',
      border: 'border-blue-200/70',
      iconText: 'text-blue-600',
      iconBox: 'bg-white/90 border border-blue-100 shadow-2xs text-blue-600',
      hoverBorder: 'hover:border-blue-400/80',
    },
    rose: {
      gradient: 'bg-gradient-to-br from-[#FFE5EC]/85 via-[#FFF0F4]/60 to-white/70',
      border: 'border-rose-200/70',
      iconText: 'text-rose-600',
      iconBox: 'bg-white/90 border border-rose-100 shadow-2xs text-rose-600',
      hoverBorder: 'hover:border-rose-400/80',
    },
    orange: {
      // Replaced harsh orange with fresh soft pastel sky/cyan as requested
      gradient: 'bg-gradient-to-br from-[#E0F2FE]/85 via-[#F0F9FF]/60 to-white/70',
      border: 'border-sky-200/70',
      iconText: 'text-sky-600',
      iconBox: 'bg-white/90 border border-sky-100 shadow-2xs text-sky-600',
      hoverBorder: 'hover:border-sky-400/80',
    },
    green: {
      gradient: 'bg-gradient-to-br from-[#EBF5DF]/85 via-[#F4FAEC]/60 to-white/70',
      border: 'border-lime-200/70',
      iconText: 'text-emerald-700',
      iconBox: 'bg-white/90 border border-lime-100 shadow-2xs text-emerald-600',
      hoverBorder: 'hover:border-emerald-400/80',
    },
    indigo: {
      gradient: 'bg-gradient-to-br from-[#ECEBFF]/85 via-[#F5F4FF]/60 to-white/70',
      border: 'border-indigo-200/70',
      iconText: 'text-indigo-600',
      iconBox: 'bg-white/90 border border-indigo-100 shadow-2xs text-indigo-600',
      hoverBorder: 'hover:border-indigo-400/80',
    },
    yellow: {
      gradient: 'bg-gradient-to-br from-[#FFF3D6]/85 via-[#FFFBEB]/60 to-white/70',
      border: 'border-amber-200/70',
      iconText: 'text-amber-700',
      iconBox: 'bg-white/90 border border-amber-100 shadow-2xs text-amber-600',
      hoverBorder: 'hover:border-amber-400/80',
    },
    teal: {
      gradient: 'bg-gradient-to-br from-[#E2F7F2]/85 via-[#F0FDF9]/60 to-white/70',
      border: 'border-teal-200/70',
      iconText: 'text-teal-700',
      iconBox: 'bg-white/90 border border-teal-100 shadow-2xs text-teal-600',
      hoverBorder: 'hover:border-teal-400/80',
    },
    slate: {
      gradient: 'bg-gradient-to-br from-slate-100/80 via-slate-50/60 to-white/70',
      border: 'border-slate-200/70',
      iconText: 'text-slate-700',
      iconBox: 'bg-white/90 border border-slate-200/60 shadow-2xs text-slate-600',
      hoverBorder: 'hover:border-slate-400/80',
    },
  }[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`relative rounded-3xl border p-5 backdrop-blur-md transition-all duration-200 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] ${
        themeStyles.gradient
      } ${themeStyles.border} ${
        onClick
          ? `cursor-pointer ${themeStyles.hoverBorder} hover:shadow-md hover:-translate-y-1`
          : ''
      } ${
        active
          ? 'ring-2 ring-teal-500/30 border-teal-500 shadow-md scale-[1.02]'
          : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold text-slate-700 tracking-tight">{title}</span>
        <div
          className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${
            iconBg || themeStyles.iconBox
          }`}
        >
          <Icon size={18} className={iconColor || themeStyles.iconText} />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
        {badge && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-2xs ${
              badge.variant === 'success'
                ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-200/60'
                : badge.variant === 'warning'
                ? 'bg-amber-100/90 text-amber-800 border border-amber-200/60'
                : badge.variant === 'error'
                ? 'bg-rose-100/90 text-rose-800 border border-rose-200/60'
                : 'bg-white/80 text-slate-700 border border-slate-200/60'
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-[11px] text-slate-500 font-medium truncate">{subtitle}</p>
      )}
    </div>
  );
};
