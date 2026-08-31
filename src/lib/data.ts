import { createSupabaseServerClient } from "./supabase/server";
import { businesses as fallbackBusinesses, products as fallbackProducts } from "./mock-data";
import type { BusinessCard, ProductCard } from "./mock-data";
import type {
  CanadaProductStatus,
  ConfidenceLevel,
  OwnershipStatus,
  VerificationStatus
} from "@/domain";

interface DbBusinessRow {
  slug: string;
  name: string;
  description: string | null;
  story: string | null;
  city: string | null;
  province: string | null;
  ownership_status: OwnershipStatus;
  verification_status: VerificationStatus;
  confidence: ConfidenceLevel;
}

interface DbProductRow {
  id: string;
  barcode: string | null;
  name: string;
  brand_name: string;
  description: string | null;
  canada_status: CanadaProductStatus;
  verification_status: VerificationStatus;
  confidence: ConfidenceLevel;
}

function matchesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

function filterBusinesses(items: BusinessCard[], query?: string) {
  if (!query) return items;
  return items.filter((item) =>
    [item.name, item.city, item.province, item.category, item.story].some((value) =>
      matchesQuery(value, query)
    )
  );
}

function filterProducts(items: ProductCard[], query?: string) {
  if (!query) return items;
  return items.filter((item) =>
    [item.name, item.brandName, item.category, item.barcode, item.canadaStatus].some((value) =>
      matchesQuery(value, query)
    )
  );
}

function mapBusiness(row: DbBusinessRow): BusinessCard {
  return {
    slug: row.slug,
    name: row.name,
    city: row.city ?? "Canada",
    province: row.province ?? "CA",
    category: "Small business",
    story: row.story ?? row.description ?? "No story has been added yet.",
    ownershipStatus: row.ownership_status,
    verificationStatus: row.verification_status,
    confidence: row.confidence
  };
}

function mapProduct(row: DbProductRow): ProductCard {
  return {
    slug: row.barcode ?? row.id,
    barcode: row.barcode ?? "No barcode",
    name: row.name,
    brandName: row.brand_name,
    category: "Product",
    canadaStatus: row.canada_status,
    verificationStatus: row.verification_status,
    confidence: row.confidence
  };
}

export async function getBusinesses(query?: string): Promise<BusinessCard[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return filterBusinesses(fallbackBusinesses, query);

  const { data, error } = await supabase
    .from("businesses")
    .select("slug,name,description,story,city,province,ownership_status,verification_status,confidence")
    .order("created_at", { ascending: false })
    .limit(24);

  if (error || !data?.length) return filterBusinesses(fallbackBusinesses, query);
  return filterBusinesses(data.map((row) => mapBusiness(row as DbBusinessRow)), query);
}

export async function getProducts(query?: string): Promise<ProductCard[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return filterProducts(fallbackProducts, query);

  const { data, error } = await supabase
    .from("products")
    .select("id,barcode,name,brand_name,description,canada_status,verification_status,confidence")
    .order("created_at", { ascending: false })
    .limit(36);

  if (error || !data?.length) return filterProducts(fallbackProducts, query);
  return filterProducts(data.map((row) => mapProduct(row as DbProductRow)), query);
}

export async function getBusinessBySlug(slug: string): Promise<BusinessCard | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return fallbackBusinesses.find((item) => item.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("businesses")
    .select("slug,name,description,story,city,province,ownership_status,verification_status,confidence")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return fallbackBusinesses.find((item) => item.slug === slug) ?? null;
  return mapBusiness(data as DbBusinessRow);
}

export async function getProductByRouteKey(routeKey: string): Promise<ProductCard | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return fallbackProducts.find((item) => item.slug === routeKey) ?? null;

  const { data, error } = await supabase
    .from("products")
    .select("id,barcode,name,brand_name,description,canada_status,verification_status,confidence")
    .or(`barcode.eq.${routeKey},id.eq.${routeKey}`)
    .maybeSingle();

  if (error || !data) return fallbackProducts.find((item) => item.slug === routeKey) ?? null;
  return mapProduct(data as DbProductRow);
}
