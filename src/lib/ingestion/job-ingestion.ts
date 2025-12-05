import { createAdminClient } from '../supabase/admin';
import { storageService } from '../storage';
import { jobUnderstandingAgent, NormalizedJob } from '../agents/job-understanding-agent';

export class JobIngestionService {
  private supabase = createAdminClient();

  /**
   * Ingest and normalize a job description
   */
  async ingestJob(jobId: string): Promise<NormalizedJob> {
    // Get job from database
    const { data: job, error } = await this.supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    // Store raw JD in storage
    await storageService.uploadBytes(
      'jobs',
      storageService.getJobPath(jobId),
      new TextEncoder().encode(job.description_raw),
      { contentType: 'text/markdown' }
    );

    // Normalize job using JobUnderstandingAgent
    const normalized = await jobUnderstandingAgent.normalizeJobDescription(job.description_raw);

    // Update job with normalized data
    await this.supabase
      .from('jobs')
      .update({ normalized_json: normalized })
      .eq('id', jobId);

    return normalized;
  }
}

export const jobIngestionService = new JobIngestionService();


