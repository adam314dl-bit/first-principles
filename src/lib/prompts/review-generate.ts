// src/lib/prompts/review-generate.ts
export interface ReviewGenerateParams {
  reviewType: "teach-it" | "what-if" | "connect";
  topic: string;
  relatedTopics: string[];
}

export function reviewGeneratePrompt(params: ReviewGenerateParams): string {
  const { reviewType, topic, relatedTopics } = params;
  const relatedContext = relatedTopics.length > 0
    ? `Related topics the learner knows: ${relatedTopics.join(", ")}.`
    : "No closely related topics mastered yet.";

  const typeInstructions = reviewType === "teach-it"
    ? `Generate a "Teach It" challenge. Examples of good prompts:
- "Explain ${topic} to a curious 12-year-old who asks great questions."
- "Your friend says '[common misconception about ${topic}].' Are they right? What's missing?"
- "Create an analogy for ${topic} using something from everyday life."
Pick ONE creative angle. Make it fun and specific — not generic.`
    : reviewType === "what-if"
    ? `Generate a "What If?" counterfactual challenge. Examples:
- "What would happen if [fundamental assumption of ${topic}] were different?"
- "If [key concept] didn't exist, how would [related field] change?"
- "Remove one key property from [${topic}]. What breaks, and what still works?"
Pick ONE thought-provoking counterfactual. It should force reasoning from first principles.`
    : `Generate a "Connect" challenge that bridges ${topic} with the learner's other knowledge. Examples:
- "You know ${topic} and ${relatedTopics[0] ?? "another concept"}. What's the actual relationship?"
- "Find a real-world system that demonstrates ${topic} — something not in any textbook."
- "Here's a problem that requires combining ${topic} with ${relatedTopics[0] ?? "another concept"}..."
Pick ONE challenge that rewards cross-domain thinking.`;

  return `You are generating a creative review challenge for a STEM learning platform. The challenge should feel like a fun side quest, not homework.

Topic: ${topic}
Review type: ${reviewType}
${relatedContext}

${typeInstructions}

Respond with ONLY the challenge text. No preamble, no labels. Just the challenge.`;
}
