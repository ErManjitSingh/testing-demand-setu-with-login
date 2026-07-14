"use client";

import { useEffect } from "react";
import {
  loadPartnerSession,
  PARTNER_AUTH_CHANGE_EVENT,
} from "@/lib/packagemakerPartnerApi";
import { AuthProvider } from "@/components/partner/hotel-manager/context/AuthContext";

export default function PartnerSessionBridge({ children }) {
  useEffect(() => {
    const sync = () => {
      const session = loadPartnerSession();
      if (!session) return;
      if (session.token) localStorage.setItem("token", session.token);
      if (session.user) localStorage.setItem("user", JSON.stringify(session.user));
    };

    sync();
    window.addEventListener(PARTNER_AUTH_CHANGE_EVENT, sync);
    return () => window.removeEventListener(PARTNER_AUTH_CHANGE_EVENT, sync);
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}
