import { createAdminClient } from '../supabase/admin';
import { storageService } from '../storage';
import { gemini, GEMINI_MODELS } from '../gemini/client';

export interface NormalizedJob {
  competencies: Array<{
    name: string;
    weight: number;
    level: string;
  }>;
  level: string;
  techStack: string[];
  requirements: string[];
}

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
    await storageService.uploadFile(
      'jobs',
      storageService.getJobPath(jobId),
      Buffer.from(job.description_raw),
      { contentType: 'text/markdown' }
    );

    // Normalize job using LLM
    const normalized = await this.normalizeJobDescription(job.description_raw);

    // Update job with normalized data
    await this.supabase
      .from('jobs')
      .update({ normalized_json: normalized })
      .eq('id', jobId);

    return normalized;
  }

  /**
   * Use LLM to extract competencies, level, and requirements from JD
   */
  private async normalizeJobDescription(
    description: string
  ): Promise<NormalizedJob> {
    const prompt = `Analyze this job description and extract structured information:

${description}

Return a JSON object with this structure:
{
  "competencies": [
    { "name": "competency name", "weight": 0.0-1.0, "level": "junior|mid|senior|staff" }
  ],
  "level": "overall level",
  "techStack": ["tech1", "tech2", ...],
  "requirements": ["req1", "req2", ...]
}`;

    const model = gemini.getGenerativeModel({ 
      model: GEMINI_MODELS.PRO,
      systemInstruction: 'You are an expert at analyzing job descriptions. Extract structured information accurately. Always respond with valid JSON only.',
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(jsonText);
    return parsed as NormalizedJob;
  }
}

export const jobIngestionService = new JobIngestionService();


