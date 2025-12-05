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

export class FrontendExpertAgent extends BaseAgent {
  constructor() {
    super(`You are a FrontendExpertAgent specializing in frontend engineering interviews.
Your expertise covers:
- Modern JavaScript/TypeScript
- React, Vue, Angular, and other frameworks
- State management (Redux, Zustand, Context API)
- Component architecture and design patterns
- Performance optimization (bundle size, rendering, lazy loading)
- Web accessibility (a11y)
- CSS and styling (CSS-in-JS, Tailwind, styled-components)
- Build tools and bundlers (Webpack, Vite, esbuild)
- Testing (Jest, React Testing Library, Cypress)
- Browser APIs and Web APIs
- Progressive Web Apps (PWA)
- Responsive design and mobile-first development

Your responsibilities:
1. Generate domain-specific technical questions based on competency and difficulty
2. Evaluate candidate answers with evidence-based scoring
3. Provide recommendations for follow-up

Be thorough but fair. Focus on understanding, not just memorization. Ask questions that reveal real-world problem-solving ability.`);
  }

  /**
   * Generate a frontend engineering question
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
      `What is the candidate's experience with ${competency} in frontend development?`,
      3
    );

    const contextText = candidateContext.map((c) => c.text).join('\n\n');

    const messages: AgentMessage[] = [
      {
        role: 'user',
        content: `Generate a ${difficulty}-level frontend engineering question about ${competency}.

Job context: ${JSON.stringify(jobContext || {})}

Candidate context:
${contextText}

Return JSON:
{
  "text": "the question (be specific and practical)",
  "competency": "${competency}",
  "difficulty": "${difficulty}",
  "expectedAnswer": "what a strong answer should cover (key concepts, trade-offs, best practices)"
}

For ${difficulty} level:
- junior: basic concepts, simple components
- mid: practical application, common patterns, performance basics
- senior: complex state management, architecture, optimization
- staff: design systems, team leadership, cross-cutting concerns`,
      },
    ];

    return await this.executeJSON<Question>(messages);
  }

  /**
   * Evaluate a frontend engineering answer
   */
  async evaluateAnswer(
    question: Question,
    answer: string,
    candidateId: string
  ): Promise<AnswerEvaluation> {
    // Get relevant candidate context for additional evidence
    const candidateContext = await vectorStore.retrieveCandidateContext(
      candidateId,
      `Evidence about candidate's knowledge of ${question.competency} in frontend development`,
      3
    );

    const contextText = candidateContext.map((c) => c.text).join('\n\n');

    const messages: AgentMessage[] = [
      {
        role: 'user',
        content: `Evaluate this answer to a ${question.difficulty}-level frontend engineering question about ${question.competency}.

Question: ${question.text}
Expected answer should cover: ${question.expectedAnswer}

Candidate's answer: ${answer}

Additional candidate context:
${contextText}

Return JSON:
{
  "score": 0.0-1.0,
  "evidence": "specific evidence from answer and context (what they got right/wrong, depth of understanding)",
  "recommendation": "probe_deeper" | "move_on" | "sufficient"
}

Scoring guidelines:
- 0.8-1.0: Excellent, demonstrates deep understanding
- 0.6-0.8: Good, solid grasp with minor gaps
- 0.4-0.6: Adequate, basic understanding but missing key points
- 0.0-0.4: Poor, significant gaps or misunderstandings`,
      },
    ];

    return await this.executeJSON<AnswerEvaluation>(messages);
  }
}

export const frontendExpertAgent = new FrontendExpertAgent();

