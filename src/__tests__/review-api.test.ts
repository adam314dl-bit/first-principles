// src/__tests__/review-api.test.ts
import { describe, it, expect } from "vitest";
import { reviewGeneratePrompt } from "@/lib/prompts/review-generate";
import { reviewEvaluatePrompt } from "@/lib/prompts/review-evaluate";

describe("Review API prompt integration", () => {
  describe("reviewGeneratePrompt", () => {
    it("generates a teach-it prompt with topic name", () => {
      const result = reviewGeneratePrompt({ reviewType: "teach-it", topic: "Derivatives", relatedTopics: ["Limits", "Integrals"] });
      expect(result).toContain("Derivatives");
      expect(result).toContain("Teach It");
    });

    it("generates a what-if prompt", () => {
      const result = reviewGeneratePrompt({ reviewType: "what-if", topic: "Gravity", relatedTopics: ["Newton's Laws"] });
      expect(result).toContain("Gravity");
      expect(result).toContain("What If");
    });

    it("generates a connect prompt including related topics", () => {
      const result = reviewGeneratePrompt({ reviewType: "connect", topic: "Recursion", relatedTopics: ["Trees & Graphs", "Sorting Algorithms"] });
      expect(result).toContain("Recursion");
      expect(result).toContain("Trees & Graphs");
    });
  });

  describe("reviewEvaluatePrompt", () => {
    it("generates teach-it evaluation with follow_up_question field", () => {
      const result = reviewEvaluatePrompt({ reviewType: "teach-it", challenge: "Explain derivatives to a 12-year-old", userResponse: "A derivative measures the rate of change", topic: "Derivatives" });
      expect(result).toContain("Derivatives");
      expect(result).toContain("follow_up_question");
    });

    it("generates what-if evaluation with depth_score field", () => {
      const result = reviewEvaluatePrompt({ reviewType: "what-if", challenge: "What if gravity followed a cube law?", userResponse: "Orbits would collapse quickly", topic: "Gravity" });
      expect(result).toContain("depth_score");
    });

    it("generates connect evaluation with connection_quality field", () => {
      const result = reviewEvaluatePrompt({ reviewType: "connect", challenge: "How do recursion and trees relate?", userResponse: "Tree traversal is naturally recursive", topic: "Recursion" });
      expect(result).toContain("connection_quality");
    });
  });
});
