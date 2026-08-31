import type {
  CanadaProductStatus,
  ConfidenceLevel,
  EvidenceSource,
  VerificationStatus
} from "./types";
import { calculateEvidenceConfidence, canMarkVerified } from "./evidence";

export interface ClassificationResult {
  canadaStatus: CanadaProductStatus;
  verificationStatus: VerificationStatus;
  confidence: ConfidenceLevel;
  explanation: string;
}

export function mapProductClassification(params: {
  claimedStatus?: CanadaProductStatus;
  evidence: EvidenceSource[];
}): ClassificationResult {
  const confidence = calculateEvidenceConfidence(params.evidence);
  const verified = canMarkVerified(params.evidence);
  const canadaStatus = verified ? params.claimedStatus ?? "unknown" : "unknown";

  if (!verified) {
    return {
      canadaStatus: "unknown",
      verificationStatus: params.evidence.length > 0 ? "needs_review" : "needs_review",
      confidence,
      explanation: "There is not enough source evidence to verify Canadian status yet."
    };
  }

  return {
    canadaStatus,
    verificationStatus: "verified",
    confidence,
    explanation:
      canadaStatus === "unknown"
        ? "Evidence exists, but it does not establish a specific Canadian product status."
        : "Classification is based on reviewed source evidence."
  };
}
