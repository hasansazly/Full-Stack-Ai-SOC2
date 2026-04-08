import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

export function createBrowserSupabaseClient() {
  if (!supabaseUrl || !anonKey) {
    return null;
  }

  return createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
}

export function createAdminSupabaseClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }) as any;
}
