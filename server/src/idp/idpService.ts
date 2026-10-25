import crypto from 'crypto';
import { DocumentPreprocessor } from './preprocessor';
import { MultilingualOcrEngine } from './ocrEngine';
import { TabularMatrixParser } from './tableParser';
import { KeyValueEntityExtractor } from './kvpExtractor';
import { idpQueue, IdpQueue } from './idpQueue';
import { IdpJobSummary, IdpProcessingResult, PreprocessingMetrics } from './types';

export interface ProcessDocumentRequest {
  documentId: string;
  applicationId: string;
  fileName: string;
  category: string;
  fileSizeBytes?: number;
  mimeType?: string;
  institutionName?: string;
  registrationNumber?: string;
}

export class IdpService {
  private preprocessor: DocumentPreprocessor;
  private ocrEngine: MultilingualOcrEngine;
  private tableParser: TabularMatrixParser;
  private kvpExtractor: KeyValueEntityExtractor;
  private queue: IdpQueue;

  constructor(queue?: IdpQueue) {
    this.preprocessor = new DocumentPreprocessor();
    this.ocrEngine = new MultilingualOcrEngine();
    this.tableParser = new TabularMatrixParser();
    this.kvpExtractor = new KeyValueEntityExtractor();
    this.queue = queue || idpQueue;
  }

  /**
   * Enqueue document for background asynchronous OCR & IDP pipeline processing
   */
  async enqueueDocumentProcessing(params: ProcessDocumentRequest): Promise<IdpJobSummary> {
    const jobId = `JOB-IDP-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const enqueuedAt = new Date().toISOString();

    const summary: IdpJobSummary = {
      jobId,
      documentId: params.documentId,
      applicationId: params.applicationId,
      fileName: params.fileName,
      status: 'QUEUED',
      progressPercent: 5,
      currentStage: 'Document queued for optical ingestion and structural calibration',
      enqueuedAt,
      updatedAt: enqueuedAt,
    };

    await this.queue.enqueue(summary);

    // Trigger async processing pipeline in background
    setTimeout(async () => {
      await this.runPipeline(jobId, params);
    }, 150);

    return summary;
  }

  /**
   * Synchronous inspection and extraction endpoint for direct verification & testing
   */
  async processSync(params: ProcessDocumentRequest): Promise<IdpProcessingResult> {
    const jobId = `JOB-SYNC-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    return this.executeProcessingSteps(jobId, params);
  }

  /**
   * Pipeline worker execution with stage-wise status updates
   */
  private async runPipeline(jobId: string, params: ProcessDocumentRequest): Promise<void> {
    try {
      // Stage 1: Preprocessing & DPI Calibration
      await this.queue.updateProgress(
        jobId,
        'PREPROCESSING',
        25,
        'Calibrating DPI (target 300 DPI), calculating deskew angle, and binarizing contrast'
      );

      // Stage 2: OCR Tokenization
      await this.queue.updateProgress(
        jobId,
        'EXTRACTING_OCR',
        50,
        'Executing multilingual optical character recognition and spatial bounding box derivation'
      );

      // Stage 3: Tabular Matrix Parsing
      await this.queue.updateProgress(
        jobId,
        'PARSING_TABLES',
        75,
        'Parsing statutory tabular matrices and validating mathematical cadre sums'
      );

      // Stage 4: Entity Extraction
      await this.queue.updateProgress(
        jobId,
        'EXTRACTING_ENTITIES',
        90,
        'Extracting regulatory key-value entities and running cross-attribute compliance checks'
      );

      // Execute full pipeline steps
      const result = await this.executeProcessingSteps(jobId, params);

      // Complete job
      await this.queue.complete(jobId, result);
    } catch (err: any) {
      await this.queue.fail(jobId, err.message || 'Unknown processing error');
    }
  }

