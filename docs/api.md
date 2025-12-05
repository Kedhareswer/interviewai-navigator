# API Documentation

This document describes all API endpoints in InterviewOS, including request/response formats, authentication, and usage examples.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: Your Vercel deployment URL

## Authentication

All API endpoints (except public invitation page) require authentication via Supabase session cookie.

### Session Management

Sessions are managed via Supabase Auth and automatically included in requests via cookies.

**Server-Side**: Use `getSessionWithProfile()` from `src/lib/auth/session.ts`

**Client-Side**: Supabase client automatically includes session in requests

## Response Format

All API responses follow this format:

```typescript
{
  data: T | null;
  error: string | null;
}
```

**Success Response** (200):
```json
{
  "data": { /* response data */ },
  "error": null
}
```

**Error Response** (4xx/5xx):
```json
{
  "data": null,
  "error": "Error message"
}
```

## Endpoints

### Jobs

#### List Jobs

**GET** `/api/jobs`

**Authentication**: Required (HR or Candidate)

**Response**:
```typescript
{
  data: Array<{
    id: string;
    title: string;
    level: string;
    description_raw: string;
    normalized_json: any | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
  }>;
  error: null;
}
```

#### Create Job

**POST** `/api/jobs`

**Authentication**: Required (HR only)

**Request Body**:
```json
{
  "title": "Senior Backend Engineer",
  "level": "senior",
  "description_raw": "Job description text...",
  "preferred_agents": ["backend"] // Optional
}
```

**Response**:
```typescript
{
  data: {
    id: string;
    title: string;
    level: string;
    description_raw: string;
    normalized_json: null;
    created_by: string;
    created_at: string;
    updated_at: string;
  };
  error: null;
}
```

#### Get Job

**GET** `/api/jobs/[id]`

**Authentication**: Required

**Response**:
```typescript
{
  data: {
    id: string;
    title: string;
    level: string;
    description_raw: string;
    normalized_json: any | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
  };
  error: null;
}
```

#### Update Job

**PATCH** `/api/jobs/[id]`

**Authentication**: Required (HR only, own jobs)

**Request Body**:
```json
{
  "title": "Updated Title", // Optional
  "level": "mid", // Optional
  "description_raw": "Updated description", // Optional
  "preferred_agents": ["backend", "ml"] // Optional
}
```

**Response**: Updated job object

#### Delete Job

**DELETE** `/api/jobs/[id]`

**Authentication**: Required (HR only, own jobs)

**Response**:
```json
{
  "data": { "id": "job-id" },
  "error": null
}
```

#### Ingest Job

**POST** `/api/jobs/[id]/ingest`

**Authentication**: Required (HR only)

**Purpose**: Normalize job description using JobUnderstandingAgent

**Response**:
```typescript
{
  data: {
    normalized: {
      competencies: Array<{
        name: string;
        weight: number;
        level: string;
      }>;
      level: string;
      techStack: string[];
      requirements: string[];
      domain?: string;
    };
  };
  error: null;
}
```

### Candidates

#### List Candidates

**GET** `/api/candidates`

**Authentication**: Required (HR only)

**Response**:
```typescript
{
  data: Array<{
    id: string;
    name: string;
    email: string;
    links: {
      linkedin?: string;
      github?: string;
      portfolio?: string;
    } | null;
    resume_url: string | null;
    user_id: string | null;
    created_at: string;
    updated_at: string;
  }>;
  error: null;
}
```

#### Create Candidate

**POST** `/api/candidates`

