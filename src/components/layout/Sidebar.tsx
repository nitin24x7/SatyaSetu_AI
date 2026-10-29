import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  FolderOpen,
  Bell,
  Building2,
  ListTodo,
  BarChart3,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  LucideIcon,
  Sparkles,
} from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../ui/Toast';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface SidebarProps {
  role: 'applicant' | 'admin';
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, mobileOpen, onMobileClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { currentInstitution, currentReviewer, resetDemoData, unreadCount } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { success } = useToast();

  const applicantLinks: NavItem[] = [
    { to: '/applicant/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/applicant/applications', label: 'My Applications', icon: FileText },
    { to: '/applicant/applications/new', label: 'New Application', icon: FilePlus },
    { to: '/applicant/documents', label: 'Document Library', icon: FolderOpen },
    {
      to: '/applicant/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount('applicant'),
    },
    { to: '/applicant/profile', label: 'Institution Profile', icon: Building2 },
  ];

  const adminLinks: NavItem[] = [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/applications', label: 'All Applications', icon: FileText },
    { to: '/admin/review-queue', label: 'Review Queue', icon: ListTodo },
    { to: '/admin/institutions', label: 'Institutions', icon: Building2 },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/admin/audit-logs', label: 'Audit Trail', icon: History },
    { to: '/admin/settings', label: 'Platform Settings', icon: Settings },
  ];

  const links = role === 'admin' ? adminLinks : applicantLinks;

  const handleReset = () => {
    resetDemoData();
    setShowResetDialog(false);
    success('Demo state restored to initial baseline.');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar container - Clean White iOS Style with Squircles */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white text-slate-800 transition-all duration-300 border-r border-slate-200/80 shadow-[1px_0_12px_rgba(0,0,0,0.02)] ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
          <div
            onClick={() => navigate('/')}
            className="flex items-center cursor-pointer overflow-hidden group py-1"
            title="SatyaSetu AI"
          >
            <img
              src="/logo.png"
              alt="SatyaSetu AI"
              className={
                collapsed
                  ? 'h-9 w-9 object-contain'
                  : 'h-11 sm:h-12 w-auto max-w-[195px] object-contain transition-transform group-hover:scale-102'
              }
            />
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Role Portal Badge */}
        <div className="px-3.5 py-2.5">
          <div
            className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold transition-all ${
              role === 'admin'
                ? 'bg-amber-50/80 text-amber-900 border border-amber-200/70'
                : 'bg-teal-50/80 text-teal-900 border border-teal-200/70'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                role === 'admin' ? 'bg-amber-500 animate-pulse' : 'bg-teal-500'
              }`}
            />
            {!collapsed && (
              <span className="truncate">
                {role === 'admin' ? 'Admin Verification Console' : 'Institutional Portal'}
              </span>
            )}
          </div>
        </div>

        {/* Navigation items - Smooth Squircles iOS Aesthetic */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.to === `/${role}/dashboard`
                ? location.pathname === link.to
                : location.pathname.startsWith(link.to);

            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onMobileClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-teal-600 text-white font-semibold shadow-sm shadow-teal-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
                title={collapsed ? link.label : undefined}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-600'
                  }`}
                />
                {!collapsed && <span className="truncate">{link.label}</span>}
                {link.badge !== undefined && link.badge > 0 && (
                  <span
                    className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
                      isActive ? 'bg-white/90 text-teal-700' : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Area - Rounded Squircle Profile & Quick Switches */}
        <div className="p-3 border-t border-slate-100 space-y-2 shrink-0 bg-slate-50/50">
          {/* Active profile snippet */}
          {!collapsed && (
            <div className="p-2.5 rounded-2xl bg-white border border-slate-200/70 shadow-xs">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                Active Demo Identity
              </div>
              <div className="text-xs font-semibold text-slate-800 truncate">
                {role === 'admin' ? currentReviewer.name : currentInstitution.name}
              </div>
              <div className="text-[11px] text-teal-700 font-medium truncate">
                {role === 'admin' ? currentReviewer.role : currentInstitution.representativeName}
              </div>
            </div>
          )}

          {/* Quick Switch role button */}
          <button
            onClick={() => {
              if (role === 'admin') {
                navigate('/applicant/dashboard');
              } else {
                navigate('/admin/dashboard');
              }
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-200/60 shadow-xs transition-all"
            title="Switch portal view"
          >
            <RotateCcw size={14} className="text-teal-600 shrink-0" />
            {!collapsed && (
              <span>Switch to {role === 'admin' ? 'Applicant Portal' : 'Admin Console'}</span>
            )}
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={() => setShowResetDialog(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50/60 rounded-xl transition-all"
            title="Restore default mock dataset"
          >
            <RotateCcw size={14} className="shrink-0 text-slate-400" />
            {!collapsed && <span>Reset Demo Dataset</span>}
          </button>

          {/* Exit Demo button */}
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            title="Exit demo"
          >
            <LogOut size={14} className="shrink-0" />
            {!collapsed && <span>Exit to Role Selection</span>}
          </button>
        </div>
      </aside>

      <ConfirmDialog
        isOpen={showResetDialog}
        title="Reset Demo Dataset"
        description="Are you sure you want to reset all mock applications, audit logs, and settings back to the initial baseline? Any new applications or state modifications will be restored to defaults."
        confirmText="Reset Baseline"
        variant="danger"
        onConfirm={handleReset}
        onCancel={() => setShowResetDialog(false)}
      />
    </>
  );
};
