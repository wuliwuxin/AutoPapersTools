/**
 * Base LLM Adapter Interface
 * Defines the contract for all LLM adapters
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  tokensUsed?: number;
  model?: string;
}

export interface LLMConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export abstract class BaseLLMAdapter {
  protected config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  /**
   * 发送聊天请求
   */
  abstract chat(messages: LLMMessage[]): Promise<LLMResponse>;

  /**
   * 验证 API 密钥是否有效
   */
  abstract validateApiKey(): Promise<boolean>;

  /**
   * 获取提供商名称
   */
  abstract getProvider(): string;

  /**
   * 获取模型名称
   */
  getModel(): string {
    return this.config.model;
  }

  /**
   * 估算成本（可选实现）
   */
  estimateCost(tokensUsed: number): number {
    return 0; // 默认返回 0，子类可以覆盖
  }
}
