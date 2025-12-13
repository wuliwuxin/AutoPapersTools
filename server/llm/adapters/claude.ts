/**
 * Claude (Anthropic) LLM Adapter
 */

import { BaseLLMAdapter, LLMMessage, LLMResponse } from './base';

export class ClaudeAdapter extends BaseLLMAdapter {
  private readonly baseURL = 'https://api.anthropic.com/v1';

  getProvider(): string {
    return 'claude';
  }

  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      // Claude API 格式略有不同，需要转换消息格式
      const systemMessage = messages.find((m) => m.role === 'system');
      const conversationMessages = messages.filter((m) => m.role !== 'system');

      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: conversationMessages,
          system: systemMessage?.content,
          temperature: this.config.temperature ?? 0.7,
          max_tokens: this.config.maxTokens ?? 4000,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${error}`);
      }

      const data = await response.json();

      return {
        content: data.content[0]?.text || '',
        tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
        model: data.model,
      };
    } catch (error) {
      console.error('[Claude] Chat error:', error);
      throw error;
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Claude 没有专门的验证端点，尝试发送一个简单请求
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        }),
      });

      return response.ok || response.status === 400; // 400 也表示密钥有效
    } catch (error) {
      console.error('[Claude] API key validation error:', error);
      return false;
    }
  }

  estimateCost(tokensUsed: number): number {
    // Claude 定价: $0.015 per 1K input tokens, $0.075 per 1K output tokens
    // 简化估算，假设输入输出各占一半
    const inputCost = (tokensUsed * 0.5 * 0.015) / 1000;
    const outputCost = (tokensUsed * 0.5 * 0.075) / 1000;
    return inputCost + outputCost;
  }
}
