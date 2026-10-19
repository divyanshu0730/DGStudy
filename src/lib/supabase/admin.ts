import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVICE-ROLE client. Server-only. Never import this from client components,
// never send this key to the browser. Used only inside Route Handlers /
// Server Actions after we've verified the caller is an authenticated admin.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase service role configuration.");
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
