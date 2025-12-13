/**
 * Analysis Service
 * Manages paper analysis tasks with progress tracking
 */

import { createLLMAdapter, LLMProvider } from '../llm/adapters';
import {
  createAnalysisTask,
  updateAnalysisTask,
  getAnalysisTask,
  getPaperById,
  createAnalysisReport,
  getUserAPIKeys,
} from '../db';
import { cryptoService } from '../_core/crypto';
import crypto from 'crypto';

interface AnalysisOptions {
  userId: number;
  paperId: number;
  provider?: LLMProvider;
  modelName?: string;
}

export class AnalysisService {
  /**
   * 开始分析任务
   */
  async startAnalysis(options: AnalysisOptions): Promise<string> {
    const { userId, paperId, provider, modelName } = options;

    // 获取论文信息
    const paper = await getPaperById(paperId);
    if (!paper) {
      throw new Error('Paper not found');
    }

    // 获取用户的 API 密钥
    const apiKeys = await getUserAPIKeys(userId);
    let selectedKey;

    if (provider) {
      // 使用指定的提供商
      selectedKey = apiKeys.find(
        (k) => k.provider === provider && k.isActive
      );
    } else {
      // 使用默认密钥
      selectedKey = apiKeys.find((k) => k.isDefault && k.isActive);
    }

    if (!selectedKey) {
      throw new Error(
        'No API key found. Please add an API key in settings.'
      );
    }

    // 解密 API 密钥
    const apiKey = cryptoService.decrypt(selectedKey.apiKeyEncrypted);

    // 创建任务
    const taskId = crypto.randomUUID();
    await createAnalysisTask(
      taskId,
      userId,
      paperId,
      selectedKey.provider,
      modelName || selectedKey.modelName
    );

    // 异步执行分析
    this.executeAnalysis(
      taskId,
      paper,
      selectedKey.provider as LLMProvider,
      apiKey,
      modelName || selectedKey.modelName
    ).catch((error) => {
      console.error(`[Analysis] Task ${taskId} failed:`, error);
    });

    return taskId;
  }

