import { createAdminClient } from '../supabase/admin';
import { gemini, GEMINI_MODELS } from '../gemini/client';

export interface CandidateChunk {
  text: string;
  source: string;
  url?: string;
  metadata?: Record<string, any>;
}

export class VectorStore {
  private supabase = createAdminClient();

  /**
   * Generate embedding for text using Gemini
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const model = gemini.getGenerativeModel({ model: GEMINI_MODELS.EMBEDDING });
    
    const result = await model.embedContent(text);
    const embedding = result.embedding;
    
    // Gemini returns values array directly
    return embedding.values;
  }

  /**
   * Store candidate chunks with embeddings
   */
  async storeCandidateChunks(
    candidateId: string,
    chunks: CandidateChunk[]
  ): Promise<void> {
    // Generate embeddings for all chunks
    const embeddings = await Promise.all(
      chunks.map((chunk) => this.generateEmbedding(chunk.text))
    );

    // Insert into database
    const records = chunks.map((chunk, index) => ({
      candidate_id: candidateId,
      source: chunk.source,
      chunk_text: chunk.text,
      metadata: {
        url: chunk.url,
        ...chunk.metadata,
      },
      embedding: embeddings[index],
    }));

    const { error } = await this.supabase
      .from('candidate_embeddings')
      .upsert(records, {
        onConflict: 'candidate_id,source,chunk_text',
      });

    if (error) throw error;
  }

  /**
   * Retrieve relevant candidate context using vector similarity search
   */
  async retrieveCandidateContext(
    candidateId: string,
    query: string,
    k: number = 5
  ): Promise<CandidateChunk[]> {
    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);

    // Vector similarity search using pgvector
    const { data, error } = await this.supabase.rpc('match_candidate_embeddings', {
      candidate_id: candidateId,
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: k,
    });

    if (error) {
      // If function doesn't exist, fall back to manual query
      // This is a simplified version - you'll want to create the function in Supabase
      const { data: chunks, error: queryError } = await this.supabase
        .from('candidate_embeddings')
        .select('chunk_text, source, metadata')
        .eq('candidate_id', candidateId)
        .limit(k);

      if (queryError) throw queryError;

      return (chunks || []).map((chunk) => ({
        text: chunk.chunk_text,
        source: chunk.source,
        url: chunk.metadata?.url,
        metadata: chunk.metadata,
      }));
    }

    return (data || []).map((item: any) => ({
      text: item.chunk_text,
      source: item.source,
      url: item.metadata?.url,
      metadata: item.metadata,
    }));
  }

  /**
   * Delete all embeddings for a candidate
   */
  async deleteCandidateEmbeddings(candidateId: string): Promise<void> {
    const { error } = await this.supabase
      .from('candidate_embeddings')
      .delete()
      .eq('candidate_id', candidateId);

    if (error) throw error;
  }
}

export const vectorStore = new VectorStore();


