/**
 * AI Provider Types and Interfaces
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface ChatResponse {
  content: string;
  model: string;
  provider: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  costUsd: number;
  finishReason: 'stop' | 'length' | 'error';
}

export interface TokenCount {
  tokens: number;
  method: 'exact' | 'estimated';
}

export interface CostEstimate {
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
}

/**
 * Base AI Provider Interface
 */
export interface AIProvider {
  readonly name: string;
  readonly defaultModel: string;
  readonly supportedModels: string[];
  
  /**
   * Send a chat completion request
   */
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse>;
  
  /**
   * Count tokens in text (for budget estimation)
   */
  countTokens(text: string, model?: string): Promise<TokenCount>;
  
  /**
   * Estimate cost for a request
   */
  estimateCost(inputTokens: number, outputTokens: number, model?: string): CostEstimate;
  
  /**
   * Check if provider is available (API key configured)
   */
  isAvailable(): boolean;
}

/**
 * Model capabilities for routing decisions
 */
export interface ModelCapabilities {
  contextWindow: number;
  maxOutputTokens: number;
  supportsStreaming: boolean;
  costPerInputToken: number; // USD per token
  costPerOutputToken: number; // USD per token
  quality: 'basic' | 'good' | 'excellent' | 'premium';
  speed: 'slow' | 'medium' | 'fast' | 'very-fast';
}

/**
 * Task types for model routing
 */
export type AITask = 
  | 'diagnosis' // Diagnose a finding
  | 'root-cause' // Find root cause of multiple findings
  | 'code-review' // Review code quality
  | 'security-analysis' // Analyze security issues
  | 'explanation' // Explain something
  | 'suggestion' // Suggest improvements
  | 'classification'; // Classify/categorize

/**
 * Model routing request
 */
export interface ModelRoutingRequest {
  task: AITask;
  complexity: 'simple' | 'medium' | 'complex';
  tokenBudget?: number;
  costBudget?: number;
  preferredProvider?: string;
  preferredModel?: string;
}

/**
 * Model routing result
 */
export interface ModelRoutingResult {
  provider: string;
  model: string;
  reasoning: string;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export class TokenBudgetExceededError extends Error {
  constructor(
    public readonly requested: number,
    public readonly budget: number
  ) {
    super(`Token budget exceeded: requested ${requested}, budget ${budget}`);
    this.name = 'TokenBudgetExceededError';
  }
}

export class CostBudgetExceededError extends Error {
  constructor(
    public readonly requestedCost: number,
    public readonly budget: number
  ) {
    super(`Cost budget exceeded: requested $${requestedCost.toFixed(4)}, budget $${budget.toFixed(4)}`);
    this.name = 'CostBudgetExceededError';
  }
}