  /**
   * 执行分析
   */
  private async executeAnalysis(
    taskId: string,
    paper: any,
    provider: LLMProvider,
    apiKey: string,
    modelName: string
  ): Promise<void> {
    try {
      // 更新状态为进行中
      await updateAnalysisTask(taskId, {
        status: 'processing',
        progress: 10,
      });

      // 创建 LLM 适配器
      const adapter = createLLMAdapter(provider, {
        apiKey,
        model: modelName,
        temperature: 0.7,
        maxTokens: 4000,
      });

      // 构建分析提示
      const prompt = this.buildAnalysisPrompt(paper);

      // 更新进度
      await updateAnalysisTask(taskId, { progress: 30 });

      // 调用 LLM
      const response = await adapter.chat([
        {
          role: 'system',
          content:
            'You are an expert in time series analysis and academic paper review. Provide detailed, insightful analysis.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      // 更新进度
      await updateAnalysisTask(taskId, { progress: 80 });

      // 解析分析结果（五维度格式）
      const analysis = this.parseAnalysisResponse(response.content);
      
      // 保存分析报告
      await createAnalysisReport({
        paperId: paper.id,
        background: analysis.background,
        what: analysis.what,
        why: analysis.why,
        how: analysis.how,
        howWhy: analysis.howWhy,
        summary: analysis.summary,
        status: 'completed',
        generatedAt: new Date(),
      });

      // 计算成本
      const cost = adapter.estimateCost(response.tokensUsed || 0);

      // 更新任务为完成
      await updateAnalysisTask(taskId, {
        status: 'completed',
        progress: 100,
        tokensUsed: response.tokensUsed || 0,
        costEstimate: cost,
        completedAt: new Date(),
      });

      console.log(`[Analysis] Task ${taskId} completed successfully`);
    } catch (error: any) {
      console.error(`[Analysis] Task ${taskId} failed:`, error);

      // 更新任务为失败
      await updateAnalysisTask(taskId, {
        status: 'failed',
        errorMessage: error.message || 'Unknown error',
      });
    }
  }

  /**
   * 获取任务状态
   */
  async getTaskStatus(taskId: string) {
    return getAnalysisTask(taskId);
  }

  /**
   * 构建分析提示（五维度格式）
   */
  private buildAnalysisPrompt(paper: any): string {
    const authors = typeof paper.authors === 'string' ? paper.authors : JSON.parse(paper.authors).join(', ');
    
    // 构建论文内容
    let paperContent = `标题: ${paper.title}\n\n作者: ${authors}\n\n`;
    
    // 如果有完整文本，使用完整文本
    if (paper.fullText && paper.fullText.trim()) {
      paperContent += `论文内容:\n\n${paper.fullText}`;
      console.log('[Analysis] Using full text for analysis');
    } else {
      // 否则只使用摘要
      paperContent += `摘要: ${paper.abstract}\n\n注意：当前只有摘要信息，请基于摘要进行深入推理和分析。`;
      console.log('[Analysis] Using abstract only for analysis');
    }

    return `请对以下研究论文进行深度分析：

${paperContent}

请按照以下五个维度进行分析，每个维度都要详细且深入：

## Background（问题背景）
为什么会有这个问题存在？包括：
- 场景描述：这个问题出现在什么场景下
- 面临瓶颈：当前方法遇到了什么困难
- 发展现状：该领域的研究现状如何

## What（解决方案）
做什么？包括：
- Goal（目标）：论文要解决什么问题
- Results（成果）：取得了什么成果，用数据说话

## Why（价值与挑战）
为什么要做这件事？包括：
- Values（价值）：解决这个问题有什么意义
- Challenges（挑战）：面临哪些技术挑战

## How（实现方法）
怎么做这件事？包括：
- 框架：整体架构是什么
- 模块：包含哪些关键模块
- 关键步骤：核心算法或方法的步骤
- 交互逻辑：各部分如何协同工作

## How-why（方法论证）
为什么采用这种方法？包括：
- Insights（洞察）：作者的关键洞察是什么
- Advantages（优势）：这种方法相比其他方法的优势

## Summary（核心要点）
用3-5句话总结论文的核心贡献和价值

请用中文回答，每个维度都要详细展开，使用 Markdown 格式。`;
  }

  /**
   * 解析分析响应（五维度格式）
   */
  private parseAnalysisResponse(analysis: string): {
    background: string;
    what: string;
    why: string;
    how: string;
    howWhy: string;
    summary: string;
  } {
    // 提取各个维度
    const background = this.extractSection(analysis, 'Background', ['What', '## What']);
    const what = this.extractSection(analysis, 'What', ['Why', '## Why']);
    const why = this.extractSection(analysis, 'Why', ['How', '## How']);
    const how = this.extractSection(analysis, 'How', ['How-why', '## How-why']);
    const howWhy = this.extractSection(analysis, 'How-why', ['Summary', '## Summary']);
    const summary = this.extractSection(analysis, 'Summary', []);

    return {
      background: background || '暂无背景分析',
      what: what || '暂无解决方案分析',
      why: why || '暂无价值分析',
      how: how || '暂无实现方法分析',
      howWhy: howWhy || '暂无方法论证',
      summary: summary || analysis.substring(0, 500),
    };
  }

  /**
   * 从文本中提取指定章节
   */
  private extractSection(text: string, sectionName: string, nextSections: string[]): string {
    // 尝试匹配 ## SectionName 或 SectionName:
    const patterns = [
      new RegExp(`##\\s*${sectionName}[：:]?\\s*([\\s\\S]*?)(?=${nextSections.map(s => `##\\s*${s}`).join('|')}|$)`, 'i'),
      new RegExp(`${sectionName}[：:]\\s*([\\s\\S]*?)(?=${nextSections.join('|')}|$)`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return '';
  }
}

// 单例实例
export const analysisService = new AnalysisService();
