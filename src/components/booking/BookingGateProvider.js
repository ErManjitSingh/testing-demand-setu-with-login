"use client";

import { createContext, useCallback, useContext, useState } from "react";
import ListingsBookingAlert from "@/components/listings/ListingsBookingAlert";

export const BookingGateContext = createContext({
  requireBooking: false,
  onBookingBlocked: undefined,
});

export function useBookingGate() {
  return useContext(BookingGateContext);
}

export default function BookingGateProvider({
  children,
  scrollTargetId = "hero-search",
}) {
  const [message, setMessage] = useState("");

  const onBookingBlocked = useCallback(
    (msg) => {
      setMessage(msg);
      document.getElementById(scrollTargetId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    },
    [scrollTargetId]
  );

  return (
    <BookingGateContext.Provider
      value={{ requireBooking: true, onBookingBlocked }}
    >
      <ListingsBookingAlert
        message={message}
        onDismiss={() => setMessage("")}
      />
      {children}
    </BookingGateContext.Provider>
  );
}
