/**
 * Analysis Engine Module
 * Uses LLM to generate structured analysis reports for papers
 */

import { invokeLLM } from "./_core/llm";
import type { Paper } from "../drizzle/schema";

export interface AnalysisResult {
  background: string;
  what: string;
  why: string;
  how: string;
  howWhy: string;
  summary: string;
}

/**
 * Generate a comprehensive analysis report for a paper using LLM
 */
export async function generateAnalysisReport(paper: Paper): Promise<AnalysisResult> {
  const prompt = buildAnalysisPrompt(paper);

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert research analyst specializing in time series analysis and machine learning. 
Your task is to analyze research papers and provide structured insights using the five-dimensional analysis framework.
Always respond with valid JSON that matches the specified schema.`,
        },
        {
          role: "user",
          content: prompt + `\n\nIMPORTANT: Respond ONLY with a valid JSON object in this exact format:
{
  "background": "...",
  "what": "...",
  "why": "...",
  "how": "...",
  "howWhy": "...",
  "summary": "..."
}`,
        },
      ],
    });

    // Parse the response
    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error("No content in LLM response");
    }

    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    const analysisData = JSON.parse(contentStr);
    return {
      background: analysisData.background,
      what: analysisData.what,
      why: analysisData.why,
      how: analysisData.how,
      howWhy: analysisData.howWhy,
      summary: analysisData.summary,
    };
  } catch (error) {
    console.error("Error generating analysis report:", error);
    throw error;
  }
}

/**
 * Build the prompt for LLM analysis
 */
function buildAnalysisPrompt(paper: Paper): string {
  const authors = JSON.parse(paper.authors || "[]") as string[];
  const keywords = paper.keywords ? (JSON.parse(paper.keywords) as string[]) : [];

  return `Please analyze the following research paper and provide a comprehensive structured analysis using the five-dimensional framework (Background, What, Why, How, How-why).

**Paper Information:**
- Title: ${paper.title}
- Authors: ${authors.join(", ")}
- Published: ${paper.publishedAt.toISOString().split("T")[0]}
- Category: ${paper.category || "Not specified"}
- Source: ${paper.sourceUrl}

**Abstract:**
${paper.abstract || "No abstract available"}

**Keywords:** ${keywords.join(", ") || "Not specified"}

Please provide a detailed analysis that:

1. **Background**: Explain the context and problem space. Why does this research problem exist? What are the current bottlenecks and development status in this field?

2. **What**: Describe what the paper proposes. Include both the goal (the problem statement or positioning) and the results (quantified metrics, improvements over baselines, key system components).

3. **Why**: Explain the value and challenges. What value does this work bring (customer value in terms of cost/efficiency/experience, social value)? What challenges does it address?

4. **How**: Detail the methodology. Describe the framework, main modules, key technical steps, and how different components interact.

5. **How-why**: Justify the approach. Why is this method chosen over alternatives? What insights enable it to address the challenges? What are its advantages compared to other approaches?

6. **Summary**: Provide a concise one-paragraph summary of the paper's key contributions.

Ensure your analysis is:
- Grounded in the paper's content
- Clear and accessible to researchers in the field
- Structured and well-organized
- Specific with technical details where relevant
- Balanced in presenting both strengths and limitations`;
}

/**
 * Generate analysis for multiple papers in batch
 */
export async function generateAnalysisReportBatch(
  papers: Array<{ id: number; title: string; authors: string; abstract: string | null; publishedAt: Date; sourceUrl: string; arxivId: string; category: string | null; keywords: string | null; createdAt: Date; updatedAt: Date; source: string }>,
  concurrency: number = 3
): Promise<Map<number, AnalysisResult | Error>> {
  const results = new Map<number, AnalysisResult | Error>();

  // Process papers with controlled concurrency
  for (let i = 0; i < papers.length; i += concurrency) {
    const batch = papers.slice(i, i + concurrency);
    const promises = batch.map(async (paper) => {
      try {
        const analysis = await generateAnalysisReport(paper);
        results.set(paper.id, analysis);
      } catch (error) {
        results.set(paper.id, error instanceof Error ? error : new Error(String(error)));
      }
    });

    await Promise.all(promises);
  }

  return results;
}
