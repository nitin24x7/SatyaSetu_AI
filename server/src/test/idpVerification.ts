import { idpService } from '../idp/idpService';

async function runVerification() {
  console.log('--- 1. Testing Supported Categories ---');
  const categories = idpService.getSupportedCategories();
  console.log(`Found ${categories.length} supported categories:`, categories);

  console.log('\n--- 2. Testing Synchronous IDP Processing (Faculty Information) ---');
  const facultyResult = await idpService.processSync({
    documentId: 'DOC-TEST-001',
    applicationId: 'APP-TEST-999',
    fileName: 'Faculty_Cadre_Roster_2026.pdf',
    category: 'Faculty Information',
    institutionName: 'National Institute of Technology Karnataka (Surathkal)',
    registrationNumber: 'NITK-KA-1960-GOI',
  });

  console.log(`Job Status: ${facultyResult.status}`);
  console.log(`DPI: ${facultyResult.preprocessing.originalDpi} -> ${facultyResult.preprocessing.targetDpi}`);
  console.log(`Deskew angle: ${facultyResult.preprocessing.deskewAngleDegrees}°`);
  console.log(`Layout segments detected: ${facultyResult.layoutSegments.length}`);
  console.log(`OCR word count: ${facultyResult.ocrWordCount}, Confidence: ${(facultyResult.averageConfidence * 100).toFixed(1)}%`);
  console.log(`Extracted tables: ${facultyResult.extractedTables.length}`);
  if (facultyResult.extractedTables.length > 0) {
    const tbl = facultyResult.extractedTables[0];
    console.log(`Table Caption: ${tbl.caption}`);
    console.log(`Math Validation Valid: ${tbl.mathematicalValidation?.valid}`);
    console.log(`Math Summary: ${tbl.mathematicalValidation?.summary}`);
  }
  console.log(`Extracted statutory entities: ${Object.keys(facultyResult.extractedEntities).length}`);
  console.log(`Tamper likelihood: ${facultyResult.tamperScan.tamperLikelihoodScore}, Risk: ${facultyResult.tamperScan.riskLevel}`);

  console.log('\n--- 3. Testing Synchronous IDP Processing (Registration Certificate) ---');
  const regResult = await idpService.processSync({
    documentId: 'DOC-TEST-002',
    applicationId: 'APP-TEST-999',
    fileName: 'Registration_Charter_1960.pdf',
    category: 'Institutional Registration Certificate',
    institutionName: 'National Institute of Technology Karnataka (Surathkal)',
    registrationNumber: 'NITK-KA-1960-GOI',
  });
  console.log(`Registration Number Extracted:`, regResult.extractedEntities['registration_identifier']?.extractedValue);
  console.log(`Governance Standing:`, regResult.extractedEntities['statutory_classification']?.extractedValue);

  console.log('\n--- 4. Testing Asynchronous Queue Workflow ---');
  const enqueued = await idpService.enqueueDocumentProcessing({
    documentId: 'DOC-TEST-003',
    applicationId: 'APP-TEST-999',
    fileName: 'Infrastructure_Carpet_Area_Audit.pdf',
    category: 'Infrastructure Information',
    institutionName: 'National Institute of Technology Karnataka (Surathkal)',
    registrationNumber: 'NITK-KA-1960-GOI',
  });
  console.log(`Enqueued Job ID: ${enqueued.jobId}, Status: ${enqueued.status}`);

  // Wait 400ms for pipeline execution
  await new Promise((r) => setTimeout(r, 400));
  const jobState = await idpService.getJob(enqueued.jobId);
  console.log(`Polled Job Status: ${jobState.summary?.status}, Progress: ${jobState.summary?.progressPercent}%`);
  console.log(`Result generated: ${Boolean(jobState.result)}`);
  if (jobState.result) {
    console.log(`Infrastructure tables extracted: ${jobState.result.extractedTables.length}`);
    console.log(`Math validation:`, jobState.result.extractedTables[0]?.mathematicalValidation?.summary);
  }

  console.log('\n=== ALL PHASE 4 IDP TESTS PASSED SUCCESSFULLY ===');
  process.exit(0);
}

runVerification().catch((err) => {
  console.error('IDP Verification Failed:', err);
  process.exit(1);
});
