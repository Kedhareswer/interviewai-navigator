# Database Schema

This document describes the database schema, relationships, and data structures used in InterviewOS.

## Database Overview

**Platform**: Supabase (PostgreSQL)

**Extensions**:
- `uuid-ossp`: UUID generation
- `vector` (pgvector): Vector similarity search

**Security**: Row Level Security (RLS) enabled on all tables

## Schema Diagram

```
┌─────────────┐
│   profiles  │
│  (auth)     │
└──────┬──────┘
       │
       │ user_id
       │
┌──────▼──────────┐
│   candidates    │
└──────┬──────────┘
       │
       │ candidate_id
       │
┌──────▼──────────┐      ┌─────────────┐
│   interviews    │◄─────┤    jobs     │
└──────┬──────────┘      └─────────────┘
       │
       │ interview_id
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│interview_    │  │ evaluations  │
│  events      │  └──────────────┘
└──────┬───────┘
       │
       │ candidate_id
       │
       ▼
┌──────────────┐
│  candidate_  │
│  embeddings  │
└──────────────┘

┌──────────────┐
│   hr_config  │
│  (standalone)│
└──────────────┘
```

## Tables

### profiles

User profiles linked to Supabase Auth.

**Columns**:
- `id` (UUID, PK): References `auth.users(id)`
- `role` (user_role ENUM): `'hr'` or `'candidate'`
- `full_name` (TEXT): User's full name
- `company` (TEXT): Company name (usually for HR)
- `resume_url` (TEXT): Resume URL (usually for candidates)
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**Indexes**:
- Primary key on `id`

**RLS Policies**:
- Users can view own profile
- HR can view all profiles
- Users can update own profile

**Triggers**:
- `handle_new_user()`: Auto-creates profile on user signup
- `update_profiles_updated_at()`: Auto-updates `updated_at`

### jobs

Job postings with normalized requirements.

**Columns**:
- `id` (UUID, PK): Job identifier
- `title` (TEXT): Job title
- `level` (TEXT): `'junior'`, `'mid'`, `'senior'`, `'staff'`
- `description_raw` (TEXT): Raw job description
- `normalized_json` (JSONB): Structured job data (see below)
- `preferred_agents` (JSONB): Array of preferred agent IDs
- `created_by` (UUID, FK): References `auth.users(id)`
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**normalized_json Structure**:
```json
{
  "competencies": [
    {
      "name": "System Design",
      "weight": 0.3,
      "level": "senior"
    }
  ],
  "level": "senior",
  "techStack": ["Python", "FastAPI"],
  "requirements": ["5+ years"],
  "domain": "backend"
}
```

**Indexes**:
- Primary key on `id`
- Index on `created_by`

**RLS Policies**:
- HR can view all jobs
- Candidates can view all jobs
- HR can create jobs
- HR can update/delete own jobs

**Triggers**:
- `update_jobs_updated_at()`: Auto-updates `updated_at`

### candidates

Candidate profiles with links to external data sources.

**Columns**:
- `id` (UUID, PK): Candidate identifier
- `name` (TEXT): Candidate name
- `email` (TEXT): Email address
- `links` (JSONB): External links (see below)
- `resume_url` (TEXT): Resume file URL
- `user_id` (UUID, FK, UNIQUE): References `auth.users(id)` (nullable)
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**links Structure**:
```json
{
  "linkedin": "https://linkedin.com/in/...",
  "github": "username or URL",
  "portfolio": "https://portfolio.com"
}
```

**Indexes**:
- Primary key on `id`
- Unique index on `user_id`

**RLS Policies**:
- HR can view all candidates
- Candidates can view own record (via `user_id`)
- HR can create candidates
- Candidates can create own record
- HR can update all candidates
- Candidates can update own record
- HR can delete candidates

**Triggers**:
- `update_candidates_updated_at()`: Auto-updates `updated_at`

### interviews

Interview sessions linking jobs and candidates.

**Columns**:
- `id` (UUID, PK): Interview identifier
- `job_id` (UUID, FK): References `jobs(id)`
- `candidate_id` (UUID, FK): References `candidates(id)`
- `status` (TEXT): `'scheduled'`, `'in_progress'`, `'completed'`, `'cancelled'`
- `mode` (TEXT): `'chat'` or `'voice'`
- `difficulty_override` (TEXT): Override difficulty (`'junior'`, `'mid'`, `'senior'`, `'staff'`)
- `selected_agents` (JSONB): Array of selected agent IDs
- `scheduled_by` (UUID, FK): References `auth.users(id)` (HR who scheduled)
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp
- `started_at` (TIMESTAMPTZ): Interview start timestamp
- `completed_at` (TIMESTAMPTZ): Interview completion timestamp

