/**
 * SatyaSetu AI — Phase 9: Cryptographic Audit Ledger & Regulatory Reporting Verification
 * Production Test Suite verifying Hash Chaining, Tamper Detection, Merkle Roots, Certificates & BI
 */

import { cryptographicLedger } from '../ledger/cryptographicLedger';
import { certificateGenerator } from '../ledger/certificateGenerator';
import { regulatoryBiEngine } from '../ledger/regulatoryBiEngine';
import { gazetteReportGenerator } from '../ledger/gazetteReportGenerator';
import { ledgerService } from '../ledger/ledgerService';
import { applicationService } from '../services/applicationService';

async function runLedgerVerificationTests(): Promise<void> {
  console.log('================================================================');
  console.log('   SATYASETU AI — PHASE 9 IMMUTABLE LEDGER & BI VERIFICATION    ');
  console.log('================================================================\n');

  // --- 1. Testing Cryptographic Hash Chaining & Genesis Block ---
  console.log('--- 1. Testing Cryptographic Hash Chaining & Block Sequencer ---');

  const { blocks, total } = ledgerService.getBlocks({ limit: 10 });
  console.log(`[Ledger Initialized] Total Blocks in Chain: ${total}`);

  // Retrieve genesis block
  const genesis = blocks[blocks.length - 1]; // Oldest block is genesis
  console.log(`[Genesis Block] Seq #${genesis.sequenceNumber} | ID: ${genesis.blockId} | Action: ${genesis.actionType}`);
  console.log(`  * Genesis PrevHash: ${genesis.previousBlockHash.slice(0, 16)}...`);
  console.log(`  * Genesis BlockHash: ${genesis.blockHash.slice(0, 16)}...`);
  console.log(`  * Platform Signature: ${genesis.digitalSignature.slice(0, 16)}...`);

  if (genesis.sequenceNumber !== 0) throw new Error('Genesis block must have sequence 0.');
  if (genesis.previousBlockHash !== '0000000000000000000000000000000000000000000000000000000000000000') {
    throw new Error('Genesis block previousBlockHash must be null string (64 zeroes).');
  }

  // Append a live regulatory audit event
  const liveBlock = await ledgerService.recordAuditEvent({
    applicationId: 'PRM-2026-1001',
    institutionId: 'INST-001',
    actorId: 'REV-001',
    actorName: 'Dr. Amitabh Sengupta',
    actorRole: 'TechnicalAssessor',
    actionType: 'DOCUMENT_UPLOAD',
    actionDescription: 'Statutory verification audit completed for institutional campus architectural floor plans.',
    payload: {
      documentCategory: 'Infrastructure Information',
      carpetAreaSqM: 58500,
      inspectionPassed: true,
    },
  });

  console.log(`[Block Appended] Seq #${liveBlock.sequenceNumber} | ID: ${liveBlock.blockId}`);
  console.log(`  * Payload Hash: ${liveBlock.payloadHash.slice(0, 16)}...`);
  console.log(`  * Block Hash: ${liveBlock.blockHash.slice(0, 16)}...`);
  console.log(`  * Prev Block Hash: ${liveBlock.previousBlockHash.slice(0, 16)}...`);

  // --- 2. Testing Full Cryptographic Hash Chain Integrity ---
  console.log('\n--- 2. Testing Cryptographic Chain Verification ---');

  const cleanVerification = ledgerService.verifyChainIntegrity();
  console.log(`[Chain Verification] Status: ${cleanVerification.isValid ? 'VALID' : 'INVALID'}`);
  console.log(`  * Total Blocks Audited: ${cleanVerification.totalBlocks}`);
  console.log(`  * Verified Blocks: ${cleanVerification.verifiedBlocks}`);
  console.log(`  * Genesis Hash: ${cleanVerification.genesisHash.slice(0, 16)}...`);
  console.log(`  * Head Hash: ${cleanVerification.headHash.slice(0, 16)}...`);
  console.log(`  * Merkle Root: ${cleanVerification.merkleRoot.slice(0, 16)}...`);

  if (!cleanVerification.isValid) {
    throw new Error(`Clean chain verification failed: ${cleanVerification.tamperedDetails}`);
  }

  // --- 3. Testing Tamper Detection & Non-Repudiation ---
  console.log('\n--- 3. Testing Tamper Detection Engine ---');

  console.log('[Simulating Tamper] Injecting unauthorized modification into historical Block #1 payload in memory...');
  cryptographicLedger.simulateTampering(1, 'carpetAreaSqM', 99999);

  const tamperedVerification = ledgerService.verifyChainIntegrity();
  console.log(`[Tamper Check Result] Is Valid: ${tamperedVerification.isValid}`);
  console.log(`  * Tampered Block Index: Block #${tamperedVerification.tamperedBlockIndex}`);
  console.log(`  * Tamper Detection Evidence: "${tamperedVerification.tamperedDetails}"`);

  if (tamperedVerification.isValid) {
    throw new Error('Security failure: Retroactive tampering was not detected by cryptographic ledger.');
  }

  // Restore clean chain
  cryptographicLedger.restoreCleanChain();
  const restoredVerification = ledgerService.verifyChainIntegrity();
  console.log(`[Chain Restored] Integrity Re-verified: ${restoredVerification.isValid}`);

  // --- 4. Testing Binary Merkle Tree Root Computation ---
  console.log('\n--- 4. Testing Binary Merkle Tree Root Computation ---');

  const merkleRoot = await ledgerService.getMerkleRoot();
  console.log(`[Merkle Root] 256-bit Digest: ${merkleRoot}`);
  if (!merkleRoot || merkleRoot.length !== 64) {
    throw new Error('Merkle root must be a valid 64-character SHA-256 hexadecimal string.');
  }

  // --- 5. Testing Verifiable Compliance Clearance Certificate ---
  console.log('\n--- 5. Testing Compliance Clearance Certificate Generator ---');

  const testApp = await applicationService.getApplicationById('PRM-2026-1001');
  if (!testApp) throw new Error('Application PRM-2026-1001 not found.');
  testApp.status = 'Verified'; // Ensure verified for certificate generation

  const cert = await ledgerService.generateClearanceCertificate({
    applicationId: 'PRM-2026-1001',
    complianceScore: 95,
    sanctionedIntake: 4200,
    approvedProgramsCount: 14,
    calculatedSfr: 14.8,
    authorizerName: 'Prof. R. C. Sharma',
    authorizerDesignation: 'Chief Compliance Director & Regulatory Registrar',
  });

  console.log(`[Certificate Issued] Number: ${cert.certificateNumber}`);
  console.log(`  * Institution: ${cert.institutionName}`);
  console.log(`  * AISHE Code: ${cert.aisheCode} | Academic Year: ${cert.academicYear}`);
  console.log(`  * Approved Intake: ${cert.sanctionedIntake} students | Programs: ${cert.approvedProgramsCount}`);
  console.log(`  * Verified SFR: 1:${cert.calculatedSfr} | Compliance Score: ${cert.complianceScore}%`);
  console.log(`  * Valid Until: ${cert.validUntil}`);
  console.log(`  * Certificate Digest: ${cert.certificateDigest.slice(0, 16)}...`);
  console.log(`  * Digital Seal Signature: ${cert.digitalSealSignature.slice(0, 16)}...`);
  console.log(`  * QR Verification URL: ${cert.qrVerificationUrl}`);

  // Verify Certificate Authenticity
  const certVerification = await ledgerService.verifyCertificate(cert.certificateNumber);
  console.log(`[Certificate Authenticity Check] Status: ${certVerification.status}, Is Valid: ${certVerification.isValid}`);
  console.log(`  * Merkle Status: ${certVerification.merkleVerificationStatus}`);
  console.log(`  * Verification Message: "${certVerification.message}"`);

  if (!certVerification.isValid) throw new Error('Authentic certificate verification failed.');

  // Test Non-Existent Certificate Check
  const bogusVerification = await ledgerService.verifyCertificate('SAT-CERT-BOGUS-9999');
  console.log(`[Bogus Cert Check] Is Valid: ${bogusVerification.isValid}, Status: ${bogusVerification.status}`);
  if (bogusVerification.isValid) throw new Error('Bogus certificate was falsely verified.');

  // --- 6. Testing Regulatory Business Intelligence & Analytics ---
  console.log('\n--- 6. Testing Regulatory Business Intelligence & Deficit Indices ---');

  const bi = await ledgerService.getRegulatoryIntelligence();
  console.log(`[Macroeconomic BI Intelligence] Generated At: ${bi.generatedAt}`);
  console.log(`  * Total Applications: ${bi.overallMetrics.totalApplications}`);
  console.log(`  * Clearance Rate: ${bi.overallMetrics.clearanceRatePercent}%`);
  console.log(`  * Average Turnaround: ${bi.overallMetrics.averageTurnaroundDays} days`);
  console.log(`  * Statutory SLA Adherence: ${bi.overallMetrics.slaAdherencePercent}%`);

  console.log('\n[Regional State-Wise Distribution]:');
  bi.regionalDistribution.forEach((reg) => {
    console.log(`  * ${reg.state}: Total=${reg.totalApplications}, Approved=${reg.approved}, Rejected=${reg.rejected}, ComplianceRate=${reg.complianceRatePercent}%`);
  });

  console.log('\n[Common Statutory Deficit Frequency Indices]:');
  bi.defectFrequencyIndices.slice(0, 3).forEach((def, idx) => {
    console.log(`  ${idx + 1}. [${def.category}] ${def.defectName} (${def.percentageOfTotalDefects}%)`);
  });

  console.log(`\n[Tamper & Forensic Trends]: Total Scanned: ${bi.tamperForensicTrends.totalScanned}, Clean: ${bi.tamperForensicTrends.cleanCount}, Tampered: ${bi.tamperForensicTrends.tamperedCount} (${bi.tamperForensicTrends.tamperRatePercent}%)`);

  // --- 7. Testing Statutory Gazette Dossier Compilation ---
  console.log('\n--- 7. Testing Statutory Gazette Dossier Compilation ---');

  const gazette = await ledgerService.getGazetteDossier('PRM-2026-1001');
  console.log(`[Gazette Dossier] Reference: ${gazette.gazetteReference}`);
  console.log(`  * Title: ${gazette.title}`);
  console.log(`  * Publication Date: ${gazette.publicationDate}`);
  console.log(`  * Final Regulatory Verdict: "${gazette.finalRegulatoryVerdict}"`);
  console.log(`  * Merkle Notarization: ${gazette.merkleNotarizationHash.slice(0, 16)}...`);
  console.log(`  * Digital Attestation: ${gazette.digitalAttestation.slice(0, 16)}...`);

  console.log('\n================================================================');
  console.log('   ALL PHASE 9 IMMUTABLE LEDGER & BI TESTS PASSED               ');
  console.log('================================================================');
  process.exit(0);
}

runLedgerVerificationTests().catch((err) => {
  console.error('[Verification Failure]', err);
  process.exit(1);
});
