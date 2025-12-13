import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Papers table: stores research paper metadata
 */
export const papers = mysqlTable("papers", {
  id: int("id").autoincrement().primaryKey(),
  arxivId: varchar("arxivId", { length: 64 }).notNull().unique(), // arXiv ID or unique identifier
  title: text("title").notNull(),
  authors: text("authors").notNull(), // JSON array of author names
  abstract: text("abstract"),
  fullText: text("fullText"), // 论文全文（至少包含摘要和引言）
  publishedAt: timestamp("publishedAt").notNull(),
  source: varchar("source", { length: 64 }).notNull(), // 'arxiv', 'scholar', etc.
  sourceUrl: varchar("sourceUrl", { length: 512 }).notNull(),
  category: varchar("category", { length: 128 }), // e.g., 'cs.LG', 'stat.ML'
  keywords: text("keywords"), // JSON array of keywords
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Paper = typeof papers.$inferSelect;
export type InsertPaper = typeof papers.$inferInsert;

/**
 * Analysis reports table: stores LLM-generated analysis for papers
 */
export const analysisReports = mysqlTable("analysisReports", {
  id: int("id").autoincrement().primaryKey(),
  paperId: int("paperId").notNull(),
  background: text("background"), // Background section
  what: text("what"), // What section (goal + results)
  why: text("why"), // Why section (values + challenges)
  how: text("how"), // How section (framework + modules)
  howWhy: text("howWhy"), // How-why section (insights + advantages)
  summary: text("summary"), // Brief summary
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  generatedAt: timestamp("generatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnalysisReport = typeof analysisReports.$inferSelect;
export type InsertAnalysisReport = typeof analysisReports.$inferInsert;

/**
 * User favorites table: stores user's favorite papers
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  paperId: int("paperId").notNull(),
  notes: text("notes"), // User's notes about the paper
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

/**
 * User subscriptions table: stores user's subscription preferences
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  category: varchar("category", { length: 128 }).notNull(), // e.g., 'cs.LG', 'stat.ML'
  keywords: text("keywords"), // JSON array of keywords to subscribe to
  enabled: int("enabled").default(1).notNull(), // 1 = enabled, 0 = disabled
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Daily digest table: stores daily digest records for tracking
 */
export const dailyDigests = mysqlTable("dailyDigests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD format
  paperIds: text("paperIds"), // JSON array of paper IDs included in digest
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyDigest = typeof dailyDigests.$inferSelect;
export type InsertDailyDigest = typeof dailyDigests.$inferInsert;