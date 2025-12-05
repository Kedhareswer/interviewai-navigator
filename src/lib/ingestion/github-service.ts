export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
  readme?: string;
  topics: string[];
}

export class GitHubService {
  private apiBase = 'https://api.github.com';

  /**
   * Fetch user repositories
   */
  async getUserRepos(username: string): Promise<GitHubRepo[]> {
    try {
      const response = await fetch(`${this.apiBase}/users/${username}/repos?sort=updated&per_page=20`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          // Add GitHub token if available for higher rate limits
          ...(process.env.GITHUB_TOKEN && {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          }),
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const repos: any[] = await response.json();

      // Fetch README for each repo
      const reposWithReadme = await Promise.all(
        repos.map(async (repo) => {
          let readme: string | undefined;
          try {
            const readmeResponse = await fetch(
              `https://raw.githubusercontent.com/${username}/${repo.name}/main/README.md`
            );
            if (readmeResponse.ok) {
              readme = await readmeResponse.text();
            }
          } catch {
            // README not found or error - continue without it
          }

          return {
            name: repo.name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            url: repo.html_url,
            readme,
            topics: repo.topics || [],
          };
        })
      );

      return reposWithReadme;
    } catch (error) {
      throw new Error(`Failed to fetch GitHub repos: ${error}`);
    }
  }

  /**
   * Extract username from GitHub URL
   */
  extractUsername(url: string): string {
    // Handle various GitHub URL formats
    const patterns = [
      /github\.com\/([^/]+)\/?$/,
      /github\.com\/([^/]+)\/repositories/,
      /@([^/]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // If no match, assume the URL itself is the username
    return url.replace(/^https?:\/\//, '').replace(/^github\.com\//, '').split('/')[0];
  }

  /**
   * Convert repos to chunks for RAG
   */
  reposToChunks(repos: GitHubRepo[]): Array<{
    text: string;
    source: string;
    url: string;
    metadata: Record<string, any>;
  }> {
    return repos.map((repo) => {
      let text = `Repository: ${repo.name}\n`;
      if (repo.description) {
        text += `Description: ${repo.description}\n`;
      }
      if (repo.language) {
        text += `Language: ${repo.language}\n`;
      }
      text += `Stars: ${repo.stars}, Forks: ${repo.forks}\n`;
      if (repo.topics.length > 0) {
        text += `Topics: ${repo.topics.join(', ')}\n`;
      }
      if (repo.readme) {
        text += `\nREADME:\n${repo.readme.substring(0, 2000)}`; // Limit README size
      }

      return {
        text,
        source: 'github',
        url: repo.url,
        metadata: {
          repoName: repo.name,
          language: repo.language,
          stars: repo.stars,
          forks: repo.forks,
          topics: repo.topics,
        },
      };
    });
  }
}

export const githubService = new GitHubService();

