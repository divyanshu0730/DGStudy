"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error: string | null };

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "").trim();

  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });

  if (error) return { error: error.message };
 redirect("/verify-email");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "");

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid email or password." };
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
}

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function adminLoginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Email and password are required." };

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "Invalid email or password." };

  const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", data.user.id)
  .single();

if (profileError) {
  console.error("Admin profile check failed:", profileError);
  return { error: "Could not verify admin profile. Check the terminal." };
}

if (!profile || profile.role !== "admin") {
  await supabase.auth.signOut();
  return { error: "Admin role was not found for this account." };
}
  redirect("/admin");
}
