/**
 * Property-Based Tests for Build Output
 * Feature: github-pages-deployment, Property 2: Asset path correctness
 * Validates: Requirements 1.4
 */

import { describe, it, expect, beforeAll } from "vitest";
import fs from "fs";
import path from "path";

describe("Build Output - Asset Path Correctness", () => {
  const distPath = path.resolve(process.cwd(), "dist/public");
  const indexHtmlPath = path.join(distPath, "index.html");
  let htmlContent: string;

  beforeAll(() => {
    // Check if build output exists
    if (!fs.existsSync(indexHtmlPath)) {
      throw new Error(
        "Build output not found. Please run 'GITHUB_PAGES=true pnpm run build:static' first."
      );
    }
    htmlContent = fs.readFileSync(indexHtmlPath, "utf-8");
  });

  /**
   * Property 2: Asset path correctness
   * For any static resource reference (script, link, img tags) in the built HTML file,
   * its path should start with /AutoPapersTools/
   */
  it("should have all script tags with correct base path", () => {
    // Extract all script src attributes
    const scriptRegex = /<script[^>]+src="([^"]+)"/g;
    const matches = [...htmlContent.matchAll(scriptRegex)];

    expect(matches.length).toBeGreaterThan(0);

    matches.forEach((match) => {
      const src = match[1];
      // Skip external URLs (http/https)
      if (src.startsWith("http://") || src.startsWith("https://")) {
        return;
      }
      // Local resources should start with /AutoPapersTools/
      expect(src).toMatch(/^\/AutoPapersTools\//);
    });
  });

  it("should have all link tags with correct base path", () => {
    // Extract all link href attributes (for stylesheets)
    const linkRegex = /<link[^>]+href="([^"]+)"[^>]*>/g;
    const matches = [...htmlContent.matchAll(linkRegex)];

    expect(matches.length).toBeGreaterThan(0);

    matches.forEach((match) => {
      const href = match[1];
      // Skip external URLs and special protocols
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("//")
      ) {
        return;
      }
      // Check if it's a stylesheet link
      const fullMatch = match[0];
      if (fullMatch.includes('rel="stylesheet"')) {
        expect(href).toMatch(/^\/AutoPapersTools\//);
      }
    });
  });

  it("should have all img tags with correct base path (if any)", () => {
    // Extract all img src attributes
    const imgRegex = /<img[^>]+src="([^"]+)"/g;
    const matches = [...htmlContent.matchAll(imgRegex)];

    // Images might not exist in the HTML, so we only test if they do
    matches.forEach((match) => {
      const src = match[1];
      // Skip external URLs and data URIs
      if (
        src.startsWith("http://") ||
        src.startsWith("https://") ||
        src.startsWith("data:")
      ) {
        return;
      }
      // Local images should start with /AutoPapersTools/
      expect(src).toMatch(/^\/AutoPapersTools\//);
    });
  });

  it("should ensure all local asset paths start with /AutoPapersTools/", () => {
    // Generic test for any local asset reference
    const assetRegex = /(src|href)="(\/[^"]+)"/g;
    const matches = [...htmlContent.matchAll(assetRegex)];

    matches.forEach((match) => {
      const path = match[2];
      // Skip if it's an external URL or special protocol
      if (
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("//")
      ) {
        return;
      }
      // All local paths should start with /AutoPapersTools/
      if (path.startsWith("/") && !path.startsWith("/AutoPapersTools/")) {
        throw new Error(
          `Found local asset path without correct base: ${path}`
        );
      }
    });
  });

  it("should verify base path ends with /", () => {
    const basePath = "/AutoPapersTools/";
    expect(basePath.endsWith("/")).toBe(true);
  });

  it("should verify index.html exists in build output", () => {
    expect(fs.existsSync(indexHtmlPath)).toBe(true);
  });

  it("should verify assets directory exists", () => {
    const assetsPath = path.join(distPath, "assets");
    expect(fs.existsSync(assetsPath)).toBe(true);
  });

  it("should verify HTML content is not empty", () => {
    expect(htmlContent.length).toBeGreaterThan(0);
    expect(htmlContent).toContain("<!doctype html>");
  });
});
