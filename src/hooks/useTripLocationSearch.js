"use client";

import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { normalizeTripLocation } from "@/lib/locationCatalog";
import { logSearchSelection } from "@/lib/logSearchSelection";

/** Redux-backed API catalog resolver + search console logging. */
export function useTripLocationSearch() {
  const { cities, states } = useSelector((s) => s.locations);
  const catalog = useMemo(() => ({ cities, states }), [cities, states]);

  const resolveLocation = useCallback(
    ({ city = "", state = "", kind = null } = {}) =>
      normalizeTripLocation({ city, state, kind }, catalog),
    [catalog]
  );

  const logSearch = useCallback(
    (source, trip) => {
      const normalized = resolveLocation({
        city: trip.city,
        state: trip.state,
        kind: trip.locationKind || trip.kind,
      });
      logSearchSelection(source, {
        ...trip,
        city: normalized.city,
        state: normalized.state,
        locationKind: normalized.kind,
      });
      return normalized;
    },
    [resolveLocation]
  );

  return { catalog, resolveLocation, logSearch };
}
