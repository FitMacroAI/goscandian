import type { AlternativeScore, ProductSummary } from "./types";

const DEFAULT_WEIGHTS = {
  categorySimilarity: 35,
  verifiedCanadianStatus: 25,
  productSimilarity: 20,
  smallBusinessBoost: 10,
  dataQuality: 10
};

const CANADIAN_PRODUCT_STATUSES = new Set([
  "product_of_canada",
  "made_in_canada",
  "manufactured_in_canada",
  "designed_in_canada",
  "canadian_brand_imported"
]);

export function scoreAlternatives(
  source: ProductSummary,
  candidates: ProductSummary[]
): AlternativeScore[] {
  return candidates
    .filter((candidate) => candidate.id !== source.id)
    .map((candidate) => {
      const sharedCategories = candidate.categorySlugs.filter((slug) =>
        source.categorySlugs.includes(slug)
      ).length;
      const categorySimilarity =
        source.categorySlugs.length === 0
          ? 0
          : Math.min(sharedCategories / source.categorySlugs.length, 1);
      const sharedTags = candidate.tags.filter((tag) => source.tags.includes(tag)).length;
      const productSimilarity = source.tags.length === 0 ? 0 : Math.min(sharedTags / source.tags.length, 1);
      const verifiedCanadian =
        candidate.verificationStatus === "verified" &&
        CANADIAN_PRODUCT_STATUSES.has(candidate.canadaStatus);

      const score =
        categorySimilarity * DEFAULT_WEIGHTS.categorySimilarity +
        (verifiedCanadian ? DEFAULT_WEIGHTS.verifiedCanadianStatus : 0) +
        productSimilarity * DEFAULT_WEIGHTS.productSimilarity +
        (candidate.smallBusiness ? DEFAULT_WEIGHTS.smallBusinessBoost : 0) +
        Math.max(0, Math.min(candidate.dataQualityScore, 1)) * DEFAULT_WEIGHTS.dataQuality;

      const reason = verifiedCanadian
        ? "Verified Canadian option with similar category signals."
        : "Similar option that still needs stronger Canadian-status evidence.";

      return { product: candidate, score: Math.round(score), reason };
    })
    .sort((a, b) => b.score - a.score);
}
