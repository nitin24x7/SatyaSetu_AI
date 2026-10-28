import { CacheService } from '../cache/cacheService';
import { errorLevelAnalyzer, ErrorLevelAnalyzer } from './elaAnalyzer';
import { copyMoveForgeryDetector, CopyMoveForgeryDetector } from './cmfdAnalyzer';
import { pdfStructureInspector, PdfStructureInspector } from './pdfStructureInspector';
import { perceptualHashEngine, PerceptualHashEngine } from './perceptualHashEngine';
import {
  ForensicAnomaly,
  ForensicReport,
  ForensicVerdict,
} from './types';

export interface AnalyzeDocumentRequest {
  documentId: string;
  applicationId: string;
  institutionId?: string;
  fileName: string;
  category?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  isSimulatedTampered?: boolean;
  isSimulatedCloned?: boolean;
  isSimulatedRecycled?: boolean;
}

export class ForensicService {
  private cache: CacheService;
  private ela: ErrorLevelAnalyzer;
  private cmfd: CopyMoveForgeryDetector;
  private pdf: PdfStructureInspector;
  private pHash: PerceptualHashEngine;
  private inMemoryReports: Map<string, ForensicReport> = new Map();

  constructor(
    cache?: CacheService,
    ela?: ErrorLevelAnalyzer,
    cmfd?: CopyMoveForgeryDetector,
    pdf?: PdfStructureInspector,
    pHash?: PerceptualHashEngine
  ) {
    this.cache = cache || new CacheService();
    this.ela = ela || errorLevelAnalyzer;
    this.cmfd = cmfd || copyMoveForgeryDetector;
    this.pdf = pdf || pdfStructureInspector;
    this.pHash = pHash || perceptualHashEngine;
  }

