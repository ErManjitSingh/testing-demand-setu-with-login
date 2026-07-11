"use client";

import { PropertyRoomSelectionProvider } from "@/contexts/PropertyRoomSelectionContext";

export default function PropertyBookingShell({
  inventoryB2c,
  rooms,
  initialTrip,
  propertyState,
  children,
}) {
  return (
    <PropertyRoomSelectionProvider
      inventoryB2c={inventoryB2c}
      rooms={rooms}
      initialTrip={initialTrip}
      propertyState={propertyState}
    >
      {children}
    </PropertyRoomSelectionProvider>
  );
}
