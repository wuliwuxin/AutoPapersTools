import { eq, desc, or, like, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, papers, InsertPaper, analysisReports, InsertAnalysisReport, favorites, InsertFavorite, subscriptions, InsertSubscription, dailyDigests, InsertDailyDigest } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _dbConnectionAttempted = false;

// 内存存储（无数据库时使用）
interface MemoryStore {
  papers: any[];
  analysisReports: any[];
  users: any[];
  apiKeys: any[];
  analysisTasks: any[];
  userPreferences: any[];
  nextPaperId: number;
  nextReportId: number;
  nextUserId: number;
  nextApiKeyId: number;
  nextPreferenceId: number;
}

const memoryStore: MemoryStore = {
  papers: [],
  analysisReports: [],
  users: [],
  apiKeys: [],
  analysisTasks: [],
  userPreferences: [],
  nextPaperId: 1,
  nextReportId: 1,
  nextUserId: 1,
  nextApiKeyId: 1,
  nextPreferenceId: 1,
};

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  // 如果没有配置 DATABASE_URL，直接返回 null 使用内存存储
  if (!process.env.DATABASE_URL) {
    if (!_dbConnectionAttempted) {
      console.log("[Database] No DATABASE_URL configured, using memory storage");
      _dbConnectionAttempted = true;
    }
    return null;
  }
  
  if (!_db && !_dbConnectionAttempted) {
    _dbConnectionAttempted = true;
    try {
      _db = drizzle(process.env.DATABASE_URL);
      console.log("[Database] Connected to MySQL");
    } catch (error) {
      console.warn("[Database] Failed to connect, using memory storage:", error);
      _db = null;
    }
  }
  return _db;
}

// 检查是否使用内存存储
function useMemoryStore(): boolean {
  return !process.env.DATABASE_URL || _dbConnectionAttempted && !_db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Paper queries
 */
// 演示数据（无数据库时使用）
const demoPapers = [
  {
    id: 1,
    title: "Attention Is All You Need",
    authors: JSON.stringify(["Ashish Vaswani", "Noam Shazeer", "Niki Parmar"]),
    abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
    publishedAt: new Date("2017-06-12"),
    sourceUrl: "https://arxiv.org/abs/1706.03762",
    arxivId: "1706.03762",
    category: "cs.CL",
    keywords: JSON.stringify(["transformer", "attention", "neural network"]),
    createdAt: new Date(),
    updatedAt: new Date(),
    source: "arxiv"
  },
  {
    id: 2,
    title: "BERT: Pre-training of Deep Bidirectional Transformers",
    authors: JSON.stringify(["Jacob Devlin", "Ming-Wei Chang", "Kenton Lee"]),
    abstract: "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.",
    publishedAt: new Date("2018-10-11"),
    sourceUrl: "https://arxiv.org/abs/1810.04805",
    arxivId: "1810.04805",
    category: "cs.CL",
    keywords: JSON.stringify(["BERT", "NLP", "pre-training"]),
    createdAt: new Date(),
    updatedAt: new Date(),
    source: "arxiv"
  }
];

export async function getPapers(limit: number = 20, offset: number = 0, filters?: {
  category?: string;
  searchQuery?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'newest' | 'oldest';
}) {
  const db = await getDb();
  if (!db) {
    // 合并内存存储和演示数据
    const allPapers = [...memoryStore.papers, ...demoPapers];
    console.log(`[Memory] Returning ${allPapers.length} papers from memory storage`);
    
    // 应用过滤
    let filtered = allPapers;
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(query) || 
        p.abstract?.toLowerCase().includes(query)
      );
    }
    if (filters?.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    // 排序
    if (filters?.sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    } else {
      filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }
    
    return filtered.slice(offset, offset + limit);
  }

  let query = db.select().from(papers);

  if (filters?.category) {
    query = query.where(eq(papers.category, filters.category)) as any;
  }

  if (filters?.searchQuery) {
    const searchTerm = `%${filters.searchQuery}%`;
    query = query.where(
      or(
        like(papers.title, searchTerm),
        like(papers.abstract, searchTerm),
        like(papers.authors, searchTerm)
      )
    ) as any;
  }

  if (filters?.startDate) {
    query = query.where(gte(papers.publishedAt, filters.startDate)) as any;
  }

  if (filters?.endDate) {
    query = query.where(lte(papers.publishedAt, filters.endDate)) as any;
  }

  if (filters?.sortBy === 'oldest') {
    query = query.orderBy(papers.publishedAt) as any;
  } else {
    query = query.orderBy(desc(papers.publishedAt)) as any;
  }

  return query.limit(limit).offset(offset);
}

