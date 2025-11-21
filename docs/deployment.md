# Deployment Guide

This guide covers deploying InterviewOS to production, including environment setup, configuration, and best practices.

## Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Vercel account (or alternative hosting)
- Google Gemini API key
- GitHub account (for repository)

## Deployment Architecture

```
┌─────────────────────────────────────┐
│      Vercel (Frontend + API)        │
│  - Next.js Application              │
│  - Serverless Functions             │
│  - Edge Network (CDN)               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Supabase Platform              │
│  - PostgreSQL Database              │
│  - Storage Buckets                  │
│  - Auth Service                     │
│  - Realtime Subscriptions           │
└─────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      External Services              │
│  - Google Gemini API                │
│  - GitHub API (optional)            │
│  - Voice Services (optional)        │
└─────────────────────────────────────┘
```

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and API keys

### 1.2 Enable Extensions

In Supabase SQL Editor, run:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
```

### 1.3 Run Migrations

Run migrations in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_vector_search_function.sql`
3. `supabase/migrations/003_fix_security_and_performance.sql`
4. `supabase/migrations/004_public_access.sql`
5. `supabase/migrations/005_auth_roles.sql`
6. `supabase/migrations/006_interview_metadata.sql`

### 1.4 Create Storage Buckets

1. Go to Storage in Supabase dashboard
2. Create buckets:
   - `jobs` (private)
   - `candidates` (private)
   - `interviews` (private)
3. Run `supabase/storage-setup.sql` for bucket policies

### 1.5 Configure Auth

1. Go to Authentication → Settings
2. Configure email templates (optional)
3. Set up OAuth providers if needed (optional)
4. Configure redirect URLs

## Step 2: Environment Variables

### 2.1 Local Development

Create `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini API Configuration
GEMINI_API_KEY=your-gemini-api-key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: GitHub Token (for higher rate limits)
GITHUB_TOKEN=your-github-token

# Optional: Voice Services
ELEVENLABS_API_KEY=your-elevenlabs-key
GOOGLE_SPEECH_API_KEY=your-google-speech-key
```

### 2.2 Production (Vercel)

Add environment variables in Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Set `NEXT_PUBLIC_APP_URL` to your Vercel URL
4. Mark sensitive variables (service role key, API keys)

**Required Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_APP_URL`

**Optional Variables**:
- `GITHUB_TOKEN`
- `ELEVENLABS_API_KEY`
- `GOOGLE_SPEECH_API_KEY`

## Step 3: Vercel Deployment

### 3.1 Connect Repository

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import project from GitHub
4. Select repository

### 3.2 Configure Build

Vercel auto-detects Next.js. Verify:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### 3.3 Deploy

1. Add environment variables (see Step 2.2)
2. Click "Deploy"
3. Wait for build to complete
4. Access your deployment URL

### 3.4 Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add custom domain
3. Configure DNS records
4. Update `NEXT_PUBLIC_APP_URL` if needed

## Step 4: Post-Deployment Configuration

### 4.1 Update Supabase Redirect URLs

1. Go to Supabase → Authentication → URL Configuration
2. Add production URL to:
   - Site URL
   - Redirect URLs

### 4.2 Verify Environment Variables

Test that all environment variables are accessible:

```bash
# In Vercel function logs, verify:
console.log(process.env.GEMINI_API_KEY ? 'OK' : 'MISSING');
```

### 4.3 Test Deployment

1. Visit your deployment URL
2. Test signup/login
3. Create a test job
4. Create a test candidate
5. Trigger ingestion
6. Create and start an interview

## Step 5: Monitoring & Maintenance

### 5.1 Vercel Analytics

Enable Vercel Analytics for:
- Page views
- Function execution times
- Error tracking

### 5.2 Supabase Monitoring

Monitor in Supabase dashboard:
- Database performance
- API usage
- Storage usage
- Auth activity

### 5.3 Error Tracking

Consider adding:
- **Sentry**: Error tracking and monitoring
- **LogRocket**: Session replay and error tracking
- **Vercel Logs**: Built-in function logs

### 5.4 Database Maintenance

Regular tasks:
- Monitor database size
- Review slow queries
- Check index usage
- Archive old interviews (if needed)

## Deployment Checklist

### Pre-Deployment

- [ ] All migrations run successfully
- [ ] Storage buckets created
- [ ] Environment variables configured
- [ ] API keys obtained
- [ ] Code pushed to repository

### Deployment

- [ ] Vercel project created
- [ ] Environment variables added
- [ ] Build successful
- [ ] Deployment URL accessible

### Post-Deployment

- [ ] Supabase redirect URLs updated
- [ ] Environment variables verified
- [ ] Signup/login tested
- [ ] Job creation tested
- [ ] Candidate creation tested
- [ ] Interview flow tested
- [ ] Error tracking configured

## Environment-Specific Configuration

### Development

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Staging

```env
NEXT_PUBLIC_APP_URL=https://staging.yourdomain.com
NODE_ENV=production
```

### Production

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

## Scaling Considerations

### Database Scaling

- **Read Replicas**: Add read replicas for heavy read workloads
- **Connection Pooling**: Use Supabase connection pooling
- **Query Optimization**: Monitor and optimize slow queries

### Function Scaling

- **Vercel**: Auto-scales serverless functions
- **Edge Functions**: Consider edge functions for low latency
- **Caching**: Add caching layer (Redis) if needed

### Storage Scaling

- **CDN**: Supabase Storage uses CDN automatically
- **Compression**: Compress large files before upload
- **Cleanup**: Archive old artifacts

## Security Best Practices

### API Keys

- **Never commit** API keys to repository
- **Use environment variables** for all secrets
- **Rotate keys** regularly
- **Use service role key** only server-side

### Database Security

- **RLS enabled** on all tables
- **Strong policies** for data access
- **Regular audits** of RLS policies
- **Backup encryption** enabled

### Application Security

- **HTTPS only** in production
- **CORS configured** properly
- **Rate limiting** (consider adding)
- **Input validation** on all endpoints

## Troubleshooting

### Build Failures

**Issue**: Build fails on Vercel

**Solutions**:
- Check Node.js version (should be 18+)
- Verify all dependencies in `package.json`
- Check build logs for specific errors
- Ensure environment variables are set

### Database Connection Issues

**Issue**: Cannot connect to Supabase

**Solutions**:
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Verify Supabase project is active
- Check network/firewall settings

### Function Timeouts

**Issue**: API routes timeout

**Solutions**:
- Increase function timeout in Vercel settings
- Optimize long-running operations
- Use background jobs for heavy processing
- Consider edge functions for faster execution

### Vector Search Not Working

**Issue**: RAG queries fail

**Solutions**:
- Verify pgvector extension is enabled
- Check `match_candidate_embeddings` function exists
- Verify embeddings are 768-dimensional
- Check HNSW index is created

## Rollback Procedure

### Vercel Rollback

1. Go to Vercel dashboard
2. Navigate to Deployments
3. Find previous successful deployment
4. Click "Promote to Production"

### Database Rollback

1. Use Supabase point-in-time recovery
2. Or manually revert migrations
3. Restore from backup if needed

## CI/CD (Optional)

### GitHub Actions

Example workflow for automated testing:

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run lint
      - run: npm run build
```

## References

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Architecture Overview](./architecture.md)

