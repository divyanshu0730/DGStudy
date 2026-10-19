import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Require a logged-in user. Redirects to /login if not authenticated. */
export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

/**
 * Login is OPTIONAL for browsing/viewing/downloading (per spec).
 * Use this on public academic pages: returns the user if logged in,
 * or null otherwise, without redirecting.
 */
export async function optionalUser() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Require a logged-in admin. Redirects appropriately if not. */
export async function requireAdmin() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") redirect("/dashboard");
  return { supabase, user };
}
