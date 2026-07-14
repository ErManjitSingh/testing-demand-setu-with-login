"use client";

import { useLayoutEffect } from "react";
import { PropertyRoomSelectionProvider } from "@/contexts/PropertyRoomSelectionContext";
import { setRuntimePriceMarkupMultiplier } from "@/lib/bookingPricing";

export default function PropertyBookingShell({
  inventoryB2c,
  rooms,
  initialTrip,
  propertyState,
  priceMarkupMultiplier,
  children,
}) {
  useLayoutEffect(() => {
    setRuntimePriceMarkupMultiplier(priceMarkupMultiplier);
    return () => setRuntimePriceMarkupMultiplier(null);
  }, [priceMarkupMultiplier]);

  return (
    <PropertyRoomSelectionProvider
      inventoryB2c={inventoryB2c}
      rooms={rooms}
      initialTrip={initialTrip}
      propertyState={propertyState}
      priceMarkupMultiplier={priceMarkupMultiplier}
    >
      {children}
    </PropertyRoomSelectionProvider>
  );
}
