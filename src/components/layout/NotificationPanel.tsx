import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../lib/formatters';
import { Bell, Check, CheckCheck, ExternalLink, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'applicant' | 'admin';
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  role,
}) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, currentInstitutionId } = useApp();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const relevantNotifications = notifications.filter((n) => {
    if (role === 'admin') return n.recipientRole === 'admin' || n.recipientRole === 'all';
    return (
      (n.recipientRole === 'applicant' || n.recipientRole === 'all') &&
      (!n.institutionId || n.institutionId === currentInstitutionId)
    );
  });

  return (
    <div className="absolute right-0 top-12 z-50 w-96 bg-white rounded-xl shadow-xl border border-slate-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div className="p-4 border-b border-slate-border flex items-center justify-between bg-surface-subtle">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-brand-blue" />
          <h3 className="font-semibold text-sm text-slate-text">Notifications</h3>
          <span className="text-xs bg-brand-blue-light text-brand-blue px-2 py-0.5 rounded-full font-medium">
            {relevantNotifications.filter((n) => !n.read).length} new
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => markAllNotificationsRead(role)}
            className="text-xs text-brand-blue hover:underline flex items-center gap-1 font-medium"
            title="Mark all as read"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
          <button
            onClick={onClose}
            className="text-slate-muted hover:text-slate-text p-1 rounded-md"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
        {relevantNotifications.length === 0 ? (
          <div className="p-8 text-center text-slate-muted">
            <Bell size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          relevantNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 transition-colors hover:bg-slate-50 ${
                !notif.read ? 'bg-blue-50/40' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      !notif.read ? 'bg-brand-blue' : 'bg-transparent'
                    }`}
                  />
                  <h4 className="text-xs font-semibold text-slate-text">{notif.title}</h4>
                </div>
                <span className="text-[10px] text-slate-muted whitespace-nowrap">
                  {formatDate(notif.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-muted leading-relaxed pl-4">
                {notif.message}
              </p>
              <div className="mt-2 pl-4 flex items-center justify-between">
                {notif.applicationId && (
                  <button
                    onClick={() => {
                      onClose();
                      if (role === 'admin') {
                        navigate(`/admin/applications/${notif.applicationId}`);
                      } else {
                        navigate(`/applicant/applications/${notif.applicationId}`);
                      }
                    }}
                    className="text-xs text-brand-blue hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    View Application <ExternalLink size={11} />
                  </button>
                )}
                {!notif.read && (
                  <button
                    onClick={() => markNotificationRead(notif.id)}
                    className="text-[11px] text-slate-muted hover:text-slate-text ml-auto inline-flex items-center gap-1"
                  >
                    <Check size={12} /> Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2.5 bg-surface-subtle border-t border-slate-border text-center">
        <button
          onClick={() => {
            onClose();
            if (role === 'applicant') {
              navigate('/applicant/notifications');
            } else {
              navigate('/admin/audit-logs');
            }
          }}
          className="text-xs text-brand-blue hover:underline font-medium"
        >
          {role === 'applicant' ? 'View all notifications' : 'View audit event history'}
        </button>
      </div>
    </div>
  );
};
