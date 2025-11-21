import { BaseAgent, AgentMessage } from './base-agent';
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
  domain?: string; // e.g., 'backend', 'ml', 'frontend', 'fullstack'
}

export class JobUnderstandingAgent extends BaseAgent {
  constructor() {
    super(`You are a JobUnderstandingAgent that analyzes job descriptions.
Your job is to:
1. Extract structured competencies with weights and levels
2. Identify required tech stack
3. Determine overall role level
4. Classify the domain (backend, frontend, ml, fullstack, etc.)
5. Extract key requirements

Be thorough and accurate. Competencies should be specific and measurable.`);
  }

  /**
   * Normalize a job description into structured format
   */
  async normalizeJobDescription(description: string): Promise<NormalizedJob> {
    const messages: AgentMessage[] = [
      {
        role: 'user',
        content: `Analyze this job description and extract structured information:

${description}

Return JSON:
{
  "competencies": [
    { "name": "competency name (e.g., 'System Design', 'Python', 'React')", "weight": 0.0-1.0, "level": "junior|mid|senior|staff" }
  ],
  "level": "overall level (junior|mid|senior|staff)",
  "techStack": ["technology1", "technology2", ...],
  "requirements": ["requirement1", "requirement2", ...],
  "domain": "backend|frontend|ml|fullstack|devops|data|other"
}

Guidelines:
- Competencies should be specific technical skills or knowledge areas
- Weights should sum to approximately 1.0 (most important = higher weight)
- Level should reflect the seniority required
- Domain should be inferred from tech stack and responsibilities
- Requirements should be key must-haves`,
      },
    ];

    return await this.executeJSON<NormalizedJob>(messages);
  }
}

export const jobUnderstandingAgent = new JobUnderstandingAgent();

