import { createSupabaseAdminClient, getSupabaseAdminConfigStatus } from "./supabase/admin";

export interface ProductSubmissionRow {
  id: string;
  barcode: string | null;
  product_name: string | null;
  brand_name: string | null;
  claimed_origin: string | null;
  source_url: string | null;
  status: string;
  created_at: string;
}

export interface BusinessSubmissionRow {
  id: string;
  business_name: string;
  website_url: string | null;
  province: string | null;
  category: string | null;
  why_it_belongs: string | null;
  evidence_url: string | null;
  status: string;
  moderation_score: number | null;
  moderation_decision: string | null;
  moderation_notes: string[] | null;
  published_business_id: string | null;
  created_at: string;
}

export interface ReportRow {
  id: string;
  entity_type: string;
  entity_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
}

export interface ModerationQueues {
  productSubmissions: ProductSubmissionRow[];
  businessSubmissions: BusinessSubmissionRow[];
  reports: ReportRow[];
  error?: string;
}

export async function getModerationQueues(): Promise<ModerationQueues> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    const status = getSupabaseAdminConfigStatus();
    return {
      productSubmissions: [],
      businessSubmissions: [],
      reports: [],
      error: `Supabase admin access is missing: ${status.missing.join(", ") || "unknown configuration"}.`
    };
  }

  const [products, businesses, reports] = await Promise.all([
    supabase
      .from("product_submissions")
      .select("id,barcode,product_name,brand_name,claimed_origin,source_url,status,created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("business_submissions")
      .select("id,business_name,website_url,province,category,why_it_belongs,evidence_url,status,moderation_score,moderation_decision,moderation_notes,published_business_id,created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("reports")
      .select("id,entity_type,entity_id,reason,details,status,created_at")
      .in("status", ["open", "reviewing"])
      .order("created_at", { ascending: false })
      .limit(20)
  ]);

  return {
    productSubmissions: (products.data ?? []) as ProductSubmissionRow[],
    businessSubmissions: (businesses.data ?? []) as BusinessSubmissionRow[],
    reports: (reports.data ?? []) as ReportRow[],
    error: products.error?.message ?? businesses.error?.message ?? reports.error?.message
  };
}
