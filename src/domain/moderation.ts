export type ModerationDecision = "auto_publish" | "pending_review" | "auto_hold";

export interface BusinessSubmissionInput {
  businessName: string;
  websiteUrl: string | null;
  province: string;
  category: string;
  whyItBelongs: string;
  evidenceUrl: string | null;
}

export interface ModerationResult {
  score: number;
  decision: ModerationDecision;
  notes: string[];
}

const decisionRisk: Record<ModerationDecision, number> = {
  auto_publish: 0,
  pending_review: 1,
  auto_hold: 2
};

function decisionFromScore(score: number): ModerationDecision {
  if (score >= 70) return "auto_hold";
  if (score >= 40) return "pending_review";
  return "auto_publish";
}

const blockedTerms = [
  "casino",
  "gambling",
  "crypto",
  "loan",
  "adult",
  "weapon",
  "miracle cure",
  "guaranteed income"
];

const strongClaimPatterns = [
  /100%\s+canadian/i,
  /product\s+of\s+canada/i,
  /made\s+in\s+canada/i,
  /canadian[-\s]?owned/i,
  /manufactured\s+in\s+canada/i
];

function validUrl(value: string | null) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function normalizedBusinessTokens(name: string) {
  return name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4);
}

function websiteSignals(input: BusinessSubmissionInput) {
  if (!validUrl(input.websiteUrl)) {
    return {
      hasValidWebsite: false,
      isDotCa: false,
      matchesBusinessName: false
    };
  }

  const hostname = new URL(input.websiteUrl ?? "").hostname.toLowerCase();
  const tokens = normalizedBusinessTokens(input.businessName);

  return {
    hasValidWebsite: true,
    isDotCa: hostname.endsWith(".ca"),
    matchesBusinessName: tokens.some((token) => hostname.includes(token))
  };
}

export function scoreBusinessSubmission(input: BusinessSubmissionInput): ModerationResult {
  const notes: string[] = [];
  let score = 15;
  const combined = `${input.businessName} ${input.category} ${input.whyItBelongs}`.toLowerCase();
  const signals = websiteSignals(input);

  if (!signals.hasValidWebsite) {
    score += 20;
    notes.push("No valid business website was provided.");
  } else {
    notes.push("A valid business website was provided.");
  }

  if (signals.isDotCa) {
    notes.push("The website uses a .ca domain, which is useful context but not proof of ownership.");
  }

  if (signals.matchesBusinessName) {
    notes.push("The website domain appears to match the submitted business name.");
  }

  if (!validUrl(input.evidenceUrl) && !signals.matchesBusinessName) {
    score += 10;
    notes.push("No valid evidence link was provided.");
  }

  if (input.whyItBelongs.trim().length < 40 && !signals.matchesBusinessName) {
    score += 15;
    notes.push("The explanation is short and may need review.");
  }

  if (blockedTerms.some((term) => combined.includes(term))) {
    score += 60;
    notes.push("Potentially high-risk or unrelated category language was detected.");
  }

  if (strongClaimPatterns.some((pattern) => pattern.test(input.whyItBelongs))) {
    score += 25;
    notes.push("The submission makes a strong Canadian-status claim that needs evidence review.");
  }

  if (/\.ru|\.cn|\.xyz|bit\.ly|tinyurl/i.test(input.websiteUrl ?? "")) {
    score += 30;
    notes.push("The website domain looks higher risk.");
  }

  const clampedScore = Math.max(0, Math.min(score, 100));
  const decision = decisionFromScore(clampedScore);

  if (decision === "auto_publish") {
    notes.push("Low-risk submission can publish as community submitted, not verified.");
  }

  return {
    score: clampedScore,
    decision,
    notes
  };
}

export function combineModerationResults(
  ruleResult: ModerationResult,
  aiResult: ModerationResult | null
): ModerationResult {
  if (!aiResult) return ruleResult;

  const score = Math.max(ruleResult.score, aiResult.score);
  const scoreDecision = decisionFromScore(score);
  const decision =
    decisionRisk[aiResult.decision] > decisionRisk[ruleResult.decision]
      ? aiResult.decision
      : decisionRisk[scoreDecision] > decisionRisk[ruleResult.decision]
        ? scoreDecision
        : ruleResult.decision;

  return {
    score,
    decision,
    notes: [...ruleResult.notes, ...aiResult.notes.map((note) => `AI: ${note}`)]
  };
}

export function shouldRunBusinessResearch(ruleResult: ModerationResult): boolean {
  return ruleResult.decision !== "auto_hold" && ruleResult.score < 70;
}
