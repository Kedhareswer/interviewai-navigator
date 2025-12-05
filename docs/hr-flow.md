# HR Flow

This document describes the HR user journey through InterviewOS, from creating jobs and candidates to conducting interviews and reviewing evaluations.

## HR Journey Overview

```
┌─────────────┐
│   Sign Up   │
│   / Login   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Dashboard  │
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌─────┐ ┌─────┐
│Jobs │ │Cands│
└──┬──┘ └──┬──┘
   │       │
   └───┬───┘
       │
       ▼
┌─────────────┐
│ Interviews  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Evaluations │
└─────────────┘
```

## 1. Authentication & Setup

### Sign Up

**Route**: `/signup`

**Process**:
1. HR provides email, password
2. Sets role to `'hr'` in metadata
3. Optionally provides full name and company
4. Account created with HR role
5. Profile created in `profiles` table

### Profile Setup

**Fields**:
- `role`: `'hr'` (required)
- `full_name`: Optional
- `company`: Optional (recommended for HR)

### Dashboard Access

**Route**: `/dashboard`

**Access Control**:
- Only accessible to users with `role = 'hr'`
- Middleware redirects candidates to `/dashboard/candidate`
- Enforced by RLS policies

## 2. Job Management

### Creating a Job

**Route**: `/dashboard/jobs/new`

**Location**: `src/app/dashboard/jobs/new/page.tsx`

**Required Fields**:
- **Title**: Job title (e.g., "Senior Backend Engineer")
- **Level**: `junior`, `mid`, `senior`, `staff`
- **Description**: Raw job description text

**Optional Fields**:
- **Preferred Agents**: Array of agent IDs (`['backend', 'frontend', 'ml']`)
- **Difficulty Override**: Override default difficulty for interviews

**API Endpoint**: `POST /api/jobs`

**Process**:
1. Job created in `jobs` table
2. `description_raw` stored as-is
3. `normalized_json` initially null
4. HR can trigger ingestion to normalize

### Job Ingestion

**Purpose**: Normalize job description into structured format

**Trigger**: `POST /api/jobs/[id]/ingest`

**Process**:
1. `JobIngestionService` processes job
2. `JobUnderstandingAgent` analyzes description
3. Extracts:
   - Competencies with weights and levels
   - Tech stack
   - Domain classification
   - Requirements
4. Stores in `normalized_json` field
5. Saves raw JD to Supabase Storage

**Normalized Structure**:
```json
{
  "competencies": [
    {
      "name": "System Design",
      "weight": 0.3,
      "level": "senior"
    },
    {
      "name": "Python",
      "weight": 0.25,
      "level": "senior"
    }
  ],
  "level": "senior",
  "techStack": ["Python", "FastAPI", "PostgreSQL", "Redis"],
  "requirements": ["5+ years experience", "Distributed systems"],
  "domain": "backend"
}
```

### Managing Jobs

**Route**: `/dashboard/jobs`

**Features**:
- List all jobs
- View job details
- Edit job information
- Delete jobs
- Trigger ingestion
- View normalized data

**Job Details Page**: `/dashboard/jobs/[id]`

Shows:
- Job title and level
- Raw description
- Normalized competencies
- Tech stack
- Associated interviews

## 3. Candidate Management

### Creating a Candidate

**Route**: `/dashboard/candidates/new`

**Location**: `src/app/dashboard/candidates/new/page.tsx`

**Required Fields**:
- **Name**: Candidate full name
- **Email**: Email address

**Optional Fields**:
- **LinkedIn URL**: LinkedIn profile URL
- **GitHub Username/URL**: GitHub profile
- **Portfolio URL**: Personal website/portfolio
- **Resume URL**: Link to resume file (PDF/text)

**API Endpoint**: `POST /api/candidates`

**Process**:
1. Candidate record created in `candidates` table
2. Links stored as JSON object
3. `user_id` initially null (linked when candidate signs up)

### Candidate Ingestion

**Purpose**: Collect and index candidate data for RAG

**Trigger**: `POST /api/candidates/[id]/ingest`

