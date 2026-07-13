"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadPartnerSession,
  PARTNER_AUTH_CHANGE_EVENT,
} from "@/lib/packagemakerPartnerApi";

export function usePartnerAuth() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setSession(loadPartnerSession());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener(PARTNER_AUTH_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(PARTNER_AUTH_CHANGE_EVENT, onChange);
  }, [refresh]);

  return {
    ready,
    session,
    isLoggedIn: Boolean(session?.token),
    user: session?.user || null,
  };
}
