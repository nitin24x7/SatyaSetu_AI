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
          icon: <AlertCircle className="text-rose-600" size={22} />,
          iconBg: 'bg-rose-50 border border-rose-200/60',
          buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs shadow-rose-600/20',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="text-amber-600" size={22} />,
          iconBg: 'bg-amber-50 border border-amber-200/60',
          buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs shadow-amber-600/20',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="text-emerald-600" size={22} />,
          iconBg: 'bg-emerald-50 border border-emerald-200/60',
          buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-600/20',
        };
      default:
        return {
          icon: <HelpCircle className="text-blue-600" size={22} />,
          iconBg: 'bg-blue-50 border border-blue-200/60',
          buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-600/20',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl shrink-0 ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
                <button
                  onClick={onCancel}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mt-2 text-xs text-slate-600 leading-relaxed">{description}</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-50/80 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 shadow-2xs"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all disabled:opacity-50 ${styles.buttonBg}`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
