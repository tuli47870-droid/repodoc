import { AIProviderFactory } from '../ai/AIProviderFactory';
import { ModelRouter } from '../ai/ModelRouter';
import type { Finding, Diagnosis, AIUsage } from '@prisma/client';
import { createLogger } from '../utils/logger';
import type { AITask } from '../ai/types';

const logger = createLogger();

export interface DiagnosisRequest {
  finding: Finding;
  repositoryContext: {
    name: string;
    language?: string;
    framework?: string;
  };
  codeContext?: string;
}

export interface DiagnosisResult {
  diagnosis: Diagnosis;
  tokensUsed: number;
  cost: number;
}

/**
 * Service for analyzing findings with AI to generate diagnoses and recommendations
 */
export class AIAnalysisService {
  constructor(
    private readonly diagnosisRepo: { create(data: any): Promise<Diagnosis>; findByFindingId(id: string): Promise<Diagnosis[]>; findByScanId(id: string): Promise<Diagnosis[]> },
    private readonly aiUsageRepo: { create(data: any): Promise<AIUsage>; findByScanId(id: string): Promise<AIUsage[]> }
  ) {}

  /**
   * Diagnose a finding using AI
   */
  async diagnoseFinding(request: DiagnosisRequest): Promise<DiagnosisResult> {
    const { finding, repositoryContext, codeContext } = request;

    // Determine task type and select model
    const taskType = this.determineTaskType(finding);
    const modelSelection = ModelRouter.route({
      task: taskType,
      complexity: finding.severity === 'CRITICAL' ? 'complex' : 'medium',
    });

    logger.info({
      findingId: finding.id,
      scanner: finding.scanner,
      severity: finding.severity,
      model: modelSelection.model,
      provider: modelSelection.provider,
    }, 'Diagnosing finding with AI');

    try {
      // Get AI provider
      const provider = AIProviderFactory.getProvider(modelSelection.provider);
      if (!provider) {
        throw new Error(`Provider ${modelSelection.provider} not available`);
      }

      // Build diagnosis prompt
      const prompt = this.buildDiagnosisPrompt(finding, repositoryContext, codeContext);

      // Call AI provider
      const response = await provider.chat([
        {
          role: 'system',
          content: 'You are a senior software engineer analyzing code issues. Provide clear, actionable diagnoses with concrete recommendations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ], {
        model: modelSelection.model,
        temperature: 0.3, // Lower temperature for consistent, factual responses
        maxTokens: 1000,
      });

      // Parse AI response
      const analysisResult = this.parseAIResponse(response.content);

      // Create diagnosis record
      const diagnosis = await this.diagnosisRepo.create({
        findingId: finding.id,
        rootCause: analysisResult.explanation, // Using explanation as root cause for now
        explanation: analysisResult.explanation,
        impact: analysisResult.explanation, // AI response combines these
        recommendation: analysisResult.recommendation,
        confidence: analysisResult.confidence,
        aiProvider: modelSelection.provider,
        aiModel: modelSelection.model,
        tokensUsed: response.tokensUsed.total,
        costUsd: response.costUsd,
      });

      // Record AI usage
      await this.aiUsageRepo.create({
        scanId: finding.scanId,
        provider: modelSelection.provider,
        model: modelSelection.model,
        task: taskType,
        inputTokens: response.tokensUsed.input,
        outputTokens: response.tokensUsed.output,
        totalTokens: response.tokensUsed.total,
        costUsd: response.costUsd,
        durationMs: 0, // TODO: Track actual duration
        success: true,
      });

      logger.info({
        findingId: finding.id,
        diagnosisId: diagnosis.id,
        tokensUsed: response.tokensUsed.total,
        cost: response.costUsd,
      }, 'Successfully diagnosed finding');

      return {
        diagnosis,
        tokensUsed: response.tokensUsed.total,
        cost: response.costUsd,
      };
    } catch (error) {
      logger.error({
        findingId: finding.id,
        error: error instanceof Error ? error.message : String(error),
      }, 'Failed to diagnose finding');
      throw error;
    }
  }

  /**
   * Diagnose multiple findings in batch
   */
  async diagnoseBatch(requests: DiagnosisRequest[]): Promise<DiagnosisResult[]> {
    const results: DiagnosisResult[] = [];

    // Process in batches to avoid overwhelming the AI provider
    const batchSize = 5;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(req => this.diagnoseFinding(req))
      );

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          logger.error({
            error: result.reason,
          }, 'Failed to diagnose finding in batch');
        }
      }
    }

    return results;
  }

  /**
   * Determine task type based on finding characteristics
   */
  private determineTaskType(finding: Finding): AITask {
    // Parse scanner name to determine type
    const scanner = finding.scanner.toLowerCase();
    
    // Security findings get highest priority
    if (scanner.includes('security') || scanner.includes('secret') || finding.severity === 'CRITICAL') {
      return 'security-analysis';
    }

    // Code quality findings
    if (scanner.includes('quality') || scanner.includes('code')) {
      return 'code-review';
    }

    // Dependency findings
    if (scanner.includes('dependency') || scanner.includes('dep')) {
      return 'diagnosis';
    }

    // Default to diagnosis
    return 'diagnosis';
  }

  /**
   * Build prompt for AI diagnosis
   */
  private buildDiagnosisPrompt(
    finding: Finding,
    repositoryContext: { name: string; language?: string; framework?: string },
    codeContext?: string
  ): string {
    const parts: string[] = [];

    // Repository context
    parts.push(`Repository: ${repositoryContext.name}`);
    if (repositoryContext.language) {
      parts.push(`Language: ${repositoryContext.language}`);
    }
    if (repositoryContext.framework) {
      parts.push(`Framework: ${repositoryContext.framework}`);
    }
    parts.push('');

    // Finding details
    parts.push(`Scanner: ${finding.scanner}`);
    parts.push(`Severity: ${finding.severity}`);
    parts.push(`Category: ${finding.category}`);
    parts.push(`Title: ${finding.title}`);
    parts.push(`Description: ${finding.description}`);
    parts.push('');

    // Location if available
    if (finding.location) {
      try {
        const location = typeof finding.location === 'string' 
          ? JSON.parse(finding.location) 
          : finding.location;
        if (location && typeof location === 'object') {
          if ('file' in location) parts.push(`File: ${location.file}`);
          if ('line' in location) parts.push(`Line: ${location.line}`);
          if ('column' in location) parts.push(`Column: ${location.column}`);
        }
      } catch {
        // Ignore parse errors
      }
      parts.push('');
    }

    // Code context if available
    if (codeContext) {
      parts.push('Code Context:');
      parts.push('```');
      parts.push(codeContext);
      parts.push('```');
      parts.push('');
    }

    // Request
    parts.push('Please provide:');
    parts.push('1. A clear explanation of why this is an issue');
    parts.push('2. The potential impact if not addressed');
    parts.push('3. Specific, actionable recommendations to fix it');
    parts.push('4. Your confidence level (0.0-1.0)');
    parts.push('5. Relevant tags for categorization');
    parts.push('6. Estimated effort (hours)');
    parts.push('');
    parts.push('Format your response as JSON:');
    parts.push('{');
    parts.push('  "explanation": "detailed explanation",');
    parts.push('  "impact": "potential impact",');
    parts.push('  "recommendation": "specific fix steps",');
    parts.push('  "confidence": 0.9,');
    parts.push('  "tags": ["tag1", "tag2"],');
    parts.push('  "estimatedEffort": 2.5');
    parts.push('}');

    return parts.join('\n');
  }

  /**
   * Parse AI response into structured diagnosis
   */
  private parseAIResponse(content: string): {
    explanation: string;
    recommendation: string;
    confidence: number;
    tags: string[];
    estimatedEffort: number | null;
  } {
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        explanation: parsed.explanation || '',
        recommendation: parsed.recommendation || '',
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        estimatedEffort: typeof parsed.estimatedEffort === 'number' ? parsed.estimatedEffort : null,
      };
    } catch (error) {
      logger.warn({
        error: error instanceof Error ? error.message : String(error),
      }, 'Failed to parse AI response as JSON, using fallback');

      // Fallback: use the raw content
      return {
        explanation: content,
        recommendation: 'Review the explanation above and determine appropriate action.',
        confidence: 0.5,
        tags: [],
        estimatedEffort: null,
      };
    }
  }

  /**
   * Get diagnosis for a finding
   */
  async getDiagnosis(findingId: string): Promise<Diagnosis | null> {
    const diagnoses = await this.diagnosisRepo.findByFindingId(findingId);
    // Return the most confident diagnosis
    return diagnoses.length > 0 ? diagnoses[0] : null;
  }

  /**
   * Get all diagnoses for a scan
   */
  async getScanDiagnoses(scanId: string): Promise<Diagnosis[]> {
    return this.diagnosisRepo.findByScanId(scanId);
  }

  /**
   * Get AI usage statistics for a scan
   */
  async getScanAIUsage(scanId: string) {
    const usage = await this.aiUsageRepo.findByScanId(scanId);

    const totalTokens = usage.reduce((sum: number, u: AIUsage) => sum + u.totalTokens, 0);
    const totalCost = usage.reduce((sum: number, u: AIUsage) => sum + u.costUsd, 0);

    const byProvider = usage.reduce((acc: Record<string, { tokens: number; cost: number; count: number }>, u: AIUsage) => {
      if (!acc[u.provider]) {
        acc[u.provider] = { tokens: 0, cost: 0, count: 0 };
      }
      acc[u.provider].tokens += u.totalTokens;
      acc[u.provider].cost += u.costUsd;
      acc[u.provider].count += 1;
      return acc;
    }, {} as Record<string, { tokens: number; cost: number; count: number }>);

    return {
      totalTokens,
      totalCost,
      byProvider,
      details: usage,
    };
  }
}
