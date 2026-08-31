export type OwnershipStatus =
  | "canadian_owned"
  | "partially_canadian_owned"
  | "foreign_owned"
  | "unknown";

export type CanadaProductStatus =
  | "product_of_canada"
  | "made_in_canada"
  | "manufactured_in_canada"
  | "designed_in_canada"
  | "canadian_brand_imported"
  | "not_canadian"
  | "unknown";

export type VerificationStatus =
  | "verified"
  | "community_submitted"
  | "needs_review"
  | "disputed"
  | "rejected";

export type ConfidenceLevel = "high" | "medium" | "low" | "unknown";

export type EvidenceSourceType =
  | "official_company_website"
  | "official_product_label"
  | "government_or_regulatory"
  | "verified_retailer_or_manufacturer"
  | "reputable_news"
  | "community_submission"
  | "ai_inference";

export type Province =
  | "AB"
  | "BC"
  | "MB"
  | "NB"
  | "NL"
  | "NS"
  | "NT"
  | "NU"
  | "ON"
  | "PE"
  | "QC"
  | "SK"
  | "YT";

export interface EvidenceSource {
  sourceType: EvidenceSourceType;
  confidence: ConfidenceLevel;
  isPrimarySource: boolean;
  extractedClaim: string;
  sourceUrl?: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  barcode?: string;
  categorySlugs: string[];
  canadaStatus: CanadaProductStatus;
  verificationStatus: VerificationStatus;
  confidence: ConfidenceLevel;
  smallBusiness: boolean;
  dataQualityScore: number;
  tags: string[];
}

export interface AlternativeScore {
  product: ProductSummary;
  score: number;
  reason: string;
}
