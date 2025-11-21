import { BaseAgent, AgentMessage } from './base-agent';
import { vectorStore } from '../rag/vector-store';
import { createAdminClient } from '../supabase/admin';

export interface CandidateAnalysis {
  strengths: string[];
  risks: string[];
  recommendedDifficulty: 'junior' | 'mid' | 'senior' | 'staff';
  summary: string;
  experienceLevel: string;
  keyTechnologies: string[];
}

export class CandidateUnderstandingAgent extends BaseAgent {
  private supabase = createAdminClient();

  constructor() {
    super(`You are a CandidateUnderstandingAgent that analyzes candidate profiles.
Your job is to:
1. Review candidate's resume, LinkedIn, GitHub, and portfolio data
2. Identify their key strengths and potential risks
3. Determine appropriate interview difficulty level
4. Provide a comprehensive summary for the planner agent

Be objective, evidence-based, and consider both technical depth and breadth.`);
  }

  /**
   * Analyze candidate and provide insights for interview planning
   */
  async analyzeCandidate(
    candidateId: string,
    jobId: string
  ): Promise<CandidateAnalysis> {
    // Get job context
    const { data: job } = await this.supabase
      .from('jobs')
      .select('normalized_json, level, title')
      .eq('id', jobId)
      .single();

    const jobNormalized = job?.normalized_json as any;
    const jobLevel = job?.level || 'mid';
    const jobTitle = job?.title || '';

    // Get candidate profile
    const { data: candidate } = await this.supabase
      .from('candidates')
      .select('*')
      .eq('id', candidateId)
      .single();

    // Retrieve comprehensive candidate context using RAG
    const candidateContext = await vectorStore.retrieveCandidateContext(
      candidateId,
      `What are this candidate's technical skills, experience level, projects, and background relevant to ${jobTitle}?`,
      10
    );

    const contextText = candidateContext.map((c) => c.text).join('\n\n');

    // Use LLM to analyze candidate
    const messages: AgentMessage[] = [
      {
        role: 'user',
        content: `Analyze this candidate for a ${jobLevel}-level ${jobTitle} position.

Job Requirements:
${JSON.stringify(jobNormalized?.competencies || [], null, 2)}
Tech Stack: ${JSON.stringify(jobNormalized?.techStack || [], null, 2)}

Candidate Context (from resume, LinkedIn, GitHub, portfolio):
${contextText}

Candidate Profile:
- Name: ${candidate?.name || 'N/A'}
- Email: ${candidate?.email || 'N/A'}
- Links: ${JSON.stringify(candidate?.links || {}, null, 2)}

Analyze and return JSON:
{
  "strengths": ["strength1", "strength2", ...],
  "risks": ["risk1", "risk2", ...],
  "recommendedDifficulty": "junior" | "mid" | "senior" | "staff",
  "summary": "comprehensive 2-3 sentence summary of candidate's profile",
  "experienceLevel": "brief description of experience level",
  "keyTechnologies": ["tech1", "tech2", ...]
}

Be specific and evidence-based. The recommendedDifficulty should match the candidate's actual level, not necessarily the job level.`,
      },
    ];

    return await this.executeJSON<CandidateAnalysis>(messages);
  }
}

export const candidateUnderstandingAgent = new CandidateUnderstandingAgent();

