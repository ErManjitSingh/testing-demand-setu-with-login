"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { guestGoogleLogin, saveGuestSession } from "@/lib/inventoryBookingApi";
import { useGuestAuth } from "@/hooks/useGuestAuth";

export default function GoogleAuthHandler() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isLoggedIn, ready: guestReady } = useGuestAuth();
  const processedRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("[Google Auth] Session status:", status);

    if (status !== "authenticated" || !session || !guestReady) return;

    console.log("[Google Auth] Session data:", {
      user: session.user,
      provider: session.provider,
      accessToken: session.accessToken,
      idToken: session.idToken,
      expires: session.expires,
    });

    if (isLoggedIn) {
      console.log("[Google Auth] Guest already logged in — signing out NextAuth session");
      signOut({ redirect: false });
      return;
    }

    if (!session.idToken) {
      console.warn("[Google Auth] No idToken in session — cannot call backend");
      return;
    }

    if (processedRef.current === session.idToken) return;

    processedRef.current = session.idToken;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");

      console.log("[Google Auth] Sending idToken to backend…", {
        idTokenPreview: `${session.idToken.slice(0, 24)}…`,
      });

      try {
        const response = await guestGoogleLogin({ idToken: session.idToken });
        if (cancelled) return;

        console.log("[Google Auth] Backend response:", response);

        const user = response?.user ?? response?.data ?? response;
        saveGuestSession(
          {
            ...user,
            token: response?.token,
          },
          { persist: false }
        );

        console.log("[Google Auth] Guest session saved:", user);

        await signOut({ redirect: false });
        router.replace("/my-bookings");
      } catch (err) {
        if (cancelled) return;

        processedRef.current = null;
        console.error("[Google Auth] Backend login failed:", err);

        setError(err?.message || "Google sign in failed. Please try again.");
        await signOut({ redirect: false });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session, status, guestReady, isLoggedIn, router]);

  if (!loading && !error) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[4.5rem] z-50 flex justify-center px-4">
      <div
        className={`max-w-md rounded-xl px-4 py-2.5 text-center text-xs font-semibold shadow-lg sm:text-sm ${
          error
            ? "border border-red-200 bg-red-50 text-red-700"
            : "border border-white/40 bg-white/90 text-foreground backdrop-blur-md"
        }`}
        role={error ? "alert" : "status"}
      >
        {error || "Signing you in with Google…"}
      </div>
    </div>
  );
}
