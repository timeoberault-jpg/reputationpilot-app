import { createServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Limite le nombre d'appels par adresse IP sur une route publique.
 * Renvoie true si la requête est autorisée, false si le quota est dépassé.
 *
 * En cas d'erreur de base de données, on autorise la requête : mieux vaut
 * un outil qui fonctionne qu'un outil bloqué par un incident interne.
 */
export async function checkRateLimit(params: {
  ip: string;
  route: string;
  maxRequests: number;
  windowMinutes: number;
}): Promise<boolean> {
  const { ip, route, maxRequests, windowMinutes } = params;

  try {
    const supabase = createServiceRoleClient();
    const since = new Date(
      Date.now() - windowMinutes * 60 * 1000
    ).toISOString();

    const { count, error } = await supabase
      .from("rate_limit_hits")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .eq("route", route)
      .gte("created_at", since);

    if (error) return true;
    if ((count ?? 0) >= maxRequests) return false;

    await supabase.from("rate_limit_hits").insert({ ip, route });
    return true;
  } catch {
    return true;
  }
}

/** Récupère l'IP du visiteur derrière le proxy Vercel. */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
