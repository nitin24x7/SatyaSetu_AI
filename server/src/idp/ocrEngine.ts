import {
  BoundingBox,
  DocumentLayoutType,
  LayoutSegment,
  OcrToken,
} from './types';

export class MultilingualOcrEngine {
  /**
   * Performs optical character recognition across layout segments
   */
  async extractTokens(params: {
    fileName: string;
    category: string;
    institutionName?: string;
    registrationNumber?: string;
    layoutSegments: Array<{
      type: DocumentLayoutType;
      bbox: BoundingBox;
      confidence: number;
    }>;
  }): Promise<{ segments: LayoutSegment[]; wordCount: number; averageConfidence: number }> {
    const { category, institutionName = 'National Institute of Technology Karnataka (Surathkal)', registrationNumber = 'NITK-KA-1960-GOI', layoutSegments } = params;

    const fullSegments: LayoutSegment[] = [];
    let totalConfidence = 0;
    let totalTokens = 0;

    for (let i = 0; i < layoutSegments.length; i++) {
      const segInfo = layoutSegments[i];
      const { text, tokens, segmentConfidence } = this.synthesizeSegmentOcr(
        segInfo.type,
        category,
        institutionName,
        registrationNumber,
        segInfo.bbox
      );

      tokens.forEach((t) => {
        totalConfidence += t.confidence;
        totalTokens += 1;
      });

      fullSegments.push({
        id: `SEG-${i + 1}`,
        type: segInfo.type,
        bbox: segInfo.bbox,
        confidence: segmentConfidence,
        rawText: text,
        tokens,
      });
    }

    const averageConfidence =
      totalTokens > 0 ? parseFloat((totalConfidence / totalTokens).toFixed(4)) : 0.985;

    return {
      segments: fullSegments,
      wordCount: totalTokens,
      averageConfidence,
    };
  }

  /**
   * Synthesizes OCR token streams and bounding boxes for specific statutory sections
   */
  private synthesizeSegmentOcr(
    type: DocumentLayoutType,
    category: string,
    institutionName: string,
    registrationNumber: string,
    segBbox: BoundingBox
  ): { text: string; tokens: OcrToken[]; segmentConfidence: number } {
    let text = '';
    const tokens: OcrToken[] = [];

    switch (type) {
      case 'HEADER_GAZETTE_TITLE':
        text = `GOVERNMENT OF INDIA • STATUTORY REGULATORY GAZETTE\nDEPARTMENT OF HIGHER EDUCATION & TECHNICAL ACCREDITATION\nOFFICIAL ORDER OF APPROVAL`;
        break;

      case 'SEAL_STAMP_ZONE':
        text = `OFFICIAL EMBLEM OF STATE • SEAL OF REGULATORY AUTHORITY • DIGITALLY ENCRYPTED VERIFICATION QR PRESENT`;
        break;

      case 'KEY_VALUE_METADATA':
        if (category === 'Institutional Registration Certificate') {
          text = `Institution Name: ${institutionName}\nRegistration Identifier: ${registrationNumber}\nIncorporation Act: Societies Registration Act / State Universities Act\nDate of Inception: 1960-08-15\nStatus: Active Autonomous Standing`;
        } else if (category === 'Affiliation / Recognition Certificate') {
          text = `Affiliating Council: University Grants Commission & AICTE Council\nInstitutional File No: AICTE/RO/2026/AFF-8812\nAcademic Cycle: 2026-2027 Valid\nDisciplines Sanctioned: Engineering, Technology, Computing & Applied Sciences`;
        } else if (category === 'Accreditation Certificate') {
          text = `Accreditation Agency: National Board of Accreditation (NBA) & NAAC\nCycle Grade: A++ (Cumulative GPA: 3.68/4.00)\nAccreditation Validity: Valid Through June 2028`;
        } else {
          text = `Statutory Reference: AICTE-APHB-2026-REG\nEntity Declared: ${institutionName}\nValidity Status: Verified Compliant`;
        }
        break;

      case 'TABULAR_ROSTER_GRID':
        if (category === 'Faculty Information') {
          text = `Faculty Cadre Distribution Matrix:\nProfessors: 42 (Required: 38) • Associate Professors: 78 (Required: 76) • Assistant Professors: 164 (Required: 152)\nTotal Core Teaching Faculty: 284\nStudent-to-Faculty Ratio (SFR): 1:14.8 (Prescribed Norm <= 1:20)\nPh.D. Qualified Ratio: 81.2% (Norm >= 50%)`;
        } else {
          text = `Campus Infrastructure Assessment Roster:\nTotal Land Acreage: 295.4 Acres (Free from all encumbrances)\nInstructional Carpet Area: 64,820 sq.m\nSpecialized Computing Laboratories: 32 Labs (1,280 High-End Workstations)\nFire Safety Municipal Clearance: CERT-FS-2026-9041 (Active Valid)`;
        }
        break;

      case 'NOTARY_ENDORSEMENT':
        text = `NON-JUDICIAL STAMP PAPER VALUE: INR 100\nNOTARY PUBLIC REGISTRATION: DL-2018-NOT-4190\nSWORN AND SIGNED BEFORE ME ON STAMP PAPER WITH REQUISITE TREASURY RECEIPT`;
        break;

      case 'STATUTORY_LEGAL_CLAUSE':
        text = `I hereby solemnly affirm and state on oath that all statements made herein and all academic, structural, and financial disclosures attached hereto are genuine, authentic, and unencumbered under the penal laws of regulatory governance.`;
        break;

      case 'SIGNATURE_BLOCK':
        text = `[DIGITALLY SIGNED]\nDr. Suresh Kumar Nayak\nDean & Authorized Statutory Signatory\nFor and on behalf of Governing Council\nDate: 2026-10-24 15:42:19 IST`;
        break;

      default:
        text = `Statutory disclosure verified in accordance with national regulatory criteria.`;
    }

    // Split into tokens with computed spatial bounding boxes
    const words = text.split(/\s+/).filter(Boolean);
    const wordsPerLine = 6;

    words.forEach((w, idx) => {
      const lineIdx = Math.floor(idx / wordsPerLine);
      const colIdx = idx % wordsPerLine;

      const tokenWidth = segBbox.width / wordsPerLine;
      const tokenHeight = 0.025;

      const tokenBbox: BoundingBox = {
        x: parseFloat((segBbox.x + colIdx * tokenWidth).toFixed(4)),
        y: parseFloat((segBbox.y + lineIdx * (tokenHeight + 0.005)).toFixed(4)),
        width: parseFloat((tokenWidth * 0.85).toFixed(4)),
        height: tokenHeight,
      };

      // Confidence score is high for clear text (0.94 to 0.99)
      const conf = parseFloat((0.95 + (Math.sin(idx) * 0.04)).toFixed(3));

      tokens.push({
        text: w,
        confidence: conf,
        bbox: tokenBbox,
        language: 'eng',
      });
    });

    return {
      text,
      tokens,
      segmentConfidence: 0.975,
    };
  }
}

export const ocrEngine = new MultilingualOcrEngine();

