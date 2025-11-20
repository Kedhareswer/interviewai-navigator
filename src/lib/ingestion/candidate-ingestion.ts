import { createAdminClient } from '../supabase/admin';
import { storageService } from '../storage';
import { vectorStore } from '../rag/vector-store';
import { resumeParser } from './resume-parser';
import { githubService } from './github-service';
import { portfolioScraper } from './portfolio-scraper';
import { linkedInService } from './linkedin-service';

export class CandidateIngestionService {
  private supabase = createAdminClient();

  /**
   * Ingest all candidate data and build RAG index
   */
  async ingestCandidate(candidateId: string): Promise<void> {
    // Get candidate from database
    const { data: candidate, error } = await this.supabase
      .from('candidates')
      .select('*')
      .eq('id', candidateId)
      .single();

    if (error || !candidate) {
      throw new Error(`Candidate not found: ${candidateId}`);
    }

    const chunks: Array<{
      text: string;
      source: string;
      url?: string;
      metadata?: Record<string, any>;
    }> = [];

    // 1. Ingest resume
    if (candidate.resume_url) {
      const resumeChunks = await this.ingestResume(candidateId, candidate.resume_url);
      chunks.push(...resumeChunks);
    }

    // 2. Ingest LinkedIn
    if (candidate.links && typeof candidate.links === 'object') {
      const links = candidate.links as Record<string, string>;
      if (links.linkedin) {
        const linkedInChunks = await this.ingestLinkedIn(candidateId, links.linkedin);
        chunks.push(...linkedInChunks);
      }

      // 3. Ingest GitHub
      if (links.github) {
        const githubChunks = await this.ingestGitHub(candidateId, links.github);
        chunks.push(...githubChunks);
      }

      // 4. Ingest Portfolio
      if (links.portfolio) {
        const portfolioChunks = await this.ingestPortfolio(candidateId, links.portfolio);
        chunks.push(...portfolioChunks);
      }
    }

    // Store all chunks in vector store
    if (chunks.length > 0) {
      // Delete old embeddings first
      await vectorStore.deleteCandidateEmbeddings(candidateId);
      
      // Store new chunks
      await vectorStore.storeCandidateChunks(candidateId, chunks);
    }
  }

  /**
   * Ingest resume file
   */
  private async ingestResume(
    candidateId: string,
    resumeUrl: string
  ): Promise<Array<{ text: string; source: string; url?: string; metadata?: Record<string, any> }>> {
    try {
      // Parse resume
      const { text, metadata } = await resumeParser.parseResume(resumeUrl);
      
      // Chunk the resume
      const chunks = resumeParser.chunkResume(text);
      
      // Store raw resume in storage
      await storageService.uploadFile(
        'candidates',
        storageService.getCandidateResumePath(candidateId),
        Buffer.from(text),
        { contentType: 'text/plain' }
      );

      // Convert to RAG chunks
      return chunks.map((chunk) => ({
        text: chunk.text,
        source: 'resume',
        url: resumeUrl,
        metadata: {
          ...metadata,
          section: chunk.section,
        },
      }));
    } catch (error) {
      console.error(`Failed to ingest resume: ${error}`);
      return [];
    }
  }

  /**
   * Ingest LinkedIn profile
   */
  private async ingestLinkedIn(
    candidateId: string,
    linkedInUrl: string
  ): Promise<Array<{ text: string; source: string; url?: string; metadata?: Record<string, any> }>> {
    try {
      // Extract LinkedIn data
      const chunks = await linkedInService.extractProfileData(linkedInUrl);
      
      // Store LinkedIn data in storage
      const linkedInData = {
        url: linkedInUrl,
        extractedAt: new Date().toISOString(),
        chunks: chunks.map(c => ({ text: c.text, metadata: c.metadata })),
      };
      
      await storageService.uploadFile(
        'candidates',
        storageService.getCandidateLinkedInPath(candidateId),
        Buffer.from(JSON.stringify(linkedInData, null, 2)),
        { contentType: 'application/json' }
      );

      return chunks;
    } catch (error) {
      console.error(`Failed to ingest LinkedIn: ${error}`);
      return [];
    }
  }

  /**
   * Ingest GitHub profile
   */
  private async ingestGitHub(
    candidateId: string,
    githubUrlOrUsername: string
  ): Promise<Array<{ text: string; source: string; url?: string; metadata?: Record<string, any> }>> {
    try {
      // Extract username from URL if needed
      const username = githubService.extractUsername(githubUrlOrUsername);
      
      // Fetch repos
      const repos = await githubService.getUserRepos(username);
      
      // Convert to chunks
      const chunks = githubService.reposToChunks(repos);
      
      // Store each repo in storage
      for (const repo of repos) {
        const repoData = {
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stars,
          forks: repo.forks,
          topics: repo.topics,
          readme: repo.readme,
          url: repo.url,
        };
        
        await storageService.uploadFile(
          'candidates',
          storageService.getCandidateGitHubPath(candidateId, repo.name),
          Buffer.from(JSON.stringify(repoData, null, 2)),
          { contentType: 'application/json' }
        );
      }

      return chunks;
    } catch (error) {
      console.error(`Failed to ingest GitHub: ${error}`);
      return [];
    }
  }

  /**
   * Ingest portfolio website
   */
  private async ingestPortfolio(
    candidateId: string,
    portfolioUrl: string
  ): Promise<Array<{ text: string; source: string; url?: string; metadata?: Record<string, any> }>> {
    try {
      // Scrape portfolio
      const chunks = await portfolioScraper.scrapePortfolio(portfolioUrl, 5);
      
      // Store each page in storage
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const pageName = chunk.metadata?.title || `page_${i + 1}`;
        
        await storageService.uploadFile(
          'candidates',
          storageService.getCandidatePortfolioPath(candidateId, pageName),
          Buffer.from(chunk.text),
          { contentType: 'text/markdown' }
        );
      }

      return chunks;
    } catch (error) {
      console.error(`Failed to ingest portfolio: ${error}`);
      return [];
    }
  }
}

export const candidateIngestionService = new CandidateIngestionService();


