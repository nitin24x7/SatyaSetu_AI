-- ============================================================================
-- SatyaSetu AI: Initial Seed Data for PostgreSQL Database
-- ============================================================================

INSERT INTO institutions (id, code, name, institution_type, registration_number, aishe_code, state, district, address, official_email, contact_number, representative_name, representative_designation, status)
VALUES
('a0000000-0000-0000-0000-000000000001', 'INST-001', 'National Institute of Technology Karnataka (Surathkal)', 'Autonomous Engineering College', 'NITK-KA-1960-GOI', 'C-26789', 'Karnataka', 'Dakshina Kannada', 'NH 66, Srinivasnagar, Surathkal, Mangaluru, Karnataka 575025', 'registrar@nitk.edu.in', '+91 824 2474000', 'Dr. Suresh Kumar Nayak', 'Dean of Academic Affairs', 'Active'),
('a0000000-0000-0000-0000-000000000002', 'INST-002', 'Vellore Apex Academy of Technology', 'Deemed University', 'VAAT-TN-1984-EDU', 'U-04891', 'Tamil Nadu', 'Vellore', 'Katpadi Road, Vellore, Tamil Nadu 632014', 'dean.compliance@vaat.ac.in', '+91 416 2243091', 'Prof. Ananya Sundaram', 'Registrar & Regulatory Officer', 'Active'),
('a0000000-0000-0000-0000-000000000003', 'INST-003', 'Maharashtra Institute of Polytechnic & Technology', 'Polytechnic Institute', 'MIPT-MH-2005-BTE', 'S-12345', 'Maharashtra', 'Pune', 'Sector 28, Pradhikaran, Akurdi, Pune, Maharashtra 411044', 'contact@mipt-pune.org', '+91 20 27653168', 'Er. Rajesh Deshmukh', 'Principal', 'Pending Review'),
('a0000000-0000-0000-0000-000000000004', 'INST-004', 'Aryabhatta Global Technical Campus', 'Affiliated Technical Institute', 'AGTC-UP-2012-REG', 'C-55412', 'Uttar Pradesh', 'Gautam Buddha Nagar', 'Knowledge Park III, Greater Noida, UP 201306', 'admin@aryabhattatech.ac.in', '+91 120 4567890', 'Dr. Rakesh Verma', 'Director', 'Flagged'),
('a0000000-0000-0000-0000-000000000005', 'INST-005', 'Kalinga Premier Management & Research Foundation', 'Management Institute', 'KPMR-OD-2018-AICTE', 'C-78901', 'Odisha', 'Bhubaneswar', 'Chandaka Industrial Estate, Patia, Bhubaneswar, Odisha 751024', 'approvals@kalingapremier.edu', '+91 674 2725113', 'Dr. Subhashree Patnaik', 'Dean of Regulatory Compliance', 'Active'),
('a0000000-0000-0000-0000-000000000006', 'INST-006', 'Delhi State Technological University (Ambedkar Campus)', 'State University', 'DSTU-DL-1998-UNIV', 'U-01055', 'Delhi', 'North West Delhi', 'Bawana Road, Shahbad Daulatpur, Delhi 110042', 'regulatory@dstu.ac.in', '+91 11 27871018', 'Prof. Arvind K. Sharma', 'Director of Approvals', 'Active')
ON CONFLICT (code) DO NOTHING;

INSERT INTO reviewers (id, code, name, role, email, department, active_cases_count, is_active)
VALUES
('b0000000-0000-0000-0000-000000000001', 'REV-01', 'Dr. Priyadarshini Rao', 'Senior Compliance Director', 'priyadarshini.rao@satyasetu.gov.in', 'Higher Education Regulatory Cell', 4, true),
('b0000000-0000-0000-0000-000000000002', 'REV-02', 'Amitabh Sengupta', 'Technical Verification Officer', 'amitabh.sengupta@satyasetu.gov.in', 'Technical & Engineering Division', 3, true),
('b0000000-0000-0000-0000-000000000003', 'REV-03', 'Sunita Meena', 'Legal & Accreditation Auditor', 'sunita.meena@satyasetu.gov.in', 'Statutory Verification Directorate', 2, true),
('b0000000-0000-0000-0000-000000000004', 'REV-04', 'Vikramaditya Chauhan', 'Chief Compliance Assessor', 'vikram.chauhan@satyasetu.gov.in', 'Appeals & Special Reviews Cell', 1, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO compliance_rules (id, code, name, category, description, enabled, severity)
VALUES
('c0000000-0000-0000-0000-000000000001', 'RULE-01', 'Mandatory Document Completeness', 'Document Completeness', 'Checks whether all documents marked mandatory for application type are attached.', true, 'Critical'),
('c0000000-0000-0000-0000-000000000002', 'RULE-02', 'Institution Name Concordance', 'Entity Concordance', 'Verifies OCR extracted institution title against applicant records with fuzzy matching.', true, 'High'),
('c0000000-0000-0000-0000-000000000003', 'RULE-03', 'Registration Identifier Concordance', 'Entity Concordance', 'Validates registration number on certificate against master regulatory index.', true, 'Critical'),
('c0000000-0000-0000-0000-000000000004', 'RULE-04', 'Certificate Validity & Expiration', 'Temporal Validity', 'Ensures uploaded recognition and affiliation certificates are within valid calendar span.', true, 'High'),
('c0000000-0000-0000-0000-000000000005', 'RULE-05', 'Duplicate Document Hash Verification', 'Integrity Check', 'Cross-checks document digital fingerprint across historical applications.', true, 'Medium'),
('c0000000-0000-0000-0000-000000000006', 'RULE-06', 'Digital Seal & Authorized Signature Check', 'Forensic Check', 'Scans for presence and tamper markers of issuing authority seal.', true, 'Medium')
ON CONFLICT (code) DO NOTHING;

