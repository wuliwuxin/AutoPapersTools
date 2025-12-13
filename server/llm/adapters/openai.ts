/**
 * OpenAI LLM Adapter
 */

import { BaseLLMAdapter, LLMMessage, LLMResponse } from './base';

export class OpenAIAdapter extends BaseLLMAdapter {
  private readonly baseURL = 'https://api.openai.com/v1';

  getProvider(): string {
    return 'openai';
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
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
      }

      const data = await response.json();

      return {
        content: data.choices[0]?.message?.content || '',
        tokensUsed: data.usage?.total_tokens,
        model: data.model,
      };
    } catch (error) {
      console.error('[OpenAI] Chat error:', error);
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
      console.error('[OpenAI] API key validation error:', error);
      return false;
    }
  }

  estimateCost(tokensUsed: number): number {
    // OpenAI GPT-4 定价: $0.03 per 1K input tokens, $0.06 per 1K output tokens
    // 简化估算，假设输入输出各占一半
    const inputCost = (tokensUsed * 0.5 * 0.03) / 1000;
    const outputCost = (tokensUsed * 0.5 * 0.06) / 1000;
    return inputCost + outputCost;
  }
}
