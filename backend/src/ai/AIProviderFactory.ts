import { config } from '../config/index.js';
import { AIProvider } from './types.js';
import { OpenAIProvider } from './providers/OpenAIProvider.js';
import { AnthropicProvider } from './providers/AnthropicProvider.js';

/**
 * AI Provider Factory
 * Creates and manages AI provider instances
 */
export class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map();

  /**
   * Get a provider by name
   */
  static getProvider(name: string): AIProvider | null {
    // Check cache first
    if (this.providers.has(name)) {
      return this.providers.get(name)!;
    }

    // Create provider
    let provider: AIProvider | null = null;
    
    switch (name.toLowerCase()) {
      case 'openai':
        provider = new OpenAIProvider(config.openaiApiKey);
        break;
      case 'anthropic':
        provider = new AnthropicProvider(config.anthropicApiKey);
        break;
      default:
        return null;
    }

    // Cache if available
    if (provider && provider.isAvailable()) {
      this.providers.set(name, provider);
    }

    return provider;
  }

  /**
   * Get all available providers
   */
  static getAvailableProviders(): AIProvider[] {
    const providerNames = ['openai', 'anthropic'];
    const available: AIProvider[] = [];

    for (const name of providerNames) {
      const provider = this.getProvider(name);
      if (provider && provider.isAvailable()) {
        available.push(provider);
      }
    }

    return available;
  }

  /**
   * Get the default provider (from config)
   */
  static getDefaultProvider(): AIProvider | null {
    return this.getProvider(config.defaultAiProvider);
  }

  /**
   * Check if any provider is available
   */
  static hasAvailableProvider(): boolean {
    return this.getAvailableProviders().length > 0;
  }

  /**
   * Clear provider cache (useful for testing)
   */
  static clearCache(): void {
    this.providers.clear();
  }
}
