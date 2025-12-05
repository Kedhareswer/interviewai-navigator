-- Vector similarity search function for candidate embeddings
CREATE OR REPLACE FUNCTION match_candidate_embeddings(
  candidate_id UUID,
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  chunk_text TEXT,
  source TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    candidate_embeddings.id,
    candidate_embeddings.chunk_text,
    candidate_embeddings.source,
    candidate_embeddings.metadata,
    1 - (candidate_embeddings.embedding <=> query_embedding) as similarity
  FROM candidate_embeddings
  WHERE candidate_embeddings.candidate_id = match_candidate_embeddings.candidate_id
    AND candidate_embeddings.embedding IS NOT NULL
    AND 1 - (candidate_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY candidate_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;


