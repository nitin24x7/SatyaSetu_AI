import { StringSimilarity } from '../compliance/stringSimilarity';
import { ConcordanceMatcher } from '../compliance/concordanceMatcher';
import { TemporalValidator } from '../compliance/temporalValidator';
import { StatutoryCalculus } from '../compliance/statutoryCalculus';
import { complianceService } from '../compliance/complianceService';

async function runComplianceVerification() {
  console.log('================================================================');
  console.log('       SATYASETU AI — PHASE 5 COMPLIANCE & CONCORDANCE ENGINE   ');
  console.log('================================================================\n');

  // --- 1. Test String Similarity Engine ---
  console.log('--- 1. Testing String Similarity & Metric Derivations ---');
  const exact = StringSimilarity.evaluate(
    'National Institute of Technology Karnataka',
    'National Institute of Technology Karnataka'
  );
  console.log(`[Exact Match] Confidence: ${exact.confidence}, MatchLevel: ${exact.matchLevel}`);
  if (exact.matchLevel !== 'EXACT_MATCH' || exact.confidence !== 1.0) {
    throw new Error('Exact match failed');
  }

  const tokenReorder = StringSimilarity.evaluate(
    'National Institute of Technology Karnataka (Surathkal)',
    'Karnataka National Institute of Technology Surathkal'
  );
  console.log(`[Token Reorder] Jaro-Winkler: ${tokenReorder.jaroWinklerSimilarity}, TokenSort: ${tokenReorder.tokenSortRatio}, Confidence: ${tokenReorder.confidence}, MatchLevel: ${tokenReorder.matchLevel}`);
  if (tokenReorder.matchLevel !== 'STRONG_MATCH' && tokenReorder.matchLevel !== 'EXACT_MATCH') {
    throw new Error('Token reorder should yield strong match');
  }

  const mismatch = StringSimilarity.evaluate(
    'National Institute of Technology Karnataka',
    'Indian Institute of Science Bangalore'
  );
  console.log(`[Discrepancy] Confidence: ${mismatch.confidence}, MatchLevel: ${mismatch.matchLevel}`);
  if (mismatch.matchLevel !== 'DISCREPANCY') {
    throw new Error('Unrelated names should yield discrepancy');
  }

  // --- 2. Test Concordance Cross-Referencer ---
  console.log('\n--- 2. Testing Field Concordance Matcher ---');
  const concordanceReport = ConcordanceMatcher.match({
    declared: {
      institutionName: 'National Institute of Technology Karnataka (Surathkal)',
      institutionType: 'Autonomous Engineering College',
      aisheCode: 'C-26789',
      registrationNumber: 'NITK-KA-1960-GOI',
    },
    extractedEntities: {
      institution_name: { extractedValue: 'National Institute of Technology Karnataka, Surathkal' },
      aishe_code: { extractedValue: 'C-26789' },
      registration_identifier: { extractedValue: 'NITK-KA-1960-GOI' },
      statutory_classification: { extractedValue: 'Autonomous Engineering College' },
    },
  });
  console.log(`Overall Concordance Score: ${concordanceReport.overallScore}/100`);
  console.log(`Concordance Status: ${concordanceReport.concordanceStatus}`);
  console.log(`Total Fields Compared: ${concordanceReport.totalFieldsCompared}`);
  console.log(`Concordant Fields: ${concordanceReport.concordantCount}, Warnings: ${concordanceReport.warningCount}, Mismatches: ${concordanceReport.mismatchCount}`);
  if (concordanceReport.concordanceStatus !== 'CONCORDANT') {
    throw new Error('Expected CONCORDANT status');
  }

  // --- 3. Test Temporal Validity Validator ---
  console.log('\n--- 3. Testing Temporal Validity & Expiration Engine ---');
  const temporalChecks = TemporalValidator.evaluate([
    {
      category: 'Affiliation / Recognition Certificate',
      extractedMetadata: { issue_date: '2024-06-01', valid_through: '2027-06-30' },
    },
    {
      category: 'Accreditation Certificate',
      extractedMetadata: { issue_date: '2023-01-10', accreditation_validity: '2028-12-31' },
    },
  ], '2026-2027');

  for (const t of temporalChecks) {
    console.log(`- ${t.certificateType}: Status=${t.status}, Valid=${t.isValid}, DaysRemaining=${t.daysRemaining}`);
  }

  // --- 4. Test Statutory Cadre & Infrastructure Calculus ---
  console.log('\n--- 4. Testing Statutory Calculus (Cadre SFR & Infrastructure Area) ---');
  // Compliant Case: 4200 students, 284 faculty (SFR 1:14.8)
  const cadreCompliant = StatutoryCalculus.evaluateCadre({
    totalStudents: 4200,
    professors: 42,
    assocProfessors: 78,
    asstProfessors: 164,
  });
  console.log(`[Cadre Compliant] Calculated SFR 1:${cadreCompliant.calculatedSfr} (Ceiling 1:${cadreCompliant.mandatedSfrCeiling}), Compliant: ${cadreCompliant.isSfrCompliant}`);
  if (!cadreCompliant.isSfrCompliant) throw new Error('Cadre check should be compliant');

  // Deficit Case: 4200 students, only 150 faculty (SFR 1:28 > 1:20 ceiling)
  const cadreDeficit = StatutoryCalculus.evaluateCadre({
    totalStudents: 4200,
    professors: 10,
    assocProfessors: 40,
    asstProfessors: 100,
  });
  console.log(`[Cadre Deficit] Calculated SFR 1:${cadreDeficit.calculatedSfr}, Compliant: ${cadreDeficit.isSfrCompliant}`);
  if (cadreDeficit.isSfrCompliant) throw new Error('Cadre deficit should fail');

  // Infrastructure Carpet Area
  const infraCompliant = StatutoryCalculus.evaluateInfrastructure({
    totalStudents: 4200,
    actualBuiltCarpetArea: 58500,
  });
  console.log(`[Infra Carpet Area] Actual: ${infraCompliant.totalBuiltAreaSqM} sq.m vs Required: ${infraCompliant.mandatedMinimumSqM} sq.m (${infraCompliant.deficitSurplusPercent}% surplus), Compliant: ${infraCompliant.isCompliant}`);

  // --- 5. Test Pluggable Rule Engine & Application Evaluation ---
  console.log('\n--- 5. Testing Full Statutory Rule Engine Evaluation ---');
  const registeredRules = complianceService.getRegisteredRules();
  console.log(`Total Registered Statutory Rules: ${registeredRules.length}`);
  registeredRules.forEach((r, idx) => {
    console.log(`  ${idx + 1}. [${r.code}] ${r.title} (Weight: ${r.weight}%, Category: ${r.category})`);
  });

  const evaluationSummary = await complianceService.evaluateApplication('PRM-2026-1001');
  if (evaluationSummary) {
    console.log(`\nEvaluation Summary for ${evaluationSummary.applicationId}:`);
    console.log(`- Overall Compliance Score: ${evaluationSummary.overallScore}/100`);
    console.log(`- Computed Risk Level: ${evaluationSummary.riskLevel}`);
    console.log(`- Recommended Decision: ${evaluationSummary.recommendedDecision}`);
    console.log(`- Total Findings Evaluated: ${evaluationSummary.findings.length}`);
    const passCount = evaluationSummary.findings.filter((f) => f.status === 'Pass').length;
    const warnCount = evaluationSummary.findings.filter((f) => f.status === 'Warning').length;
    const failCount = evaluationSummary.findings.filter((f) => f.status === 'Fail').length;
    console.log(`  * Passes: ${passCount}, Warnings: ${warnCount}, Failures: ${failCount}`);
  } else {
    throw new Error('Application evaluation failed for PRM-2026-1001');
  }

  console.log('\n================================================================');
  console.log('       ALL PHASE 5 COMPLIANCE & CONCORDANCE TESTS PASSED        ');
  console.log('================================================================\n');

  process.exit(0);
}

runComplianceVerification().catch((err) => {
  console.error('[Verification Failure]', err);
  process.exit(1);
});
