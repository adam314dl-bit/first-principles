// src/lib/prompts/review-evaluate.ts
export interface ReviewEvaluateParams {
  reviewType: "teach-it" | "what-if" | "connect";
  challenge: string;
  userResponse: string;
  topic: string;
}

export function reviewEvaluatePrompt(params: ReviewEvaluateParams): string {
  const { reviewType, challenge, userResponse, topic } = params;

  const evaluationCriteria = reviewType === "teach-it"
    ? `Evaluate whether the learner accurately conveyed the core concept of "${topic}". A passing explanation:
- Identifies the key idea correctly (not necessarily using formal language)
- Does not contain fundamental misconceptions
- Would help someone unfamiliar with the topic build correct intuition
Return: { "passed": boolean, "feedback": "...", "follow_up_question": "..." (optional) }`
    : reviewType === "what-if"
    ? `Evaluate the depth of the learner's counterfactual reasoning about "${topic}". Assess:
- Did they identify which principles would be affected?
- Did they trace consequences beyond the immediate/obvious?
- Did they reason from first principles rather than guessing?
Depth score: 1 = surface-level, 2 = traced one chain of consequences, 3 = explored multiple implications and edge cases.
Return: { "passed": boolean, "feedback": "...", "depth_score": 1|2|3 }`
    : `Evaluate the quality of the connection the learner made involving "${topic}". Assess:
- Is the connection genuine (not superficial or forced)?
- Did they explain the mechanism of the connection (not just "they're related")?
- Did they demonstrate understanding of both connected concepts?
Return: { "passed": boolean, "feedback": "...", "connection_quality": "weak|moderate|strong" }`;

  return `You are evaluating a learner's response to a creative review challenge. Be encouraging but honest. The goal is growth, not gatekeeping.

Review type: ${reviewType}
Topic: ${topic}
Challenge: ${challenge}
Learner's response: "${userResponse}"

${evaluationCriteria}

Respond with ONLY the JSON object. No markdown, no wrapping.`;
}
