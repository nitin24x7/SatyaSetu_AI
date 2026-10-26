import { CacheService } from '../cache/cacheService';
import { IdpJobSummary, IdpProcessingResult, JobStatus } from './types';

export class IdpQueue {
  private cache: CacheService;
  private jobSummaries = new Map<string, IdpJobSummary>();
  private jobResults = new Map<string, IdpProcessingResult>();

  constructor(cacheService?: CacheService) {
    this.cache = cacheService || new CacheService();
  }

  async enqueue(job: IdpJobSummary): Promise<void> {
    this.jobSummaries.set(job.jobId, job);
    await this.cache.set(`idp:job:${job.jobId}`, job, 3600);
  }

  async updateProgress(
    jobId: string,
    status: JobStatus,
    progressPercent: number,
    currentStage: string
  ): Promise<void> {
    const existing = this.jobSummaries.get(jobId);
    if (!existing) return;

    const updated: IdpJobSummary = {
      ...existing,
      status,
      progressPercent,
      currentStage,
      updatedAt: new Date().toISOString(),
    };

    this.jobSummaries.set(jobId, updated);
    await this.cache.set(`idp:job:${jobId}`, updated, 3600);
  }

  async complete(jobId: string, result: IdpProcessingResult): Promise<void> {
    const summary = this.jobSummaries.get(jobId);
    if (summary) {
      const updatedSummary: IdpJobSummary = {
        ...summary,
        status: 'COMPLETED',
        progressPercent: 100,
        currentStage: 'Document verification and entity extraction completed',
        updatedAt: new Date().toISOString(),
      };
      this.jobSummaries.set(jobId, updatedSummary);
      await this.cache.set(`idp:job:${jobId}`, updatedSummary, 3600);
    }

    this.jobResults.set(jobId, result);
    await this.cache.set(`idp:result:${jobId}`, result, 7200);
  }

  async fail(jobId: string, error: string): Promise<void> {
    const summary = this.jobSummaries.get(jobId);
    if (summary) {
      const updatedSummary: IdpJobSummary = {
        ...summary,
        status: 'FAILED',
        progressPercent: 100,
        currentStage: `Processing failed: ${error}`,
        updatedAt: new Date().toISOString(),
      };
      this.jobSummaries.set(jobId, updatedSummary);
      await this.cache.set(`idp:job:${jobId}`, updatedSummary, 3600);
    }
  }

  async getJobSummary(jobId: string): Promise<IdpJobSummary | null> {
    const memory = this.jobSummaries.get(jobId);
    if (memory) return memory;

    const cached = await this.cache.get<IdpJobSummary>(`idp:job:${jobId}`);
    if (cached) {
      this.jobSummaries.set(jobId, cached);
      return cached;
    }
    return null;
  }

  async getJobResult(jobId: string): Promise<IdpProcessingResult | null> {
    const memory = this.jobResults.get(jobId);
    if (memory) return memory;

    const cached = await this.cache.get<IdpProcessingResult>(`idp:result:${jobId}`);
    if (cached) {
      this.jobResults.set(jobId, cached);
      return cached;
    }
    return null;
  }

  async listJobs(limit = 20): Promise<IdpJobSummary[]> {
    const jobs = Array.from(this.jobSummaries.values());
    jobs.sort((a, b) => new Date(b.enqueuedAt).getTime() - new Date(a.enqueuedAt).getTime());
    return jobs.slice(0, limit);
  }
}

export const idpQueue = new IdpQueue();

