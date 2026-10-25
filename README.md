# SatyaSetu AI — Institutional Verification & Compliance Platform

> **AI-Powered Regulatory Application Validation, Document Authentication & Compliance Verification Platform**  
> *Production Architecture: Frontend, Core Microservices Backend & IDP Pipeline (Phase 4 Completed)*

---

## 🏛️ Platform Overview

**SatyaSetu AI** is an enterprise-grade regulatory compliance and document authentication platform built for institutional applicants (colleges, universities, polytechnics) and authorized regulatory administrators (councils, accreditation directorates, and evaluators).

The platform delivers an integrated regulatory lifecycle:
1. **Institutional Submission Portal**: Multi-step application creation wizard with client-side file inspection, checksum validation, and encrypted storage tickets.
2. **Deterministic Compliance Engine**: Automated validation rules checking entity title concordance, statutory registration validity, temporal certificate validity, and digital seal markers.
3. **Admin 3-Panel Inspection Workspace**: High-density review console providing simultaneous document checklists, optical document rendering with forensic seal ribbons, and field-level entity concordance inspectors.
4. **Bidirectional Review & Remediation Loop**: Structured assessor correction requests with specific findings → Applicant resolution and replacement uploads → Assessor re-audit and recorded statutory decision.
5. **Core Microservices Backend (Phase 3 Completed)**:
   - **PostgreSQL Relational Schema**: Normalized relational design with UUID primary keys, GIN indexes on extracted metadata, foreign key constraints, and tamper-evident append-only audit triggers.
   - **Encrypted S3 / MinIO Document Storage**: Presigned upload and download URLs with Server-Side Encryption (`AES256` / `aws:kms`), SHA-256 checksum tracking, and MIME verification.
   - **Redis Caching & Distributed Locks**: Cache-aside caching layer, distributed review locks preventing simultaneous assessor state collisions, and sliding-window rate limiters.
   - **Dual Gateways (REST & GraphQL)**: Production Express REST API with RFC 7807 error envelopes and high-throughput GraphQL Gateway.
   - **OpenAPI 3.1 Specification**: Comprehensive contract documentation served interactively via Swagger UI at `/api-docs`.
6. **Intelligent Document Processing & Multilingual OCR (Phase 4 Completed)**:
   - **Document Preprocessor**: Automatic DPI upsampling/calibration to 300 DPI, geometric deskew angle compensation, contrast enhancement, and layout decomposition into Gazette titles, seal/stamp zones, signature blocks, and tabular matrices.
   - **Multilingual OCR Engine**: Token-level optical character extraction with spatial bounding boxes (`x, y, width, height`), confidence scores, and raw text synthesis.
   - **Tabular Matrix Parser**: Structured extraction for faculty cadre rosters and infrastructure floor areas with mathematical consistency checks (AICTE SFR 1:20 ceiling, cadre sum reconciliation).
   - **Key-Value Entity Extractor**: Targeted extraction of Indian regulatory attributes (AISHE code, charter ID, accreditation tier, sanctioned intake, issuing directorate).
   - **Forensic Tamper Detection**: Computes document risk scores, resolution deficiency flags, and tabular anomalies.
   - **Asynchronous IDP Queue**: Redis/in-memory stage progression (`QUEUED` -> `PREPROCESSING` -> `EXTRACTING_OCR` -> `PARSING_TABLES` -> `EXTRACTING_ENTITIES` -> `COMPLETED`).

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Institutional Client Layer"]
        A["Institutional Applicant Portal"]
        B["Admin Verification Console"]
        C["API Client Bridge (REST & GraphQL)"]
    end

    subgraph Gateway["Core Microservices Gateway (Port 4000)"]
        D["REST API Gateway (/api/v1/*)"]
        E["GraphQL Gateway (/graphql)"]
        F["OpenAPI Swagger UI (/api-docs)"]
        G["Health & Telemetry (/health)"]
    end

    subgraph CoreServices["Domain Services Layer"]
        H["Application Lifecycle Service"]
        I["Storage Service (S3 / MinIO)"]
        J["Cache & Distributed Lock Service"]
        IDP["IDP & Multilingual OCR Pipeline\n(Preprocessor, OCR, Tables, KVP)"]
    end

    subgraph Persistence["Enterprise Persistence Layer"]
        K[("PostgreSQL 15+\nNormalized Schema & Triggers")]
        L[("Redis Cluster\nCache, Queues & Locks")]
        M[("Encrypted S3 / MinIO\nStatutory Dossiers")]
    end

    A --> C
    B --> C
    C --> D
    C --> E
    D --> H
    D --> I
    D --> IDP
    E --> H
    E --> IDP
    H --> J
    H --> K
    I --> M
    J --> L
    IDP --> L
    IDP --> I
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18.0+ or v20+ recommended)
- npm (v9+ or v10+)
- PostgreSQL 14+ (optional for local standalone mode; seed scripts included)
- Redis 6+ (optional; resilient in-memory fallback included)
- AWS S3 or MinIO (optional; presigned generator operates with mock/live credentials)

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory (optional defaults are already preconfigured):
```env
# Server Gateway
PORT=4000
HOST=0.0.0.0
NODE_ENV=development

# PostgreSQL Connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/satyasetu
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=satyasetu

# Redis Caching & Lock Service
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# S3 / MinIO Encrypted Storage
S3_BUCKET_NAME=satyasetu-statutory-documents
AWS_REGION=ap-south-1
S3_ENDPOINT=http://localhost:9000
S3_FORCE_PATH_STYLE=true
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
S3_ENCRYPTION=AES256
```

