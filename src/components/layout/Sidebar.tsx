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
  Shield,
  HelpCircle,
  RotateCcw,
  LucideIcon,
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
          className="fixed inset-0 z-40 bg-navy-deep/60 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-navy-deep text-slate-100 transition-all duration-300 border-r border-navy-light/40 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-navy-light/40 shrink-0">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-blue flex items-center justify-center shrink-0 shadow-sm">
              <Shield className="text-white" size={20} />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-wider text-white flex items-center gap-1.5">
                  PRAMAAN <span className="text-brand-blue font-black text-xs px-1 py-0.5 bg-brand-blue/20 rounded">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-tight">
                  Regulatory Verification
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-light/60 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Role Portal Badge */}
        <div className="px-3 py-2.5 bg-navy/60 border-b border-navy-light/30">
          <div
            className={`flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium ${
              role === 'admin'
                ? 'bg-amber-950/40 text-amber-300 border border-amber-800/50'
                : 'bg-blue-950/40 text-blue-300 border border-blue-800/50'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 mr-2 ${
                role === 'admin' ? 'bg-amber-400' : 'bg-brand-blue'
              }`}
            />
            {!collapsed && (
              <span className="truncate">
                {role === 'admin' ? 'Admin Verification Console' : 'Institutional Applicant Portal'}
              </span>
            )}
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-navy-light/50'
                }`}
                title={collapsed ? link.label : undefined}
              >
                <Icon
                  size={18}
                  className={`shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                {!collapsed && <span className="truncate">{link.label}</span>}
                {link.badge !== undefined && link.badge > 0 && (
                  <span
                    className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white text-brand-blue' : 'bg-brand-blue text-white'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-3 border-t border-navy-light/40 space-y-2 shrink-0 bg-navy/40">
          {/* Active profile snippet */}
          {!collapsed && (
            <div className="p-2.5 rounded-lg bg-navy-light/30 border border-navy-light/40">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Active Demo Identity
              </div>
              <div className="text-xs font-medium text-white truncate">
                {role === 'admin' ? currentReviewer.name : currentInstitution.name}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
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
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-navy-light/50 rounded-lg transition-colors"
            title="Switch portal view"
          >
            <RotateCcw size={15} className="text-amber-400 shrink-0" />
            {!collapsed && (
              <span>Switch to {role === 'admin' ? 'Applicant Portal' : 'Admin Console'}</span>
            )}
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={() => setShowResetDialog(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg transition-colors"
            title="Restore default mock dataset"
          >
            <RotateCcw size={15} className="shrink-0 text-slate-400" />
            {!collapsed && <span>Reset Demo Dataset</span>}
          </button>

          {/* Exit Demo button */}
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-navy-light/50 rounded-lg transition-colors"
            title="Exit demo"
          >
            <LogOut size={15} className="shrink-0" />
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
