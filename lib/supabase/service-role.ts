import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * À utiliser UNIQUEMENT côté serveur, dans du code que l'utilisateur ne
 * contrôle jamais (ex : le webhook Stripe). Cette clé contourne RLS —
 * ne jamais l'exposer au navigateur ni l'utiliser dans une route
 * appelée directement par un utilisateur non vérifié.
 */
export function createServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
