import { createSupabaseServerClient } from "./supabase/server";

export interface AdminSessionState {
  allowed: boolean;
  reason?: string;
  role?: string;
}

export async function getAdminSessionState(): Promise<AdminSessionState> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return {
      allowed: false,
      reason: "Supabase environment variables are not configured."
    };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, reason: "Sign in with an admin or moderator account." };
  }

  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = data?.role;

  return {
    allowed: role === "admin" || role === "moderator",
    role,
    reason: role ? "This account does not have admin access." : "Profile role was not found."
  };
}
