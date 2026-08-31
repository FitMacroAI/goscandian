import type { ConfidenceLevel, VerificationStatus } from "@/domain";

interface StatusBadgeProps {
  verificationStatus: VerificationStatus;
  confidence: ConfidenceLevel;
}

export function StatusBadge({ verificationStatus, confidence }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${verificationStatus}`}>
      {verificationStatus.replace("_", " ")} · {confidence}
    </span>
  );
}
