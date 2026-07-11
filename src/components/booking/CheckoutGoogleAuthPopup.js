"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CheckoutGoogleSignIn from "@/components/booking/CheckoutGoogleSignIn";
import { useGuestAuth } from "@/hooks/useGuestAuth";

export default function CheckoutGoogleAuthPopup() {
  const { isLoggedIn, ready } = useGuestAuth();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!ready || isLoggedIn || dismissed) {
      setVisible(false);
      return undefined;
    }

    const timer = window.setTimeout(() => setVisible(true), 400);
    return () => window.clearTimeout(timer);
  }, [ready, isLoggedIn, dismissed]);

  if (!mounted || !ready || isLoggedIn || dismissed) return null;

  return createPortal(
    <div
      className={`fixed right-4 top-20 z-[90] w-[min(calc(100vw-2rem),320px)] transition-all duration-300 sm:right-6 sm:top-24 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-labelledby="checkout-google-popup-title"
      aria-live="polite"
    >
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-stone-900/15 ring-1 ring-black/5">
        <div className="relative bg-gradient-to-br from-brand-muted via-white to-orange-50 px-4 pb-3 pt-4 sm:px-5">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-stone-500 shadow-sm transition hover:bg-white hover:text-stone-700"
            aria-label="Close"
          >
            ✕
          </button>
          <p className="text-[10px] font-bold uppercase tracking-wide text-brand">Fast checkout</p>
          <h2 id="checkout-google-popup-title" className="mt-1 pr-8 text-base font-extrabold text-foreground">
            Sign in with Google
          </h2>
          
        </div>

        <div className="space-y-3 px-4 py-4 sm:px-5">
          {visible ? (
            <CheckoutGoogleSignIn
              className="w-full"
              onSuccess={() => setDismissed(true)}
              fullWidth
            />
          ) : (
            <div className="h-11 animate-pulse rounded-lg bg-stone-100" aria-hidden="true" />
          )}

        
        </div>
      </div>
    </div>,
    document.body
  );
}
