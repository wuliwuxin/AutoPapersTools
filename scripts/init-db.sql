-- 创建数据库
CREATE DATABASE IF NOT EXISTS ts_analysis_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ts_analysis_hub;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  open_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  login_method VARCHAR(50),
  role VARCHAR(50) DEFAULT 'user',
  last_signed_in DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 论文表
CREATE TABLE IF NOT EXISTS papers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  arxiv_id VARCHAR(50) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  authors JSON,
  abstract TEXT,
  published_at DATETIME,
  source VARCHAR(50) DEFAULT 'arxiv',
  source_url VARCHAR(500),
  category VARCHAR(100),
  keywords JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 分析报告表
CREATE TABLE IF NOT EXISTS analysis_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  paper_id INT NOT NULL,
  background TEXT,
  what_content TEXT,
  why_content TEXT,
  how_content TEXT,
  how_why TEXT,
  summary TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  generated_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
);

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  paper_id INT NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorite (user_id, paper_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
);

-- 订阅表
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(100),
  keywords JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 每日摘要表
CREATE TABLE IF NOT EXISTS daily_digests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date VARCHAR(10) NOT NULL,
  paper_ids JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_digest (user_id, date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX idx_papers_arxiv_id ON papers(arxiv_id);
CREATE INDEX idx_papers_published_at ON papers(published_at);
CREATE INDEX idx_papers_category ON papers(category);
CREATE INDEX idx_analysis_reports_paper_id ON analysis_reports(paper_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
