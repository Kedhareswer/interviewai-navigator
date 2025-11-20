import { BaseAgent, AgentMessage } from './base-agent';
import { createAdminClient } from '../supabase/admin';

export interface HRQuestion {
  text: string;
  category: string;
  templateId?: string;
}

export interface HRAnswerEvaluation {
  score: number; // 0-1
  evidence: string;
  recommendation: 'probe_deeper' | 'move_on' | 'sufficient';
}

export class HRBehavioralAgent extends BaseAgent {
  private supabase = createAdminClient();

  constructor() {
    super(`You are an HRBehavioralAgent that conducts behavioral interviews.
Your responsibilities:
1. Select appropriate behavioral questions from the library
2. Adapt questions to candidate/job context
3. Evaluate answers based on behavioral rubrics

Focus on communication, teamwork, problem-solving, and cultural fit.`);
  }

  /**
   * Get HR question library from database
   */
  private async getQuestionLibrary(): Promise<any[]> {
    const { data } = await this.supabase
      .from('hr_config')
      .select('value')
      .eq('key', 'behavioral_questions')
      .single();

    return (data?.value as any) || [];
  }

  /**
   * Generate a behavioral question
   */
  async generateQuestion(
    category?: string,
    candidateContext?: any
  ): Promise<HRQuestion> {
    const questionLibrary = await this.getQuestionLibrary();
    
    // Filter by category if provided
    const availableQuestions = category
      ? questionLibrary.filter((q: any) => q.category === category)
      : questionLibrary;

    if (availableQuestions.length === 0) {
      // Fallback to default question
      return {
        text: 'Tell me about a time you faced a challenging situation at work. How did you handle it?',
        category: 'problem_solving',
      };
    }

    // Use LLM to select and adapt question
    const messages: AgentMessage[] = [
      {
        role: 'user',
        content: `Select and adapt a behavioral question from this library:
${JSON.stringify(availableQuestions, null, 2)}

Candidate context: ${JSON.stringify(candidateContext || {})}

Return JSON:
{
  "text": "the adapted question",
  "category": "category name",
  "templateId": "original template id if applicable"
}`,
      },
    ];

    return await this.executeJSON<HRQuestion>(messages);
  }

  /**
   * Evaluate a behavioral answer
   */
  async evaluateAnswer(
    question: HRQuestion,
    answer: string
  ): Promise<HRAnswerEvaluation> {
    const messages: AgentMessage[] = [
      {
        role: 'user',
        content: `Evaluate this behavioral answer.

Question: ${question.text}
Category: ${question.category}

Answer: ${answer}

Look for:
- Specific examples (STAR method)
- Clear communication
- Relevant experience
- Problem-solving approach

Return JSON:
{
  "score": 0.0-1.0,
  "evidence": "specific evidence from answer",
  "recommendation": "probe_deeper" | "move_on" | "sufficient"
}`,
      },
    ];

    return await this.executeJSON<HRAnswerEvaluation>(messages);
  }
}

export const hrBehavioralAgent = new HRBehavioralAgent();


