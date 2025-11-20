# InterviewOS Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

1. **Create a Supabase project** at https://supabase.com
2. **Enable pgvector extension:**
   - Go to Database → Extensions
   - Enable `vector` extension

3. **Run migrations:**
   - Go to SQL Editor in Supabase dashboard
   - Run migrations in order:
     - `supabase/migrations/001_initial_schema.sql` - Creates all tables, indexes, and triggers
     - `supabase/migrations/002_vector_search_function.sql` - Creates vector similarity search function
     - `supabase/migrations/003_fix_security_and_performance.sql` - Security fixes and performance indexes
     - `supabase/migrations/004_fix_rls_policies.sql` - Comprehensive RLS policies

4. **Set up Storage Buckets:**
   - Go to Storage in Supabase dashboard
   - Create buckets: `jobs`, `candidates`, `interviews`
   - Set them as private (not public)
   - Run `supabase/storage-setup.sql` to configure storage policies

### 3. Environment Variables

Copy `env.example` to `.env.local`:
```bash
cp env.example .env.local
```

Then fill in your `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key

# Optional: GitHub Token (for higher rate limits)
GITHUB_TOKEN=your_github_token

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Voice Services
ELEVENLABS_API_KEY=your_elevenlabs_key
GOOGLE_SPEECH_API_KEY=your_google_speech_key
```

**Where to find keys:**
- **Supabase**: Go to Project Settings → API
  - `NEXT_PUBLIC_SUPABASE_URL` = Your project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key
  - `SUPABASE_SERVICE_ROLE_KEY` = service_role key (keep secret!)
