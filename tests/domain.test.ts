import { describe, expect, it } from "vitest";
import {
  calculateEvidenceConfidence,
  combineModerationResults,
  isDuplicateChoice,
  isSupportedBarcode,
  mapProductClassification,
  normalizeBarcode,
  scoreAlternatives,
  scoreBusinessSubmission,
  sortEvidenceByPriority
} from "@/domain";
import type { EvidenceSource, ProductSummary } from "@/domain";

const officialEvidence: EvidenceSource = {
  sourceType: "official_product_label",
  confidence: "high",
  isPrimarySource: true,
  extractedClaim: "Label states made in Canada."
};

describe("barcode normalization", () => {
  it("keeps only digits", () => {
    expect(normalizeBarcode(" 123-45 67890 ")).toBe("1234567890");
  });

  it("accepts common UPC and EAN lengths", () => {
    expect(isSupportedBarcode("12345678")).toBe(true);
    expect(isSupportedBarcode("123456789012")).toBe(true);
    expect(isSupportedBarcode("1234567890123")).toBe(true);
    expect(isSupportedBarcode("123")).toBe(false);
  });
});

describe("evidence priority and confidence", () => {
  it("prioritizes official evidence over AI inference", () => {
    const sorted = sortEvidenceByPriority([
      {
        sourceType: "ai_inference",
        confidence: "high",
        isPrimarySource: false,
        extractedClaim: "Looks Canadian."
      },
      officialEvidence
    ]);

    expect(sorted[0]?.sourceType).toBe("official_product_label");
  });

  it("does not allow AI inference alone to produce high confidence", () => {
    expect(
      calculateEvidenceConfidence([
        {
          sourceType: "ai_inference",
          confidence: "high",
          isPrimarySource: false,
          extractedClaim: "AI guess."
        }
      ])
    ).toBe("low");
  });
});

describe("classification mapping", () => {
  it("marks strong sourced classifications as verified", () => {
    expect(
      mapProductClassification({
        claimedStatus: "made_in_canada",
        evidence: [officialEvidence]
      })
    ).toMatchObject({
      canadaStatus: "made_in_canada",
      verificationStatus: "verified",
      confidence: "high"
    });
  });

  it("keeps weak classifications unknown", () => {
    expect(
      mapProductClassification({
        claimedStatus: "product_of_canada",
        evidence: [
          {
            sourceType: "ai_inference",
            confidence: "medium",
            isPrimarySource: false,
            extractedClaim: "Inferred from brand name."
          }
        ]
      })
    ).toMatchObject({
      canadaStatus: "unknown",
      verificationStatus: "needs_review"
    });
  });
});

describe("alternatives scoring", () => {
  const source: ProductSummary = {
    id: "source",
    name: "Imported Snack",
    categorySlugs: ["snacks"],
    canadaStatus: "not_canadian",
    verificationStatus: "verified",
    confidence: "high",
    smallBusiness: false,
    dataQualityScore: 0.6,
    tags: ["granola", "oats"]
  };

  it("ranks verified Canadian small business matches first", () => {
    const [best] = scoreAlternatives(source, [
      {
        id: "best",
        name: "Canadian Granola",
        categorySlugs: ["snacks"],
        canadaStatus: "product_of_canada",
        verificationStatus: "verified",
        confidence: "high",
        smallBusiness: true,
        dataQualityScore: 1,
        tags: ["granola", "oats"]
      },
      {
        id: "weak",
        name: "Unknown Granola",
        categorySlugs: ["snacks"],
        canadaStatus: "unknown",
        verificationStatus: "needs_review",
        confidence: "unknown",
        smallBusiness: true,
        dataQualityScore: 0.2,
        tags: ["granola"]
      }
    ]);

    expect(best?.product.id).toBe("best");
  });
});

describe("duplicate community-choice prevention", () => {
  it("blocks repeated choices for the same actor and entity within the time window", () => {
    const createdAt = new Date("2026-08-30T12:00:00Z");

    expect(
      isDuplicateChoice(
        {
          anonymousSessionId: "session-1",
          productId: "product-1",
          createdAt
        },
        [
          {
            anonymousSessionId: "session-1",
            productId: "product-1",
            createdAt: new Date("2026-08-30T11:30:00Z")
          }
        ]
      )
    ).toBe(true);
  });

  it("allows different entities", () => {
    expect(
      isDuplicateChoice(
        {
          anonymousSessionId: "session-1",
          productId: "product-2",
          createdAt: new Date("2026-08-30T12:00:00Z")
        },
        [
          {
            anonymousSessionId: "session-1",
            productId: "product-1",
            createdAt: new Date("2026-08-30T11:30:00Z")
          }
        ]
      )
    ).toBe(false);
  });
});

describe("business submission moderation", () => {
  it("auto-publishes low-risk submissions only as community submitted candidates", () => {
    const result = scoreBusinessSubmission({
      businessName: "Harbour Test Studio",
      websiteUrl: "https://example.com",
      province: "ON",
      category: "Gifts",
      whyItBelongs: "A small local studio sharing a story about handmade gifts in Ontario.",
      evidenceUrl: "https://example.com/about"
    });

    expect(result.decision).toBe("auto_publish");
    expect(result.score).toBeLessThan(40);
  });

  it("uses a matching .ca website as lower-risk context without verification", () => {
    const result = scoreBusinessSubmission({
      businessName: "Fitmacro",
      websiteUrl: "https://fitmacro.ca",
      province: "ON",
      category: "Tech",
      whyItBelongs: "Canadian app studio.",
      evidenceUrl: null
    });

    expect(result.decision).toBe("auto_publish");
    expect(result.notes.join(" ")).toContain(".ca domain");
    expect(result.notes.join(" ")).toContain("match the submitted business name");
  });

  it("keeps strong Canadian-status claims pending for review", () => {
    const result = scoreBusinessSubmission({
      businessName: "Claimed Test Foods",
      websiteUrl: "https://example.com",
      province: "ON",
      category: "Food",
      whyItBelongs: "This is 100% Canadian-owned and every product is made in Canada.",
      evidenceUrl: null
    });

    expect(result.decision).toBe("pending_review");
    expect(result.notes.join(" ")).toContain("strong Canadian-status claim");
  });

  it("auto-holds high-risk submissions", () => {
    const result = scoreBusinessSubmission({
      businessName: "Fast Crypto Loan Test",
      websiteUrl: "https://example.xyz",
      province: "ON",
      category: "crypto",
      whyItBelongs: "Guaranteed income through crypto loan offers.",
      evidenceUrl: null
    });

    expect(result.decision).toBe("auto_hold");
  });

  it("does not let AI lower deterministic risk", () => {
    const combined = combineModerationResults(
      {
        score: 75,
        decision: "auto_hold",
        notes: ["Rule risk."]
      },
      {
        score: 10,
        decision: "auto_publish",
        notes: ["Looks fine."]
      }
    );

    expect(combined.score).toBe(75);
    expect(combined.decision).toBe("auto_hold");
  });

  it("lets AI raise moderation risk", () => {
    const combined = combineModerationResults(
      {
        score: 20,
        decision: "auto_publish",
        notes: ["Low rule risk."]
      },
      {
        score: 65,
        decision: "pending_review",
        notes: ["Website and business name appear mismatched."]
      }
    );

    expect(combined.score).toBe(65);
    expect(combined.decision).toBe("pending_review");
    expect(combined.notes.some((note) => note.startsWith("AI:"))).toBe(true);
  });
});
