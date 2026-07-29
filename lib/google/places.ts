export type GoogleReview = {
  google_review_id: string;
  author_name: string;
  rating: number;
  review_text: string | null;
  review_time: string;
};

export type PlaceDetails = {
  name: string;
  rating: number | null;
  userRatingCount: number | null;
  reviews: GoogleReview[];
};

/**
 * Récupère le nom, la note moyenne et les avis (jusqu'à 5, fournis par
 * Google) d'un établissement via la Places API (New).
 * Ne nécessite qu'une clé API standard, pas d'approbation spéciale.
 */
export async function fetchPlaceReviews(placeId: string): Promise<PlaceDetails> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY manquante dans .env.local");
  }

  const response = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "displayName,rating,userRatingCount,reviews",
      },
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Places API error (${response.status}): ${body}`);
  }

  const data = await response.json();

  const reviews: GoogleReview[] = (data.reviews ?? []).map((r: any) => ({
    google_review_id: r.name, // identifiant unique fourni par Google pour cet avis
    author_name: r.authorAttribution?.displayName ?? "Anonymous",
    rating: r.rating,
    review_text: r.text?.text ?? null,
    review_time: r.publishTime,
  }));

  return {
    name: data.displayName?.text ?? "Unknown business",
    rating: data.rating ?? null,
    userRatingCount: data.userRatingCount ?? null,
    reviews,
  };
}
