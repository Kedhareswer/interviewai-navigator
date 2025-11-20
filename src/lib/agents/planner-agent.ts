import { BaseAgent, AgentMessage } from './base-agent';
import { vectorStore } from '../rag/vector-store';
import { createAdminClient } from '../supabase/admin';

export interface PlannerState {
  competencies: Array<{
    name: string;
    covered: boolean;
    score: number | null;
    questionsAsked: number;
  }>;
  currentCompetency: string | null;
  questionCount: number;
  maxQuestions: number;
  difficulty: 'junior' | 'mid' | 'senior' | 'staff';
}

export class PlannerAgent extends BaseAgent {
  private supabase = createAdminClient();

  constructor() {
    super(`You are a PlannerAgent that orchestrates technical interviews.
Your job is to:
1. Decide which competency to probe next
2. Choose the appropriate expert agent (domain vs HR)
3. Determine when to stop the interview
4. Maintain interview state and flow

You must be strategic and efficient, covering all required competencies while not over-questioning.`);
  }

  /**
   * Initialize planner state from job and candidate
   */
  async initialize(jobId: string, candidateId: string): Promise<PlannerState> {
    // Get job normalized data
    const { data: job } = await this.supabase
      .from('jobs')
      .select('normalized_json, level')
      .eq('id', jobId)
      .single();

    const normalized = job?.normalized_json as any;
    const competencies = (normalized?.competencies || []).map((comp: any) => ({
      name: comp.name,
      covered: false,
      score: null,
      questionsAsked: 0,
    }));

    // Get candidate context summary
    const candidateContext = await vectorStore.retrieveCandidateContext(
      candidateId,
      'What are this candidate\'s main strengths and experience?',
      5
    );

    // Determine starting difficulty based on candidate context
    const difficulty = await this.determineDifficulty(candidateContext, normalized?.level || 'mid');

    return {
      competencies,
      currentCompetency: null,
      questionCount: 0,
      maxQuestions: 15, // Configurable
      difficulty,
    };
  }

  /**
   * Decide next action (which competency, which agent)
   */
  async decideNextAction(
    state: PlannerState,
    jobId: string,
    candidateId: string
  ): Promise<{
    action: 'question' | 'complete';
    competency?: string;
    agentType?: 'domain' | 'hr';
    reasoning?: string;
  }> {
    const messages: AgentMessage[] = [
      {
        role: 'user',
        content: `Current interview state:
${JSON.stringify(state, null, 2)}

Decide the next action. Return JSON:
{
  "action": "question" | "complete",
  "competency": "competency name if action is question",
  "agentType": "domain" | "hr" if action is question,
  "reasoning": "why this decision"
}`,
      },
    ];

    const decision = await this.executeJSON<{
      action: 'question' | 'complete';
      competency?: string;
      agentType?: 'domain' | 'hr';
      reasoning?: string;
    }>(messages);

    return decision;
  }

  /**
   * Update state after a question-answer cycle
   */
  updateState(
    state: PlannerState,
    competency: string,
    score: number
  ): PlannerState {
    const updatedCompetencies = state.competencies.map((comp) => {
      if (comp.name === competency) {
        return {
          ...comp,
          covered: true,
          score: comp.score !== null ? (comp.score + score) / 2 : score, // Average score
          questionsAsked: comp.questionsAsked + 1,
        };
      }
      return comp;
    });

    return {
      ...state,
      competencies: updatedCompetencies,
      questionCount: state.questionCount + 1,
      currentCompetency: null,
    };
  }

  private async determineDifficulty(
    candidateContext: any[],
    jobLevel: string
  ): Promise<'junior' | 'mid' | 'senior' | 'staff'> {
    // Simple heuristic - can be improved with LLM
    const contextText = candidateContext.map((c) => c.text).join('\n');
    
    if (contextText.toLowerCase().includes('senior') || contextText.toLowerCase().includes('lead')) {
      return 'senior';
    }
    if (contextText.toLowerCase().includes('junior') || contextText.toLowerCase().includes('entry')) {
      return 'junior';
    }
    
    return jobLevel as any || 'mid';
  }
}

export const plannerAgent = new PlannerAgent();


