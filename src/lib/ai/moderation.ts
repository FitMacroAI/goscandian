import {
  shouldRunBusinessResearch,
  type BusinessSubmissionInput,
  type ModerationDecision,
  type ModerationResult
} from "@/domain";

interface AiModerationResponse {
  score: number;
  decision: ModerationDecision;
  notes: string[];
  foundBusiness: boolean;
  matchedWebsite: boolean;
  location: string | null;
  founded: string | null;
  sources: string[];
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
    },
    foundBusiness: {
      type: "boolean",
      description: "Whether public search results appear to identify the submitted business."
    },
    matchedWebsite: {
      type: "boolean",
      description: "Whether public search results connect the submitted business name to the submitted website domain."
    },
    location: {
      type: ["string", "null"],
      description: "A concise public location finding, such as city and province, or null if not found."
    },
    founded: {
      type: ["string", "null"],
      description: "A public founded year or founding statement, or null if not found."
    },
    sources: {
      type: "array",
      items: { type: "string" },
      description: "Public source URLs used for the research notes."
    }
  },
  required: ["score", "decision", "notes", "foundBusiness", "matchedWebsite", "location", "founded", "sources"],
  additionalProperties: false
};

function isAiModerationResponse(value: unknown): value is AiModerationResponse {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.score === "number" &&
    ["auto_publish", "pending_review", "auto_hold"].includes(String(candidate.decision)) &&
    Array.isArray(candidate.notes) &&
    candidate.notes.every((note) => typeof note === "string") &&
    typeof candidate.foundBusiness === "boolean" &&
    typeof candidate.matchedWebsite === "boolean" &&
    (typeof candidate.location === "string" || candidate.location === null) &&
    (typeof candidate.founded === "string" || candidate.founded === null) &&
    Array.isArray(candidate.sources) &&
    candidate.sources.every((source) => typeof source === "string")
  );
}

function extractResponseText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const response = payload as {
    output_text?: unknown;
    output?: Array<{
      content?: Array<{
        type?: string;
        text?: unknown;
      }>;
    }>;
  };

  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return null;
}

function aiResearchEnabled(ruleResult: ModerationResult) {
  return process.env.ENABLE_AI_WEB_RESEARCH === "true" && shouldRunBusinessResearch(ruleResult);
}

function domainFromUrl(value: string | null) {
  if (!value) return null;
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function normalizeAiNotes(parsed: AiModerationResponse, includeResearch: boolean) {
  const notes = parsed.notes.slice(0, 6);

  if (!includeResearch) {
    return notes;
  }

  if (parsed.foundBusiness) {
    notes.push("Research found public signals for this business.");
  }

  if (parsed.matchedWebsite) {
    notes.push("Research connected the business name to the submitted website.");
  }

  if (parsed.location) {
    notes.push(`Research location: ${parsed.location}.`);
  }

  if (parsed.founded) {
    notes.push(`Research founding detail: ${parsed.founded}.`);
  }

  const sources = parsed.sources.filter((source) => source.startsWith("http")).slice(0, 3);
  if (sources.length) {
    notes.push(`Research sources: ${sources.join(", ")}`);
  }

  return notes.slice(0, 12);
}

export async function reviewBusinessSubmissionWithAi(
  input: BusinessSubmissionInput,
  ruleResult: ModerationResult
): Promise<ModerationResult | null> {
  if (process.env.ENABLE_AI_MODERATION !== "true" || !process.env.OPENAI_API_KEY) {
    return null;
  }

  const includeResearch = aiResearchEnabled(ruleResult);
  const websiteDomain = domainFromUrl(input.websiteUrl);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        max_output_tokens: includeResearch ? 700 : 450,
        store: false,
        ...(includeResearch
          ? {
              tools: [{ type: "web_search", search_context_size: "low" }],
              tool_choice: "required"
            }
          : {}),
        input: [
          {
            role: "system",
            content:
              "You triage Canadian small-business submissions for spam, fraud, unsupported claims, and moderation risk. Return JSON only. You must not verify Canadian ownership, Product of Canada, Made in Canada, or manufacturing claims. A .ca domain alone is not proof. A submitted website URL that appears to match the business name can support lower-risk publication as community submitted, but not verification. Strong Canadian-status claims require pending_review unless strong source evidence is supplied. Low-risk means it may be listed as community submitted, not verified. When web search is available, do a quick public search for the business name, submitted website domain, and province. Report only concise public findings such as whether the business appears to exist, where it is located, founding details if found, and source URLs. Do not fetch or summarize arbitrary page content beyond public search evidence. If search findings are weak, mismatched, or unavailable, keep the decision at pending_review or higher."
          },
          {
            role: "user",
            content: JSON.stringify({
              submission: input,
              searchQuery: includeResearch
                ? {
                    businessName: input.businessName,
                    websiteDomain,
                    province: input.province,
                    instruction: "Find public evidence that the business exists and whether the submitted website domain matches the business name."
                  }
                : null,
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

    const payload = await response.json();
    const responseText = extractResponseText(payload);
    if (!responseText) return null;

    const parsed = JSON.parse(responseText) as unknown;

    if (!isAiModerationResponse(parsed)) return null;

    return {
      score: Math.max(0, Math.min(Math.round(parsed.score), 100)),
      decision: parsed.decision,
      notes: normalizeAiNotes(parsed, includeResearch)
    };
  } catch {
    return null;
  }
}
