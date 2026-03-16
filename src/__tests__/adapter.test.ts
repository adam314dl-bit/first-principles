// src/__tests__/adapter.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { chat, clearProviderCache, AIAdapterError } from "@/lib/ai/adapter";
import type { ChatOptions } from "@/lib/ai/types";
import { getModelConfig, MODEL_CONFIGS } from "@/lib/ai/types";

// Mock both provider modules
vi.mock("@/lib/ai/providers/anthropic", () => {
  const mockChat = vi.fn();
  return {
    AnthropicProvider: vi.fn().mockImplementation(() => ({
      name: "anthropic",
      chat: mockChat,
      createWithModel: () => mockChat,
    })),
    __mockChat: mockChat,
  };
});

vi.mock("@/lib/ai/providers/openai", () => {
  const mockChat = vi.fn();
  return {
    OpenAIProvider: vi.fn().mockImplementation(() => ({
      name: "openai",
      chat: mockChat,
      createWithModel: () => mockChat,
    })),
    __mockChat: mockChat,
  };
});

describe("AI Adapter", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    clearProviderCache();
    vi.stubEnv("ANTHROPIC_API_KEY", "test-anthropic-key");
    vi.stubEnv("OPENAI_API_KEY", "test-openai-key");
  });

  const baseOptions: ChatOptions = {
    messages: [{ role: "user", content: "Hello" }],
    systemPrompt: "You are a tutor.",
  };

  describe("getModelConfig", () => {
    it("returns config for claude-sonnet", () => {
      const config = getModelConfig("claude-sonnet");
      expect(config).toBeDefined();
      expect(config!.provider).toBe("anthropic");
      expect(config!.label).toBe("Claude Sonnet");
    });

    it("returns config for gpt-4o", () => {
      const config = getModelConfig("gpt-4o");
      expect(config).toBeDefined();
      expect(config!.provider).toBe("openai");
    });

    it("returns undefined for unknown model", () => {
      expect(getModelConfig("unknown-model")).toBeUndefined();
    });
  });

  describe("MODEL_CONFIGS", () => {
    it("has 3 models", () => {
      expect(MODEL_CONFIGS).toHaveLength(3);
    });

    it("every config has required fields", () => {
      for (const config of MODEL_CONFIGS) {
        expect(config.id).toBeTruthy();
        expect(config.label).toBeTruthy();
        expect(config.provider).toBeTruthy();
        expect(config.modelId).toBeTruthy();
        expect(config.maxTokens).toBeGreaterThan(0);
      }
    });
  });

  describe("chat routing", () => {
    it("throws UNKNOWN_MODEL for invalid model id", async () => {
      await expect(chat("nonexistent", baseOptions)).rejects.toThrow(AIAdapterError);
      try {
        await chat("nonexistent", baseOptions);
      } catch (e) {
        expect((e as AIAdapterError).code).toBe("UNKNOWN_MODEL");
      }
    });

    it("throws INVALID_KEY when ANTHROPIC_API_KEY is missing", async () => {
      vi.stubEnv("ANTHROPIC_API_KEY", "");
      clearProviderCache();
      await expect(chat("claude-sonnet", baseOptions)).rejects.toThrow(AIAdapterError);
      try {
        await chat("claude-sonnet", baseOptions);
      } catch (e) {
        expect((e as AIAdapterError).code).toBe("INVALID_KEY");
        expect((e as AIAdapterError).retryable).toBe(false);
      }
    });

    it("throws INVALID_KEY when OPENAI_API_KEY is missing", async () => {
      vi.stubEnv("OPENAI_API_KEY", "");
      clearProviderCache();
      await expect(chat("gpt-4o", baseOptions)).rejects.toThrow(AIAdapterError);
      try {
        await chat("gpt-4o", baseOptions);
      } catch (e) {
        expect((e as AIAdapterError).code).toBe("INVALID_KEY");
        expect((e as AIAdapterError).retryable).toBe(false);
      }
    });
  });

  describe("AIAdapterError", () => {
    it("has correct name and properties", () => {
      const err = new AIAdapterError("test error", "RATE_LIMIT", true);
      expect(err.name).toBe("AIAdapterError");
      expect(err.message).toBe("test error");
      expect(err.code).toBe("RATE_LIMIT");
      expect(err.retryable).toBe(true);
    });

    it("marks INVALID_KEY as non-retryable", () => {
      const err = new AIAdapterError("bad key", "INVALID_KEY", false);
      expect(err.retryable).toBe(false);
    });

    it("marks PROVIDER_ERROR as retryable", () => {
      const err = new AIAdapterError("server error", "PROVIDER_ERROR", true);
      expect(err.retryable).toBe(true);
    });
  });
});
