import { createAdminClient } from '../supabase/admin';
import { plannerAgent, PlannerState } from './planner-agent';
import { ExpertAgentFactory, Question, AnswerEvaluation } from './expert-agent-factory';
import { hrBehavioralAgent, HRQuestion, HRAnswerEvaluation } from './hr-agent';
import { evaluationAgent } from './evaluation-agent';
import { storageService } from '../storage';

export class InterviewOrchestrator {
  private supabase = createAdminClient();
  private stateMap = new Map<string, PlannerState>();

  /**
   * Start an interview
   */
  async start(interviewId: string): Promise<void> {
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

    if (!interview) {
      throw new Error(`Interview not found: ${interviewId}`);
    }

    // Initialize planner state with difficulty override if provided
    const state = await plannerAgent.initialize(
      interview.job_id,
      interview.candidate_id,
      interview.difficulty_override
    );
    this.stateMap.set(interviewId, state);

    // Record system event with candidate analysis
    await this.recordEvent(interviewId, 'system', {
      message: 'Interview started',
      state: {
        competencies: state.competencies,
        difficulty: state.difficulty,
        maxQuestions: state.maxQuestions,
      },
      candidateAnalysis: state.candidateAnalysis,
      jobDomain: state.jobDomain,
    });

    // Generate first question
    await this.generateNextQuestion(interviewId);
  }

  /**
   * Process a candidate answer
   */
  async processAnswer(interviewId: string, answer: string): Promise<void> {
    const state = this.stateMap.get(interviewId);
    if (!state) {
      throw new Error(`Interview state not found: ${interviewId}`);
    }

    // Get the last question
    const { data: lastQuestion } = await this.supabase
      .from('interview_events')
      .select('*')
      .eq('interview_id', interviewId)
      .eq('type', 'question')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (!lastQuestion) {
      throw new Error('No question found to answer');
    }

    const questionPayload = lastQuestion.payload as any;
    const question: Question = {
      text: questionPayload.text,
      competency: questionPayload.competency,
      difficulty: questionPayload.difficulty,
      expectedAnswer: questionPayload.expectedAnswer,
    };

    // Get interview details
    const { data: interview } = await this.supabase
      .from('interviews')
      .select('job_id, candidate_id')
      .eq('id', interviewId)
      .single();

    // Evaluate answer using appropriate agent
    let evaluation: AnswerEvaluation | HRAnswerEvaluation;
    if (questionPayload.agentType === 'hr') {
      const hrQuestion: HRQuestion = {
        text: question.text,
        category: questionPayload.category || 'general',
      };
      evaluation = await hrBehavioralAgent.evaluateAnswer(hrQuestion, answer);
    } else {
      // Get interview to check for selected agents
      const { data: fullInterview } = await this.supabase
        .from('interviews')
        .select('selected_agents, jobs (*)')
        .eq('id', interviewId)
        .single();
      
      let agentDomain = questionPayload.domain;
      
      // Respect HR's agent selection if provided
      const selectedAgents = fullInterview?.selected_agents as string[] | null;
      const preferredAgents = (fullInterview?.jobs as any)?.[0]?.preferred_agents as string[] | null;
      
      if (selectedAgents && selectedAgents.length > 0) {
        const matchingAgent = selectedAgents.find((agentId) => {
          if (agentId === 'backend' && (agentDomain === 'backend' || !agentDomain)) return true;
          if (agentId === 'ml' && (agentDomain === 'ml' || agentDomain === 'machine-learning')) return true;
          if (agentId === 'frontend' && (agentDomain === 'frontend' || !agentDomain)) return true;
          return false;
        });
        if (matchingAgent) {
          agentDomain = matchingAgent === 'ml' ? 'ml' : matchingAgent;
        }
      } else if (preferredAgents && preferredAgents.length > 0) {
        const matchingAgent = preferredAgents.find((agentId) => {
          if (agentId === 'backend' && (agentDomain === 'backend' || !agentDomain)) return true;
          if (agentId === 'ml' && (agentDomain === 'ml' || agentDomain === 'machine-learning')) return true;
          if (agentId === 'frontend' && (agentDomain === 'frontend' || !agentDomain)) return true;
          return false;
        });
        if (matchingAgent) {
          agentDomain = matchingAgent === 'ml' ? 'ml' : matchingAgent;
        }
      }
      
      const expertAgent = ExpertAgentFactory.getExpertAgent(
        agentDomain,
        question.competency,
        questionPayload.techStack
      );
      
      // All expert agents have the same interface
      evaluation = await (expertAgent as any).evaluateAnswer(
        question,
        answer,
        interview!.candidate_id
      );
    }

    // Record score event
    await this.recordEvent(interviewId, 'score', {
      competency: question.competency,
      score: evaluation.score,
      evidence: evaluation.evidence,
      recommendation: evaluation.recommendation,
    });

    // Update planner state
    const updatedState = plannerAgent.updateState(
      state,
      question.competency,
      evaluation.score
    );
    this.stateMap.set(interviewId, updatedState);

    // Check if we should continue or complete
    const decision = await plannerAgent.decideNextAction(
      updatedState,
      interview!.job_id,
      interview!.candidate_id
    );

    if (decision.action === 'complete') {
      await this.completeInterview(interviewId);
    } else {
      // Generate next question
      await this.generateNextQuestion(interviewId);
    }
  }