  /**
   * Core pipeline step computation
   */
  private async executeProcessingSteps(jobId: string, params: ProcessDocumentRequest): Promise<IdpProcessingResult> {
    const startTime = Date.now();
    const startedAt = new Date().toISOString();

    const fileSizeBytes = params.fileSizeBytes || 2_450_000;
    const mimeType = params.mimeType || 'application/pdf';
    const institutionName = params.institutionName || 'National Institute of Technology Karnataka (Surathkal)';
    const registrationNumber = params.registrationNumber || 'NITK-KA-1960-GOI';

    // 1. Preprocessing & Layout Segmentation
    const { metrics, inferredLayoutSegments } = this.preprocessor.process({
      fileName: params.fileName,
      category: params.category,
      fileSizeBytes,
      mimeType,
    });

    // 2. Multilingual OCR Tokenization
    const { segments, wordCount, averageConfidence } = await this.ocrEngine.extractTokens({
      fileName: params.fileName,
      category: params.category,
      institutionName,
      registrationNumber,
      layoutSegments: inferredLayoutSegments,
    });

    // 3. Tabular Matrix Extraction & Sanity Verification
    const tables = this.tableParser.parseTables(params.category, institutionName);

    // 4. Statutory Key-Value Entity Extraction
    const extractedEntities = this.kvpExtractor.extractEntities({
      category: params.category,
      institutionName,
      registrationNumber,
      segments,
    });

    // 5. Tamper Detection & Forensic Integrity Scan
    const tamperScan = this.evaluateDocumentIntegrity(metrics, segments, tables);

    const completedAt = new Date().toISOString();
    const durationMs = Date.now() - startTime;

    return {
      jobId,
      documentId: params.documentId,
      applicationId: params.applicationId,
      fileName: params.fileName,
      category: params.category,
      status: 'COMPLETED',
      startedAt,
      completedAt,
      durationMs,
      preprocessing: metrics,
      layoutSegments: segments,
      ocrWordCount: wordCount,
      averageConfidence,
      extractedEntities,
      extractedTables: tables,
      tamperScan,
    };
  }

  /**
   * Optical & structural forensic integrity analysis
   */
  private evaluateDocumentIntegrity(
    metrics: PreprocessingMetrics,
    segments: any[],
    tables: any[]
  ): {
    tamperLikelihoodScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    anomaliesDetected: string[];
  } {
    const anomalies: string[] = [];
    let tamperScore = 0.04; // baseline clean confidence

    if (metrics.originalDpi < 200) {
      anomalies.push('Sub-optimal scan resolution (< 200 DPI); adaptive upsampling applied.');
      tamperScore += 0.06;
    }

    if (Math.abs(metrics.deskewAngleDegrees) > 2.5) {
      anomalies.push(`Significant scan tilt detected (${metrics.deskewAngleDegrees}°); geometric correction applied.`);
      tamperScore += 0.05;
    }

    // Verify mathematical tables if present
    for (const tbl of tables) {
      if (tbl.mathematicalValidation && !tbl.mathematicalValidation.valid) {
        anomalies.push(`Tabular reconciliation warning: ${tbl.mathematicalValidation.summary}`);
        tamperScore += 0.25;
      }
    }

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (tamperScore >= 0.4) {
      riskLevel = 'HIGH';
    } else if (tamperScore >= 0.2) {
      riskLevel = 'MEDIUM';
    }

    return {
      tamperLikelihoodScore: parseFloat(tamperScore.toFixed(3)),
      riskLevel,
      anomaliesDetected: anomalies,
    };
  }

  async getJob(jobId: string): Promise<{ summary: IdpJobSummary | null; result: IdpProcessingResult | null }> {
    const summary = await this.queue.getJobSummary(jobId);
    const result = await this.queue.getJobResult(jobId);
    return { summary, result };
  }

  async listJobs(limit = 20): Promise<IdpJobSummary[]> {
    return this.queue.listJobs(limit);
  }

  getSupportedCategories(): string[] {
    return [
      'Institutional Registration Certificate',
      'Affiliation / Recognition Certificate',
      'Accreditation Certificate',
      'Faculty Information',
      'Infrastructure Information',
      'Supporting Declaration',
      'Audited Financial Statement',
      'Land Title & Encumbrance Certificate',
    ];
  }
}

export const idpService = new IdpService();
