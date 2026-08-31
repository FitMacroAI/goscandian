import type { CanadaProductStatus, ConfidenceLevel, OwnershipStatus, VerificationStatus } from "@/domain";

export interface BusinessCard {
  slug: string;
  name: string;
  city: string;
  province: string;
  category: string;
  story: string;
  ownershipStatus: OwnershipStatus;
  verificationStatus: VerificationStatus;
  confidence: ConfidenceLevel;
}

export interface ProductCard {
  slug: string;
  barcode: string;
  name: string;
  brandName: string;
  category: string;
  canadaStatus: CanadaProductStatus;
  verificationStatus: VerificationStatus;
  confidence: ConfidenceLevel;
}

export const businesses: BusinessCard[] = [
  {
    slug: "northern-larder-test",
    name: "Northern Larder Test Kitchen",
    city: "Kingston",
    province: "ON",
    category: "Pantry",
    story: "Small-batch preserves and pantry staples built around regional ingredients.",
    ownershipStatus: "canadian_owned",
    verificationStatus: "verified",
    confidence: "high"
  },
  {
    slug: "west-coast-home-test",
    name: "West Coast Home Test Goods",
    city: "Victoria",
    province: "BC",
    category: "Home Goods",
    story: "Durable kitchen and home items with a lower-waste approach.",
    ownershipStatus: "canadian_owned",
    verificationStatus: "verified",
    confidence: "medium"
  },
  {
    slug: "laurentian-threads-test",
    name: "Laurentian Threads Test Label",
    city: "Montreal",
    province: "QC",
    category: "Apparel",
    story: "Everyday apparel designed in Canada with transparent manufacturing notes.",
    ownershipStatus: "canadian_owned",
    verificationStatus: "verified",
    confidence: "high"
  }
];

export const products: ProductCard[] = [
  {
    slug: "development-product-001",
    barcode: "100000000001",
    name: "Development Maple Granola",
    brandName: "Northern Larder Test Kitchen",
    category: "Pantry Staples",
    canadaStatus: "product_of_canada",
    verificationStatus: "verified",
    confidence: "high"
  },
  {
    slug: "development-product-002",
    barcode: "100000000002",
    name: "Development Trail Mug",
    brandName: "West Coast Home Test Goods",
    category: "Home Goods",
    canadaStatus: "canadian_brand_imported",
    verificationStatus: "verified",
    confidence: "medium"
  },
  {
    slug: "development-product-003",
    barcode: "100000000003",
    name: "Unknown Origin Test Bar",
    brandName: "Bay Gift Test House",
    category: "Snacks",
    canadaStatus: "unknown",
    verificationStatus: "needs_review",
    confidence: "unknown"
  }
];
