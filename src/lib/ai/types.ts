// src/lib/ai/types.ts
export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface ChatOptions {
  messages: AIMessage[];
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIProvider {
  name: string;
  chat(options: ChatOptions): Promise<AIResponse>;
  createWithModel(modelId: string): (options: ChatOptions) => Promise<AIResponse>;
}

export interface ModelConfig {
  id: string;
  label: string;
  provider: "anthropic" | "openai";
  modelId: string;
  maxTokens: number;
}

export const MODEL_CONFIGS: ModelConfig[] = [
  {
    id: "claude-sonnet",
    label: "Claude Sonnet",
    provider: "anthropic",
    modelId: "claude-sonnet-4-20250514",
    maxTokens: 8192,
  },
  {
    id: "claude-opus",
    label: "Claude Opus",
    provider: "anthropic",
    modelId: "claude-opus-4-20250514",
    maxTokens: 4096,
  },
  {
    id: "gpt-4o",
    label: "GPT-4o",
    provider: "openai",
    modelId: "gpt-4o",
    maxTokens: 4096,
  },
];

export function getModelConfig(modelId: string): ModelConfig | undefined {
  return MODEL_CONFIGS.find((m) => m.id === modelId);
}