**Authentication**: Required (HR or Candidate)

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "links": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "johndoe",
    "portfolio": "https://johndoe.dev"
  },
  "resume_url": "https://example.com/resume.pdf"
}
```

**Response**: Created candidate object

#### Get Candidate

**GET** `/api/candidates/[id]`

**Authentication**: Required (HR or candidate owner)

**Response**: Candidate object

#### Update Candidate

**PATCH** `/api/candidates/[id]`

**Authentication**: Required (HR or candidate owner)

**Request Body**: Partial candidate object

**Response**: Updated candidate object

#### Delete Candidate

**DELETE** `/api/candidates/[id]`

**Authentication**: Required (HR only)

**Response**: Deletion confirmation

#### Ingest Candidate

**POST** `/api/candidates/[id]/ingest`

**Authentication**: Required (HR only)

**Purpose**: Collect and index candidate data (resume, GitHub, portfolio, LinkedIn)

**Process**:
1. Parses resume (if URL provided)
2. Fetches GitHub repos (if username provided)
3. Scrapes portfolio (if URL provided)
4. Extracts LinkedIn data (if URL provided)
5. Generates embeddings for all chunks
6. Stores in `candidate_embeddings` table

**Response**:
```json
{
  "data": {
    "message": "Candidate ingestion completed",
    "chunksIndexed": 42
  },
  "error": null
}
```

### Interviews

#### List Interviews

**GET** `/api/interviews`

**Authentication**: Required

**Query Parameters**:
- `status`: Filter by status (`scheduled`, `in_progress`, `completed`, `cancelled`)
- `job_id`: Filter by job ID
- `candidate_id`: Filter by candidate ID

**Example**: `/api/interviews?status=in_progress&job_id=xxx`

**Response**:
```typescript
{
  data: Array<{
    id: string;
    job_id: string;
    candidate_id: string;
    status: string;
    mode: 'chat' | 'voice';
    created_at: string;
    updated_at: string;
    started_at: string | null;
    completed_at: string | null;
    difficulty_override: string | null;
    selected_agents: string[] | null;
    jobs?: Job;
    candidates?: Candidate;
  }>;
  error: null;
}
```

#### Create Interview

**POST** `/api/interviews`

**Authentication**: Required (HR only)

**Request Body**:
```json
{
  "job_id": "job-uuid",
  "candidate_id": "candidate-uuid",
  "mode": "chat", // or "voice"
  "difficulty_override": "senior", // Optional
  "selected_agents": ["backend", "ml"] // Optional
}
```

**Response**: Created interview object

#### Get Interview

**GET** `/api/interviews/[id]`

**Authentication**: Required (HR or candidate owner)

**Response**: Interview object with related job and candidate

#### Update Interview

**PATCH** `/api/interviews/[id]`

**Authentication**: Required (HR only)

**Request Body**: Partial interview object

**Response**: Updated interview object

#### Start Interview

**POST** `/api/interviews/[id]/start`

**Authentication**: Required (HR only)

**Purpose**: Initialize and start interview orchestration

**Process**:
1. Updates interview status to `in_progress`
2. Sets `started_at` timestamp
3. Calls `InterviewOrchestrator.start()`
4. Initializes planner state
5. Generates first question

**Response**:
```json
{
  "data": {
    "interview": { /* interview object */ },
    "message": "Interview started"
  },
  "error": null
}
```

#### Submit Answer

**POST** `/api/interviews/[id]/answer`

**Authentication**: Required (Candidate only, interview owner)

**Request Body**:
```json
{
  "answer": "Candidate's answer text",
  "question_id": "event-id-of-question" // Optional
}
```

**Process**:
1. Records answer as `interview_events` event
2. Calls `InterviewOrchestrator.processAnswer()`
3. Evaluates answer through appropriate agent
4. Records score event
5. Generates next question or completes interview

**Response**:
```json
{
  "data": {
    "event": { /* answer event */ },
    "message": "Answer recorded"
  },
  "error": null
}
```

#### Stream Interview Events

**GET** `/api/interviews/[id]/stream`

**Authentication**: Required

**Purpose**: Server-Sent Events (SSE) stream for real-time interview updates

**Response**: Event stream with events:
- `connected`: Initial connection confirmation
- `event`: New interview event (question, answer, score, system)
- `heartbeat`: Keep-alive message (every 30 seconds)

**Event Format**:
```
data: {"type": "event", "data": { /* interview_event object */ }}

data: {"type": "heartbeat"}

```

**Client Usage**:
```typescript
const eventSource = new EventSource(`/api/interviews/${id}/stream`);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'event') {
    // Handle interview event
    console.log(data.data);
  }
};
```

#### Get Evaluation

**GET** `/api/interviews/[id]/evaluation`

**Authentication**: Required (HR or candidate owner)

**Purpose**: Retrieve final interview evaluation

**Response**:
```typescript
{
  data: {
    id: string;
    interview_id: string;
    scores_json: {
      [competency: string]: number; // 0-1 score
      candidateSummary?: string; // Candidate-friendly summary
    };
    summary: string; // Full HR summary
    recommendation: 'strong_yes' | 'yes' | 'no' | 'strong_no';
    created_at: string;
    updated_at: string;
  };
  error: null;
}
```

#### Get Interview Invitation (Public)

**GET** `/api/interviews/[id]/invitation`

**Authentication**: Not required (public endpoint)

**Purpose**: Get interview details for public invitation page

**Response**: Interview object with job and candidate details

### Profiles

#### Get Profile

**GET** `/api/profiles`

**Authentication**: Required

**Purpose**: Get current user's profile

**Response**:
```typescript
{
  data: {
    id: string;
    role: 'hr' | 'candidate';
    full_name: string | null;
    company: string | null;
    resume_url: string | null;
    email: string; // From auth.users
    created_at: string;
    updated_at: string;
  };
  error: null;
}
```

#### Update Profile

**PATCH** `/api/profiles`

**Authentication**: Required

**Request Body**:
```json
{
  "full_name": "John Doe", // Optional
  "company": "Acme Corp", // Optional
  "resume_url": "https://example.com/resume.pdf" // Optional
}
```

**Response**: Updated profile object

## Error Codes

### HTTP Status Codes

- `200`: Success
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

### Common Error Messages

- `"Unauthorized"`: Not authenticated
- `"Forbidden"`: Insufficient permissions
- `"Interview not found"`: Invalid interview ID
- `"Job not found"`: Invalid job ID
- `"Candidate not found"`: Invalid candidate ID
- `"Interview state not found"`: Interview not started or state lost

## Rate Limiting

Currently no rate limiting implemented. Consider adding:
- Per-user rate limits
- Per-endpoint rate limits
- API key-based limits

## Webhooks (Future)

Potential webhook events:
- Interview started
- Interview completed
- Evaluation generated
- Candidate ingested

## SDK Examples

### JavaScript/TypeScript

```typescript
// Create job
const response = await fetch('/api/jobs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Senior Engineer',
    level: 'senior',
    description_raw: '...'
  })
});

const { data, error } = await response.json();
```

### cURL

```bash
# Start interview
curl -X POST https://your-domain.com/api/interviews/xxx/start \
  -H "Cookie: sb-access-token=..." \
  -H "Content-Type: application/json"
```

## References

- [Architecture Overview](./architecture.md) - System architecture
- [HR Flow](./hr-flow.md) - HR usage patterns
- [Candidate Flow](./candidate-flow.md) - Candidate usage patterns

