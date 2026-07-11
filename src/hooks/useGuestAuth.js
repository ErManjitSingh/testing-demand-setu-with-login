"use client";

import { useEffect, useState } from "react";
import { getGuestAuthToken, loadGuestSession } from "@/lib/inventoryBookingApi";

const AUTH_CHANGE_EVENT = "guest-auth-change";

export function useGuestAuth() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setSession(loadGuestSession());
    sync();
    setReady(true);
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, sync);
  }, []);

  return {
    session,
    isLoggedIn: Boolean(getGuestAuthToken()),
    ready,
  };
}
