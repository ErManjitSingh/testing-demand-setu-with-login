"use client";

import { useEffect } from "react";
import { logSearchSelection } from "@/lib/logSearchSelection";

/** Logs category + location when the listings page loads with search params. */
export default function ListingsSearchLogger({
  category = "all",
  city = "",
  state = "",
  locationKind = null,
  checkIn = null,
  checkOut = null,
  guests = null,
}) {
  useEffect(() => {
    const trimmedCity = String(city || "").trim();
    const trimmedState = String(state || "").trim();
    if (!trimmedCity && !trimmedState) return;

    logSearchSelection("listings-page-loaded", {
      category,
      city: trimmedCity,
      state: trimmedState,
      locationKind,
      checkIn,
      checkOut,
      guests,
    });
  }, [category, city, state, locationKind, checkIn, checkOut, guests]);

  return null;
}
