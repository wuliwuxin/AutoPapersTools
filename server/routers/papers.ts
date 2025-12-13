/**
 * Papers Router
 * Handles all paper-related API endpoints
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  getPapers,
  getPaperById,
  createPaper,
  getAnalysisReport,
  createAnalysisReport,
  updateAnalysisReport,
  getUserFavorites,
  isFavorited,
  addFavorite,
  removeFavorite,
} from "../db";
import { generateAnalysisReport } from "../analysisEngine";
import { fetchFromArxiv, convertToInsertPaper } from "../paperFetcher";
import { analysisService } from "../services/analysisService";
import { getAnalysisTask } from "../db";

export const papersRouter = router({
  /**
   * Get papers with filtering and pagination
   */
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        category: z.string().optional(),
        searchQuery: z.string().optional(),
        sortBy: z.enum(["newest", "oldest"]).default("newest"),
      })
    )
    .query(async ({ input }) => {
      const papers = await getPapers(input.limit, input.offset, {
        category: input.category,
        searchQuery: input.searchQuery,
        sortBy: input.sortBy,
      });

      return {
        papers,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Get paper details with analysis report
   */
  detail: publicProcedure
    .input(z.object({ paperId: z.number() }))
    .query(async ({ input, ctx }) => {
      const paper = await getPaperById(input.paperId);
      if (!paper) {
        throw new Error("Paper not found");
      }

      const report = await getAnalysisReport(input.paperId);

      let isFav = false;
      if (ctx.user) {
        isFav = await isFavorited(ctx.user.id, input.paperId);
      }

      return {
        paper,
        report,
        isFavorited: isFav,
      };
    }),

  /**
   * Fetch papers from arXiv and generate analysis reports
   * 支持无数据库模式：直接返回论文数据
   */
  fetchFromArxiv: publicProcedure
    .input(
      z.object({
        searchQuery: z.string().default("time series"),
        maxResults: z.number().min(1).max(50).default(20),
        startDate: z.string().optional(), // ISO date string
        endDate: z.string().optional(),   // ISO date string
      })
    )
    .mutation(async ({ input }) => {
      try {
        const startDate = input.startDate ? new Date(input.startDate) : undefined;
        const endDate = input.endDate ? new Date(input.endDate) : undefined;
        
        console.log(`[Papers] Fetching ${input.maxResults} papers for query: ${input.searchQuery}`);
        if (startDate || endDate) {
          console.log(`[Papers] Date range: ${startDate?.toISOString()} to ${endDate?.toISOString()}`);
        }
        
        const papers = await fetchFromArxiv(input.searchQuery, input.maxResults, startDate, endDate);
        console.log(`[Papers] Fetched ${papers.length} papers from arXiv`);

        if (papers.length === 0) {
          return { 
            results: [], 
            count: 0, 
            papers: [],
            message: "No papers found for the given query and date range" 
          };
        }

        // 转换为前端可用的格式
        const formattedPapers = papers.map((p, index) => ({
          id: index + 1,
          title: p.title,
          authors: JSON.stringify(p.authors),
          abstract: p.abstract,
          publishedAt: p.publishedAt,
          sourceUrl: p.sourceUrl,
          arxivId: p.arxivId,
          category: p.category || null,
          keywords: p.keywords ? JSON.stringify(p.keywords) : null,
          createdAt: new Date(),
          updatedAt: new Date(),
          source: "arxiv"
        }));

        // 尝试存储到数据库（如果可用）
        const results = [];
        for (const paperSource of papers) {
          try {
            const insertPaper = convertToInsertPaper(paperSource);
            const result = await createPaper(insertPaper);
            let paperId: number | undefined;
            
            if (result && typeof result === "object") {
              if ("insertId" in result) {
                paperId = (result as any).insertId;
              }
            }
            
            if (paperId) {
              // 生成分析报告
              try {
                const paper = await getPaperById(paperId);
                if (paper) {
                  console.log(`[Papers] Generating analysis for paper ${paperId}...`);
                  const analysis = await generateAnalysisReport(paper);
                  await createAnalysisReport({
                    paperId,
                    background: analysis.background,
                    what: analysis.what,
                    why: analysis.why,
                    how: analysis.how,
                    howWhy: analysis.howWhy,
                    summary: analysis.summary,
                    status: "completed",
                    generatedAt: new Date(),
                  });
                  results.push({ success: true, paperId });
                }
              } catch (analysisError) {
                console.error(`[Papers] Analysis error:`, analysisError);
                results.push({ success: true, paperId, analysisError: true });
              }
            }
          } catch (dbError: any) {
            // 数据库不可用或其他错误，继续返回论文数据
            console.log(`[Papers] DB operation skipped: ${dbError.message}`);
          }
        }

        return { 
          results, 
          count: papers.length,
          papers: formattedPapers,
          message: `Successfully fetched ${papers.length} papers from arXiv`
        };
      } catch (error) {
        console.error("[Papers] Error fetching from arXiv:", error);
        throw new Error(`Failed to fetch papers from arXiv: ${error}`);
      }
    }),

  /**
   * Get user's favorite papers
   */
  favorites: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const favorites = await getUserFavorites(ctx.user.id, input.limit, input.offset);

      return {
        favorites: favorites.map((f) => ({
          paper: f.paper,
          notes: f.favorite.notes,
          createdAt: f.favorite.createdAt,
        })),
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Add paper to favorites
   */
  addFavorite: protectedProcedure
    .input(z.object({ paperId: z.number(), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      await addFavorite(ctx.user.id, input.paperId, input.notes);
      return { success: true };
    }),

  /**
   * Remove paper from favorites
   */
  removeFavorite: protectedProcedure
    .input(z.object({ paperId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await removeFavorite(ctx.user.id, input.paperId);
      return { success: true };
    }),

  /**
   * Search papers with optional date range filter
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const papers = await getPapers(input.limit, input.offset, {
        searchQuery: input.query,
      });

      return {
        papers,
        query: input.query,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Search papers with date range filter
   */
  searchWithDateRange: publicProcedure
    .input(
      z.object({
        query: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const papers = await getPapers(input.limit, input.offset, {
        searchQuery: input.query,
        startDate: input.startDate,
        endDate: input.endDate,
      });

      return {
        papers,
        query: input.query,
        startDate: input.startDate,
        endDate: input.endDate,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Start analysis for a paper (requires authentication)
   */
  startAnalysis: protectedProcedure
    .input(
      z.object({
        paperId: z.number(),
        provider: z.enum(['deepseek', 'openai', 'claude', 'gemini']).optional(),
        modelName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const taskId = await analysisService.startAnalysis({
        userId: ctx.user.id,
        paperId: input.paperId,
        provider: input.provider,
        modelName: input.modelName,
      });

      return {
        success: true,
        taskId,
      };
    }),

  /**
   * Get analysis task status
   */
  getAnalysisStatus: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input }) => {
      const task = await getAnalysisTask(input.taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      return task;
    }),

  /**
   * Upload local paper file
   */
  uploadLocal: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, 'Title is required'),
        authors: z.string().default('Unknown'),
        abstract: z.string().min(10, 'Abstract must be at least 10 characters'),
        introduction: z.string().optional(), // 引言部分（可选）
        fullText: z.string().optional(), // 完整文本（可选）
        fileContent: z.string(), // Base64 encoded file content
        fileName: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 解析作者列表
      const authorsList = input.authors
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      // 构建完整文本：摘要 + 引言 + 其他内容
      let combinedFullText = `# 摘要\n\n${input.abstract}\n\n`;
      
      if (input.introduction && input.introduction.trim()) {
        combinedFullText += `# 引言\n\n${input.introduction}\n\n`;
      }
      
      if (input.fullText && input.fullText.trim()) {
        combinedFullText += `# 正文\n\n${input.fullText}\n\n`;
      }

      // 创建论文记录
      const result = await createPaper({
        title: input.title,
        authors: JSON.stringify(authorsList),
        abstract: input.abstract,
        fullText: combinedFullText, // 存储完整文本
        publishedAt: new Date(), // 使用当前日期
        sourceUrl: `local://${input.fileName}`,
        arxivId: `local-${Date.now()}`, // 生成唯一 ID
        category: 'local-upload',
        keywords: null,
        source: 'local',
      });

      const paperId = (result as any).insertId || (result as any).id;

      return {
        success: true,
        paperId,
        message: 'Paper uploaded successfully',
      };
    }),
});