  /**
   * Executes multi-layer forensic analysis on an uploaded statutory document
   */
  async analyzeDocument(params: AnalyzeDocumentRequest): Promise<ForensicReport> {
    const {
      documentId,
      applicationId,
      institutionId = 'INST-001',
      fileName,
      category = 'Institutional Registration Certificate',
      fileSizeBytes = 2_450_000,
      mimeType = 'application/pdf',
      isSimulatedTampered,
      isSimulatedCloned,
      isSimulatedRecycled,
    } = params;

    // 1. Error Level Analysis (ELA)
    const elaAnalysis = this.ela.analyze({
      fileName,
      fileSizeBytes,
      category,
      isSimulatedTampered,
    });

    // 2. Copy-Move Forgery Detection (CMFD)
    const cmfdAnalysis = this.cmfd.analyze({
      fileName,
      isSimulatedCloned,
      category,
    });

    // 3. PDF Structure & Metadata Inspection
    const { pdfInspection, metadataForensics } = this.pdf.inspect({
      fileName,
      isSimulatedTampered,
      mimeType,
    });

    // 4. Perceptual Hash Deduplication
    const perceptualHash = this.pHash.checkDeduplication({
      fileName,
      applicationId,
      institutionId,
      category,
      isSimulatedRecycled,
    });

    // 5. Aggregate Anomalies
    const anomalies: ForensicAnomaly[] = [];
    let tamperScore = 0.04; // clean baseline

    if (elaAnalysis.hasInconsistentCompression) {
      tamperScore += 0.35;
      elaAnalysis.suspiciousRegions.forEach((reg, idx) => {
        anomalies.push({
          id: `ANOM-ELA-${idx + 1}`,
          type: 'COMPRESSION_DISCREPANCY_ELA',
          severity: 'CRITICAL',
          title: 'Localized Compression Artifact Discrepancy',
          location: reg,
          evidence: reg.description,
          remediationAction: 'Request original physical scanner raster without post-editing in photo software.',
        });
      });
    }

    if (cmfdAnalysis.isCloned) {
      tamperScore += 0.40;
      cmfdAnalysis.clonedPairs.forEach((pair, idx) => {
        anomalies.push({
          id: `ANOM-CMFD-${idx + 1}`,
          type: 'CLONED_STAMP_SIGNATURE_CMFD',
          severity: 'CRITICAL',
          title: 'Duplicated / Cloned Stamp & Signature Block',
          location: pair.targetBox,
          evidence: `98.5% identical feature match to Page ${pair.sourceBox.pageNumber} stamp descriptor.`,
          remediationAction: 'Dossier flagged for physical on-site committee inspection. Cloned seal rejected.',
        });
      });
    }

    if (pdfInspection.isTampered) {
      tamperScore += 0.30;
      anomalies.push({
        id: 'ANOM-PDF-01',
        type: 'PDF_INCREMENTAL_OVERLAY_MODIFICATION',
        severity: 'CRITICAL',
        title: 'Post-Compilation Opaque Vector Overlays Detected',
        evidence: pdfInspection.summary,
        remediationAction: 'Submit original un-redacted PDF generated directly from source statutory authority.',
      });
    }

    if (metadataForensics.isSuspiciousSoftware) {
      tamperScore += 0.15;
      anomalies.push({
        id: 'ANOM-META-01',
        type: 'SOFTWARE_EDIT_TAG_DETECTED',
        severity: 'WARNING',
        title: 'Graphic Editing Software Footprint Detected in Metadata',
        evidence: metadataForensics.summary,
        remediationAction: 'Provide explanation for use of design editor on official government gazette.',
      });
    }

    if (perceptualHash.isRecycled) {
      tamperScore += 0.45;
      anomalies.push({
        id: 'ANOM-PHASH-01',
        type: 'CROSS_INSTITUTION_DOCUMENT_RECYCLING',
        severity: 'CRITICAL',
        title: 'Cross-Institutional Document Recycling Detected',
        evidence: perceptualHash.summary,
        remediationAction: 'Immediate statutory show-cause notice issued. Blueprint previously filed by another institution.',
      });
    }

    tamperScore = parseFloat(Math.min(0.99, tamperScore).toFixed(2));

    let verdict: ForensicVerdict = 'CLEAN';
    if (tamperScore >= 0.50 || anomalies.some((a) => a.severity === 'CRITICAL')) {
      verdict = 'TAMPERED';
    } else if (tamperScore >= 0.20 || anomalies.length > 0) {
      verdict = 'SUSPICIOUS';
    }

    let summary = `Forensic Inspection Completed: Document exhibits authentic structural markers, uniform ELA compression, and zero copy-move cloning (Tamper Likelihood: ${(tamperScore * 100).toFixed(0)}%).`;
    if (verdict === 'TAMPERED') {
      summary = `Fraud Warning: Document exhibits high probability of digital tampering (${(tamperScore * 100).toFixed(0)}% likelihood score). ${anomalies.length} forensic anomalies detected across visual and structural layers.`;
    } else if (verdict === 'SUSPICIOUS') {
      summary = `Forensic Caution: Document exhibits minor structural warnings (${(tamperScore * 100).toFixed(0)}% likelihood score). Assessor manual scrutiny recommended.`;
    }

    const report: ForensicReport = {
      documentId,
      applicationId,
      fileName,
      analysisTimestamp: new Date().toISOString(),
      tamperLikelihoodScore: tamperScore,
      verdict,
      anomalies,
      elaAnalysis,
      cmfdAnalysis,
      pdfInspection,
      perceptualHash,
      metadataForensics,
      summary,
    };

    // Cache report
    this.inMemoryReports.set(documentId, report);
    await this.cache.set(`forensics:report:${documentId}`, report, 7200);

    return report;
  }

  async getForensicReport(documentId: string): Promise<ForensicReport | null> {
    const memory = this.inMemoryReports.get(documentId);
    if (memory) return memory;

    const cached = await this.cache.get<ForensicReport>(`forensics:report:${documentId}`);
    if (cached) {
      this.inMemoryReports.set(documentId, cached);
      return cached;
    }

    return null;
  }

  async listReports(): Promise<ForensicReport[]> {
    return Array.from(this.inMemoryReports.values());
  }
}

export const forensicService = new ForensicService();

