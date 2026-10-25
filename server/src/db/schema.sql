-- ============================================================================
-- SatyaSetu AI: Regulatory Document Authentication & Compliance Platform
-- Production PostgreSQL Relational Schema (Phase 3 Core Architecture)
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. Enumerated Domain Types
CREATE TYPE institution_type_enum AS ENUM (
    'Central University',
    'State University',
    'Deemed University',
    'Autonomous Engineering College',
    'Affiliated Technical Institute',
    'Polytechnic Institute',
    'Management Institute'
);

CREATE TYPE application_type_enum AS ENUM (
    'Institutional Recognition',
    'Compliance Review',
    'Document Verification',
    'Renewal / Extension',
    'Capacity Expansion Approval'
);

CREATE TYPE application_status_enum AS ENUM (
    'Draft',
    'Submitted',
    'Under Verification',
    'Action Required',
    'Resubmitted',
    'Verified',
    'Rejected'
);

CREATE TYPE risk_level_enum AS ENUM (
    'Low',
    'Medium',
    'High'
);

CREATE TYPE check_result_enum AS ENUM (
    'Pass',
    'Warning',
    'Fail',
    'Not Checked'
);

CREATE TYPE finding_severity_enum AS ENUM (
    'Info',
    'Low',
    'Medium',
    'High',
    'Critical'
);

CREATE TYPE document_category_enum AS ENUM (
    'Institutional Registration Certificate',
    'Affiliation / Recognition Certificate',
    'Accreditation Certificate',
    'Faculty Information',
    'Infrastructure Information',
    'Supporting Declaration',
    'Other Supporting Documents'
);

CREATE TYPE review_status_enum AS ENUM (
    'Pending',
    'Verified',
    'Flagged',
    'Rejected',
    'Missing'
);

CREATE TYPE actor_role_enum AS ENUM (
    'Applicant',
    'Administrator',
    'System'
);

-- 3. Trigger Function: Automatically Refresh updated_at Timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Institutions Master Table
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE, -- e.g. INST-001
    name VARCHAR(255) NOT NULL,
    institution_type institution_type_enum NOT NULL,
    registration_number VARCHAR(100) NOT NULL UNIQUE,
    aishe_code VARCHAR(50) NOT NULL UNIQUE,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    official_email CITEXT NOT NULL UNIQUE,
    contact_number VARCHAR(30) NOT NULL,
    representative_name VARCHAR(150) NOT NULL,
    representative_designation VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active', -- Active, Flagged, Pending Review, Suspended
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_institutions_aishe ON institutions (aishe_code);
CREATE INDEX IF NOT EXISTS idx_institutions_reg_num ON institutions (registration_number);
CREATE INDEX IF NOT EXISTS idx_institutions_state_type ON institutions (state, institution_type);
CREATE INDEX IF NOT EXISTS idx_institutions_metadata_gin ON institutions USING GIN (metadata);

CREATE TRIGGER set_timestamp_institutions
BEFORE UPDATE ON institutions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 5. Reviewers & Regulatory Assessors Roster Table
CREATE TABLE IF NOT EXISTS reviewers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE, -- e.g. REV-01
    name VARCHAR(150) NOT NULL,
    role VARCHAR(150) NOT NULL,
    email CITEXT NOT NULL UNIQUE,
    department VARCHAR(150) NOT NULL,
    active_cases_count INTEGER NOT NULL DEFAULT 0,
    public_key_fingerprint VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviewers_active ON reviewers (is_active, active_cases_count);

CREATE TRIGGER set_timestamp_reviewers
BEFORE UPDATE ON reviewers
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 6. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number VARCHAR(50) NOT NULL UNIQUE, -- e.g. SAT-2026-1001
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
    application_type application_type_enum NOT NULL,
    academic_year VARCHAR(20) NOT NULL DEFAULT '2026-2027',
    purpose TEXT NOT NULL,
    internal_reference VARCHAR(100),
    remarks TEXT,
    status application_status_enum NOT NULL DEFAULT 'Draft',
    risk_level risk_level_enum NOT NULL DEFAULT 'Low',
    assigned_reviewer_id UUID REFERENCES reviewers(id) ON DELETE SET NULL,
    reviewer_comments TEXT,
    rejection_reason TEXT,
    correction_due_date DATE,
    applicant_response TEXT,
    submitted_at TIMESTAMPTZ,
    decision_date TIMESTAMPTZ,
    sla_deadline TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_ref ON applications (reference_number);
