/**
 * Paper Fetcher Module
 * Handles fetching papers from various sources (arXiv, Google Scholar, etc.)
 */

import { InsertPaper } from "../drizzle/schema";

export interface PaperSource {
  title: string;
  authors: string[];
  abstract: string;
  publishedAt: Date;
  sourceUrl: string;
  arxivId: string;
  category?: string;
  keywords?: string[];
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch papers from arXiv API with retry logic
 * Searches for papers with optional date range filter
 */
export async function fetchFromArxiv(
  searchQuery: string = "time series",
  maxResults: number = 20,
  startDate?: Date,
  endDate?: Date
): Promise<PaperSource[]> {
  const maxRetries = 3;
  const baseDelay = 3000; // 3 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // arXiv API endpoint for searching papers
      const baseUrl = "http://export.arxiv.org/api/query";
      
      // 构建搜索查询
      // 优化搜索策略：优先搜索标题和摘要，提高相关性
      let query = `(ti:"${searchQuery}" OR abs:"${searchQuery}")`;
      
      // 如果指定了日期范围，添加日期过滤
      if (startDate || endDate) {
        const start = startDate ? formatDate(startDate) : getLastYearDate();
        const end = endDate ? formatDate(endDate) : getCurrentDate();
        query += ` AND submittedDate:[${start}000000 TO ${end}235959]`;
      }
      
      console.log(`[arXiv] Search query: ${query}`);
      
      const params = new URLSearchParams({
        search_query: query,
        start: "0",
        max_results: maxResults.toString(),
        sortBy: "submittedDate",
        sortOrder: "descending",
      });

      const url = `${baseUrl}?${params}`;
      console.log(`[arXiv] Attempt ${attempt}/${maxRetries}: Fetching from ${url}`);
      
      const response = await fetch(url);
      
      if (response.status === 429) {
        // Rate limited - wait and retry
        const delay = baseDelay * attempt;
        console.log(`[arXiv] Rate limited (429). Waiting ${delay}ms before retry...`);
        if (attempt < maxRetries) {
          await sleep(delay);
          continue;
        } else {
          console.error(`[arXiv] Max retries reached. Giving up.`);
          throw new Error('arXiv API rate limit exceeded. Please try again later.');
        }
      }
      
      if (!response.ok) {
        console.error(`[arXiv] API error: ${response.status} ${response.statusText}`);
        if (attempt < maxRetries) {
          await sleep(baseDelay);
          continue;
        }
        return [];
      }

      const text = await response.text();
      const papers = parseArxivResponse(text);
      console.log(`[arXiv] Successfully parsed ${papers.length} papers`);
      return papers;
    } catch (error) {
      console.error(`[arXiv] Attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        console.error("[arXiv] All retry attempts failed");
        throw error;
      }
      await sleep(baseDelay * attempt);
    }
  }
  
  return [];
}

/**
 * Parse arXiv API XML response
 */
function parseArxivResponse(xmlText: string): PaperSource[] {
  const papers: PaperSource[] = [];

  // Simple XML parsing (in production, use a proper XML parser)
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xmlText)) !== null) {
    const entry = match[1];

    // Extract fields using regex
    const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(entry);
    const summaryMatch = /<summary>([\s\S]*?)<\/summary>/.exec(entry);
    const publishedMatch = /<published>([\s\S]*?)<\/published>/.exec(entry);
    const idMatch = /<id>([\s\S]*?)<\/id>/.exec(entry);
    const categoryMatch = /<arxiv:primary_category term="([^"]+)"/.exec(entry);

    if (titleMatch && summaryMatch && publishedMatch && idMatch) {
      const arxivId = extractArxivId(idMatch[1]);
      const authors = extractAuthors(entry);

      papers.push({
        title: decodeHtml(titleMatch[1].trim()),
        authors,
        abstract: decodeHtml(summaryMatch[1].trim()),
        publishedAt: new Date(publishedMatch[1]),
        sourceUrl: `https://arxiv.org/abs/${arxivId}`,
        arxivId,
        category: categoryMatch ? categoryMatch[1] : undefined,
        keywords: extractKeywords(summaryMatch[1]),
      });
    }
  }

  return papers;
}

/**
 * Extract arXiv ID from full URL
 */
function extractArxivId(url: string): string {
  const match = /arxiv\.org\/abs\/(.+)/.exec(url);
  return match ? match[1] : url;
}

/**
 * Extract authors from arXiv entry
 */
function extractAuthors(entry: string): string[] {
  const authors: string[] = [];
  const authorRegex = /<author>([\s\S]*?)<\/author>/g;
  let match;

  while ((match = authorRegex.exec(entry)) !== null) {
    const nameMatch = /<name>([\s\S]*?)<\/name>/.exec(match[1]);
    if (nameMatch) {
      authors.push(decodeHtml(nameMatch[1].trim()));
    }
  }

  return authors;
}

/**
 * Extract keywords from abstract
 */
function extractKeywords(abstract: string): string[] {
  // Simple keyword extraction: split by common delimiters and filter
  const keywords = abstract
    .toLowerCase()
    .match(/\\b[a-z]{4,}\\b/g) || [];
  
  // Remove common words
  const commonWords = new Set([
    "this", "that", "with", "from", "have", "been", "paper", "study",
    "method", "model", "data", "using", "based", "result", "show",
    "time", "series", "analysis", "learning", "neural", "network"
  ]);

  const uniqueKeywords = Array.from(new Set(keywords));
  return uniqueKeywords
    .filter(w => !commonWords.has(w))
    .slice(0, 5);
}

/**
 * Decode HTML entities
 */
function decodeHtml(html: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&apos;": "'",
    "&#39;": "'",
  };

  return html.replace(/&[^;]+;/g, (match) => entities[match] || match);
}

/**
 * Get date string for last 7 days in YYYYMMDD format
 */
function getLastWeekDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return formatDate(date);
}

/**
 * Get date string for last year in YYYYMMDD format
 */
function getLastYearDate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return formatDate(date);
}

/**
 * Get current date string in YYYYMMDD format
 */
function getCurrentDate(): string {
  return formatDate(new Date());
}

/**
 * Format date as YYYYMMDD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * Convert PaperSource to InsertPaper for database insertion
 */
export function convertToInsertPaper(source: PaperSource): InsertPaper {
  return {
    arxivId: source.arxivId,
    title: source.title,
    authors: JSON.stringify(source.authors),
    abstract: source.abstract,
    publishedAt: source.publishedAt,
    source: "arxiv",
    sourceUrl: source.sourceUrl,
    category: source.category,
    keywords: source.keywords ? JSON.stringify(source.keywords) : null,
  };
}
