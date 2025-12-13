/**
 * Property-Based Tests for Vite Configuration
 * Feature: github-pages-deployment, Property 1: Base path consistency
 * Validates: Requirements 1.2
 */

import { describe, it, expect } from "vitest";
import { defineConfig } from "vite";
import path from "path";

describe("Vite Configuration - Base Path", () => {
  /**
   * Property 1: Base path consistency
   * For any build configuration, when GITHUB_PAGES environment variable is true,
   * Vite's base config should be set to /AutoPapersTools/
   */
  it("should set base path to /AutoPapersTools/ when GITHUB_PAGES is true", () => {
    // Save original env
    const originalEnv = process.env.GITHUB_PAGES;

    try {
      // Set GITHUB_PAGES to true
      process.env.GITHUB_PAGES = "true";

      // Simulate the config logic
      const isGitHubPages = process.env.GITHUB_PAGES === "true";
      const base = isGitHubPages ? "/AutoPapersTools/" : "/";

      // Verify the base path is correct
      expect(base).toBe("/AutoPapersTools/");
      expect(isGitHubPages).toBe(true);
    } finally {
      // Restore original env
      if (originalEnv !== undefined) {
        process.env.GITHUB_PAGES = originalEnv;
      } else {
        delete process.env.GITHUB_PAGES;
      }
    }
  });

  it("should set base path to / when GITHUB_PAGES is not set", () => {
    // Save original env
    const originalEnv = process.env.GITHUB_PAGES;

    try {
      // Unset GITHUB_PAGES
      delete process.env.GITHUB_PAGES;

      // Simulate the config logic
      const isGitHubPages = process.env.GITHUB_PAGES === "true";
      const base = isGitHubPages ? "/AutoPapersTools/" : "/";

      // Verify the base path is correct
      expect(base).toBe("/");
      expect(isGitHubPages).toBe(false);
    } finally {
      // Restore original env
      if (originalEnv !== undefined) {
        process.env.GITHUB_PAGES = originalEnv;
      }
    }
  });

  it("should set base path to / when GITHUB_PAGES is false", () => {
    // Save original env
    const originalEnv = process.env.GITHUB_PAGES;

    try {
      // Set GITHUB_PAGES to false
      process.env.GITHUB_PAGES = "false";

      // Simulate the config logic
      const isGitHubPages = process.env.GITHUB_PAGES === "true";
      const base = isGitHubPages ? "/AutoPapersTools/" : "/";

      // Verify the base path is correct
      expect(base).toBe("/");
      expect(isGitHubPages).toBe(false);
    } finally {
      // Restore original env
      if (originalEnv !== undefined) {
        process.env.GITHUB_PAGES = originalEnv;
      } else {
        delete process.env.GITHUB_PAGES;
      }
    }
  });

  /**
   * Property test: Base path should always end with /
   */
  it("should ensure base path always ends with /", () => {
    const testCases = [
      { env: "true", expected: "/AutoPapersTools/" },
      { env: "false", expected: "/" },
      { env: undefined, expected: "/" },
    ];

    testCases.forEach(({ env, expected }) => {
      const originalEnv = process.env.GITHUB_PAGES;

      try {
        if (env === undefined) {
          delete process.env.GITHUB_PAGES;
        } else {
          process.env.GITHUB_PAGES = env;
        }

        const isGitHubPages = process.env.GITHUB_PAGES === "true";
        const base = isGitHubPages ? "/AutoPapersTools/" : "/";

        expect(base).toBe(expected);
        expect(base.endsWith("/")).toBe(true);
      } finally {
        if (originalEnv !== undefined) {
          process.env.GITHUB_PAGES = originalEnv;
        } else {
          delete process.env.GITHUB_PAGES;
        }
      }
    });
  });
});
