import OpenAI from 'openai';
import { encoding_for_model, TiktokenModel } from 'tiktoken';
import {
  AIProvider,
  ChatMessage,
  ChatOptions,
  ChatResponse,
  TokenCount,
  CostEstimate,
  ModelCapabilities,
  AIProviderError,
} from '../types.js';

/**
 * OpenAI Provider Implementation
 */
export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';
  readonly defaultModel = 'gpt-4o-mini';
  readonly supportedModels = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
  ];

  private client: OpenAI | null = null;
  private readonly apiKey?: string;

  // Pricing per 1M tokens (as of 2024)
  private readonly pricing: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4-turbo': { input: 10.00, output: 30.00 },
    'gpt-4': { input: 30.00, output: 60.00 },
    'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
  };

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey && !!this.client;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    if (!this.isAvailable()) {
      throw new AIProviderError('OpenAI provider not available (missing API key)', this.name);
    }

    const model = options?.model || this.defaultModel;
    
    try {
      const completion = await this.client!.chat.completions.create({
        model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
        stop: options?.stopSequences,
      });

      const choice = completion.choices[0];
      if (!choice || !choice.message) {
        throw new Error('No response from OpenAI');
      }

      const usage = completion.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
      const cost = this.estimateCost(usage.prompt_tokens, usage.completion_tokens, model);

      return {
        content: choice.message.content || '',
        model,
        provider: this.name,
        tokensUsed: {
          input: usage.prompt_tokens,
          output: usage.completion_tokens,
          total: usage.total_tokens,
        },
        costUsd: cost.totalCostUsd,
        finishReason: this.mapFinishReason(choice.finish_reason),
      };
    } catch (error) {
      throw new AIProviderError(
        `OpenAI request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  async countTokens(text: string, model?: string): Promise<TokenCount> {
    const modelName = (model || this.defaultModel) as TiktokenModel;
    
    try {
      const encoder = encoding_for_model(modelName);
      const tokens = encoder.encode(text);
      encoder.free(); // Clean up
      
      return {
        tokens: tokens.length,
        method: 'exact',
      };
    } catch (error) {
      // Fallback to estimation (roughly 4 characters per token)
      return {
        tokens: Math.ceil(text.length / 4),
        method: 'estimated',
      };
    }
  }

  estimateCost(inputTokens: number, outputTokens: number, model?: string): CostEstimate {
    const modelName = model || this.defaultModel;
    const prices = this.pricing[modelName] || this.pricing['gpt-4o-mini'];

    const inputCostUsd = (inputTokens / 1_000_000) * prices.input;
    const outputCostUsd = (outputTokens / 1_000_000) * prices.output;

    return {
      inputCostUsd,
      outputCostUsd,
      totalCostUsd: inputCostUsd + outputCostUsd,
    };
  }

  getCapabilities(model?: string): ModelCapabilities {
    const modelName = model || this.defaultModel;
    
    const capabilities: Record<string, ModelCapabilities> = {
      'gpt-4o': {
        contextWindow: 128000,
        maxOutputTokens: 16384,
        supportsStreaming: true,
        costPerInputToken: 2.50 / 1_000_000,
        costPerOutputToken: 10.00 / 1_000_000,
        quality: 'premium',
        speed: 'fast',
      },
      'gpt-4o-mini': {
        contextWindow: 128000,
        maxOutputTokens: 16384,
        supportsStreaming: true,
        costPerInputToken: 0.15 / 1_000_000,
        costPerOutputToken: 0.60 / 1_000_000,
        quality: 'excellent',
        speed: 'very-fast',
      },
      'gpt-4-turbo': {
        contextWindow: 128000,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        costPerInputToken: 10.00 / 1_000_000,
        costPerOutputToken: 30.00 / 1_000_000,
        quality: 'premium',
        speed: 'medium',
      },
      'gpt-4': {
        contextWindow: 8192,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        costPerInputToken: 30.00 / 1_000_000,
        costPerOutputToken: 60.00 / 1_000_000,
        quality: 'premium',
        speed: 'slow',
      },
      'gpt-3.5-turbo': {
        contextWindow: 16385,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        costPerInputToken: 0.50 / 1_000_000,
        costPerOutputToken: 1.50 / 1_000_000,
        quality: 'good',
        speed: 'very-fast',
      },
    };

    return capabilities[modelName] || capabilities['gpt-4o-mini'];
  }

  private mapFinishReason(reason?: string): 'stop' | 'length' | 'error' {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      default:
        return 'error';
    }
  }
}
