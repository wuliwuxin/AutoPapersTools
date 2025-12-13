/**
 * Gemini (Google) LLM Adapter
 */

import { BaseLLMAdapter, LLMMessage, LLMResponse } from './base';

export class GeminiAdapter extends BaseLLMAdapter {
  private readonly baseURL = 'https://generativelanguage.googleapis.com/v1beta';

  getProvider(): string {
    return 'gemini';
  }

  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      // Gemini API 格式需要转换
      const contents = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      const systemInstruction = messages.find((m) => m.role === 'system');

      const response = await fetch(
        `${this.baseURL}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            systemInstruction: systemInstruction
              ? { parts: [{ text: systemInstruction.content }] }
              : undefined,
            generationConfig: {
              temperature: this.config.temperature ?? 0.7,
              maxOutputTokens: this.config.maxTokens ?? 4000,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
      }

      const data = await response.json();

      return {
        content: data.candidates[0]?.content?.parts[0]?.text || '',
        tokensUsed:
          data.usageMetadata?.promptTokenCount +
          data.usageMetadata?.candidatesTokenCount,
        model: this.config.model,
      };
    } catch (error) {
      console.error('[Gemini] Chat error:', error);
      throw error;
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseURL}/models?key=${this.config.apiKey}`
      );

      return response.ok;
    } catch (error) {
      console.error('[Gemini] API key validation error:', error);
      return false;
    }
  }

  estimateCost(tokensUsed: number): number {
    // Gemini 定价: $0.00025 per 1K input tokens, $0.0005 per 1K output tokens
    // 简化估算，假设输入输出各占一半
    const inputCost = (tokensUsed * 0.5 * 0.00025) / 1000;
    const outputCost = (tokensUsed * 0.5 * 0.0005) / 1000;
    return inputCost + outputCost;
  }
}
