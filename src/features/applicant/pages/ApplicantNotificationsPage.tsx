import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { formatDate } from '../../../lib/formatters';
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ApplicantNotificationsPage: React.FC = () => {
  const { notifications, currentInstitutionId, markNotificationRead, markAllNotificationsRead } = useApp();
  const [filterUnread, setFilterUnread] = useState(false);
  const navigate = useNavigate();

  const myNotifications = notifications.filter(
    (n) =>
      (n.recipientRole === 'applicant' || n.recipientRole === 'all') &&
      (!n.institutionId || n.institutionId === currentInstitutionId)
  );

  const displayedNotifications = filterUnread
    ? myNotifications.filter((n) => !n.read)
    : myNotifications;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-deep">Notification Center</h1>
          <p className="text-xs text-slate-muted">
            Statutory review updates, correction notices, and validation decisions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={filterUnread}
              onChange={(e) => setFilterUnread(e.target.checked)}
              className="rounded text-brand-blue"
            />
            <span>Unread Only</span>
          </label>
          <button
            onClick={() => markAllNotificationsRead('applicant')}
            className="px-3 py-1.5 border border-slate-border text-xs font-semibold rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
          >
            <CheckCheck size={14} className="text-brand-blue" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-border shadow-xs divide-y divide-slate-100 overflow-hidden">
        {displayedNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-muted">
            <Bell size={32} className="mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="font-semibold text-slate-700">No notifications</p>
            <p className="text-xs text-slate-400 mt-1">
              You are completely caught up with all case events.
            </p>
          </div>
        ) : (
          displayedNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 transition-colors flex items-start justify-between gap-4 ${
                !notif.read ? 'bg-blue-50/30' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg shrink-0 mt-0.5">
                  {notif.type === 'warning' ? (
                    <AlertTriangle size={18} className="text-orange-600" />
                  ) : notif.type === 'success' ? (
                    <CheckCircle2 size={18} className="text-status-success" />
                  ) : notif.type === 'error' ? (
                    <XCircle size={18} className="text-status-error" />
                  ) : (
                    <Info size={18} className="text-brand-blue" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-800">{notif.title}</h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-brand-blue" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[10px] text-slate-400">
                      {formatDate(notif.createdAt)}
                    </span>
                    {notif.applicationId && (
                      <button
                        onClick={() => navigate(`/applicant/applications/${notif.applicationId}`)}
                        className="text-xs text-brand-blue font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>View Dossier</span>
                        <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={() => markNotificationRead(notif.id)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-100 shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
