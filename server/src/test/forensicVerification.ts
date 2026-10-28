import { errorLevelAnalyzer } from '../forensics/elaAnalyzer';
import { copyMoveForgeryDetector } from '../forensics/cmfdAnalyzer';
import { pdfStructureInspector } from '../forensics/pdfStructureInspector';
import { perceptualHashEngine } from '../forensics/perceptualHashEngine';
import { forensicService } from '../forensics/forensicService';

async function runForensicVerification() {
  console.log('================================================================');
  console.log('   SATYASETU AI — PHASE 7 FORENSICS & VISUAL INTEGRITY ANALYSIS ');
  console.log('================================================================\n');

  // --- 1. Test Clean Document Baseline ---
  console.log('--- 1. Testing Clean Document Baseline (Authentic Gazette Scan) ---');
  const cleanReport = await forensicService.analyzeDocument({
    documentId: 'DOC-CLEAN-001',
    applicationId: 'PRM-2026-1001',
    institutionId: 'INST-001',
    fileName: 'NITK_Autonomous_Renewal_Cert.pdf',
    category: 'Institutional Registration Certificate',
  });

  console.log(`[Verdict] Status: ${cleanReport.verdict}, Tamper Likelihood Score: ${(cleanReport.tamperLikelihoodScore * 100).toFixed(0)}%`);
  console.log(`  * ELA Mean Error Rate: ${cleanReport.elaAnalysis.meanErrorRate}%, Variance: ${cleanReport.elaAnalysis.variance}`);
  console.log(`  * CMFD Keypoints Cloned: ${cleanReport.cmfdAnalysis.keypointMatchesFound}`);
  console.log(`  * PDF Incremental Updates: ${cleanReport.pdfInspection.incrementalUpdatesCount}`);
  console.log(`  * Authoring Hardware: ${cleanReport.metadataForensics.creatorTool}`);
  console.log(`  * Perceptual dHash: ${cleanReport.perceptualHash.dhash}`);
  console.log(`  * Total Anomalies: ${cleanReport.anomalies.length}`);

  if (cleanReport.verdict !== 'CLEAN' || cleanReport.tamperLikelihoodScore > 0.15) {
    throw new Error('Authentic document should have CLEAN verdict and low tamper score');
  }

  // --- 2. Test Spliced & Tampered Document Detection ---
  console.log('\n--- 2. Testing Spliced & Tampered Document Detection ---');
  const tamperedReport = await forensicService.analyzeDocument({
    documentId: 'DOC-TAMPERED-002',
    applicationId: 'PRM-2026-1002',
    institutionId: 'INST-006',
    fileName: 'Tampered_Intake_Sanction_Order.pdf',
    category: 'Approval / Extension Order',
    isSimulatedTampered: true,
  });

  console.log(`[Verdict] Status: ${tamperedReport.verdict}, Tamper Likelihood Score: ${(tamperedReport.tamperLikelihoodScore * 100).toFixed(0)}%`);
  console.log(`  * ELA High-Error Regions: ${tamperedReport.elaAnalysis.highErrorRegionsCount} zones flagged`);
  tamperedReport.elaAnalysis.suspiciousRegions.forEach((reg, i) => {
    console.log(`    - Zone ${i + 1}: [x:${reg.x}, y:${reg.y}, w:${reg.width}, h:${reg.height}] -> ${reg.description}`);
  });
  console.log(`  * PDF Overlaid Vector Layers: ${tamperedReport.pdfInspection.overlaidLayersDetected}`);
  console.log(`  * Suspicious Software Footprint: ${tamperedReport.metadataForensics.softwareFingerprint}`);
  console.log(`  * Critical Anomalies Detected: ${tamperedReport.anomalies.filter((a) => a.severity === 'CRITICAL').length}`);

  if (tamperedReport.verdict !== 'TAMPERED' || tamperedReport.tamperLikelihoodScore < 0.60) {
    throw new Error('Tampered document must yield TAMPERED verdict with score >= 0.60');
  }

  // --- 3. Test Copy-Move Forgery Detection (CMFD) ---
  console.log('\n--- 3. Testing Copy-Move Forgery Detection (Cloned Stamp / Seal) ---');
  const clonedReport = await forensicService.analyzeDocument({
    documentId: 'DOC-CLONED-003',
    applicationId: 'PRM-2026-1003',
    institutionId: 'INST-004',
    fileName: 'Duplicate_Seal_Declaration.pdf',
    category: 'Supporting Declaration',
    isSimulatedCloned: true,
  });

  console.log(`[Verdict] Status: ${clonedReport.verdict}, Tamper Likelihood Score: ${(clonedReport.tamperLikelihoodScore * 100).toFixed(0)}%`);
  console.log(`  * Keypoint Matches: ${clonedReport.cmfdAnalysis.keypointMatchesFound}`);
  if (clonedReport.cmfdAnalysis.clonedPairs.length > 0) {
    const pair = clonedReport.cmfdAnalysis.clonedPairs[0];
    console.log(`  * Cloned Pair Feature Similarity: ${(pair.featureSimilarity * 100).toFixed(1)}%`);
    console.log(`  * Source: ${pair.sourceBox.description}`);
    console.log(`  * Target: ${pair.targetBox.description}`);
  }

  if (!clonedReport.cmfdAnalysis.isCloned) {
    throw new Error('Copy-move forgery should be detected');
  }

  // --- 4. Test Cross-Institutional Document Recycling (pHash Deduplication) ---
  console.log('\n--- 4. Testing Cross-Institutional Document Recycling (pHash Deduplication) ---');
  const recycledReport = await forensicService.analyzeDocument({
    documentId: 'DOC-RECYCLED-004',
    applicationId: 'PRM-2026-1004',
    institutionId: 'INST-007',
    fileName: 'Recycled_Municipal_Blueprint.pdf',
    category: 'Infrastructure Information',
    isSimulatedRecycled: true,
  });

  console.log(`[Verdict] Status: ${recycledReport.verdict}, Tamper Likelihood Score: ${(recycledReport.tamperLikelihoodScore * 100).toFixed(0)}%`);
  console.log(`  * Is Recycled: ${recycledReport.perceptualHash.isRecycled}`);
  console.log(`  * Matched Application ID: ${recycledReport.perceptualHash.matchedPreviousApplicationId}`);
  console.log(`  * Matched Institution: ${recycledReport.perceptualHash.matchedPreviousInstitution}`);
  console.log(`  * Hamming Distance: ${recycledReport.perceptualHash.hammingDistance} bits (threshold <= 4)`);

  if (!recycledReport.perceptualHash.isRecycled) {
    throw new Error('Document recycling should be flagged');
  }

  // --- 5. Test Standalone Analyzers & Cache Ingestion ---
  console.log('\n--- 5. Testing Standalone Analyzers & Report Caching ---');
  const elaStandalone = errorLevelAnalyzer.analyze({ fileName: 'test_scan.png' });
  console.log(`[Standalone ELA] Mean error rate: ${elaStandalone.meanErrorRate}%`);

  const cmfdStandalone = copyMoveForgeryDetector.analyze({ fileName: 'test_seal.png' });
  console.log(`[Standalone CMFD] Cloned: ${cmfdStandalone.isCloned}`);

  const cached = await forensicService.getForensicReport('DOC-CLEAN-001');
  if (!cached || cached.documentId !== 'DOC-CLEAN-001') {
    throw new Error('Failed to retrieve cached forensic report');
  }
  console.log(`[Cache Verification] Successfully retrieved cached report for ${cached.documentId}`);

  console.log('\n================================================================');
  console.log('   ALL PHASE 7 FORENSICS & ANTI-FRAUD VERIFICATIONS PASSED      ');
  console.log('================================================================\n');

  process.exit(0);
}

runForensicVerification().catch((err) => {
  console.error('[Verification Failure]', err);
  process.exit(1);
});

