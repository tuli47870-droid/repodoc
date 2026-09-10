import Anthropic from '@anthropic-ai/sdk';
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
 * Anthropic Provider Implementation
 */
export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic';
  readonly defaultModel = 'claude-3-5-sonnet-20241022';
  readonly supportedModels = [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
  ];

  private client: Anthropic | null = null;
  private readonly apiKey?: string;

  // Pricing per 1M tokens (as of 2024)
  private readonly pricing: Record<string, { input: number; output: number }> = {
    'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
    'claude-3-5-haiku-20241022': { input: 0.80, output: 4.00 },
    'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
    'claude-3-sonnet-20240229': { input: 3.00, output: 15.00 },
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  };

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey && !!this.client;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    if (!this.isAvailable()) {
      throw new AIProviderError('Anthropic provider not available (missing API key)', this.name);
    }

    const model = options?.model || this.defaultModel;
    
    // Separate system messages from user/assistant messages
    const systemMessages = messages.filter(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');
    
    const systemPrompt = systemMessages.map(m => m.content).join('\n\n');
    
    try {
      const response = await this.client!.messages.create({
        model,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature ?? 0.7,
        system: systemPrompt || undefined,
        messages: conversationMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        stop_sequences: options?.stopSequences,
      });

      const content = response.content[0];
      if (!content || content.type !== 'text') {
        throw new Error('No text response from Anthropic');
      }

      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;
      const cost = this.estimateCost(inputTokens, outputTokens, model);

      return {
        content: content.text,
        model,
        provider: this.name,
        tokensUsed: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens,
        },
        costUsd: cost.totalCostUsd,
        finishReason: this.mapStopReason(response.stop_reason),
      };
    } catch (error) {
      throw new AIProviderError(
        `Anthropic request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  async countTokens(text: string, _model?: string): Promise<TokenCount> {
    // Anthropic doesn't provide a tokenizer, so we estimate
    // Claude models use roughly 3.5 characters per token on average
    return {
      tokens: Math.ceil(text.length / 3.5),
      method: 'estimated',
    };
  }

  estimateCost(inputTokens: number, outputTokens: number, model?: string): CostEstimate {
    const modelName = model || this.defaultModel;
    const prices = this.pricing[modelName] || this.pricing['claude-3-5-sonnet-20241022'];

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
      'claude-3-5-sonnet-20241022': {
        contextWindow: 200000,
        maxOutputTokens: 8192,
        supportsStreaming: true,
        costPerInputToken: 3.00 / 1_000_000,
        costPerOutputToken: 15.00 / 1_000_000,
        quality: 'premium',
        speed: 'fast',
      },
      'claude-3-5-haiku-20241022': {
        contextWindow: 200000,
        maxOutputTokens: 8192,
        supportsStreaming: true,
        costPerInputToken: 0.80 / 1_000_000,
        costPerOutputToken: 4.00 / 1_000_000,
        quality: 'excellent',
        speed: 'very-fast',
      },
      'claude-3-opus-20240229': {
        contextWindow: 200000,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        costPerInputToken: 15.00 / 1_000_000,
        costPerOutputToken: 75.00 / 1_000_000,
        quality: 'premium',
        speed: 'slow',
      },
      'claude-3-sonnet-20240229': {
        contextWindow: 200000,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        costPerInputToken: 3.00 / 1_000_000,
        costPerOutputToken: 15.00 / 1_000_000,
        quality: 'excellent',
        speed: 'medium',
      },
      'claude-3-haiku-20240307': {
        contextWindow: 200000,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        costPerInputToken: 0.25 / 1_000_000,
        costPerOutputToken: 1.25 / 1_000_000,
        quality: 'good',
        speed: 'very-fast',
      },
    };

    return capabilities[modelName] || capabilities['claude-3-5-sonnet-20241022'];
  }

  private mapStopReason(reason: string | null): 'stop' | 'length' | 'error' {
    switch (reason) {
      case 'end_turn':
      case 'stop_sequence':
        return 'stop';
      case 'max_tokens':
        return 'length';
      default:
        return 'error';
    }
  }
}
