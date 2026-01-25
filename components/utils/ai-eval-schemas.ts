import { z } from "zod";

// ============================================================================
// Provider & Model Types
// ============================================================================

export type ProviderId = "openai" | "anthropic" | "google";

export interface ModelConfig {
  id: string;
  name: string;
  providerId: ProviderId;
  maxTokens: number;
  supportsJsonMode: boolean;
}

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  models: ModelConfig[];
  apiEndpoint: string;
}

// ============================================================================
// API Key Management
// ============================================================================

export interface StoredApiKeys {
  openai?: string;
  anthropic?: string;
  google?: string;
}

export const StoredApiKeysSchema = z.object({
  openai: z.string().optional(),
  anthropic: z.string().optional(),
  google: z.string().optional(),
});

// ============================================================================
// Chat Message Types
// ============================================================================

export type MessageRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface ChatParams {
  model: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

// ============================================================================
// Evaluation Types
// ============================================================================

export type ComparisonMode = "model-vs-model" | "prompt-vs-prompt";

export interface PromptConfig {
  id: string;
  systemPrompt: string;
  userPrompt: string;
  variables: Record<string, string>;
}

export interface EvaluationInput {
  mode: ComparisonMode;
  prompts: PromptConfig[];
  models: ModelConfig[];
  judgeModel: ModelConfig;
  criteriaWeights: CriteriaWeights;
}

export interface EvaluationResult {
  id: string;
  promptId: string;
  modelId: string;
  input: {
    systemPrompt: string;
    userPrompt: string;
    resolvedPrompt: string;
  };
  output: string;
  evaluation?: JudgeEvaluation;
  error?: string;
  latencyMs: number;
  timestamp: number;
}

// ============================================================================
// LLM-as-Judge Types & Schemas
// ============================================================================

export interface ScoreBreakdown {
  accuracy: number;
  relevance: number;
  clarity: number;
  completeness: number;
  conciseness: number;
}

export interface JudgeEvaluation {
  scores: ScoreBreakdown;
  overallScore: number;
  reasoning: string;
  winner?: "A" | "B" | "tie";
}

export interface CriteriaWeights {
  accuracy: number;
  relevance: number;
  clarity: number;
  completeness: number;
  conciseness: number;
}

// Zod schema for validating judge responses
export const ScoreBreakdownSchema = z.object({
  accuracy: z.number().min(1).max(10),
  relevance: z.number().min(1).max(10),
  clarity: z.number().min(1).max(10),
  completeness: z.number().min(1).max(10),
  conciseness: z.number().min(1).max(10),
});

export const JudgeEvaluationSchema = z.object({
  scores: ScoreBreakdownSchema,
  overallScore: z.number().min(1).max(10),
  reasoning: z.string().max(1000),
  winner: z.enum(["A", "B", "tie"]).optional(),
});

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_CRITERIA_WEIGHTS: CriteriaWeights = {
  accuracy: 0.25,
  relevance: 0.25,
  clarity: 0.2,
  completeness: 0.15,
  conciseness: 0.15,
};

export const DEFAULT_SYSTEM_PROMPT = "You are a helpful assistant.";

export const DEFAULT_USER_PROMPT = "{{question}}";

// ============================================================================
// Provider Configurations
// ============================================================================

export const PROVIDERS: ProviderConfig[] = [
  {
    id: "openai",
    name: "OpenAI",
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        providerId: "openai",
        maxTokens: 4096,
        supportsJsonMode: true,
      },
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        providerId: "openai",
        maxTokens: 4096,
        supportsJsonMode: true,
      },
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        providerId: "openai",
        maxTokens: 4096,
        supportsJsonMode: true,
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        providerId: "openai",
        maxTokens: 4096,
        supportsJsonMode: true,
      },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    apiEndpoint: "https://api.anthropic.com/v1/messages",
    models: [
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        providerId: "anthropic",
        maxTokens: 4096,
        supportsJsonMode: false,
      },
      {
        id: "claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku",
        providerId: "anthropic",
        maxTokens: 4096,
        supportsJsonMode: false,
      },
      {
        id: "claude-3-opus-20240229",
        name: "Claude 3 Opus",
        providerId: "anthropic",
        maxTokens: 4096,
        supportsJsonMode: false,
      },
    ],
  },
  {
    id: "google",
    name: "Google AI",
    apiEndpoint: "https://generativelanguage.googleapis.com/v1beta/models",
    models: [
      {
        id: "gemini-2.0-flash-exp",
        name: "Gemini 2.0 Flash",
        providerId: "google",
        maxTokens: 8192,
        supportsJsonMode: true,
      },
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        providerId: "google",
        maxTokens: 8192,
        supportsJsonMode: true,
      },
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash",
        providerId: "google",
        maxTokens: 8192,
        supportsJsonMode: true,
      },
    ],
  },
];

// Helper to get all models flat
export const ALL_MODELS: ModelConfig[] = PROVIDERS.flatMap((p) => p.models);

// Helper to find model by id
export function getModelById(modelId: string): ModelConfig | undefined {
  return ALL_MODELS.find((m) => m.id === modelId);
}

// Helper to find provider by id
export function getProviderById(providerId: ProviderId): ProviderConfig | undefined {
  return PROVIDERS.find((p) => p.id === providerId);
}

// Helper to get provider for a model
export function getProviderForModel(modelId: string): ProviderConfig | undefined {
  const model = getModelById(modelId);
  if (!model) return undefined;
  return getProviderById(model.providerId);
}

// ============================================================================
// Variable Extraction
// ============================================================================

/**
 * Extract variable names from a prompt template
 * Variables are in the format {{variableName}}
 */
export function extractVariables(template: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables: string[] = [];
  let match;
  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  return variables;
}

/**
 * Resolve variables in a template
 */
export function resolveTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
    return variables[varName] ?? `{{${varName}}}`;
  });
}

// ============================================================================
// Score Utilities
// ============================================================================

/**
 * Calculate weighted overall score from individual scores
 */
export function calculateWeightedScore(
  scores: ScoreBreakdown,
  weights: CriteriaWeights
): number {
  const total =
    scores.accuracy * weights.accuracy +
    scores.relevance * weights.relevance +
    scores.clarity * weights.clarity +
    scores.completeness * weights.completeness +
    scores.conciseness * weights.conciseness;

  // Round to 1 decimal place
  return Math.round(total * 10) / 10;
}

/**
 * Get score color class based on score value
 */
export function getScoreColorClass(score: number): string {
  if (score >= 8) return "text-green-600 dark:text-green-400";
  if (score >= 5) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

/**
 * Get score background color class based on score value
 */
export function getScoreBgClass(score: number): string {
  if (score >= 8) return "bg-green-100 dark:bg-green-900/30";
  if (score >= 5) return "bg-yellow-100 dark:bg-yellow-900/30";
  return "bg-red-100 dark:bg-red-900/30";
}
