import { config } from '../config/index.js';
import {
  AITask,
  ModelRoutingRequest,
  ModelRoutingResult,
  AIProvider,
} from './types.js';
import { AIProviderFactory } from './AIProviderFactory.js';

/**
 * Model Router
 * Routes AI requests to the most appropriate model based on task requirements
 */
export class ModelRouter {
  /**
   * Route a request to the best model
   */
  static route(request: ModelRoutingRequest): ModelRoutingResult {
    // If model routing is disabled, use default
    if (!config.aiModelRouterEnabled) {
      return {
        provider: config.defaultAiProvider,
        model: this.getDefaultModel(config.defaultAiProvider),
        reasoning: 'Model routing disabled, using default provider',
      };
    }

    // If specific provider/model requested, use it
    if (request.preferredModel && request.preferredProvider) {
      return {
        provider: request.preferredProvider,
        model: request.preferredModel,
        reasoning: 'User specified provider and model',
      };
    }

    // Get available providers
    const providers = AIProviderFactory.getAvailableProviders();
    if (providers.length === 0) {
      throw new Error('No AI providers available');
    }

    // Route based on task type and complexity
    const selection = this.selectModel(request, providers);
    
    return selection;
  }

  /**
   * Select the best model for a request
   */
  private static selectModel(
    request: ModelRoutingRequest,
    providers: AIProvider[]
  ): ModelRoutingResult {
    const { task, complexity, tokenBudget, costBudget } = request;

    // Define model preferences by task and complexity
    const preferences = this.getModelPreferences(task, complexity);

    // Try each preference in order
    for (const pref of preferences) {
      const provider = providers.find(p => p.name === pref.provider);
      if (!provider) continue;

      // Check if model is supported
      if (!provider.supportedModels.includes(pref.model)) continue;

      // Check token budget if specified
      if (tokenBudget && pref.estimatedTokens && pref.estimatedTokens > tokenBudget) {
        continue;
      }

      // Check cost budget if specified
      if (costBudget && pref.estimatedCost && pref.estimatedCost > costBudget) {
        continue;
      }

      return {
        provider: pref.provider,
        model: pref.model,
        reasoning: pref.reasoning,
      };
    }

    // Fallback to first available provider's default model
    const fallback = providers[0];
    return {
      provider: fallback.name,
      model: fallback.defaultModel,
      reasoning: 'No preference matched, using first available provider',
    };
  }

  /**
   * Get model preferences for a task
   */
  private static getModelPreferences(
    task: AITask,
    complexity: 'simple' | 'medium' | 'complex'
  ): Array<{
    provider: string;
    model: string;
    reasoning: string;
    estimatedTokens?: number;
    estimatedCost?: number;
  }> {
    // Simple tasks - use fastest, cheapest models
    if (complexity === 'simple') {
      return [
        {
          provider: 'openai',
          model: 'gpt-4o-mini',
          reasoning: 'Fast and cost-effective for simple tasks',
          estimatedTokens: 2000,
          estimatedCost: 0.001,
        },
        {
          provider: 'anthropic',
          model: 'claude-3-5-haiku-20241022',
          reasoning: 'Excellent speed and cost for simple tasks',
          estimatedTokens: 2000,
          estimatedCost: 0.001,
        },
      ];
    }

    // Complex tasks - use premium models
    if (complexity === 'complex') {
      if (task === 'root-cause' || task === 'security-analysis') {
        return [
          {
            provider: 'anthropic',
            model: 'claude-3-5-sonnet-20241022',
            reasoning: 'Best reasoning for complex analysis',
            estimatedTokens: 8000,
            estimatedCost: 0.05,
          },
          {
            provider: 'openai',
            model: 'gpt-4o',
            reasoning: 'Strong reasoning capabilities',
            estimatedTokens: 8000,
            estimatedCost: 0.06,
          },
        ];
      }

      return [
        {
          provider: 'openai',
          model: 'gpt-4o',
          reasoning: 'Balanced quality and speed for complex tasks',
          estimatedTokens: 6000,
          estimatedCost: 0.04,
        },
        {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
          reasoning: 'Excellent for complex reasoning',
          estimatedTokens: 6000,
          estimatedCost: 0.04,
        },
      ];
    }

    // Medium complexity - use good balance
    if (task === 'diagnosis' || task === 'code-review') {
      return [
        {
          provider: 'openai',
          model: 'gpt-4o-mini',
          reasoning: 'Excellent balance for code analysis',
          estimatedTokens: 4000,
          estimatedCost: 0.002,
        },
        {
          provider: 'anthropic',
          model: 'claude-3-5-haiku-20241022',
          reasoning: 'Fast and capable for code tasks',
          estimatedTokens: 4000,
          estimatedCost: 0.002,
        },
      ];
    }

    // Default medium complexity
    return [
      {
        provider: 'openai',
        model: 'gpt-4o-mini',
        reasoning: 'Default medium complexity model',
        estimatedTokens: 3000,
        estimatedCost: 0.0015,
      },
      {
        provider: 'anthropic',
        model: 'claude-3-5-haiku-20241022',
        reasoning: 'Alternative medium complexity model',
        estimatedTokens: 3000,
        estimatedCost: 0.0015,
      },
    ];
  }

  /**
   * Get default model for a provider
   */
  private static getDefaultModel(providerName: string): string {
    const provider = AIProviderFactory.getProvider(providerName);
    return provider?.defaultModel || 'gpt-4o-mini';
  }
}
