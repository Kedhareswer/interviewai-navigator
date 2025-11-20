import { createAdminClient } from './supabase/admin';

const STORAGE_BUCKETS = {
  jobs: 'jobs',
  candidates: 'candidates',
  interviews: 'interviews',
} as const;

export type StorageBucket = keyof typeof STORAGE_BUCKETS;

export class StorageService {
  private supabase = createAdminClient();

  async uploadFile(
    bucket: StorageBucket,
    path: string,
    file: File | Buffer,
    options?: { contentType?: string }
  ) {
    const { data, error } = await this.supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .upload(path, file, {
        contentType: options?.contentType,
        upsert: true,
      });

    if (error) throw error;
    return data;
  }

  async getPublicUrl(bucket: StorageBucket, path: string) {
    const { data } = this.supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async getSignedUrl(bucket: StorageBucket, path: string, expiresIn: number = 3600) {
    const { data, error } = await this.supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  }

  async deleteFile(bucket: StorageBucket, path: string) {
    const { error } = await this.supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .remove([path]);

    if (error) throw error;
  }

  // Helper methods for specific artifact paths
  getJobPath(jobId: string, filename: string = 'jd.md') {
    return `${jobId}/${filename}`;
  }

  getCandidateResumePath(candidateId: string) {
    return `${candidateId}/resume.txt`;
  }

  getCandidateLinkedInPath(candidateId: string) {
    return `${candidateId}/linkedin.json`;
  }

  getCandidateGitHubPath(candidateId: string, repoName: string) {
    return `${candidateId}/github/${repoName}.json`;
  }

  getCandidatePortfolioPath(candidateId: string, pageName: string) {
    return `${candidateId}/portfolio/${pageName}.md`;
  }

  getInterviewTranscriptPath(interviewId: string) {
    return `${interviewId}/transcript.json`;
  }
}

export const storageService = new StorageService();


