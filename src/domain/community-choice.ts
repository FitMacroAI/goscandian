export interface ChoiceFingerprint {
  anonymousSessionId?: string | null;
  userId?: string | null;
  productId?: string | null;
  businessId?: string | null;
  createdAt: Date;
}

export function isDuplicateChoice(
  next: ChoiceFingerprint,
  recentChoices: ChoiceFingerprint[],
  windowMinutes = 60
): boolean {
  const actor = next.userId ?? next.anonymousSessionId;
  if (!actor) return true;
  const entity = next.productId ? `product:${next.productId}` : `business:${next.businessId ?? ""}`;

  return recentChoices.some((choice) => {
    const choiceActor = choice.userId ?? choice.anonymousSessionId;
    const choiceEntity = choice.productId
      ? `product:${choice.productId}`
      : `business:${choice.businessId ?? ""}`;
    const elapsedMs = Math.abs(next.createdAt.getTime() - choice.createdAt.getTime());
    return (
      choiceActor === actor &&
      choiceEntity === entity &&
      elapsedMs <= windowMinutes * 60 * 1000
    );
  });
}
