export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string;
          title: string;
          level: string;
          description_raw: string;
          normalized_json: Json | null;
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          links?: Json | null;
          resume_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          links?: Json | null;
          resume_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      interviews: {
        Row: {
          id: string;
          job_id: string;
          candidate_id: string;
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          mode: 'voice' | 'chat';
          created_at: string;
          updated_at: string;
          started_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          job_id: string;
          candidate_id: string;
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          mode?: 'voice' | 'chat';
          created_at?: string;
          updated_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          job_id?: string;
          candidate_id?: string;
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          mode?: 'voice' | 'chat';
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
          type: 'question' | 'answer' | 'score' | 'system';
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          timestamp?: string;
          type: 'question' | 'answer' | 'score' | 'system';
          payload: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          timestamp?: string;
          type?: 'question' | 'answer' | 'score' | 'system';
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
          recommendation: 'strong_yes' | 'yes' | 'no' | 'strong_no';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          scores_json: Json;
          summary?: string | null;
          recommendation: 'strong_yes' | 'yes' | 'no' | 'strong_no';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          scores_json?: Json;
          summary?: string | null;
          recommendation?: 'strong_yes' | 'yes' | 'no' | 'strong_no';
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
    };
  };
}


