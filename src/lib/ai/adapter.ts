// src/lib/ai/adapter.ts
import { AnthropicProvider } from "./providers/anthropic";
import { OpenAIProvider } from "./providers/openai";
import type { AIProvider, AIResponse, ChatOptions, ModelConfig } from "./types";
import { getModelConfig } from "./types";

export class AIAdapterError extends Error {
  constructor(
    message: string,
    public code: "INVALID_KEY" | "RATE_LIMIT" | "PROVIDER_ERROR" | "UNKNOWN_MODEL",
    public retryable: boolean
  ) {
    super(message);
    this.name = "AIAdapterError";
  }
}

const providerCache = new Map<string, AIProvider>();

function getProvider(config: ModelConfig): AIProvider {
  const cacheKey = config.provider;
  const cached = providerCache.get(cacheKey);
  if (cached) return cached;

  let provider: AIProvider;

  if (config.provider === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new AIAdapterError(
        "ANTHROPIC_API_KEY is not set. Add it to your .env.local file.",
        "INVALID_KEY",
        false
      );
    }
    provider = new AnthropicProvider(apiKey);
  } else if (config.provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new AIAdapterError(
        "OPENAI_API_KEY is not set. Add it to your .env.local file.",
        "INVALID_KEY",
        false
      );
    }
    provider = new OpenAIProvider(apiKey);
  } else {
    throw new AIAdapterError(
      `Unknown provider: ${config.provider}`,
      "UNKNOWN_MODEL",
      false
    );
  }

  providerCache.set(cacheKey, provider);
  return provider;
}

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes("rate limit") || msg.includes("429") || msg.includes("too many requests");
  }
  return false;
}

function isInvalidKeyError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes("invalid api key") || msg.includes("401") || msg.includes("authentication");
  }
  return false;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function chat(
  modelId: string,
  options: ChatOptions
): Promise<AIResponse> {
  const config = getModelConfig(modelId);
  if (!config) {
    throw new AIAdapterError(
      `Unknown model: ${modelId}. Available: claude-sonnet, claude-opus, gpt-4o`,
      "UNKNOWN_MODEL",
      false
    );
  }

  const provider = getProvider(config);
  const chatOptions: ChatOptions = {
    ...options,
    maxTokens: options.maxTokens ?? config.maxTokens,
  };

  const callAI = () => provider.createWithModel(config.modelId)(chatOptions);

  try {
    return await callAI();
  } catch (error) {
    if (isInvalidKeyError(error)) {
      providerCache.delete(config.provider);
      throw new AIAdapterError(
        `Invalid API key for ${config.provider}. Check your .env.local file.`,
        "INVALID_KEY",
        false
      );
    }

    // Retry once after 3 seconds for rate limits or generic errors
    await delay(3000);
    try {
      return await callAI();
    } catch (retryError) {
      const code = isRateLimitError(error) ? "RATE_LIMIT" : "PROVIDER_ERROR";
      const msg = isRateLimitError(error)
        ? `Rate limited by ${config.provider}. Please wait a moment and try again.`
        : `AI provider error: ${retryError instanceof Error ? retryError.message : "Unknown error"}`;
      throw new AIAdapterError(msg, code, true);
    }
  }
}

/** Clear the provider cache (useful for testing or after key changes). */
export function clearProviderCache(): void {
  providerCache.clear();
}