- **Gemini**: Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **GitHub**: Optional, get from [GitHub Settings](https://github.com/settings/tokens) (public_repo scope)
- **Voice Services**: Optional, for production voice interviews

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
src/
├── app/
│   ├── api/                    # Next.js API routes
│   │   ├── jobs/              # Job CRUD + ingestion
│   │   ├── candidates/        # Candidate CRUD + ingestion
│   │   └── interviews/        # Interview management + streaming
│   ├── dashboard/             # Frontend dashboard
│   │   ├── page.tsx          # Main dashboard
│   │   ├── jobs/             # Job management UI
│   │   ├── candidates/       # Candidate management UI
│   │   └── interviews/       # Interview UI + real-time interface
│   ├── layout.tsx            # Root layout with providers
│   └── page.tsx              # Landing page
├── components/                # React components
│   ├── ui/                   # shadcn/ui components
│   └── [various].tsx         # Feature components
├── lib/
│   ├── agents/               # AI agent system
│   │   ├── base-agent.ts    # Base agent class
│   │   ├── planner-agent.ts # Interview orchestration
│   │   ├── expert-agent.ts  # Technical questions
│   │   ├── hr-agent.ts      # Behavioral questions
│   │   ├── evaluation-agent.ts # Final evaluation
│   │   └── orchestrator.ts  # Interview flow control
│   ├── ingestion/            # Data ingestion services
│   │   ├── job-ingestion.ts # Job description normalization
│   │   ├── candidate-ingestion.ts # Candidate data processing
│   │   ├── resume-parser.ts # PDF/text resume parsing
│   │   ├── github-service.ts # GitHub API integration
│   │   ├── linkedin-service.ts # LinkedIn data extraction
│   │   └── portfolio-scraper.ts # Portfolio web scraping
│   ├── rag/                  # RAG/vector store
│   │   └── vector-store.ts  # Vector embeddings & search
│   ├── voice/                # Voice layer
│   │   └── voice-service.ts # TTS/STT integration
│   ├── storage.ts            # Supabase Storage utilities
│   ├── supabase/             # Supabase clients
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Server client
│   │   └── admin.ts         # Admin client (service role)
│   ├── gemini/               # Gemini AI client
│   │   └── client.ts        # Gemini API wrapper
│   └── types/                # TypeScript types
│       └── database.ts      # Database type definitions
└── hooks/
    └── use-interview.ts     # React hook for interviews

supabase/
├── migrations/               # Database migrations
│   ├── 001_initial_schema.sql
│   ├── 002_vector_search_function.sql
│   ├── 003_fix_security_and_performance.sql
│   └── 004_fix_rls_policies.sql
└── storage-setup.sql        # Storage bucket setup
```

## Features Implemented

### ✅ Core Backend
- Complete database schema with 7 tables
- Full CRUD API routes for jobs, candidates, interviews
- Interview orchestration with multi-agent system
- Real-time event streaming (Server-Sent Events)
- RLS security policies on all tables

### ✅ Ingestion Services
- **Resume Parsing**: PDF and text file support with section detection
- **GitHub Integration**: Repository fetching with README extraction
- **Portfolio Scraping**: Multi-page web crawling with text extraction
- **LinkedIn**: Structure ready (requires API access or scraping service)
- **Job Ingestion**: LLM-powered job description normalization

### ✅ Agent System
- **PlannerAgent**: Orchestrates interview flow and decides next actions
- **ExpertDomainAgent**: Generates and evaluates technical questions
- **HRBehavioralAgent**: Handles behavioral interview questions
- **EvaluationAgent**: Generates comprehensive final evaluations
- **InterviewOrchestrator**: Manages complete interview lifecycle

### ✅ Frontend Dashboard
- Main dashboard with statistics
- Job management (list, create, edit, delete)
- Candidate management (list, create, ingest data)
- Interview management (list, view, start)
- Real-time interview interface with event streaming
- Evaluation display

### ✅ RAG & Vector Store
- Vector embeddings using Gemini text-embedding-004
- Similarity search with pgvector
- Candidate context retrieval for agents
- Automatic chunking and indexing

### ✅ Voice Layer (Structure)
- Browser-based TTS/STT using Web Speech API
- External service support (ElevenLabs, Google Speech)
- Ready for integration into interview flow

## Testing the System

### 1. Create a Job
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Backend Engineer",
    "level": "senior",
    "description_raw": "We are looking for a senior backend engineer with experience in Node.js, TypeScript, and distributed systems..."
  }'
```

Then trigger ingestion:
```bash
curl -X POST http://localhost:3000/api/jobs/{job-id}/ingest
```

### 2. Create a Candidate
```bash
curl -X POST http://localhost:3000/api/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "links": {
      "linkedin": "https://linkedin.com/in/johndoe",
      "github": "johndoe",
      "portfolio": "https://johndoe.dev"
    },
    "resume_url": "https://example.com/resume.pdf"
  }'
```

Then trigger ingestion:
```bash
curl -X POST http://localhost:3000/api/candidates/{candidate-id}/ingest
```

### 3. Create and Start Interview
```bash
# Create interview
curl -X POST http://localhost:3000/api/interviews \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "job-uuid",
    "candidate_id": "candidate-uuid",
    "mode": "chat"
  }'

# Start interview (triggers agent system)
curl -X POST http://localhost:3000/api/interviews/{interview-id}/start

# Submit answer
curl -X POST http://localhost:3000/api/interviews/{interview-id}/answer \
  -H "Content-Type: application/json" \
  -d '{
    "answer": "I would use a hash map to store the frequency..."
  }'

# Get evaluation (after completion)
curl http://localhost:3000/api/interviews/{interview-id}/evaluation
```

### 4. Use the Dashboard UI

Visit http://localhost:3000/dashboard to:
- View and manage jobs
- View and manage candidates
- View and manage interviews
- Start and participate in interviews in real-time

## Database Security

All tables have Row Level Security (RLS) enabled with comprehensive policies:
- Authenticated users can view all data
- Users can only update/delete their own jobs
- All operations verify data relationships
- Functions are secured with proper search_path

## Troubleshooting

### Database Connection Issues
- Verify Supabase URL and keys in `.env.local`
- Check Supabase project is active
- Ensure RLS policies allow your operations
- Verify you're using the correct anon key (not service role key) in client

### Vector Search Not Working
- Verify pgvector extension is enabled in Supabase
- Check `candidate_embeddings` table has embeddings
- Verify vector search function exists: `match_candidate_embeddings`
- Ensure embeddings are 768-dimensional (Gemini text-embedding-004)

### API Routes Not Working
- Check Next.js server is running
- Verify environment variables are loaded (check `.env.local` exists)
- Check browser console for errors
- Verify Supabase service role key is set (for server-side operations)

### Ingestion Not Working
- Check Gemini API key is valid
- Verify file URLs are accessible (for resume parsing)
- Check GitHub token if using GitHub integration
- Review server logs for specific errors

### Interview Not Starting
- Verify job has been ingested (has `normalized_json`)
- Verify candidate has been ingested (has embeddings)
- Check Gemini API key is working
- Review interview orchestrator logs

## Deployment to Vercel

1. **Push code to GitHub**
2. **Import project in Vercel**
3. **Add environment variables** in Vercel dashboard:
   - All variables from `.env.local` (except `NEXT_PUBLIC_APP_URL` - set to your Vercel URL)
4. **Deploy!**

The entire application (frontend + backend) deploys as a single Next.js app on Vercel. All API routes run as serverless functions.

## Next Steps (Optional Enhancements)

1. **Enhanced LinkedIn Integration**:
   - Integrate with LinkedIn API (if available)
   - Or use a scraping service like Apify
   - Or build manual data entry UI

2. **Voice Integration**:
   - Integrate voice service into interview UI
   - Add voice controls (start/stop listening)
   - Add TTS for questions

3. **Enhanced UI**:
   - Add file upload for resumes
   - Add candidate edit page
   - Add interview scheduling form
   - Add evaluation visualization charts

4. **Advanced Features**:
   - Multi-language support
   - Custom agent configurations
   - Interview templates
   - Analytics dashboard
