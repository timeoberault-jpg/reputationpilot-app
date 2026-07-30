import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const allowed = await checkRateLimit({
    ip: getClientIp(request),
    route: "audit-search",
    maxRequests: 10,
    windowMinutes: 60,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many searches. Please try again in an hour." },
      { status: 429 }
    );
  }

  const { query } = await request.json();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey!,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 5 }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }

  const data = await response.json();

  const results = (data.places ?? []).map((p: any) => ({
    id: p.id,
    displayName: p.displayName?.text ?? "Unnamed place",
    address: p.formattedAddress ?? "",
  }));

  return NextResponse.json({ results });
}
