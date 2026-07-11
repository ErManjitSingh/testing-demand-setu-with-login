"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthCountrySelect from "@/components/auth/AuthCountrySelect";
import AuthDivider from "@/components/auth/AuthDivider";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import PhoneNumberField from "@/components/booking/PhoneNumberField";
import { guestSignup, saveGuestSession } from "@/lib/inventoryBookingApi";
import {
  DEFAULT_PHONE_COUNTRY_ISO,
  parseStoredPhone,
  phoneIsoForCountryName,
} from "@/lib/phoneCountryCodes";

export default function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("India");
  const [phoneCountryIso, setPhoneCountryIso] = useState(DEFAULT_PHONE_COUNTRY_ISO);
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCountryChange = (nextCountry) => {
    setCountry(nextCountry);
    setPhoneCountryIso(phoneIsoForCountryName(nextCountry));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const parsedPhone = parseStoredPhone(mobile, phoneCountryIso);
    const mobileForApi = parsedPhone.local || String(mobile).trim();

    try {
      const response = await guestSignup({
        name: name.trim(),
        email: email.trim(),
        country,
        mobile: mobileForApi,
        password,
      });

      const user = response?.user ?? response?.data ?? response;
      saveGuestSession(
        {
          ...user,
          mobile: mobileForApi,
          country,
          token: response?.token,
        },
        { persist: false }
      );

      router.replace("/my-bookings");
    } catch (err) {
      setError(err?.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <GoogleSignInButton label="Sign up with Google" />
      <AuthDivider label="or email" />

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AuthField
            label="Full name"
            id="name"
            value={name}
            onChange={setName}
            placeholder="Full name"
            autoComplete="name"
          />
          <AuthField
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Email"
            autoComplete="email"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AuthCountrySelect value={country} onChange={handleCountryChange} compact />
          <div>
            <label htmlFor="signup-password" className="auth-label">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 chars"
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
        </div>

        <PhoneNumberField
          id="signup-mobile"
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

        {error ? <p className="auth-error">{error}</p> : null}

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-xs text-muted">
        Already have an account?{" "}
        <Link href="/signin" className="font-bold text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function AuthField({ label, id, value, onChange, placeholder, type = "text", autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="auth-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="auth-input mt-1"
      />
    </div>
  );
}
