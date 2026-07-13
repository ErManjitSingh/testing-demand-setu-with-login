"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LOGO_SRC } from "@/components/Logo";
import {
  extractPartnerAuthPayload,
  savePartnerSession,
  signupWebsitePackagemaker,
} from "@/lib/packagemakerPartnerApi";

export default function ListPropertySignupModal({ open, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setError("");
      setLoading(false);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const mobileDigits = mobile.replace(/\D/g, "");
    if (mobileDigits.length < 10) {
      setError("Please enter a valid mobile number.");
      return;
    }

    setLoading(true);
    try {
      const response = await signupWebsitePackagemaker({
        name,
        email,
        mobile: mobileDigits,
        password,
      });

      const { token, user } = extractPartnerAuthPayload(response);
      if (token || user) {
        savePartnerSession({
          token,
          user: user || {
            name: name.trim(),
            email: email.trim(),
            mobile: mobileDigits,
          },
        });
      }

      onSuccess?.();
      onClose();
      setName("");
      setEmail("");
      setMobile("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err?.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/55 px-4 py-8 backdrop-blur-[2px] sm:items-center sm:py-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="list-property-signup-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src={LOGO_SRC}
              alt="Demand Setu"
              width={120}
              height={36}
              className="h-8 w-auto object-contain"
            />
            <h2
              id="list-property-signup-title"
              className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl"
            >
              Create an account
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <Field
            label="Your name"
            id="lp-name"
            value={name}
            onChange={setName}
            placeholder="First and last name"
            required
          />

          <div>
            <Field
              label="Email address"
              id="lp-email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Enter your email address"
              required
            />
            <p className="mt-1.5 text-xs text-stone-500">
              We will send a confirmation link to your email
            </p>
          </div>

          <Field
            label="Mobile number"
            id="lp-mobile"
            type="tel"
            value={mobile}
            onChange={setMobile}
            placeholder="10-digit mobile number"
            required
          />

          <div>
            <Field
              label="Password"
              id="lp-password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter at least 8 characters"
              required
              minLength={8}
            />
            <p className="mt-1.5 text-xs text-stone-500">
              Use letters, numbers, and special characters
            </p>
          </div>

          <Field
            label="Confirm new password"
            id="lp-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Re-enter your password"
            required
            minLength={8}
          />

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark disabled:opacity-70"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs leading-relaxed text-stone-500">
          By proceeding, you agree to Demand Setu&apos;s{" "}
          <Link href="/privacy-policy" className="font-semibold text-brand hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms-of-service" className="font-semibold text-brand hover:underline">
            Terms &amp; Conditions
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  minLength,
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-stone-800">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
      />
    </div>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
