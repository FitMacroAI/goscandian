"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { normalizeBarcode } from "@/domain";
import { ADMIN_COOKIE_NAME, getAdminSessionState } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null))
  .pipe(z.string().url().nullable());

const productSubmissionSchema = z.object({
  barcode: z.string().trim().optional(),
  productName: z.string().trim().min(2).max(160),
  brandName: z.string().trim().min(2).max(160),
  claimedOrigin: z.string().trim().max(800).optional(),
  sourceUrl: optionalUrl
});

const businessSubmissionSchema = z.object({
  businessName: z.string().trim().min(2).max(180),
  websiteUrl: optionalUrl,
  province: z.string().trim().min(2).max(2),
  category: z.string().trim().min(2).max(80),
  whyItBelongs: z.string().trim().min(10).max(1000),
  evidenceUrl: optionalUrl
});

const reportSchema = z.object({
  entityType: z.enum(["business", "product", "evidence"]),
  entityId: z.string().uuid().optional().nullable(),
  reason: z.string().trim().min(3).max(120),
  details: z.string().trim().min(10).max(1200)
});

const adminLoginSchema = z.object({
  token: z.string().min(8)
});

const moderationUpdateSchema = z.object({
  table: z.enum(["product_submissions", "business_submissions", "reports"]),
  id: z.string().uuid(),
  status: z.string().min(3).max(24)
});

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

function requireSupabase() {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    const missing = [
      process.env.NEXT_PUBLIC_SUPABASE_URL ? null : "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? null : "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    ].filter(Boolean);

    throw new Error(`Supabase public write access is not configured: ${missing.join(", ")}.`);
  }
  return supabase;
}

async function requireAdminClient() {
  const state = await getAdminSessionState();
  if (!state.allowed) {
    throw new Error("Admin access required.");
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase admin client is not configured.");
  }

  return supabase;
}

export async function adminLogin(formData: FormData) {
  const parsed = adminLoginSchema.parse({
    token: readString(formData, "token")
  });
  const expected = process.env.ADMIN_ACCESS_TOKEN;

  if (!expected || parsed.token !== expected) {
    redirect("/admin/login?error=invalid");
  }

  cookies().set(ADMIN_COOKIE_NAME, parsed.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  redirect("/admin");
}

export async function adminLogout() {
  cookies().delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}

export async function updateModerationStatus(formData: FormData) {
  const parsed = moderationUpdateSchema.parse({
    table: readString(formData, "table"),
    id: readString(formData, "id"),
    status: readString(formData, "status")
  });

  const allowedStatuses =
    parsed.table === "reports"
      ? new Set(["open", "reviewing", "resolved", "rejected"])
      : new Set(["pending", "approved", "rejected"]);

  if (!allowedStatuses.has(parsed.status)) {
    throw new Error("Invalid moderation status.");
  }

  const supabase = await requireAdminClient();
  const { error } = await supabase
    .from(parsed.table)
    .update({ status: parsed.status })
    .eq("id", parsed.id);

  if (error) {
    throw new Error("Could not update moderation status.");
  }

  revalidatePath("/admin");
  redirect(`/admin?updated=${parsed.status}`);
}

export async function submitProduct(formData: FormData) {
  const parsed = productSubmissionSchema.parse({
    barcode: readString(formData, "barcode"),
    productName: readString(formData, "productName"),
    brandName: readString(formData, "brandName"),
    claimedOrigin: readString(formData, "claimedOrigin"),
    sourceUrl: readString(formData, "sourceUrl")
  });

  const barcode = parsed.barcode ? normalizeBarcode(parsed.barcode) : null;
  const supabase = requireSupabase();
  const { error } = await supabase.from("product_submissions").insert({
    barcode,
    product_name: parsed.productName,
    brand_name: parsed.brandName,
    claimed_origin: parsed.claimedOrigin || null,
    source_url: parsed.sourceUrl
  });

  if (error) {
    throw new Error("Product submission failed.");
  }

  redirect("/submit-product/success");
}

export async function submitBusiness(formData: FormData) {
  const parsed = businessSubmissionSchema.parse({
    businessName: readString(formData, "businessName"),
    websiteUrl: readString(formData, "websiteUrl"),
    province: readString(formData, "province"),
    category: readString(formData, "category"),
    whyItBelongs: readString(formData, "whyItBelongs"),
    evidenceUrl: readString(formData, "evidenceUrl")
  });

  const supabase = requireSupabase();
  const { error } = await supabase.from("business_submissions").insert({
    business_name: parsed.businessName,
    website_url: parsed.websiteUrl,
    province: parsed.province.toUpperCase(),
    category: parsed.category,
    why_it_belongs: parsed.whyItBelongs,
    evidence_url: parsed.evidenceUrl
  });

  if (error) {
    throw new Error("Business submission failed.");
  }

  redirect("/suggest-business/success");
}

export async function submitReport(formData: FormData) {
  const parsed = reportSchema.parse({
    entityType: readString(formData, "entityType"),
    entityId: readString(formData, "entityId") || null,
    reason: readString(formData, "reason"),
    details: readString(formData, "details")
  });

  const supabase = requireSupabase();
  const { error } = await supabase.from("reports").insert({
    entity_type: parsed.entityType,
    entity_id: parsed.entityId ?? "00000000-0000-0000-0000-000000000000",
    reason: parsed.reason,
    details: parsed.details
  });

  if (error) {
    throw new Error("Report submission failed.");
  }

  redirect("/report/success");
}
