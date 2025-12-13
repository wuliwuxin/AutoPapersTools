/**
 * Test script to verify LLM analysis engine works correctly
 */

import { generateAnalysisReport } from "./analysisEngine.ts";

// Mock paper data for testing
const testPaper = {
  id: 1,
  arxivId: "2401.00001",
  title: "Time Series Forecasting with Transformer Networks",
  authors: JSON.stringify(["John Doe", "Jane Smith"]),
  abstract: "This paper proposes a novel transformer-based approach for time series forecasting. We introduce attention mechanisms specifically designed for temporal dependencies. Our method achieves state-of-the-art results on multiple benchmarks.",
  publishedAt: new Date("2024-01-15"),
  source: "arXiv",
  sourceUrl: "https://arxiv.org/abs/2401.00001",
  category: "cs.LG",
  keywords: JSON.stringify(["time series", "forecasting", "transformers", "attention"]),
  createdAt: new Date(),
  updatedAt: new Date(),
};

async function testAnalysis() {
  console.log("Testing LLM Analysis Engine...");
  console.log("Paper:", testPaper.title);
  console.log("");

  try {
    const analysis = await generateAnalysisReport(testPaper);
    
    console.log("✓ Analysis Generated Successfully!");
    console.log("");
    console.log("Background:");
    console.log(analysis.background);
    console.log("");
    console.log("What:");
    console.log(analysis.what);
    console.log("");
    console.log("Why:");
    console.log(analysis.why);
    console.log("");
    console.log("How:");
    console.log(analysis.how);
    console.log("");
    console.log("How-why:");
    console.log(analysis.howWhy);
    console.log("");
    console.log("Summary:");
    console.log(analysis.summary);
  } catch (error) {
    console.error("✗ Analysis Failed:");
    console.error(error);
  }
}

testAnalysis();
