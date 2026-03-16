// src/__tests__/prompts.test.ts
import { describe, it, expect } from "vitest";
import { challengeGeneratePrompt } from "@/lib/prompts/challenge-generate";
import { challengeHintsPrompt } from "@/lib/prompts/challenge-hints";
import { challengeExplainPrompt } from "@/lib/prompts/challenge-explain";
import { dialogueSystemPrompt } from "@/lib/prompts/dialogue-system";
import { reviewEvaluatePrompt } from "@/lib/prompts/review-evaluate";
import { reviewGeneratePrompt } from "@/lib/prompts/review-generate";

describe("Prompt Templates", () => {
  describe("challengeGeneratePrompt", () => {
    it("returns a non-empty string", () => {
      const result = challengeGeneratePrompt({
        topic: "Derivatives",
        subject: "math",
        difficulty: 4,
        masteredTopics: ["Limits", "Functions"],
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it("contains injected topic and subject", () => {
      const result = challengeGeneratePrompt({
        topic: "Newton's Laws",
        subject: "physics",
        difficulty: 3,
        masteredTopics: ["Kinematics"],
      });
      expect(result).toContain("Newton's Laws");
      expect(result).toContain("physics");
      expect(result).toContain("3/5");
      expect(result).toContain("Kinematics");
    });

    it("contains math-specific guidance for math subjects", () => {
      const result = challengeGeneratePrompt({
        topic: "Integrals",
        subject: "math",
        difficulty: 4,
        masteredTopics: [],
      });
      expect(result).toContain("rigor");
    });

    it("contains physics-specific guidance for physics subjects", () => {
      const result = challengeGeneratePrompt({
        topic: "Gravity",
        subject: "physics",
        difficulty: 4,
        masteredTopics: [],
      });
      expect(result).toContain("intuition");
    });

    it("contains cs-specific guidance for CS subjects", () => {
      const result = challengeGeneratePrompt({
        topic: "Recursion",
        subject: "cs",
        difficulty: 3,
        masteredTopics: [],
      });
      expect(result).toContain("algorithmic");
    });

    it("handles empty mastered topics", () => {
      const result = challengeGeneratePrompt({
        topic: "Arithmetic",
        subject: "math",
        difficulty: 1,
        masteredTopics: [],
      });
      expect(result).toContain("just starting out");
    });
  });

  describe("challengeHintsPrompt", () => {
    it("returns a non-empty string", () => {
      const result = challengeHintsPrompt({
        challenge: "Why does a ball fall?",
        hintLevel: 1,
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it("contains the challenge text", () => {
      const result = challengeHintsPrompt({
        challenge: "Derive the quadratic formula",
        hintLevel: 2,
        userAttempt: "I tried completing the square",
      });
      expect(result).toContain("Derive the quadratic formula");
      expect(result).toContain("I tried completing the square");
    });

    it("varies guidance by hint level", () => {
      const hint1 = challengeHintsPrompt({ challenge: "test", hintLevel: 1 });
      const hint2 = challengeHintsPrompt({ challenge: "test", hintLevel: 2 });
      const hint3 = challengeHintsPrompt({ challenge: "test", hintLevel: 3 });
      expect(hint1).toContain("gentle nudge");
      expect(hint2).toContain("specific guiding question");
      expect(hint3).toContain("concrete nudge");
    });

    it("handles missing user attempt", () => {
      const result = challengeHintsPrompt({ challenge: "test", hintLevel: 1 });
      expect(result).toContain("has not yet attempted");
    });
  });

  describe("challengeExplainPrompt", () => {
    it("returns a non-empty string", () => {
      const result = challengeExplainPrompt({
        challenge: "What is a derivative?",
        topic: "Derivatives",
        userAttempt: "It measures how fast something changes",
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it("contains all injected values", () => {
      const result = challengeExplainPrompt({
        challenge: "Explain entropy",
        topic: "Thermodynamics",
        userAttempt: "Entropy is disorder",
      });
      expect(result).toContain("Explain entropy");
      expect(result).toContain("Thermodynamics");
      expect(result).toContain("Entropy is disorder");
    });
  });

  describe("dialogueSystemPrompt", () => {
    it("returns a non-empty string", () => {
      const result = dialogueSystemPrompt({
        topic: "Vectors",
        subject: "math",
        masteredTopics: ["Trigonometry"],
        sessionHistory: [],
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it("contains all injected values", () => {
      const result = dialogueSystemPrompt({
        topic: "Recursion",
        subject: "cs",
        masteredTopics: ["Control Flow", "Arrays"],
        sessionHistory: [
          { role: "user", content: "What is recursion?" },
          { role: "tutor", content: "What do you think happens when a function calls itself?" },
        ],
      });
      expect(result).toContain("Recursion");
      expect(result).toContain("cs");
      expect(result).toContain("Control Flow");
      expect(result).toContain("Arrays");
      expect(result).toContain("What is recursion?");
    });

    it("handles empty session history", () => {
      const result = dialogueSystemPrompt({
        topic: "Limits",
        subject: "math",
        masteredTopics: [],
        sessionHistory: [],
      });
      expect(result).toContain("start of a new conversation");
    });
  });

  describe("reviewEvaluatePrompt", () => {
    it("returns a non-empty string", () => {
      const result = reviewEvaluatePrompt({
        reviewType: "teach-it",
        challenge: "Explain derivatives to a 12-year-old",
        userResponse: "A derivative is like speed — how fast something changes",
        topic: "Derivatives",
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it("contains all injected values", () => {
      const result = reviewEvaluatePrompt({
        reviewType: "what-if",
        challenge: "What if gravity were cubic?",
        userResponse: "Orbits would be unstable",
        topic: "Gravity",
      });
      expect(result).toContain("what-if");
      expect(result).toContain("What if gravity were cubic?");
      expect(result).toContain("Orbits would be unstable");
      expect(result).toContain("Gravity");
    });

    it("includes teach-it specific criteria", () => {
      const result = reviewEvaluatePrompt({
        reviewType: "teach-it",
        challenge: "Explain it",
        userResponse: "My explanation",
        topic: "Limits",
      });
      expect(result).toContain("core concept");
      expect(result).toContain("follow_up_question");
    });

    it("includes what-if specific criteria", () => {
      const result = reviewEvaluatePrompt({
        reviewType: "what-if",
        challenge: "What if?",
        userResponse: "My reasoning",
        topic: "Entropy",
      });
      expect(result).toContain("depth_score");
      expect(result).toContain("counterfactual");
    });

    it("includes connect specific criteria", () => {
      const result = reviewEvaluatePrompt({
        reviewType: "connect",
        challenge: "Connect these",
        userResponse: "They relate because",
        topic: "Waves",
      });
      expect(result).toContain("connection_quality");
    });
  });

  describe("reviewGeneratePrompt", () => {
    it("returns a non-empty string", () => {
      const result = reviewGeneratePrompt({
        reviewType: "teach-it",
        topic: "Derivatives",
        relatedTopics: ["Limits"],
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it("contains all injected values", () => {
      const result = reviewGeneratePrompt({
        reviewType: "connect",
        topic: "Energy & Work",
        relatedTopics: ["Momentum", "Kinematics"],
      });
      expect(result).toContain("Energy & Work");
      expect(result).toContain("connect");
      expect(result).toContain("Momentum");
      expect(result).toContain("Kinematics");
    });

    it("handles empty related topics", () => {
      const result = reviewGeneratePrompt({
        reviewType: "what-if",
        topic: "Arithmetic",
        relatedTopics: [],
      });
      expect(result).toContain("No closely related topics");
    });
  });
});
