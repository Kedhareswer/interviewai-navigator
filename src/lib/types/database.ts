export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================
// User Role Types
// ============================================
export type UserRole = 'hr' | 'candidate';

// ============================================
// Interview Types
// ============================================
export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type InterviewMode = 'voice' | 'chat';
export type DifficultyLevel = 'junior' | 'mid' | 'senior' | 'staff';
export type Recommendation = 'strong_yes' | 'yes' | 'no' | 'strong_no';
export type EventType = 'question' | 'answer' | 'score' | 'system';

// ============================================
// Agent Types (Centralized)
// ============================================
export interface Question {
  text: string;
  competency: string;
  difficulty: DifficultyLevel;
  expectedAnswer: string;
}

export interface AnswerEvaluation {
  score: number; // 0-1
  evidence: string;
  recommendation: 'probe_deeper' | 'move_on' | 'sufficient';
}

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

export interface CandidateAnalysis {
  strengths: string[];
  risks: string[];
  recommendedDifficulty: DifficultyLevel;
  summary: string;
  experienceLevel: string;
  keyTechnologies: string[];
}

export interface NormalizedJob {
  competencies: Array<{
    name: string;
    weight: number;
    level: string;
  }>;
  level: string;
  techStack: string[];
  requirements: string[];
  domain?: string;
}

export interface Evaluation {
  scores: Record<string, number>;
  summary: string;
  candidateSummary?: string;
  recommendation: Recommendation;
}

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
  difficulty: DifficultyLevel;
  candidateAnalysis?: CandidateAnalysis;
  jobDomain?: string;
}

// ============================================
// Candidate Links Type
// ============================================
export interface CandidateLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  notes?: string;
  [key: string]: string | undefined;
}

// ============================================
// Database Schema Types
// ============================================
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          company: string | null;
          resume_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name?: string | null;
          company?: string | null;
          resume_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string | null;
          company?: string | null;
          resume_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          title: string;
          level: string;
          description_raw: string;
          normalized_json: Json | null;
          preferred_agents: Json | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          level: string;
          description_raw: string;
          normalized_json?: Json | null;
          preferred_agents?: Json | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          level?: string;
          description_raw?: string;
          normalized_json?: Json | null;
          preferred_agents?: Json | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidates: {
        Row: {
          id: string;
          name: string;
          email: string;
          links: Json | null;
          resume_url: string | null;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          links?: Json | null;
          resume_url?: string | null;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          links?: Json | null;
          resume_url?: string | null;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      interviews: {
        Row: {
          id: string;
          job_id: string;
          candidate_id: string;
          status: InterviewStatus;
          mode: InterviewMode;
          scheduled_by: string | null;
          difficulty_override: DifficultyLevel | null;
          selected_agents: Json | null;
          created_at: string;
          updated_at: string;
          started_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          job_id: string;
          candidate_id: string;
          status?: InterviewStatus;
          mode?: InterviewMode;
          scheduled_by?: string | null;
          difficulty_override?: DifficultyLevel | null;
          selected_agents?: Json | null;
          created_at?: string;
          updated_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          job_id?: string;
          candidate_id?: string;
          status?: InterviewStatus;
          mode?: InterviewMode;
          scheduled_by?: string | null;
          difficulty_override?: DifficultyLevel | null;
          selected_agents?: Json | null;
          created_at?: string;
          updated_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
        };
      };
      interview_events: {
        Row: {
          id: string;
          interview_id: string;
          timestamp: string;
          type: EventType;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          timestamp?: string;
          type: EventType;
          payload: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          timestamp?: string;
          type?: EventType;
          payload?: Json;
          created_at?: string;
        };
      };
      evaluations: {
        Row: {
          id: string;
          interview_id: string;
          scores_json: Json;
          summary: string | null;
          recommendation: Recommendation;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          scores_json: Json;
          summary?: string | null;
          recommendation: Recommendation;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          scores_json?: Json;
          summary?: string | null;
          recommendation?: Recommendation;
          created_at?: string;
          updated_at?: string;
        };
      };
      hr_config: {
        Row: {
          id: string;
          key: string;
          value: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidate_embeddings: {
        Row: {
          id: string;
          candidate_id: string;
          source: string;
          chunk_text: string;
          metadata: Json | null;
          embedding: number[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          source: string;
          chunk_text: string;
          metadata?: Json | null;
          embedding?: number[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          source?: string;
          chunk_text?: string;
          metadata?: Json | null;
          embedding?: number[] | null;
          created_at?: string;
        };
      };
      interview_state: {
        Row: {
          id: string;
          interview_id: string;
          state: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          state: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          state?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// ============================================
// Helper Types for API Responses
// ============================================
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type Candidate = Database['public']['Tables']['candidates']['Row'];
export type Interview = Database['public']['Tables']['interviews']['Row'];
export type InterviewEvent = Database['public']['Tables']['interview_events']['Row'];
export type EvaluationRecord = Database['public']['Tables']['evaluations']['Row'];
export type HRConfig = Database['public']['Tables']['hr_config']['Row'];
export type CandidateEmbedding = Database['public']['Tables']['candidate_embeddings']['Row'];
export type InterviewState = Database['public']['Tables']['interview_state']['Row'];

// ============================================
// Extended Types with Relations
// ============================================
export interface InterviewWithRelations extends Interview {
  jobs?: Job | null;
  candidates?: Candidate | null;
  scheduled_by_profile?: Profile | null;
}

export interface CandidateWithEmbeddings extends Candidate {
  candidate_embeddings?: CandidateEmbedding[];
}

// Helper type for Job with typed normalized_json
export type JobWithNormalized = Omit<Job, 'normalized_json'> & {
  normalized_json: NormalizedJob | null;
};


