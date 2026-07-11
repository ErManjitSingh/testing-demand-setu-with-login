"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useEffect, useRef, useState } from "react";
import { guestGoogleLogin, saveGuestSession } from "@/lib/inventoryBookingApi";

export default function CheckoutGoogleSignIn({ onSuccess, className = "", fullWidth = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [buttonWidth, setButtonWidth] = useState(fullWidth ? 280 : 240);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!wrapRef.current) return undefined;

    const updateWidth = () => {
      const width = Math.floor(wrapRef.current?.getBoundingClientRect().width || 0);
      if (width > 0) setButtonWidth(width);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, [fullWidth]);

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      setError("Google did not return a valid sign-in token.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await guestGoogleLogin({ idToken });
      const user = response?.user ?? response?.data ?? response;
      saveGuestSession(
        {
          ...user,
          mobile: user?.mobile || "",
          token: response?.token,
        },
        { persist: false }
      );
      onSuccess?.();
    } catch (err) {
      setError(err?.message || "Google sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={wrapRef} className={className}>
      <div
        className={`flex justify-center overflow-hidden ${loading ? "pointer-events-none opacity-70" : ""} ${
          fullWidth ? "w-full" : ""
        }`}
      >
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google sign in was cancelled or failed.")}
          useOneTap={false}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          width={buttonWidth}
        />
      </div>

      {error ? <p className="mt-2 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
