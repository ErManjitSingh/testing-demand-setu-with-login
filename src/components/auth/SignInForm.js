"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthDivider from "@/components/auth/AuthDivider";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import PhoneNumberField from "@/components/booking/PhoneNumberField";
import { useGuestAuth } from "@/hooks/useGuestAuth";
import { guestLogin, saveGuestSession } from "@/lib/inventoryBookingApi";
import {
  DEFAULT_PHONE_COUNTRY_ISO,
  parseStoredPhone,
} from "@/lib/phoneCountryCodes";

export default function SignInForm() {
  const router = useRouter();
  const { isLoggedIn, ready } = useGuestAuth();
  const [phoneCountryIso, setPhoneCountryIso] = useState(DEFAULT_PHONE_COUNTRY_ISO);
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && isLoggedIn) {
      router.replace("/my-bookings");
    }
  }, [ready, isLoggedIn, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const parsedPhone = parseStoredPhone(mobile, phoneCountryIso);
    const mobileForApi = parsedPhone.local || String(mobile).trim();

    try {
      const response = await guestLogin({
        mobile: mobileForApi,
        password,
      });

      const user = response?.user ?? response?.data ?? response;
      saveGuestSession(
        {
          ...user,
          mobile: mobileForApi,
          token: response?.token,
        },
        { persist: keepSignedIn }
      );
      router.push("/my-bookings");
    } catch (err) {
      setError(err?.message || "Sign in failed. Please check your mobile and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <GoogleSignInButton />
      <AuthDivider label="or mobile" />

      <form onSubmit={handleSubmit} className="space-y-3">
        <PhoneNumberField
          id="mobile"
          label="Mobile"
          required
          compact
          country={phoneCountryIso}
          onCountryChange={setPhoneCountryIso}
          value={mobile}
          onChange={setMobile}
          placeholder="Mobile number"
          national
          auth
        />

        <div>
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="password" className="auth-label">
              Password
            </label>
            <button type="button" className="text-[11px] font-semibold text-brand hover:underline">
              Forgot?
            </button>
          </div>
          <div className="relative mt-1">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="auth-input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={keepSignedIn}
            onChange={(e) => setKeepSignedIn(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-stone-300 text-brand"
          />
          Keep me signed in
        </label>

        {error ? <p className="auth-error">{error}</p> : null}

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
