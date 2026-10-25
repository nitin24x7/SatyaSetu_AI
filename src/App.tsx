import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/ui/Toast';
import { AppShell } from './components/layout/AppShell';
import { WelcomePage } from './pages/WelcomePage';

// Applicant Pages
import { ApplicantDashboard } from './features/applicant/pages/ApplicantDashboard';
import { ApplicantApplicationsPage } from './features/applicant/pages/ApplicantApplicationsPage';
import { NewApplicationPage } from './features/applicant/pages/NewApplicationPage';
import { ApplicantApplicationDetailPage } from './features/applicant/pages/ApplicantApplicationDetailPage';
import { ApplicantDocumentsPage } from './features/applicant/pages/ApplicantDocumentsPage';
import { ApplicantNotificationsPage } from './features/applicant/pages/ApplicantNotificationsPage';
import { ApplicantProfilePage } from './features/applicant/pages/ApplicantProfilePage';

// Admin Pages
import { AdminDashboard } from './features/admin/pages/AdminDashboard';
import { AdminApplicationsPage } from './features/admin/pages/AdminApplicationsPage';
import { AdminReviewWorkspacePage } from './features/admin/pages/AdminReviewWorkspacePage';
import { AdminReviewQueuePage } from './features/admin/pages/AdminReviewQueuePage';
import { AdminInstitutionsPage } from './features/admin/pages/AdminInstitutionsPage';
import { AdminReportsPage } from './features/admin/pages/AdminReportsPage';
import { AdminAuditLogsPage } from './features/admin/pages/AdminAuditLogsPage';
import { AdminSettingsPage } from './features/admin/pages/AdminSettingsPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Entry welcome screen */}
            <Route path="/" element={<WelcomePage />} />

            {/* Applicant Portal nested routes */}
            <Route path="/applicant" element={<AppShell role="applicant" />}>
              <Route index element={<Navigate to="/applicant/dashboard" replace />} />
              <Route path="dashboard" element={<ApplicantDashboard />} />
              <Route path="applications" element={<ApplicantApplicationsPage />} />
              <Route path="applications/new" element={<NewApplicationPage />} />
              <Route path="applications/:id" element={<ApplicantApplicationDetailPage />} />
              <Route path="documents" element={<ApplicantDocumentsPage />} />
              <Route path="notifications" element={<ApplicantNotificationsPage />} />
              <Route path="profile" element={<ApplicantProfilePage />} />
            </Route>

            {/* Admin Verification nested routes */}
            <Route path="/admin" element={<AppShell role="admin" />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="applications" element={<AdminApplicationsPage />} />
              <Route path="applications/:id" element={<AdminReviewWorkspacePage />} />
              <Route path="review-queue" element={<AdminReviewQueuePage />} />
              <Route path="institutions" element={<AdminInstitutionsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Fallback to welcome screen */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
};
