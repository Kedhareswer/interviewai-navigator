import { BaseAgent, AgentMessage } from './base-agent';
import { vectorStore } from '../rag/vector-store';

export interface Question {
  text: string;
  competency: string;
  difficulty: string;
  expectedAnswer: string;
}

export interface AnswerEvaluation {
  score: number; // 0-1
  evidence: string;
  recommendation: 'probe_deeper' | 'move_on' | 'sufficient';
}

export class ExpertDomainAgent extends BaseAgent {
  constructor(domain: string = 'general') {
    super(`You are an ExpertDomainAgent specializing in ${domain} technical interviews.
Your responsibilities:
1. Generate domain-specific technical questions based on competency and difficulty
2. Evaluate candidate answers with evidence-based scoring
3. Provide recommendations for follow-up

Be thorough but fair. Focus on understanding, not just memorization.`);
  }

  /**
   * Generate a technical question
   */
  async generateQuestion(
    competency: string,
    difficulty: 'junior' | 'mid' | 'senior' | 'staff',
    candidateId: string,
    jobContext?: any
  ): Promise<Question> {
    // Get relevant candidate context
    const candidateContext = await vectorStore.retrieveCandidateContext(
      candidateId,
      `What is the candidate's experience with ${competency}?`,
      3
    );

    const contextText = candidateContext.map((c) => c.text).join('\n\n');

    const messages: AgentMessage[] = [
      {
        role: 'user',
        content: `Generate a ${difficulty}-level technical question about ${competency}.

Job context: ${JSON.stringify(jobContext || {})}

Candidate context:
${contextText}

Return JSON:
{
  "text": "the question",
  "competency": "${competency}",
  "difficulty": "${difficulty}",
  "expectedAnswer": "what a strong answer should cover"
}`,
      },
    ];

    return await this.executeJSON<Question>(messages);
  }

  /**
   * Evaluate an answer
   */
  async evaluateAnswer(
    question: Question,
    answer: string,
    candidateId: string
  ): Promise<AnswerEvaluation> {
    // Get relevant candidate context for additional evidence
    const candidateContext = await vectorStore.retrieveCandidateContext(
      candidateId,
      `Evidence about candidate's knowledge of ${question.competency}`,
      3
    );

    const contextText = candidateContext.map((c) => c.text).join('\n\n');

    const messages: AgentMessage[] = [
      {
        role: 'user',
        content: `Evaluate this answer to a ${question.difficulty}-level question about ${question.competency}.

Question: ${question.text}
Expected answer should cover: ${question.expectedAnswer}

Candidate's answer: ${answer}

Additional candidate context:
${contextText}

Return JSON:
{
  "score": 0.0-1.0,
  "evidence": "specific evidence from answer and context",
  "recommendation": "probe_deeper" | "move_on" | "sufficient"
}`,
      },
    ];

    return await this.executeJSON<AnswerEvaluation>(messages);
  }
}

export const expertDomainAgent = new ExpertDomainAgent();


