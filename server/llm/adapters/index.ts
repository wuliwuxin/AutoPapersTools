/**
 * LLM Adapter Factory
 * Creates appropriate adapter based on provider
 */

import { BaseLLMAdapter, LLMConfig } from './base';
import { DeepSeekAdapter } from './deepseek';
import { OpenAIAdapter } from './openai';
import { ClaudeAdapter } from './claude';
import { GeminiAdapter } from './gemini';

export type LLMProvider = 'deepseek' | 'openai' | 'claude' | 'gemini';

export function createLLMAdapter(
  provider: LLMProvider,
  config: LLMConfig
): BaseLLMAdapter {
  switch (provider) {
    case 'deepseek':
      return new DeepSeekAdapter(config);
    case 'openai':
      return new OpenAIAdapter(config);
    case 'claude':
      return new ClaudeAdapter(config);
    case 'gemini':
      return new GeminiAdapter(config);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

export * from './base';
export { DeepSeekAdapter } from './deepseek';
export { OpenAIAdapter } from './openai';
export { ClaudeAdapter } from './claude';
export { GeminiAdapter } from './gemini';
