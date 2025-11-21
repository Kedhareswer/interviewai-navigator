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

export class MLExpertAgent extends BaseAgent {
  constructor() {
    super(`You are an MLExpertAgent specializing in machine learning and AI engineering interviews.
Your expertise covers:
- Machine learning fundamentals (supervised, unsupervised, reinforcement learning)
- Deep learning architectures (CNNs, RNNs, Transformers)
- Model training, validation, and evaluation
- Feature engineering and selection
- Hyperparameter tuning and optimization
- ML frameworks (TensorFlow, PyTorch, Scikit-learn)
- MLOps and model deployment
- NLP and computer vision
- Model interpretability and explainability
- Production ML systems and scalability
- Data pipelines and preprocessing

Your responsibilities:
1. Generate domain-specific technical questions based on competency and difficulty
2. Evaluate candidate answers with evidence-based scoring
3. Provide recommendations for follow-up

Be thorough but fair. Focus on understanding, not just memorization. Ask questions that reveal real-world problem-solving ability.`);
  }

  /**
   * Generate an ML engineering question
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
      `What is the candidate's experience with ${competency} in machine learning?`,
      3
    );

    const contextText = candidateContext.map((c) => c.text).join('\n\n');

    const messages: AgentMessage[] = [
      {
        role: 'user',
        content: `Generate a ${difficulty}-level machine learning question about ${competency}.

Job context: ${JSON.stringify(jobContext || {})}

Candidate context:
${contextText}

Return JSON:
{
  "text": "the question (be specific and practical)",
  "competency": "${competency}",
  "difficulty": "${difficulty}",
  "expectedAnswer": "what a strong answer should cover (key concepts, trade-offs, practical considerations)"
}

For ${difficulty} level:
- junior: basic ML concepts, simple algorithms
- mid: practical application, model selection, common pitfalls
- senior: advanced techniques, production considerations, research understanding
- staff: architecture decisions, research contributions, team leadership`,
      },
    ];

    return await this.executeJSON<Question>(messages);
  }

  /**
   * Evaluate an ML engineering answer
   */
  async evaluateAnswer(
    question: Question,
    answer: string,
    candidateId: string
  ): Promise<AnswerEvaluation> {
    // Get relevant candidate context for additional evidence
    const candidateContext = await vectorStore.retrieveCandidateContext(
      candidateId,
      `Evidence about candidate's knowledge of ${question.competency} in machine learning`,
      3
    );

    const contextText = candidateContext.map((c) => c.text).join('\n\n');

    const messages: AgentMessage[] = [
      {
        role: 'user',
        content: `Evaluate this answer to a ${question.difficulty}-level machine learning question about ${question.competency}.

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

export const mlExpertAgent = new MLExpertAgent();

