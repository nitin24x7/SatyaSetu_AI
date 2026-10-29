import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Bell,
  Search,
  ChevronRight,
  ShieldAlert,
  User,
  Building2,
  ChevronDown,
  Info,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';

interface TopbarProps {
  role: 'applicant' | 'admin';
  onMobileMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ role, onMobileMenuToggle }) => {
  const {
    currentInstitution,
    institutions,
    setCurrentInstitutionId,
    currentReviewer,
    config,
    setCurrentReviewerId,
    unreadCount,
    applications,
  } = useApp();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [identityDropdownOpen, setIdentityDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIdentityDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResultsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute breadcrumbs
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const url = `/${pathParts.slice(0, index + 1).join('/')}`;
    let label = part.replace(/-/g, ' ');
    if (label === 'applicant') label = 'Institution Portal';
    if (label === 'admin') label = 'Admin Console';
    if (label.startsWith('PRM-')) label = `Case ${label}`;
    return { url, label };
  });

  // Filter applications for search
  const filteredApps = searchQuery.trim()
    ? applications.filter(
        (app) =>
          app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.applicationType.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between gap-4 transition-all">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb Trail */}
        <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 truncate font-medium">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.url}>
              {idx > 0 && <ChevronRight size={13} className="text-slate-300 shrink-0" />}
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-slate-900 font-semibold capitalize truncate">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.url}
                  className="hover:text-blue-600 capitalize transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center: Search input with auto-suggest - Smooth squircle */}
      <div ref={searchRef} className="relative hidden md:block max-w-xs w-full">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchResultsOpen(true);
            }}
            onFocus={() => setSearchResultsOpen(true)}
            placeholder="Search by ID, college, or type..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-2xl border border-slate-200/80 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Search Results Dropdown */}
        {searchResultsOpen && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-11 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
              Matching Applications ({filteredApps.length})
            </div>
            {filteredApps.length === 0 ? (
              <div className="text-xs text-slate-400 p-2">No matching applications found.</div>
            ) : (
              filteredApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => {
                    setSearchResultsOpen(false);
                    setSearchQuery('');
                    if (role === 'admin') {
                      navigate(`/admin/applications/${app.id}`);
                    } else {
                      navigate(`/applicant/applications/${app.id}`);
                    }
                  }}
                  className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span>{app.id}</span>
                    <span className="text-[10px] font-normal text-slate-400">{app.status}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{app.institutionName}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right: Demo status pill, Notifications, and Identity Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Simulated Demo Notice */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/60 text-blue-900 text-[11px] font-medium">
          <Sparkles size={13} className="text-blue-600" />
          <span>Statutory Verification Environment</span>
        </div>

        {/* Notifications Icon with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-2xl border border-slate-200/70 transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount(role) > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>
          <NotificationPanel
            isOpen={notificationOpen}
            onClose={() => setNotificationOpen(false)}
            role={role}
          />
        </div>

        {/* Identity / Profile Switcher */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIdentityDropdownOpen(!identityDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-2xl border border-slate-200/80 hover:bg-slate-50/80 transition-all text-left shadow-2xs"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {role === 'admin'
                ? currentReviewer.name.charAt(0)
                : currentInstitution.name.charAt(0)}
            </div>
            <div className="hidden md:block max-w-[130px]">
              <div className="text-xs font-semibold text-slate-800 truncate">
                {role === 'admin' ? currentReviewer.name : currentInstitution.name}
              </div>
              <div className="text-[10px] text-blue-700 font-medium truncate">
                {role === 'admin' ? currentReviewer.role : currentInstitution.representativeName}
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {/* Identity Switcher Menu */}
          {identityDropdownOpen && (
            <div className="absolute right-0 top-12 z-50 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Identity (Demo)
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Allows testing cross-institution and multi-reviewer behaviors.
                </div>
              </div>

              {role === 'applicant' ? (
                <div className="py-1 max-h-56 overflow-y-auto space-y-1">
                  {institutions.map((inst) => (
                    <button
                      key={inst.id}
                      onClick={() => {
                        setCurrentInstitutionId(inst.id);
                        setIdentityDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-start gap-2 ${
                        inst.id === currentInstitution.id
                          ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-200/60'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Building2 size={15} className="shrink-0 mt-0.5 text-blue-600" />
                      <div className="truncate">
                        <div className="truncate">{inst.name}</div>
                        <div className="text-[10px] text-slate-400">{inst.state} • {inst.institutionType}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-1 max-h-56 overflow-y-auto space-y-1">
                  {config.reviewers.map((rev) => (
                    <button
                      key={rev.id}
                      onClick={() => {
                        setCurrentReviewerId(rev.id);
                        setIdentityDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-start gap-2 ${
                        rev.id === currentReviewer.id
                          ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-200/60'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <User size={15} className="shrink-0 mt-0.5 text-blue-600" />
                      <div className="truncate">
                        <div className="truncate">{rev.name}</div>
                        <div className="text-[10px] text-slate-400">{rev.role}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <Link
                  to={role === 'applicant' ? '/applicant/profile' : '/admin/settings'}
                  onClick={() => setIdentityDropdownOpen(false)}
                  className="block px-3 py-1.5 text-xs text-blue-700 hover:underline font-semibold text-center"
                >
                  {role === 'applicant' ? 'Edit Institution Profile' : 'Configure Verification Settings'}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