### 3. Running Frontend & Backend Services

#### Run Both Concurrently:
```bash
npm run dev:all
```

#### Run Frontend Only (Vite on port 5173):
```bash
npm run dev
```

#### Run Backend Server Only (Port 4000):
```bash
npm run server:dev
```

#### Build for Production:
```bash
# Build Frontend
npm run build

# Build Backend TypeScript Server
npm run server:build

# Start Production Backend
npm run server:start

# Run Automated IDP Pipeline Test Suite
npm run test:idp
```

---

## 📡 API Endpoints & Core Microservices

The microservices gateway exposes standardized REST and GraphQL endpoints:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `GET /health` | `GET` | Cluster readiness & liveness probe (PostgreSQL, Redis, S3/MinIO) |
| `GET /api-docs` | `GET` | **Interactive Swagger UI (OpenAPI 3.1 Explorer)** |
| `ALL /graphql` | `POST` | **GraphQL Gateway** for applications, dossiers, and audit queries |
| `/api/v1/applications` | `GET` | List applications with pagination, multi-field filters, and search |
| `/api/v1/applications` | `POST` | Create draft or execute formal application submission |
| `/api/v1/applications/:id` | `GET` | Retrieve complete application dossier with documents & findings |
| `/api/v1/applications/:id/verify` | `POST` | Transition application to `Under Verification` status |
| `/api/v1/applications/:id/assign` | `POST` | Assign or reassign regulatory reviewer |
| `/api/v1/applications/:id/corrections` | `POST` | Dispatch correction notice to applicant with flagged findings |
| `/api/v1/applications/:id/resubmit` | `POST` | Resubmit corrected application dossier |
| `/api/v1/applications/:id/decision` | `POST` | Record simulated regulatory approval (`Verified`) or `Rejected` |
| `/api/v1/applications/:id/override` | `POST` | Administrative override to reopen finalized cases |
| `/api/v1/documents/presigned-url` | `POST` | Generate encrypted S3/MinIO upload ticket with SSE-S3 headers |
| `/api/v1/documents/:id/download` | `GET` | Generate presigned temporary download URL |
| `/api/v1/institutions` | `GET` | Regulatory master directory of accredited institutions |
| `/api/v1/audit-logs` | `GET` | Immutable chronological compliance audit ledger |
| `/api/v1/reports/analytics` | `GET` | Aggregated throughput, clearance ratios, and failure statistics |
| `/api/v1/idp/process` | `POST` | Enqueue document for background asynchronous OCR & IDP pipeline |
| `/api/v1/idp/extract-sync` | `POST` | Synchronous OCR tokenization, table matrix parsing, and entity extraction |
| `/api/v1/idp/jobs/:jobId` | `GET` | Query real-time status, progress, bounding boxes, and extraction payload |
| `/api/v1/idp/jobs` | `GET` | List recent IDP processing jobs |
| `/api/v1/idp/categories` | `GET` | Supported regulatory document templates and formats |

---

