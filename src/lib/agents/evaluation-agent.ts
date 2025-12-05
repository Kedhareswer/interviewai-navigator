import { BaseAgent, AgentMessage } from './base-agent';
import { createAdminClient } from '../supabase/admin';

export interface Evaluation {
  scores: Record<string, number>; // competency -> score
  summary: string; // Full evaluation summary (HR-only)
  candidateSummary?: string; // Sanitized summary for candidate view
  recommendation: 'strong_yes' | 'yes' | 'no' | 'strong_no';
}

export class EvaluationAgent extends BaseAgent {
  private supabase = createAdminClient();

  constructor() {
    super(`You are an EvaluationAgent that synthesizes interview results.
Your job is to:
1. Review all interview events and scores
2. Generate a comprehensive evaluation
3. Provide a clear hiring recommendation

Be objective, evidence-based, and clear.`);
  }

  /**
   * Generate final evaluation from interview events
   */
  async generateEvaluation(interviewId: string): Promise<Evaluation> {
    // Get all interview events
    const { data: events } = await this.supabase
      .from('interview_events')
      .select('*')
      .eq('interview_id', interviewId)
      .order('timestamp', { ascending: true });

    // Get interview details
    const { data: interview } = await this.supabase
      .from('interviews')
      .select(`
        *,
        jobs (*),
        candidates (*)
      `)
      .eq('id', interviewId)
      .single();

    // Extract scores from events
    const scores: Record<string, number[]> = {};
    const questions: any[] = [];
    const answers: any[] = [];

    events?.forEach((event) => {
      if (event.type === 'score') {
        const payload = event.payload as any;
        const competency = payload.competency;
        if (!scores[competency]) {
          scores[competency] = [];
        }
        scores[competency].push(payload.score);
      } else if (event.type === 'question') {
        questions.push(event.payload);
      } else if (event.type === 'answer') {
        answers.push(event.payload);
      }
    });

    // Calculate average scores per competency
    const averageScores: Record<string, number> = {};
    Object.entries(scores).forEach(([competency, scoreList]) => {
      averageScores[competency] =
        scoreList.reduce((a, b) => a + b, 0) / scoreList.length;
    });

    // Generate evaluation using LLM
    const messages: AgentMessage[] = [
      {
        role: 'user',
        content: `Generate a final evaluation for this interview.

Job: ${JSON.stringify(interview?.jobs, null, 2)}
Candidate: ${JSON.stringify(interview?.candidates, null, 2)}

Scores by competency:
${JSON.stringify(averageScores, null, 2)}

Questions asked: ${questions.length}
Answers provided: ${answers.length}

Return JSON:
{
  "scores": { "competency": score, ... },
  "summary": "comprehensive evaluation summary for HR (include specific scores, strengths, weaknesses, detailed analysis)",
  "candidateSummary": "brief, encouraging summary for candidate (highlight strengths, areas for growth, overall feedback - NO specific scores or negative details)",
  "recommendation": "strong_yes" | "yes" | "no" | "strong_no"
}

The candidateSummary should be:
- Positive and constructive
- Focus on strengths and growth areas
- No specific numeric scores
- Professional and encouraging`,
      },
    ];

    const evaluation = await this.executeJSON<Evaluation>(messages);
    
    // Ensure scores match
    evaluation.scores = averageScores;

    return evaluation;
  }
}

export const evaluationAgent = new EvaluationAgent();


