/**
 * Scheduled Tasks Module
 * Handles daily paper fetching and analysis
 */

import { fetchFromArxiv, convertToInsertPaper } from "./paperFetcher";
import {
  getPaperByArxivId,
  createPaper,
  createAnalysisReport,
  getUserSubscriptions,
  createDailyDigest,
  getDailyDigest,
  getAnalysisReport,
} from "./db";
import { generateAnalysisReport } from "./analysisEngine";
import { notifyOwner } from "./_core/notification";

/**
 * Daily task to fetch papers from arXiv and generate analysis
 * Should be called once per day
 */
export async function dailyPaperFetchTask() {
  console.log("[Task] Starting daily paper fetch task...");

  try {
    // Fetch papers from arXiv
    const papers = await fetchFromArxiv("time series", 10);
    console.log(`[Task] Fetched ${papers.length} papers from arXiv`);

    let successCount = 0;
    let failureCount = 0;

    // Process each paper
    for (const paperSource of papers) {
      try {
        // Check if paper already exists
        const existing = await getPaperByArxivId(paperSource.arxivId);
        if (existing) {
          console.log(`[Task] Paper ${paperSource.arxivId} already exists, skipping...`);
          continue;
        }

        // Create paper
        const insertPaper = convertToInsertPaper(paperSource);
        const result = await createPaper(insertPaper);
        const paperId = (result as any).insertId || (result as any)[0];

        if (!paperId) {
          failureCount++;
          continue;
        }

        console.log(`[Task] Created paper ${paperId}: ${paperSource.title}`);

        // Generate analysis report
        try {
          const paper = {
            id: paperId,
            ...insertPaper,
            publishedAt: new Date(insertPaper.publishedAt),
          };

          const analysis = await generateAnalysisReport(paper as any);
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

          console.log(`[Task] Generated analysis for paper ${paperId}`);
          successCount++;
        } catch (error) {
          console.error(`[Task] Failed to generate analysis for paper ${paperId}:`, error);
          failureCount++;
        }
      } catch (error) {
        console.error(`[Task] Error processing paper:`, error);
        failureCount++;
      }
    }

    // Notify owner of task completion
    await notifyOwner({
      title: "每日论文抓取任务完成",
      content: `成功处理 ${successCount} 篇论文，失败 ${failureCount} 篇。`,
    });

    console.log(`[Task] Daily paper fetch task completed. Success: ${successCount}, Failure: ${failureCount}`);
  } catch (error) {
    console.error("[Task] Daily paper fetch task failed:", error);
    await notifyOwner({
      title: "每日论文抓取任务失败",
      content: `任务执行失败: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

/**
 * Daily task to send digest emails to subscribed users
 * Should be called once per day
 */
export async function dailyDigestTask() {
  console.log("[Task] Starting daily digest task...");

  try {
    const today = new Date().toISOString().split("T")[0];

    // Get all active users (this is a placeholder - in production, you'd query actual user list)
    // For now, we'll just log that the task ran
    console.log(`[Task] Daily digest task completed for ${today}`);
  } catch (error) {
    console.error("[Task] Daily digest task failed:", error);
  }
}

/**
 * Initialize scheduled tasks
 * Call this once when the server starts
 */
export function initializeScheduledTasks() {
  console.log("[Scheduler] Initializing scheduled tasks...");

  // Run daily paper fetch at 2 AM UTC
  // In production, use a proper scheduler like node-cron
  const scheduleDailyTask = (taskFn: () => Promise<void>, hour: number) => {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setUTCHours(hour, 0, 0, 0);

    // If the scheduled time has already passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();

    console.log(`[Scheduler] Task scheduled to run in ${Math.round(delay / 1000 / 60)} minutes`);

    setTimeout(() => {
      taskFn();
      // Run every 24 hours after the first execution
      setInterval(taskFn, 24 * 60 * 60 * 1000);
    }, delay);
  };

  // Schedule daily paper fetch at 2 AM UTC
  scheduleDailyTask(dailyPaperFetchTask, 2);

  // Schedule daily digest at 8 AM UTC
  scheduleDailyTask(dailyDigestTask, 8);

  console.log("[Scheduler] Scheduled tasks initialized");
}
