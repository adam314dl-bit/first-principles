// src/lib/ai/providers/anthropic.ts
import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, ChatOptions, AIResponse } from "../types";

export class AnthropicProvider implements AIProvider {
  name = "anthropic";
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async chat(options: ChatOptions): Promise<AIResponse> {
    return this.createWithModel("claude-sonnet-4-6-20250514")(options);
  }

  createWithModel(modelId: string): (options: ChatOptions) => Promise<AIResponse> {
    return async (options: ChatOptions) => {
      const userMessages = options.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      const response = await this.client.messages.create({
        model: modelId,
        max_tokens: options.maxTokens ?? 4096,
        temperature: options.temperature ?? 0.7,
        system: options.systemPrompt ?? "",
        messages: userMessages,
      });

      const textBlock = response.content.find((block) => block.type === "text");

      return {
        content: textBlock ? textBlock.text : "",
        model: response.model,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    };
  }
}
