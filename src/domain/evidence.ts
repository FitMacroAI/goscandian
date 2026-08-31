import type { ConfidenceLevel, EvidenceSource, EvidenceSourceType } from "./types";

const SOURCE_PRIORITY: Record<EvidenceSourceType, number> = {
  official_company_website: 7,
  official_product_label: 7,
  government_or_regulatory: 6,
  verified_retailer_or_manufacturer: 5,
  reputable_news: 4,
  community_submission: 2,
  ai_inference: 1
};

const CONFIDENCE_SCORE: Record<ConfidenceLevel, number> = {
  high: 4,
  medium: 3,
  low: 2,
  unknown: 0
};

export function evidencePriority(sourceType: EvidenceSourceType): number {
  return SOURCE_PRIORITY[sourceType];
}

export function sortEvidenceByPriority(evidence: EvidenceSource[]): EvidenceSource[] {
  return [...evidence].sort((a, b) => {
    const sourceDelta = evidencePriority(b.sourceType) - evidencePriority(a.sourceType);
    if (sourceDelta !== 0) return sourceDelta;
    return CONFIDENCE_SCORE[b.confidence] - CONFIDENCE_SCORE[a.confidence];
  });
}

export function calculateEvidenceConfidence(evidence: EvidenceSource[]): ConfidenceLevel {
  const sorted = sortEvidenceByPriority(evidence);
  const strongest = sorted[0];

  if (!strongest) return "unknown";
  if (strongest.sourceType === "ai_inference") return "low";
  if (strongest.confidence === "high" && evidencePriority(strongest.sourceType) >= 5) return "high";
  if (strongest.confidence === "medium" && evidencePriority(strongest.sourceType) >= 4) return "medium";
  return strongest.confidence === "unknown" ? "unknown" : "low";
}

export function canMarkVerified(evidence: EvidenceSource[]): boolean {
  return sortEvidenceByPriority(evidence).some(
    (source) => source.sourceType !== "ai_inference" && evidencePriority(source.sourceType) >= 4
  );
}