CREATE INDEX IF NOT EXISTS idx_applications_institution ON applications (institution_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_risk ON applications (risk_level);
CREATE INDEX IF NOT EXISTS idx_applications_assigned_rev ON applications (assigned_reviewer_id);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON applications (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_metadata_gin ON applications USING GIN (metadata);

CREATE TRIGGER set_timestamp_applications
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 7. Statutory Documents Table (Encrypted S3/MinIO Integration)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    category document_category_enum NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
    s3_bucket VARCHAR(150) NOT NULL,
    s3_key VARCHAR(500) NOT NULL UNIQUE,
    s3_version_id VARCHAR(100),
    sha256_checksum VARCHAR(64) NOT NULL,
    encryption_algorithm VARCHAR(50) NOT NULL DEFAULT 'AES256', -- SSE-S3 or aws:kms
    kms_key_id VARCHAR(255),
    is_required BOOLEAN NOT NULL DEFAULT true,
    review_status review_status_enum NOT NULL DEFAULT 'Pending',
    preview_type VARCHAR(50) DEFAULT 'pdf',
    extracted_metadata JSONB DEFAULT '{}'::jsonb,
    ocr_confidence NUMERIC(5,2),
    tamper_scan_score NUMERIC(5,4) DEFAULT 0.0000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_app ON documents (application_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents (category);
CREATE INDEX IF NOT EXISTS idx_documents_review_status ON documents (review_status);
CREATE INDEX IF NOT EXISTS idx_documents_checksum ON documents (sha256_checksum);
CREATE INDEX IF NOT EXISTS idx_documents_extracted_gin ON documents USING GIN (extracted_metadata);

CREATE TRIGGER set_timestamp_documents
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 8. Verification Findings Table
CREATE TABLE IF NOT EXISTS verification_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    check_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity finding_severity_enum NOT NULL DEFAULT 'Info',
    status check_result_enum NOT NULL DEFAULT 'Pass',
    evidence TEXT NOT NULL,
    recommended_action TEXT,
    reviewer_comment TEXT,
    selected_for_correction BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_findings_app ON verification_findings (application_id);
CREATE INDEX IF NOT EXISTS idx_findings_doc ON verification_findings (document_id);
CREATE INDEX IF NOT EXISTS idx_findings_status_severity ON verification_findings (status, severity);

-- 9. Compliance Rules Definition Table
CREATE TABLE IF NOT EXISTS compliance_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE, -- e.g. RULE-01
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    severity finding_severity_enum NOT NULL DEFAULT 'High',
    rule_logic JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_rules_enabled ON compliance_rules (enabled);

CREATE TRIGGER set_timestamp_compliance_rules
BEFORE UPDATE ON compliance_rules
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 10. Immutable Append-Only Audit Ledger Table (Tamper-Evident Hash Chained)
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    actor_id VARCHAR(100) NOT NULL,
    actor_name VARCHAR(150) NOT NULL,
    actor_role actor_role_enum NOT NULL,
    action VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    previous_status application_status_enum,
    new_status application_status_enum,
    comment TEXT,
    payload_snapshot JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    previous_event_hash VARCHAR(64), -- Merkle-style hash chaining
    current_event_hash VARCHAR(64) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_app ON audit_events (application_id);
CREATE INDEX IF NOT EXISTS idx_audit_institution ON audit_events (institution_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_events (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_events (actor_id, actor_role);

-- Strict Immutability Trigger: Prohibit any UPDATE or DELETE operations on audit_events
CREATE OR REPLACE FUNCTION enforce_audit_immutability()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'CRITICAL SECURITY VIOLATION: Audit ledger records are strictly immutable. UPDATE or DELETE operations are prohibited.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_audit_ledger_immutability
BEFORE UPDATE OR DELETE ON audit_events
FOR EACH ROW
EXECUTE FUNCTION enforce_audit_immutability();

-- 11. Multi-Channel Notification Outbox Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_role VARCHAR(50) NOT NULL, -- applicant, admin, all
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL DEFAULT 'info', -- info, success, warning, error
    is_read BOOLEAN NOT NULL DEFAULT false,
    email_dispatched BOOLEAN NOT NULL DEFAULT false,
    sms_dispatched BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications (recipient_role, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_institution ON notifications (institution_id);

