import type { BusinessSubmissionInput, ModerationDecision, ModerationResult } from "@/domain";

interface AiModerationResponse {
  score: number;
  decision: ModerationDecision;
  notes: string[];
}

const responseSchema = {
  type: "object",
  properties: {
    score: {
      type: "number",
      description: "Risk score from 0 to 100. Higher means more moderation risk."
    },
    decision: {
      type: "string",
      enum: ["auto_publish", "pending_review", "auto_hold"],
      description: "Triage decision. This is not verification."
    },
    notes: {
      type: "array",
      items: { type: "string" },
      description: "Short reasons for the score and decision."
    }
  },
  required: ["score", "decision", "notes"],
  additionalProperties: false
};

function isAiModerationResponse(value: unknown): value is AiModerationResponse {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.score === "number" &&
    ["auto_publish", "pending_review", "auto_hold"].includes(String(candidate.decision)) &&
    Array.isArray(candidate.notes) &&
    candidate.notes.every((note) => typeof note === "string")
  );
}

export async function reviewBusinessSubmissionWithAi(
  input: BusinessSubmissionInput,
  ruleResult: ModerationResult
): Promise<ModerationResult | null> {
  if (process.env.ENABLE_AI_MODERATION !== "true" || !process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        max_output_tokens: 450,
        store: false,
        input: [
          {
            role: "system",
            content:
              "You triage Canadian small-business submissions for spam, fraud, unsupported claims, and moderation risk. Return JSON only. You must not verify Canadian ownership, Product of Canada, Made in Canada, or manufacturing claims. Strong Canadian-status claims require pending_review unless strong source evidence is supplied. Low-risk means it may be listed as community submitted, not verified."
          },
          {
            role: "user",
            content: JSON.stringify({
              submission: input,
              deterministicRuleResult: ruleResult
            })
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "business_submission_moderation",
            strict: true,
            schema: responseSchema
          }
        }
      })
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as { output_text?: string };
    const parsed = JSON.parse(payload.output_text ?? "{}") as unknown;

    if (!isAiModerationResponse(parsed)) return null;

    return {
      score: Math.max(0, Math.min(Math.round(parsed.score), 100)),
      decision: parsed.decision,
      notes: parsed.notes.slice(0, 6)
    };
  } catch {
    return null;
  }
}
