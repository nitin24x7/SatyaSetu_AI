import { jwtService } from '../auth/jwtService';
import { totpService } from '../auth/totpService';
import { rbacService } from '../auth/rbacService';
import { authService } from '../auth/authService';
import { digiLockerService } from '../integrations/digiLockerService';
import { aadhaarESignService } from '../integrations/aadhaarESignService';
import { nadAisheSyncService } from '../integrations/nadAisheSyncService';

async function runAuthVerification() {
  console.log('================================================================');
  console.log('    SATYASETU AI — PHASE 6 IDENTITY & STATUTORY INTEGRATIONS    ');
  console.log('================================================================\n');

  // --- 1. Test JWT Signing, Verification & Blacklisting ---
  console.log('--- 1. Testing JWT Access Token Lifecycle & Signatures ---');
  const token = jwtService.signAccessToken({
    sub: 'USR-TEST-001',
    email: 'test.registrar@nitk.edu.in',
    name: 'Dr. Test Registrar',
    role: 'InstitutionalApplicant',
    institutionId: 'INST-001',
    scopes: ['applicant:submit', 'applicant:read', 'applicant:resubmit'],
  });
  console.log(`[JWT Signed] Token length: ${token.length} chars (HS256)`);

  const verified = await jwtService.verifyAccessToken(token);
  if (!verified || verified.sub !== 'USR-TEST-001') {
    throw new Error('JWT verification failed for valid token');
  }
  console.log(`[JWT Verified] Subject: ${verified.sub}, Role: ${verified.role}, Scopes: ${verified.scopes.join(', ')}`);

  // Test Tampered Token
  const tampered = token.substring(0, token.length - 6) + 'AAAAAA';
  const tamperedResult = await jwtService.verifyAccessToken(tampered);
  if (tamperedResult !== null) {
    throw new Error('Tampered JWT token should have been rejected');
  }
  console.log('[JWT Security] Tampered signature correctly rejected.');

  // Test Blacklisting
  await jwtService.blacklistAccessToken(token);
  const blacklistedResult = await jwtService.verifyAccessToken(token);
  if (blacklistedResult !== null) {
    throw new Error('Blacklisted token was not rejected');
  }
  console.log('[JWT Revocation] Blacklisted token rejected immediately.');

  // --- 2. Test TOTP MFA (RFC 6238) ---
  console.log('\n--- 2. Testing RFC 6238 TOTP Multi-Factor Authentication ---');
  const secret = totpService.generateSecret();
  console.log(`[TOTP Secret] Generated 160-bit Base32 secret: ${secret.substring(0, 8)}... (32 chars)`);

  const code = totpService.generateCode(secret);
  console.log(`[TOTP Code] Active 6-digit code: ${code}`);

  const isCodeValid = totpService.verifyCode(secret, code);
  if (!isCodeValid) throw new Error('TOTP code validation failed');
  console.log('[TOTP Verification] Current time-window code verified successfully.');

  const isInvalidCodeRejected = !totpService.verifyCode(secret, '000000');
  if (!isInvalidCodeRejected) throw new Error('Invalid TOTP code should have failed');
  console.log('[TOTP Security] Incorrect TOTP token rejected.');

  const backupCodes = totpService.generateBackupCodes(4);
  console.log(`[MFA Backup Codes] Generated ${backupCodes.length} recovery codes: ${backupCodes.join(', ')}`);

  // --- 3. Test RBAC Scopes & Permissions ---
  console.log('\n--- 3. Testing Role-Based Access Control (RBAC) Matrices ---');
  const applicantScopes = rbacService.getScopesForRole('InstitutionalApplicant');
  console.log(`Applicant Scopes: [${applicantScopes.join(', ')}]`);
  if (!rbacService.hasScope(applicantScopes, 'applicant:submit')) {
    throw new Error('Applicant missing submit scope');
  }

  const directorScopes = rbacService.getScopesForRole('ComplianceDirector');
  console.log(`Director Scopes: [${directorScopes.join(', ')}]`);
  if (!rbacService.hasScope(directorScopes, 'admin:decide')) {
    throw new Error('Director missing decide scope');
  }

  // --- 4. Test Complete Login & MFA Workflow ---
  console.log('\n--- 4. Testing End-to-End Authentication Flows ---');
  // Case A: Direct Login (Assessor without MFA)
  const directLogin = await authService.login('amitabh.sengupta@satyasetu.gov.in');
  if (!directLogin.tokens) throw new Error('Direct login should issue tokens');
  console.log(`[Direct Login] Assessor ${directLogin.tokens.user.email} logged in. Token expires in ${directLogin.tokens.expiresIn}s.`);

  // Case B: MFA Login (Registrar with MFA enabled)
  const mfaLogin = await authService.login('registrar@nitk.edu.in');
  if (!mfaLogin.mfaChallenge) throw new Error('Expected MFA challenge for registrar');
  console.log(`[MFA Challenge] Issued sessionId: ${mfaLogin.mfaChallenge.mfaSessionId}, destination: ${mfaLogin.mfaChallenge.maskedDestination}`);

  // Generate valid TOTP using registrar's demo secret
  const registrarSecret = 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP';
  const registrarCode = totpService.generateCode(registrarSecret);

  const mfaCompleted = await authService.verifyMfa(mfaLogin.mfaChallenge.mfaSessionId, registrarCode);
  if (!mfaCompleted.accessToken) throw new Error('MFA verification should issue access token');
  console.log(`[MFA Completed] Session established for ${mfaCompleted.user.name} (${mfaCompleted.user.role})`);

  // Token Rotation Test
  const rotated = await authService.refreshToken(mfaCompleted.refreshToken);
  if (!rotated.accessToken) throw new Error('Refresh token rotation failed');
  console.log(`[Token Rotation] Fresh access token issued via refresh token.`);

  // --- 5. Test Statutory Government Integrations ---
  console.log('\n--- 5. Testing National DigiLocker API Integration ---');
  const digiDoc = await digiLockerService.pullDocument({
    docUri: 'in.gov.education.ugc-charter-1960',
    docType: 'CHARTER',
    consent: true,
    institutionAisheCode: 'C-26789',
  });
  console.log(`[DigiLocker Pull] Document: "${digiDoc.documentTitle}"`);
  console.log(`  * Issuer: ${digiDoc.issuerName}`);
  console.log(`  * Issued To: ${digiDoc.issuedTo}`);
  console.log(`  * PKI Signature: ${digiDoc.digitalSignature.signerName} (${digiDoc.digitalSignature.certifyingAuthority})`);
  console.log(`  * Verification Status: ${digiDoc.verificationStatus}`);
  if (digiDoc.verificationStatus !== 'VERIFIED') throw new Error('DigiLocker pull verification failed');

  console.log('\n--- 6. Testing Aadhaar eSign & DSC Verification Engine ---');
  const esignResult = await aadhaarESignService.verifyDigitalSignature({
    documentId: 'DOC-AFFIDAVIT-9001',
    fileName: 'Declaration_Affidavit_2026.pdf',
    signatureHex: 'A3F98B2C41D809E1823B1948AC482910EB829102938471928374918237491823',
  });
  console.log(`[eSign Verified] Signer: ${esignResult.signerName} (${esignResult.signerDesignation})`);
  console.log(`  * Certifying Authority: ${esignResult.certifyingAuthority}`);
  console.log(`  * Non-repudiation: ${esignResult.nonRepudiationGuaranteed}`);
  console.log(`  * Audit Trail Reference: ${esignResult.auditTrailReference}`);
  if (!esignResult.isSignatureValid) throw new Error('eSign verification failed');

  console.log('\n--- 7. Testing Ministry of Education AISHE Registry Sync ---');
  const aisheRecord = await nadAisheSyncService.syncAishe({ aisheCode: 'C-26789' });
  console.log(`[AISHE Sync] Institution: ${aisheRecord.legalName}`);
  console.log(`  * Sanctioned Intake: ${aisheRecord.totalSanctionedIntake} students`);
  console.log(`  * Accredited Programs: ${aisheRecord.accreditedProgramsCount}`);
  console.log(`  * Standing: ${aisheRecord.statutoryStanding}`);
  if (aisheRecord.statutoryStanding !== 'ACTIVE_GOOD_STANDING') throw new Error('AISHE sync failed');

  console.log('\n--- 8. Testing Government Adapter Health Telemetry ---');
  const statuses = await nadAisheSyncService.getGatewayStatus();
  statuses.forEach((s) => {
    console.log(`  * [${s.status}] ${s.service} (Latency: ${s.responseTimeMs}ms, Security: ${s.securityStandard})`);
  });

  console.log('\n================================================================');
  console.log('   ALL PHASE 6 IDENTITY & STATUTORY INTEGRATION TESTS PASSED    ');
  console.log('================================================================\n');

  process.exit(0);
}

runAuthVerification().catch((err) => {
  console.error('[Verification Failure]', err);
  process.exit(1);
});

