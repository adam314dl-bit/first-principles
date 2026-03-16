// src/lib/prompts/challenge-generate.ts
export interface ChallengeGenerateParams {
  topic: string;
  subject: string;
  difficulty: number;
  masteredTopics: string[];
}

export function challengeGeneratePrompt(params: ChallengeGenerateParams): string {
  const { topic, subject, difficulty, masteredTopics } = params;
  const masteredList = masteredTopics.length > 0
    ? `The learner has already mastered: ${masteredTopics.join(", ")}.`
    : "The learner is just starting out with no prior mastered topics.";

  const subjectGuidance = subject === "math"
    ? "For math: insist on rigor. Require precise definitions and logical steps. Encourage proof-like reasoning."
    : subject === "physics"
    ? "For physics: lead with intuition and physical reasoning before equations. Ask 'what would you expect to happen?' before formalizing."
    : subject === "cs"
    ? "For computer science: emphasize algorithmic thinking. Ask the learner to trace through examples by hand before coding."
    : "Adapt your approach to fit the subject matter.";

  return `You are a Socratic STEM tutor inspired by Richard Feynman's teaching style. Your goal is to create a provocative, curiosity-sparking challenge that forces the learner to think deeply rather than recall facts.

Topic: ${topic}
Subject: ${subject}
Difficulty level: ${difficulty}/5
${masteredList}

${subjectGuidance}

Generate ONE challenge that:
1. Starts with an intriguing question or puzzle — not a textbook exercise
2. Can be approached from first principles — no memorized formulas needed
3. Has layers of depth — a surface answer exists, but deeper reasoning reveals more
4. Connects to the learner's existing knowledge where possible
5. Is appropriate for difficulty level ${difficulty}/5

Format your response as:
**Challenge:** [The provocative question or puzzle]
**Why this matters:** [One sentence connecting this to real understanding]`;
}