  /**
   * Generate next question based on planner decision
   */
  private async generateNextQuestion(interviewId: string): Promise<void> {
    const state = this.stateMap.get(interviewId);
    if (!state) {
      throw new Error(`Interview state not found: ${interviewId}`);
    }

    // Get interview details
    const { data: interview } = await this.supabase
      .from('interviews')
      .select(`
        job_id,
        candidate_id,
        selected_agents,
        jobs (*)
      `)
      .eq('id', interviewId)
      .single();

    if (!interview) {
      throw new Error(`Interview not found: ${interviewId}`);
    }

    // Extract job data (available for both HR and expert agents)
    const job = (interview.jobs as any)?.[0];
    const normalized = job?.normalized_json as any;

    // Decide next action
    const decision = await plannerAgent.decideNextAction(
      state,
      interview.job_id,
      interview.candidate_id
    );

    if (decision.action === 'complete') {
      await this.completeInterview(interviewId);
      return;
    }

    if (!decision.competency || !decision.agentType) {
      throw new Error('Invalid decision from planner');
    }

    // Generate question using appropriate agent
    let question: Question | HRQuestion;
    if (decision.agentType === 'hr') {
      question = await hrBehavioralAgent.generateQuestion(
        decision.competency,
        state.candidateAnalysis
      );
    } else {
      // Check if HR selected specific agents for this interview
      const selectedAgents = interview.selected_agents as string[] | null;
      const preferredAgents = job?.preferred_agents as string[] | null;
      
      // Determine which agent to use
      let agentDomain = decision.domain || state.jobDomain;
      
      // If HR selected agents, try to match one of them
      if (selectedAgents && selectedAgents.length > 0) {
        // Use first matching agent from selection
        const matchingAgent = selectedAgents.find((agentId) => {
          if (agentId === 'backend' && (agentDomain === 'backend' || !agentDomain)) return true;
          if (agentId === 'ml' && (agentDomain === 'ml' || agentDomain === 'machine-learning')) return true;
          if (agentId === 'frontend' && (agentDomain === 'frontend' || !agentDomain)) return true;
          return false;
        });
        if (matchingAgent) {
          agentDomain = matchingAgent === 'ml' ? 'ml' : matchingAgent;
        }
      } else if (preferredAgents && preferredAgents.length > 0) {
        // Fall back to job preferred agents
        const matchingAgent = preferredAgents.find((agentId) => {
          if (agentId === 'backend' && (agentDomain === 'backend' || !agentDomain)) return true;
          if (agentId === 'ml' && (agentDomain === 'ml' || agentDomain === 'machine-learning')) return true;
          if (agentId === 'frontend' && (agentDomain === 'frontend' || !agentDomain)) return true;
          return false;
        });
        if (matchingAgent) {
          agentDomain = matchingAgent === 'ml' ? 'ml' : matchingAgent;
        }
      }
      
      const expertAgent = ExpertAgentFactory.getExpertAgent(
        agentDomain,
        decision.competency,
        normalized?.techStack
      );
      
      // All expert agents have the same interface
      question = await (expertAgent as any).generateQuestion(
        decision.competency!,
        state.difficulty,
        interview.candidate_id,
        job
      );
    }

    // Record question event
    await this.recordEvent(interviewId, 'question', {
      ...question,
      agentType: decision.agentType,
      domain: decision.domain,
      reasoning: decision.reasoning,
      techStack: normalized?.techStack,
    });

    // Update state
    const updatedState = {
      ...state,
      currentCompetency: decision.competency,
    };
    this.stateMap.set(interviewId, updatedState);
  }

  /**
   * Complete interview and generate evaluation
   */
  private async completeInterview(interviewId: string): Promise<void> {
    // Generate final evaluation
    const evaluation = await evaluationAgent.generateEvaluation(interviewId);

    // Save evaluation to database
    await this.supabase.from('evaluations').upsert({
      interview_id: interviewId,
      scores_json: {
        ...evaluation.scores,
        candidateSummary: evaluation.candidateSummary, // Store candidate-friendly summary in scores_json for now
      },
      summary: evaluation.summary, // Full HR summary
      recommendation: evaluation.recommendation,
    });

    // Update interview status
    await this.supabase
      .from('interviews')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', interviewId);

    // Save transcript
    const { data: events } = await this.supabase
      .from('interview_events')
      .select('*')
      .eq('interview_id', interviewId)
      .order('timestamp', { ascending: true });

    await storageService.uploadFile(
      'interviews',
      storageService.getInterviewTranscriptPath(interviewId),
      Buffer.from(JSON.stringify(events, null, 2)),
      { contentType: 'application/json' }
    );

    // Record system event
    await this.recordEvent(interviewId, 'system', {
      message: 'Interview completed',
      evaluation: evaluation,
    });

    // Clean up state
    this.stateMap.delete(interviewId);
  }

  /**
   * Record an interview event
   */
  private async recordEvent(
    interviewId: string,
    type: 'question' | 'answer' | 'score' | 'system',
    payload: any
  ): Promise<void> {
    await this.supabase.from('interview_events').insert({
      interview_id: interviewId,
      type,
      payload,
    });
  }
}

export const interviewOrchestrator = new InterviewOrchestrator();


