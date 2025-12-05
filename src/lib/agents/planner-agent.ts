import { BaseAgent, AgentMessage } from './base-agent';
import { createAdminClient } from '../supabase/admin';
import { candidateUnderstandingAgent, CandidateAnalysis } from './candidate-understanding-agent';

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
  candidateAnalysis?: CandidateAnalysis;
  jobDomain?: string;
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
  async initialize(
    jobId: string,
    candidateId: string,
    difficultyOverride?: string | null
  ): Promise<PlannerState> {
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

    // Use CandidateUnderstandingAgent to analyze candidate
    const candidateAnalysis = await candidateUnderstandingAgent.analyzeCandidate(
      candidateId,
      jobId
    );

    // Use override if provided, otherwise use candidate analysis recommendation
    const difficulty = (difficultyOverride as any) || candidateAnalysis.recommendedDifficulty;

    return {
      competencies,
      currentCompetency: null,
      questionCount: 0,
      maxQuestions: 15, // Configurable
      difficulty,
      candidateAnalysis,
      jobDomain: normalized?.domain,
    };
  }

  /**
   * Decide next action (which competency, which agent, which domain)
   */
  async decideNextAction(
    state: PlannerState,
    jobId: string,
    candidateId: string
  ): Promise<{
    action: 'question' | 'complete';
    competency?: string;
    agentType?: 'domain' | 'hr';
    domain?: string; // For routing to specialized expert agents
    reasoning?: string;
  }> {
    // Get job context for domain info
    const { data: job } = await this.supabase
      .from('jobs')
      .select('normalized_json')
      .eq('id', jobId)
      .single();

    const normalized = job?.normalized_json as any;

    const messages: AgentMessage[] = [
      {
        role: 'user',
        content: `Current interview state:
${JSON.stringify(state, null, 2)}

Job domain: ${normalized?.domain || 'unknown'}
Job tech stack: ${JSON.stringify(normalized?.techStack || [])}

Candidate analysis:
${JSON.stringify(state.candidateAnalysis || {}, null, 2)}

Decide the next action. Return JSON:
{
  "action": "question" | "complete",
  "competency": "competency name if action is question",
  "agentType": "domain" | "hr" if action is question,
  "domain": "backend|ml|frontend|other" if agentType is domain (for routing to specialized expert),
  "reasoning": "why this decision"
}

Consider:
- Which competencies still need coverage
- Whether to probe deeper on weak areas or move on
- When to mix in HR/behavioral questions
- Candidate's strengths and risks from analysis`,
      },
    ];

    const decision = await this.executeJSON<{
      action: 'question' | 'complete';
      competency?: string;
      agentType?: 'domain' | 'hr';
      domain?: string;
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

}

export const plannerAgent = new PlannerAgent();


