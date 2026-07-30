import { NextResponse } from "next/server";
import { fetchPlaceReviews } from "@/lib/google/places";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Score simple et transparent, pensé pour être explicable au commerçant,
// pas pour être scientifiquement rigoureux : la note pèse le plus, le
// volume d'avis ajuste légèrement (peu d'avis = moins de confiance dans
// la note affichée).
function computeScore(rating: number | null, reviewCount: number | null): number {
  if (rating === null) return 0;
  const base = (rating / 5) * 90; // jusqu'à 90 points pour la note
  const volumeBonus = Math.min(10, Math.log10((reviewCount ?? 0) + 1) * 5); // jusqu'à 10 points de bonus
  return Math.round(base + volumeBonus);
}

export async function POST(request: Request) {
  const allowed = await checkRateLimit({
    ip: getClientIp(request),
    route: "audit-report",
    maxRequests: 10,
    windowMinutes: 60,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in an hour." },
      { status: 429 }
    );
  }

  const { placeId } = await request.json();

  try {
    const details = await fetchPlaceReviews(placeId);
    const score = computeScore(details.rating, details.userRatingCount);

    return NextResponse.json({
      name: details.name,
      rating: details.rating,
      reviewCount: details.userRatingCount,
      score,
      recentReviews: details.reviews.slice(0, 3),
    });
  } catch {
    return NextResponse.json({ error: "Could not fetch this business." }, { status: 502 });
  }
}