**Process**:
1. `CandidateIngestionService` orchestrates collection
2. Processes each data source:
   - **Resume**: Parsed and chunked
   - **GitHub**: Repos fetched, READMEs extracted
   - **Portfolio**: Multi-page scraping
   - **LinkedIn**: Data extraction (if available)
3. All chunks embedded using Gemini
4. Stored in `candidate_embeddings` table
5. Artifacts saved to Supabase Storage

**Data Sources**:

#### Resume Processing
- PDF parsing using `pdf-parse`
- Text extraction
- Section detection (experience, education, skills, etc.)
- Chunking for RAG indexing

#### GitHub Processing
- Fetches user repositories via GitHub API
- Extracts repository metadata
- Downloads README files
- Converts to RAG chunks

#### Portfolio Processing
- Multi-page web scraping
- Text content extraction
- Metadata extraction (title, description)
- Chunking for indexing

#### LinkedIn Processing
- Structure ready for API/scraping service
- Currently placeholder implementation
- Can be extended with LinkedIn API or scraping service

### Managing Candidates

**Route**: `/dashboard/candidates`

**Features**:
- List all candidates
- View candidate details
- Edit candidate information
- Delete candidates
- Trigger ingestion
- View ingestion status
- Link to user account (if signed up)

**Candidate Details Page**: `/dashboard/candidates/[id]`

Shows:
- Candidate information
- Links (LinkedIn, GitHub, Portfolio)
- Resume URL
- Associated interviews
- Ingestion status
- Embedding count

## 4. Interview Management

### Creating an Interview

**Route**: `/dashboard/interviews/new`

**Location**: `src/app/dashboard/interviews/new/page.tsx`

**Required Fields**:
- **Job**: Select from existing jobs
- **Candidate**: Select from existing candidates
- **Mode**: `chat` or `voice`

**Optional Fields**:
- **Difficulty Override**: Override candidate analysis difficulty
- **Selected Agents**: Choose specific expert agents to use
  - Options: `['backend', 'frontend', 'ml']`
  - If not specified, uses job's preferred agents or auto-detection

**API Endpoint**: `POST /api/interviews`

**Process**:
1. Interview created with status `scheduled`
2. Links to job and candidate
3. Stores configuration (mode, difficulty, agents)
4. Ready for HR to start

### Starting an Interview

**Route**: `/dashboard/interviews/[id]`

**Location**: `src/app/dashboard/interviews/[id]/page.tsx`

**Action**: Click "Start Interview" button

**API Endpoint**: `POST /api/interviews/[id]/start`

**Process**:
1. Interview status updated to `in_progress`
2. `started_at` timestamp recorded
3. `InterviewOrchestrator.start()` called:
   - Loads job and candidate data
   - Initializes `PlannerAgent` state
   - Runs `CandidateUnderstandingAgent` analysis
   - Generates first question
   - Records system event
4. Interview begins, questions streamed via SSE

### Interview Configuration

**Difficulty Override**:
- Can override candidate analysis difficulty
- Options: `junior`, `mid`, `senior`, `staff`
- Useful for testing or specific requirements

**Agent Selection**:
- Can specify which expert agents to use
- Options: `backend`, `frontend`, `ml`
- If not specified, auto-detected from job domain
- Falls back to generic expert agent if no match

### Monitoring Interviews

**Real-Time View**:
- Watch interview progress in real-time
- See questions asked
- View candidate answers
- Monitor scores as they're generated
- Track interview state

**Event Stream**:
- Server-Sent Events (SSE) for real-time updates
- Events include: `question`, `answer`, `score`, `system`
- Updates automatically as interview progresses

### Interview Details

**Information Displayed**:
- Interview status
- Job and candidate information
- Interview mode
- Configuration (difficulty, agents)
- Event timeline
- Current question (if in progress)
- Evaluation (if completed)

## 5. Evaluation Review

### Viewing Evaluations

**Access**: After interview completion

**Location**: Interview details page or evaluations list

**Content**:
- **Recommendation**: `strong_yes`, `yes`, `no`, `strong_no`
- **Summary**: Comprehensive evaluation for HR
- **Scores**: Per-competency scores (0-1 scale)
- **Candidate Summary**: What candidate sees (for reference)

