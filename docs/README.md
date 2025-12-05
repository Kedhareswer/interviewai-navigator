# InterviewOS Documentation

Welcome to the InterviewOS documentation. This documentation provides comprehensive information about the AI-powered interview platform.

## Table of Contents

1. [Architecture Overview](./architecture.md) - System architecture, components, and data flow
2. [Agent System (DeepAgents)](./agents.md) - Multi-agent orchestration system
3. [Candidate Flow](./candidate-flow.md) - Candidate user journey and features
4. [HR Flow](./hr-flow.md) - HR user journey and management features
5. [API Documentation](./api.md) - REST API endpoints and usage
6. [Database Schema](./database.md) - Database structure and relationships
7. [Deployment Guide](./deployment.md) - Deployment instructions and configuration

## Quick Start

InterviewOS is a full-stack Next.js application that automates technical and behavioral interviews using:

- **Multi-Agent System**: Intelligent agents orchestrate interview flow
- **RAG (Retrieval-Augmented Generation)**: Candidate context retrieval using vector embeddings
- **Real-time Streaming**: Server-Sent Events for live interview updates
- **Role-Based Access**: Separate interfaces for HR and Candidates

## Key Features

### For HR
- Create and manage job postings
- Add candidates and trigger data ingestion
- Schedule and start interviews
- View evaluations and scores
- Configure interview parameters

### For Candidates
- Receive interview invitations
- Participate in chat or voice interviews
- View evaluation results
- Track interview progress

## System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ HR Dashboard │  │Candidate UI  │  │ Landing Page │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              API Routes (Next.js Serverless)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Jobs    │  │Candidates│  │Interviews│  │ Profiles │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Agents     │  │  Ingestion   │  │  RAG/Vector  │     │
│  │ Orchestrator │  │   Services   │  │    Store     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (Supabase)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │PostgreSQL│  │  pgvector│  │  Storage │  │   Auth   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: Supabase (PostgreSQL with pgvector)
- **AI/ML**: Google Gemini 2.0 (Pro, Flash, Embedding models)
- **Vector Store**: pgvector extension (768-dimensional embeddings)
- **Storage**: Supabase Storage
- **Deployment**: Vercel (single deployment)

## Getting Started

1. Read the [Architecture Overview](./architecture.md) to understand the system
2. Review [Agent System](./agents.md) to understand how interviews are conducted
3. Check [API Documentation](./api.md) for integration details
4. See [Deployment Guide](./deployment.md) for setup instructions

## Support

For questions or issues, refer to the specific documentation sections or check the main [README.md](../README.md) in the project root.

