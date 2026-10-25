import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertCircle className="text-status-error" size={24} />,
          iconBg: 'bg-status-error-bg',
          buttonBg: 'bg-status-error hover:bg-red-700 text-white',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="text-status-warning" size={24} />,
          iconBg: 'bg-status-warning-bg',
          buttonBg: 'bg-status-warning hover:bg-amber-700 text-white',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="text-status-success" size={24} />,
          iconBg: 'bg-status-success-bg',
          buttonBg: 'bg-status-success hover:bg-emerald-700 text-white',
        };
      default:
        return {
          icon: <HelpCircle className="text-brand-blue" size={24} />,
          iconBg: 'bg-brand-blue-light',
          buttonBg: 'bg-brand-blue hover:bg-brand-blue-dark text-white',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-xl border border-slate-border max-w-md w-full overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full shrink-0 ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-text">{title}</h3>
                <button
                  onClick={onCancel}
                  className="text-slate-muted hover:text-slate-text p-1 rounded-md"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mt-2 text-sm text-slate-muted">{description}</div>
            </div>
          </div>
        </div>
        <div className="bg-surface-subtle px-6 py-3.5 flex justify-end gap-3 border-t border-slate-border">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-text bg-white border border-slate-border rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${styles.buttonBg} disabled:opacity-50`}
          >
            {loading && <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
