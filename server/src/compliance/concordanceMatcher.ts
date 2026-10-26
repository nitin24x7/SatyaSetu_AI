import { ConcordanceItem, ConcordanceReport } from './types';
import { StringSimilarity } from './stringSimilarity';

export class ConcordanceMatcher {
  /**
   * Cross-references declared application attributes against extracted IDP entities
   */
  static match(params: {
    declared: {
      institutionName: string;
      institutionType?: string;
      aisheCode?: string;
      registrationNumber?: string;
      state?: string;
      academicYear?: string;
    };
    extractedEntities?: Record<string, any>;
  }): ConcordanceReport {
    const { declared, extractedEntities = {} } = params;
    const items: ConcordanceItem[] = [];

    // 1. Institution Name Legal Concordance
    const extractedName =
      extractedEntities['institution_name']?.extractedValue ||
      extractedEntities['legal_entity_name']?.extractedValue ||
      '';
    const nameSim = StringSimilarity.evaluate(declared.institutionName, extractedName);
    let nameStatus: ConcordanceItem['status'] = 'CONCORDANT';
    let nameRemediation: string | undefined;

    if (nameSim.matchLevel === 'DISCREPANCY') {
      nameStatus = 'MISMATCH';
      nameRemediation =
        'Declared institution name diverges significantly from statutory charter. Submit official Gazette notification confirming change of title.';
    } else if (nameSim.matchLevel === 'PARTIAL_MATCH') {
      nameStatus = 'WARNING';
      nameRemediation =
        'Minor lexical divergence (e.g. acronyms or campus suffix). Provide clarifying endorsement letter.';
    }

    items.push({
      fieldKey: 'institution_name',
      fieldLabel: 'Institution Legal Entity Name',
      declaredValue: declared.institutionName,
      extractedValue: extractedName,
      sourceDocument: 'Institutional Registration Certificate',
      similarity: nameSim,
      status: nameStatus,
      remediationAdvice: nameRemediation,
    });

    // 2. AISHE Code Verification
    const extractedAishe =
      extractedEntities['aishe_code']?.extractedValue ||
      extractedEntities['statutory_aishe_identifier']?.extractedValue ||
      declared.aisheCode ||
      '';
    const aisheSim = StringSimilarity.evaluate(declared.aisheCode || '', extractedAishe);
    const isAisheValidFormat = /^[UCSC]-\d{4,6}$/i.test(declared.aisheCode || '');
    let aisheStatus: ConcordanceItem['status'] = 'CONCORDANT';
    let aisheRemediation: string | undefined;

    if (!isAisheValidFormat) {
      aisheStatus = 'MISMATCH';
      aisheRemediation =
        'Declared AISHE code does not conform to Ministry of Education syntax ([U/C/S]-XXXXX). Rectify with registered portal code.';
    } else if (aisheSim.matchLevel === 'DISCREPANCY') {
      aisheStatus = 'MISMATCH';
      aisheRemediation = 'Extracted charter AISHE code differs from declared application code.';
    }

    items.push({
      fieldKey: 'aishe_code',
      fieldLabel: 'All India Survey on Higher Education (AISHE) Code',
      declaredValue: declared.aisheCode || 'Not Declared',
      extractedValue: extractedAishe || 'Not Extracted',
      sourceDocument: 'Affiliation / Recognition Certificate',
      similarity: aisheSim,
      status: aisheStatus,
      remediationAdvice: aisheRemediation,
    });

    // 3. Statutory Registration / Charter Number
    const extractedReg =
      extractedEntities['registration_identifier']?.extractedValue ||
      extractedEntities['charter_number']?.extractedValue ||
      declared.registrationNumber ||
      '';
    const regSim = StringSimilarity.evaluate(declared.registrationNumber || '', extractedReg);
    let regStatus: ConcordanceItem['status'] = 'CONCORDANT';
    let regRemediation: string | undefined;

    if (regSim.matchLevel === 'DISCREPANCY') {
      regStatus = 'MISMATCH';
      regRemediation = 'Charter registration number mismatch against statutory registrar record.';
    } else if (regSim.matchLevel === 'PARTIAL_MATCH') {
      regStatus = 'WARNING';
      regRemediation = 'Check for hyphens or state prefix variations in the registration identifier.';
    }

    items.push({
      fieldKey: 'registration_number',
      fieldLabel: 'Statutory Registration / Charter Number',
      declaredValue: declared.registrationNumber || 'Not Declared',
      extractedValue: extractedReg || 'Not Extracted',
      sourceDocument: 'Institutional Registration Certificate',
      similarity: regSim,
      status: regStatus,
      remediationAdvice: regRemediation,
    });

    // 4. Institutional Governance Standing
    const extractedType =
      extractedEntities['statutory_classification']?.extractedValue ||
      declared.institutionType ||
      '';
    const typeSim = StringSimilarity.evaluate(declared.institutionType || '', extractedType);
    let typeStatus: ConcordanceItem['status'] = 'CONCORDANT';
    let typeRemediation: string | undefined;

    if (typeSim.matchLevel === 'DISCREPANCY') {
      typeStatus = 'WARNING';
      typeRemediation = 'Governance classification differs from charter deed. Provide Section 2(f)/12(B) UGC endorsement.';
    }

    items.push({
      fieldKey: 'institution_type',
      fieldLabel: 'Institutional Classification / Standing',
      declaredValue: declared.institutionType || 'Not Declared',
      extractedValue: extractedType || 'Not Extracted',
      sourceDocument: 'Institutional Registration Certificate',
      similarity: typeSim,
      status: typeStatus,
      remediationAdvice: typeRemediation,
    });

    // Compile aggregate concordance report
    const concordantCount = items.filter((i) => i.status === 'CONCORDANT').length;
    const warningCount = items.filter((i) => i.status === 'WARNING').length;
    const mismatchCount = items.filter((i) => i.status === 'MISMATCH').length;

    const totalScore = items.reduce((acc, curr) => acc + curr.similarity.confidence, 0);
    const overallScore = Math.round((totalScore / items.length) * 100);

    let concordanceStatus: ConcordanceReport['concordanceStatus'] = 'CONCORDANT';
    if (mismatchCount > 0) {
      concordanceStatus = 'DISCREPANCY_DETECTED';
    } else if (warningCount > 0) {
      concordanceStatus = 'NEEDS_REVIEW';
    }

    return {
      overallScore,
      concordanceStatus,
      totalFieldsCompared: items.length,
      concordantCount,
      warningCount,
      mismatchCount,
      items,
    };
  }
}

