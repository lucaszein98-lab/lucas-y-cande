import { createClient } from "@supabase/supabase-js";

const url = "https://terevdztvpctldrdecwt.supabase.co";
const anonKey = "sb_publishable_PL_akA0JXGuhEgVfqRWV3Q_j2qJLtTy";

export const supabaseConfigured = Boolean(url && anonKey);

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
