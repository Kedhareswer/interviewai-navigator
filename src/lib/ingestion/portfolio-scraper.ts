import cheerio from 'cheerio';

export class PortfolioScraper {
  /**
   * Scrape portfolio website
   */
  async scrapePortfolio(url: string, maxPages: number = 5): Promise<Array<{
    text: string;
    source: string;
    url: string;
    metadata: Record<string, any>;
  }>> {
    const chunks: Array<{
      text: string;
      source: string;
      url: string;
      metadata: Record<string, any>;
    }> = [];

    const visited = new Set<string>();
    const toVisit = [url];

    while (toVisit.length > 0 && visited.size < maxPages) {
      const currentUrl = toVisit.shift()!;
      
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);

      try {
        const pageContent = await this.scrapePage(currentUrl);
        chunks.push(pageContent);

        // Extract links for further crawling (same domain only)
        if (visited.size < maxPages) {
          const links = await this.extractLinks(currentUrl, pageContent.text);
          const baseUrl = new URL(url).origin;
          
          for (const link of links) {
            const absoluteUrl = new URL(link, baseUrl).href;
            if (absoluteUrl.startsWith(baseUrl) && !visited.has(absoluteUrl)) {
              toVisit.push(absoluteUrl);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to scrape ${currentUrl}:`, error);
        // Continue with other pages
      }
    }

    return chunks;
  }

  /**
   * Scrape a single page
   */
  private async scrapePage(url: string): Promise<{
    text: string;
    source: string;
    url: string;
    metadata: Record<string, any>;
  }> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; InterviewOS/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove script and style elements
      $('script, style, nav, footer, header').remove();

      // Extract text content
      const title = $('title').text() || $('h1').first().text();
      const bodyText = $('body').text()
        .replace(/\s+/g, ' ')
        .trim();

      // Extract metadata
      const metadata: Record<string, any> = {
        title,
        url,
      };

      // Try to extract structured data
      $('meta[property^="og:"]').each((_, el) => {
        const property = $(el).attr('property')?.replace('og:', '');
        const content = $(el).attr('content');
        if (property && content) {
          metadata[property] = content;
        }
      });

      return {
        text: `${title}\n\n${bodyText}`,
        source: 'portfolio',
        url,
        metadata,
      };
    } catch (error) {
      throw new Error(`Failed to scrape page ${url}: ${error}`);
    }
  }

  /**
   * Extract links from page content
   */
  private async extractLinks(baseUrl: string, html: string): Promise<string[]> {
    const $ = cheerio.load(html);
    const links: string[] = [];

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        links.push(href);
      }
    });

    return links;
  }
}

export const portfolioScraper = new PortfolioScraper();