### Evaluation Structure

```typescript
interface Evaluation {
  scores: Record<string, number>; // competency -> score
  summary: string; // Full HR summary with details
  candidateSummary: string; // Sanitized for candidate
  recommendation: 'strong_yes' | 'yes' | 'no' | 'strong_no';
}
```

### Evaluation Details

**HR Summary Includes**:
- Detailed analysis of each competency
- Specific scores and evidence
- Strengths and weaknesses
- Comparison to job requirements
- Hiring recommendation with reasoning

**Scores Breakdown**:
- Individual competency scores
- Overall performance metrics
- Question-by-question analysis
- Evidence from candidate's background

### Interview Transcript

**Location**: Supabase Storage bucket `interviews`

**Path**: `{interview-id}/transcript.json`

**Content**: Complete event log including:
- All questions asked
- All answers provided
- All scores given
- System events
- Timestamps

## 6. HR Configuration

### Behavioral Questions Library

**Table**: `hr_config`

**Key**: `behavioral_questions`

**Structure**:
```json
[
  {
    "id": "q1",
    "text": "Tell me about a time you faced a challenging situation...",
    "category": "problem_solving",
    "tags": ["leadership", "conflict"]
  }
]
```

**Management**:
- Can be updated via database
- HR agent uses library for behavioral questions
- Questions can be categorized and tagged

### HR Functions

**Database Functions**:
- `is_hr()`: Returns true if current user is HR
- `is_candidate()`: Returns true if current user is candidate

**Used in**: RLS policies for access control

## 7. Dashboard Overview

**Route**: `/dashboard`

**Location**: `src/app/dashboard/page.tsx`

**Statistics Displayed**:
- Total jobs
- Total candidates
- Total interviews
- Active interviews
- Completed interviews
- Recent activity

**Quick Actions**:
- Create new job
- Add new candidate
- Start new interview
- View recent interviews

## Security & Access Control

### HR Permissions

**Can Access**:
- All jobs (create, read, update, delete own jobs)
- All candidates (full CRUD)
- All interviews (full CRUD)
- All evaluations
- HR configuration

**RLS Policies**:
- Jobs: HR can view all, modify own
- Candidates: HR can view and modify all
- Interviews: HR can view and modify all
- Evaluations: HR can view all

### Data Isolation

- HR data is separate from candidate data
- RLS policies enforce access control
- Service role key used only server-side

## Best Practices

### Job Creation

1. **Clear Descriptions**: Write detailed job descriptions
2. **Trigger Ingestion**: Always ingest jobs to normalize
3. **Review Normalization**: Check extracted competencies
4. **Set Preferred Agents**: Specify agents if needed

### Candidate Management

1. **Complete Information**: Provide all available links
2. **Trigger Ingestion**: Ingest candidates before interviews
3. **Verify Data**: Check ingestion status and embedding count
4. **Link Accounts**: Connect candidates to user accounts when they sign up

### Interview Conduct

1. **Prepare Candidates**: Ensure candidates are ingested
2. **Review Job**: Verify job is normalized
3. **Configure Properly**: Set difficulty and agents appropriately
4. **Monitor Progress**: Watch interviews in real-time
5. **Review Evaluations**: Carefully review evaluation results

## Troubleshooting

### Job Ingestion Fails

- Check Gemini API key
- Verify job description is not empty
- Review server logs for errors

### Candidate Ingestion Fails

- Verify URLs are accessible
- Check GitHub token if using GitHub
- Review individual service logs
- Some sources may fail silently (check embedding count)

### Interview Won't Start

- Verify job has `normalized_json`
- Verify candidate has embeddings
- Check Gemini API key
- Review orchestrator logs

### Evaluation Not Generated

- Verify interview completed successfully
- Check for errors in evaluation agent
- Review interview events for completeness

## References

- [Candidate Flow](./candidate-flow.md) - Candidate-side experience
- [Agent System](./agents.md) - How interviews work
- [API Documentation](./api.md) - HR-related endpoints
- [Database Schema](./database.md) - HR-related tables

