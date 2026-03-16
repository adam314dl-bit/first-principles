// src/lib/ai/providers/openai.ts
import OpenAI from "openai";
import type { AIProvider, ChatOptions, AIResponse } from "../types";

export class OpenAIProvider implements AIProvider {
  name = "openai";
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async chat(options: ChatOptions): Promise<AIResponse> {
    return this.createWithModel("gpt-4o")(options);
  }

  createWithModel(modelId: string): (options: ChatOptions) => Promise<AIResponse> {
    return async (options: ChatOptions) => {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

      if (options.systemPrompt) {
        messages.push({ role: "system", content: options.systemPrompt });
      }

      for (const msg of options.messages) {
        if (msg.role === "system") continue;
        messages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }

      const response = await this.client.chat.completions.create({
        model: modelId,
        max_tokens: options.maxTokens ?? 4096,
        temperature: options.temperature ?? 0.7,
        messages,
      });

      const choice = response.choices[0];

      return {
        content: choice?.message?.content ?? "",
        model: response.model,
        usage: response.usage
          ? {
              inputTokens: response.usage.prompt_tokens,
              outputTokens: response.usage.completion_tokens ?? 0,
            }
          : undefined,
      };
    };
  }
}