export async function getPaperById(paperId: number) {
  const db = await getDb();
  if (!db) {
    // 先从内存存储查找
    const memPaper = memoryStore.papers.find(p => p.id === paperId);
    if (memPaper) return memPaper;
    // 再从演示数据查找
    return demoPapers.find(p => p.id === paperId);
  }

  const result = await db.select().from(papers).where(eq(papers.id, paperId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPaperByArxivId(arxivId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(papers).where(eq(papers.arxivId, arxivId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPaper(paper: InsertPaper) {
  const db = await getDb();
  if (!db) {
    // 使用内存存储
    const newPaper = {
      id: memoryStore.nextPaperId++,
      ...paper,
      authors: paper.authors,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.papers.push(newPaper);
    console.log(`[Memory] Created paper ${newPaper.id}: ${paper.title?.substring(0, 50)}...`);
    return { insertId: newPaper.id };
  }

  const result = await db.insert(papers).values(paper);
  return result;
}

/**
 * Analysis report queries
 */
export async function getAnalysisReport(paperId: number) {
  const db = await getDb();
  if (!db) {
    // 从内存存储查找
    return memoryStore.analysisReports.find(r => r.paperId === paperId);
  }

  const result = await db.select().from(analysisReports).where(eq(analysisReports.paperId, paperId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAnalysisReport(report: InsertAnalysisReport) {
  const db = await getDb();
  if (!db) {
    // 使用内存存储
    const newReport = {
      id: memoryStore.nextReportId++,
      ...report,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.analysisReports.push(newReport);
    console.log(`[Memory] Created analysis report ${newReport.id} for paper ${report.paperId}`);
    return { insertId: newReport.id };
  }

  const result = await db.insert(analysisReports).values(report);
  return result;
}

export async function updateAnalysisReport(reportId: number, updates: Partial<InsertAnalysisReport>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return db.update(analysisReports).set(updates).where(eq(analysisReports.id, reportId));
}

/**
 * Favorite queries
 */
export async function getUserFavorites(userId: number, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];

  return db.select({
    favorite: favorites,
    paper: papers,
  }).from(favorites)
    .innerJoin(papers, eq(favorites.paperId, papers.id))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function isFavorited(userId: number, paperId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db.select().from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.paperId, paperId)))
    .limit(1);
  return result.length > 0;
}

export async function addFavorite(userId: number, paperId: number, notes?: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return db.insert(favorites).values({ userId, paperId, notes });
}

export async function removeFavorite(userId: number, paperId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.paperId, paperId)));
}

/**
 * Subscription queries
 */
export async function getUserSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
}

export async function addSubscription(userId: number, category: string, keywords?: string[]) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return db.insert(subscriptions).values({
    userId,
    category,
    keywords: keywords ? JSON.stringify(keywords) : null,
  });
}

export async function removeSubscription(subscriptionId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return db.delete(subscriptions).where(eq(subscriptions.id, subscriptionId));
}

/**
 * Daily digest queries
 */
export async function createDailyDigest(userId: number, date: string, paperIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return db.insert(dailyDigests).values({
    userId,
    date,
    paperIds: JSON.stringify(paperIds),
  });
}

export async function getDailyDigest(userId: number, date: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(dailyDigests)
    .where(and(eq(dailyDigests.userId, userId), eq(dailyDigests.date, date)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}


/**
 * User authentication queries
 */
export async function createUser(email: string, passwordHash: string, name?: string) {
  const db = await getDb();
  if (!db) {
    // 使用内存存储
    const newUser = {
      id: memoryStore.nextUserId++,
      email,
      passwordHash,
      name: name || null,
      emailVerified: false,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: null,
    };
    memoryStore.users.push(newUser);
    console.log(`[Memory] Created user ${newUser.id}: ${email}`);
    return newUser;
  }

  const result = await db.insert(users).values({
    email,
    passwordHash,
    name: name || null,
    emailVerified: false,
    role: 'user',
  });
  
  const userId = (result as any).insertId;
  return getUserById(userId);
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    return memoryStore.users.find(u => u.email === email);
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) {
    return memoryStore.users.find(u => u.id === userId);
  }

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserLastSignIn(userId: number) {
  const db = await getDb();
  if (!db) {
    const user = memoryStore.users.find(u => u.id === userId);
    if (user) {
      user.lastSignedIn = new Date();
      user.updatedAt = new Date();
    }
    return;
  }

  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

/**
 * API Keys queries
 */
export async function createAPIKey(userId: number, provider: string, apiKeyEncrypted: string, modelName: string, isDefault: boolean = false) {
  const db = await getDb();
  if (!db) {
    const newKey = {
      id: memoryStore.nextApiKeyId++,
      userId,
      provider,
      apiKeyEncrypted,
      modelName,
      isDefault,
      isActive: true,
      lastUsedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.apiKeys.push(newKey);
    console.log(`[Memory] Created API key ${newKey.id} for user ${userId}`);
    return newKey;
  }

  // Database implementation would go here
  throw new Error('Database API key creation not implemented');
}

export async function getUserAPIKeys(userId: number) {
  const db = await getDb();
  if (!db) {
    return memoryStore.apiKeys.filter(k => k.userId === userId && k.isActive);
  }

  // Database implementation would go here
  return [];
}

export async function getAPIKeyById(keyId: number) {
  const db = await getDb();
  if (!db) {
    return memoryStore.apiKeys.find(k => k.id === keyId);
  }

  // Database implementation would go here
  return undefined;
}

export async function updateAPIKey(keyId: number, updates: any) {
  const db = await getDb();
  if (!db) {
    const key = memoryStore.apiKeys.find(k => k.id === keyId);
    if (key) {
      Object.assign(key, updates, { updatedAt: new Date() });
    }
    return key;
  }

  // Database implementation would go here
  throw new Error('Database API key update not implemented');
}

export async function deleteAPIKey(keyId: number) {
  const db = await getDb();
  if (!db) {
    const index = memoryStore.apiKeys.findIndex(k => k.id === keyId);
    if (index !== -1) {
      memoryStore.apiKeys[index].isActive = false;
    }
    return;
  }

  // Database implementation would go here
  throw new Error('Database API key deletion not implemented');
}

/**
 * Analysis Tasks queries
 */
export async function createAnalysisTask(taskId: string, userId: number, paperId: number, provider: string, modelName: string) {
  const db = await getDb();
  if (!db) {
    const newTask = {
      id: taskId,
      userId,
      paperId,
      provider,
      modelName,
      status: 'pending',
      progress: 0,
      tokensUsed: null,
      costEstimate: null,
      errorMessage: null,
      startedAt: new Date(),
      completedAt: null,
      createdAt: new Date(),
    };
    memoryStore.analysisTasks.push(newTask);
    return newTask;
  }

  // Database implementation would go here
  throw new Error('Database analysis task creation not implemented');
}

export async function updateAnalysisTask(taskId: string, updates: any) {
  const db = await getDb();
  if (!db) {
    const task = memoryStore.analysisTasks.find(t => t.id === taskId);
    if (task) {
      Object.assign(task, updates);
    }
    return task;
  }

  // Database implementation would go here
  throw new Error('Database analysis task update not implemented');
}

export async function getAnalysisTask(taskId: string) {
  const db = await getDb();
  if (!db) {
    return memoryStore.analysisTasks.find(t => t.id === taskId);
  }

  // Database implementation would go here
  return undefined;
}

export async function getUserAnalysisTasks(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) {
    return memoryStore.analysisTasks
      .filter(t => t.userId === userId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
  }

  // Database implementation would go here
  return [];
}
