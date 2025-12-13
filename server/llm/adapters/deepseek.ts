/**
 * DeepSeek LLM Adapter
 */

import { BaseLLMAdapter, LLMMessage, LLMResponse } from './base';

export class DeepSeekAdapter extends BaseLLMAdapter {
  private readonly baseURL = 'https://api.deepseek.com/v1';

  getProvider(): string {
    return 'deepseek';
  }

  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: this.config.temperature ?? 0.7,
          max_tokens: this.config.maxTokens ?? 4000,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
      }

      const data = await response.json();

      return {
        content: data.choices[0]?.message?.content || '',
        tokensUsed: data.usage?.total_tokens,
        model: data.model,
      };
    } catch (error) {
      console.error('[DeepSeek] Chat error:', error);
      throw error;
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('[DeepSeek] API key validation error:', error);
      return false;
    }
  }

  estimateCost(tokensUsed: number): number {
    // DeepSeek 定价: $0.14 per 1M input tokens, $0.28 per 1M output tokens
    // 简化估算，假设输入输出各占一半
    const inputCost = (tokensUsed * 0.5 * 0.14) / 1000000;
    const outputCost = (tokensUsed * 0.5 * 0.28) / 1000000;
    return inputCost + outputCost;
  }
}