## 💾 Database Schema (PostgreSQL DDL)

The relational schema is located at [`server/src/db/schema.sql`](file:///home/deepin/SatyaSetu/server/src/db/schema.sql).

### Key Relational Features:
- **`institutions`**: Master record tracking AISHE codes, statutory registration codes, classifications, and standing statuses.
- **`applications`**: Regulatory application cases with unique reference codes (`SAT-2026-XXXX`), risk classifications, reviewer assignments, and SLA deadlines.
- **`documents`**: Encrypted S3/MinIO metadata, storage keys, SHA-256 integrity checksums, and GIN-indexed `extracted_metadata` JSONB.
- **`verification_findings`**: Granular statutory check results (`Pass`, `Warning`, `Fail`), evidence strings, and assessor comments.
- **`audit_events`**: Append-only event ledger protected by a database trigger preventing `UPDATE` or `DELETE` operations, with cryptographic hash chaining to previous event records.
- **`reviewers`**: Assessor roster, departments, and active case workload counters.

To initialize a live PostgreSQL database:
```bash
psql -U postgres -d satyasetu -f server/src/db/schema.sql
psql -U postgres -d satyasetu -f server/src/db/seed.sql
```

---

## 🗺️ Application Routes

### Public / Role Selection
- `/` — Role selection dashboard connecting applicants and regulatory evaluators.

### Institutional Applicant Portal
- `/applicant/dashboard` — Overview metrics, status distribution, and recent submissions.
- `/applicant/applications` — Applications table with search, status filters, and sorting.
- `/applicant/applications/new` — 4-Step application creation wizard with file inspection.
- `/applicant/applications/:id` — Case dossier details, document replacement, and resubmission workflow.
- `/applicant/documents` — Institution-scoped statutory document library.
- `/applicant/notifications` — Alert center with unread filtering.
- `/applicant/profile` — Institution profile editor with persistence.

### Regulatory Admin Verification Console
- `/admin/dashboard` — Pipeline metrics, status distribution charts, and priority review queue.
- `/admin/applications` — Management table with multi-criteria filtering, bulk assignment, and CSV export.
- `/admin/applications/:id` — **3-Panel Review Workspace** (Checklist, Document Inspection Canvas, and Concordance Inspector).
- `/admin/review-queue` — Prioritized triage queue for new submissions, resubmissions, and high-risk cases.
- `/admin/institutions` — Institutional master directory.
- `/admin/reports` — Analytics, failure charts, and print-friendly compliance reports.
- `/admin/audit-logs` — Immutable append-only audit trail across all actions.
- `/admin/settings` — Configuration for application categories, document rules, and assessor rosters.

---

## 🛠️ Complete Technology Stack

### Frontend Architecture
- **Framework:** React 18 + TypeScript (Strict typing)
- **Bundler:** Vite
- **Styling:** Tailwind CSS (Custom institutional palette)
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **Routing:** React Router v6
- **Persistence:** LocalStorage with versioned fallback + API Client Bridge

### Backend Architecture (Phase 3 & Phase 4)
- **Server Runtime:** Node.js + TypeScript (`tsx` / `tsc`)
- **Web Framework:** Express 4 (Modular Routers & Controllers)
- **Database:** PostgreSQL 14+ (`pg.Pool` connection pooling + Transactions)
- **Object Storage:** AWS SDK v3 S3 Client (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) supporting AWS S3 and MinIO
- **Distributed Cache & Queue:** Redis / IORedis (`ioredis`) with resilient in-memory fallback
- **GraphQL:** GraphQL 16 (`graphql`, `graphql-http`)
- **API Documentation:** OpenAPI 3.1 + Swagger UI (`swagger-ui-express`, `yaml`)
- **Validation:** Zod schemas for all inbound DTOs
- **IDP & Document Preprocessing:** Automated 300 DPI calibration, deskew detection, contrast optimization, and geometric layout decomposition
- **Multilingual OCR Engine:** Token-level OCR extraction with spatial bounding box geometry (`x, y, width, height`), confidence metrics, and language tagging
- **Tabular Matrix Engine:** Structural parsing for faculty rosters and infrastructure carpet areas with mathematical consistency validation (AICTE SFR 1:20 ceiling verification)
- **Forensic Tamper Detection:** Tamper likelihood scoring and resolution anomaly flagging
