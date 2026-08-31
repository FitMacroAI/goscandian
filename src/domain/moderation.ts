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

export function scoreBusinessSubmission(input: BusinessSubmissionInput): ModerationResult {
  const notes: string[] = [];
  let score = 15;
  const combined = `${input.businessName} ${input.category} ${input.whyItBelongs}`.toLowerCase();

  if (!validUrl(input.websiteUrl)) {
    score += 20;
    notes.push("No valid business website was provided.");
  }

  if (!validUrl(input.evidenceUrl)) {
    score += 10;
    notes.push("No valid evidence link was provided.");
  }

  if (input.whyItBelongs.trim().length < 40) {
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
  const decision =
    clampedScore >= 70 ? "auto_hold" : clampedScore >= 40 ? "pending_review" : "auto_publish";

  if (decision === "auto_publish") {
    notes.push("Low-risk submission can publish as community submitted, not verified.");
  }

  return {
    score: clampedScore,
    decision,
    notes
  };
}
