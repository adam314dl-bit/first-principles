// src/lib/prompts/challenge-hints.ts
export interface ChallengeHintsParams {
  challenge: string;
  hintLevel: number;
  userAttempt?: string;
}

export function challengeHintsPrompt(params: ChallengeHintsParams): string {
  const { challenge, hintLevel, userAttempt } = params;
  const attemptContext = userAttempt
    ? `The learner has attempted: "${userAttempt}"`
    : "The learner has not yet attempted an answer.";

  const hintGuidance = hintLevel === 1
    ? "Give a gentle nudge — a question that redirects thinking. Do NOT reveal any part of the answer. Ask something like 'Think about...' or 'What happens when...'"
    : hintLevel === 2
    ? "Offer a more specific guiding question. Point toward a useful concept or approach without solving the problem. Say something like 'What if you considered...' or 'Try looking at this from the perspective of...'"
    : "Give a concrete nudge — name the specific concept or technique that applies, and suggest the first step. Still do NOT give the full answer, but make the path forward clear.";

  return `You are a Socratic tutor providing a hint for a challenge. Never reveal the full answer. Each hint peels back one layer.

Challenge: ${challenge}
Hint level: ${hintLevel}/3
${attemptContext}

${hintGuidance}

Respond with ONLY the hint — no preamble, no "Here's a hint:". Just the guiding thought.`;
}
