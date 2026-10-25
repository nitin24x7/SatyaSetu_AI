# PRAMAAN AI — Institutional Verification & Compliance Platform

> **Regulatory Application Validation, Document Authentication & Compliance Verification Platform**  
> *Frontend Prototype Implementation*

---

## 🏛️ Overview

**PRAMAAN AI** is a modern, high-trust institutional SaaS frontend prototype built for institutional applicants (colleges, universities, polytechnics) and authorized regulatory administrators.

The application delivers an interactive end-to-end simulation of:
1. **Applicant Submission**: Multi-step application wizard with file validation and simulated OCR extraction.
2. **Deterministic Compliance Verification**: Automated rule engine checks entity concordance, registration validity, certificate validity periods, and digital seal markers.
3. **Admin 3-Panel Workspace**: Document checklist, simulated document preview with zoom and forensic stamp ribbon, and field-level concordance inspector.
4. **Bidirectional Review Loop**: Assessor requests corrections with specific findings → Applicant receives notification and resolves issues → Assessor re-inspects resubmission and records decision.
5. **Audit Trail & Reporting**: Append-only activity log, analytics breakdown, and CSV export.

> [!NOTE]  
> **Simulation Notice:** This platform is strictly a frontend prototype. All optical extractions, verification checks, and institutional ratings are deterministically simulated. No real AI model, government API integration, or backend server is invoked.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 🗺️ Application Routes

### Public / Role Selection
- `/` — Interactive Entry Screen with role selector and demo data controls.

### Institutional Applicant Portal
- `/applicant/dashboard` — Overview with metric cards, status breakdown, and recent cases.
- `/applicant/applications` — Applications list with search, filter, and sort.
- `/applicant/applications/new` — 4-Step application creation wizard.
- `/applicant/applications/:id` — Case details, findings, document previews, and resubmission workflow.
- `/applicant/documents` — Institution-scoped document library.
- `/applicant/notifications` — Alert center with unread filtering.
- `/applicant/profile` — Institution profile editor with localStorage persistence.

### Regulatory Admin Verification Console
- `/admin/dashboard` — Operational metrics, status distribution, and priority queue.
- `/admin/applications` — Applications management table with multi-criteria filtering, bulk assignment, and CSV export.
- `/admin/applications/:id` — **3-Panel Review Workspace** (Checklist, Document Preview, Concordance & Findings).
- `/admin/review-queue` — Prioritized triage queue for new submissions, resubmissions, and high-risk cases.
- `/admin/institutions` — Institutional master directory.
- `/admin/reports` — Analytics, common statutory failure charts, and print view.
- `/admin/audit-logs` — Append-only event history across all cases.
- `/admin/settings` — Configuration for application categories, document rules, and assessor rosters.

---

## 🛠️ Technology Stack
- **Framework:** React 18 + TypeScript (Strict typing)
- **Bundler:** Vite
- **Styling:** Tailwind CSS (Custom institutional palette)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Routing:** React Router v6
- **Persistence:** LocalStorage with versioned safe fallback