**Indexes**:
- Primary key on `id`
- Index on `job_id`
- Index on `candidate_id`
- Index on `status`
- Composite index on `(job_id, candidate_id)`
- Composite index on `(status, created_at DESC)`

**RLS Policies**:
- HR can view all interviews
- Candidates can view own interviews (via `candidates.user_id`)
- HR can create interviews
- HR can update interviews
- HR can delete interviews

**Triggers**:
- `update_interviews_updated_at()`: Auto-updates `updated_at`

### interview_events

Event log for all interview activities (audit trail).

**Columns**:
- `id` (UUID, PK): Event identifier
- `interview_id` (UUID, FK): References `interviews(id)`
- `timestamp` (TIMESTAMPTZ): Event timestamp
- `type` (TEXT): `'question'`, `'answer'`, `'score'`, `'system'`
- `payload` (JSONB): Event-specific data (see below)
- `created_at` (TIMESTAMPTZ): Creation timestamp

**payload Structures**:

**Question Event**:
```json
{
  "text": "Question text",
  "competency": "System Design",
  "difficulty": "senior",
  "expectedAnswer": "Expected answer points",
  "agentType": "domain",
  "domain": "backend",
  "techStack": ["Python", "FastAPI"]
}
```

**Answer Event**:
```json
{
  "answer": "Candidate's answer",
  "question_id": "event-id"
}
```

**Score Event**:
```json
{
  "competency": "System Design",
  "score": 0.85,
  "evidence": "Evidence from answer",
  "recommendation": "sufficient"
}
```

**System Event**:
```json
{
  "message": "Interview started",
  "state": { /* planner state */ },
  "candidateAnalysis": { /* analysis */ }
}
```

**Indexes**:
- Primary key on `id`
- Index on `interview_id`
- Index on `timestamp`
- Composite index on `(interview_id, type)`

**RLS Policies**:
- Users can view events for accessible interviews
- System can create events (via service role)

### evaluations

Final interview evaluations with scores and recommendations.

**Columns**:
- `id` (UUID, PK): Evaluation identifier
- `interview_id` (UUID, FK, UNIQUE): References `interviews(id)`
- `scores_json` (JSONB): Competency scores and summaries (see below)
- `summary` (TEXT): Full HR evaluation summary
- `recommendation` (TEXT): `'strong_yes'`, `'yes'`, `'no'`, `'strong_no'`
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**scores_json Structure**:
```json
{
  "System Design": 0.85,
  "Python": 0.90,
  "API Design": 0.80,
  "candidateSummary": "Encouraging summary for candidate"
}
```

**Indexes**:
- Primary key on `id`
- Unique index on `interview_id`

**RLS Policies**:
- Users can view evaluations for accessible interviews
- System can create evaluations (via service role)

**Triggers**:
- `update_evaluations_updated_at()`: Auto-updates `updated_at`

### candidate_embeddings

Vector embeddings for RAG (Retrieval-Augmented Generation).

**Columns**:
- `id` (UUID, PK): Embedding identifier
- `candidate_id` (UUID, FK): References `candidates(id)`
- `source` (TEXT): Source of data (`'resume'`, `'github'`, `'portfolio'`, `'linkedin'`)
- `chunk_text` (TEXT): Text chunk content
- `metadata` (JSONB): Additional metadata (see below)
- `embedding` (vector(768)): Vector embedding (Gemini text-embedding-004)
- `created_at` (TIMESTAMPTZ): Creation timestamp

**metadata Structure**:
```json
{
  "url": "https://...",
  "section": "experience",
  "repoName": "project-name",
  "language": "Python"
}
```

**Indexes**:
- Primary key on `id`
- Index on `candidate_id`
- Index on `source`
- HNSW index on `embedding` for similarity search
- Composite index on `(candidate_id, source)`

**RLS Policies**:
- Users can view embeddings for accessible candidates
- System can create embeddings (via service role)

### hr_config

HR configuration and question library.

**Columns**:
- `id` (UUID, PK): Config identifier
- `key` (TEXT, UNIQUE): Configuration key
- `value` (JSONB): Configuration value
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**Common Keys**:
- `behavioral_questions`: Array of behavioral question templates

**behavioral_questions Structure**:
```json
[
  {
    "id": "q1",
    "text": "Tell me about a time...",
    "category": "problem_solving",
    "tags": ["leadership", "conflict"]
  }
]
```

**Indexes**:
- Primary key on `id`
- Unique index on `key`

**RLS Policies**:
- Authenticated users can view config
- Authenticated users can manage config

