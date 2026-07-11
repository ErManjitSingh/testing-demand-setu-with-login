"use client";

import { Suspense, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  buildBookUrlPreservingTrip,
  fillMissingBookingDefaults,
  loadTripSearch,
  mergeTripFromUrlAndSession,
  saveTripSearch,
  tripParamsNeedSync,
} from "@/lib/bookingSearch";

function BookingTripHydratorClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const lastSynced = useRef("");

  useEffect(() => {
    const slug = String(params?.slug || "").trim();
    if (!slug) return;

    const session = loadTripSearch();
    const merged = mergeTripFromUrlAndSession(searchParams, session);
    const hasLocation = Boolean(merged.city || merged.state);
    const hasDates = Boolean(merged.checkIn && merged.checkOut);

    if (!hasLocation && !hasDates) return;

    const trip =
      (hasLocation || hasDates) && !hasDates
        ? fillMissingBookingDefaults(merged)
        : merged;

    saveTripSearch(trip);

    if (!tripParamsNeedSync(searchParams, trip)) return;

    const price = searchParams.get("price") || "";
    const nextUrl = buildBookUrlPreservingTrip(searchParams, slug, trip, { price });
    if (lastSynced.current === nextUrl) return;
    lastSynced.current = nextUrl;

    router.replace(nextUrl, { scroll: false });
  }, [params?.slug, router, searchParams]);

  return null;
}

export default function BookingTripHydrator() {
  return (
    <Suspense fallback={null}>
      <BookingTripHydratorClient />
    </Suspense>
  );
}