**Triggers**:
- `update_hr_config_updated_at()`: Auto-updates `updated_at`

## Database Functions

### match_candidate_embeddings

Vector similarity search function for RAG.

**Signature**:
```sql
match_candidate_embeddings(
  candidate_id UUID,
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
```

**Returns**: Table with matching chunks and similarity scores

**Usage**:
```sql
SELECT * FROM match_candidate_embeddings(
  'candidate-uuid',
  '[0.1, 0.2, ...]'::vector(768),
  0.7,
  5
);
```

### is_hr()

Check if current user is HR.

**Returns**: BOOLEAN

**Usage**: Used in RLS policies

### is_candidate()

Check if current user is candidate.

**Returns**: BOOLEAN

**Usage**: Used in RLS policies

### handle_new_user()

Trigger function that creates profile on user signup.

**Trigger**: `on_auth_user_created` on `auth.users`

### update_updated_at_column()

Generic trigger function to update `updated_at` timestamp.

**Used by**: All tables with `updated_at` column

## Relationships

### One-to-Many

- `jobs` → `interviews` (one job can have many interviews)
- `candidates` → `interviews` (one candidate can have many interviews)
- `interviews` → `interview_events` (one interview has many events)
- `candidates` → `candidate_embeddings` (one candidate has many embeddings)

### One-to-One

- `interviews` → `evaluations` (one interview has one evaluation)

### Many-to-One

- `interviews` → `jobs` (many interviews belong to one job)
- `interviews` → `candidates` (many interviews belong to one candidate)
- `candidates` → `profiles` (via `user_id`)

## Data Types

### UUID

Used for all primary keys and foreign keys. Generated using `uuid_generate_v4()`.

### JSONB

Used for flexible schema data:
- `jobs.normalized_json`: Structured job data
- `candidates.links`: External links
- `interview_events.payload`: Event-specific data
- `evaluations.scores_json`: Scores and summaries
- `candidate_embeddings.metadata`: Chunk metadata
- `hr_config.value`: Configuration data

### vector(768)

pgvector type for storing embeddings. 768 dimensions for Gemini `text-embedding-004`.

### ENUM Types

- `user_role`: `'hr'`, `'candidate'`

## Indexes

### Performance Indexes

- **HNSW Index**: On `candidate_embeddings.embedding` for fast vector search
- **Composite Indexes**: On common query patterns
- **Foreign Key Indexes**: On all foreign keys

### Index Strategy

- Primary keys: Automatic indexes
- Foreign keys: Indexed for join performance
- Query patterns: Composite indexes on frequently queried columns
- Vector search: HNSW index for similarity search

## Row Level Security (RLS)

All tables have RLS enabled with policies that:

1. **Authenticate**: Require valid session
2. **Authorize**: Check role and ownership
3. **Isolate**: Ensure data access is restricted appropriately

### Policy Patterns

**HR Access**:
- Can view all records
- Can create/update/delete own records
- Can manage candidates and interviews

**Candidate Access**:
- Can view own records
- Can update own profile
- Can view own interviews and evaluations

**System Access**:
- Service role can perform all operations
- Used for background jobs and ingestion

## Migrations

Migrations are located in `supabase/migrations/`:

1. `001_initial_schema.sql`: Core schema
2. `002_vector_search_function.sql`: Vector search function
3. `003_fix_security_and_performance.sql`: Security and performance fixes
4. `004_public_access.sql`: Public access policies
5. `005_auth_roles.sql`: Auth and role management
6. `006_interview_metadata.sql`: Interview configuration fields

## Storage Buckets

Supabase Storage buckets for artifacts:

- `jobs`: Job description files
- `candidates`: Resume files, LinkedIn data, GitHub data, portfolio files
- `interviews`: Interview transcripts

## Backup & Recovery

### Backup Strategy

- Supabase provides automatic daily backups
- Point-in-time recovery available
- Manual backups via Supabase dashboard

### Data Retention

- Interview data retained for compliance
- Embeddings retained for future interviews
- Artifacts stored in Supabase Storage

## Performance Considerations

### Query Optimization

- Use indexes for common queries
- Limit result sets with pagination
- Use vector search for semantic queries

### Vector Search Performance

- HNSW index provides fast similarity search
- Tune `match_threshold` and `match_count` for balance
- Consider caching frequent queries

### Database Size

- Monitor embedding storage (can grow large)
- Consider archiving old interviews
- Clean up unused embeddings

## References

- [Architecture Overview](./architecture.md) - System architecture
- [API Documentation](./api.md) - API endpoints
- [Supabase Documentation](https://supabase.com/docs) - Platform documentation

