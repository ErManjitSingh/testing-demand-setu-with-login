"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LOGO_SRC } from "@/components/Logo";
import ListPropertyBackground from "@/components/list-property/ListPropertyBackground";
import ListPropertySignupModal from "@/components/list-property/ListPropertySignupModal";
import { usePartnerAuth } from "@/hooks/usePartnerAuth";
import {
  extractPartnerAuthPayload,
  normalizePartnerLoginId,
  savePartnerSession,
  signinWebsitePackagemaker,
} from "@/lib/packagemakerPartnerApi";

const PROPERTY_TYPES = ["Hotel", "Villa", "Resort", "Hostel", "Guest house"];

const STATS = [
  { value: "48.2 Crt+", label: "Annual bookings on our platform" },
  { value: "3.1 Crt+", label: "Annual room nights sold" },
  { value: "80+", label: "Countries & regions covered" },
  { value: "15 Lakh+", label: "Partner listings worldwide" },
];

export default function ListPropertyLanding() {
  const router = useRouter();
  const { isLoggedIn, user, ready } = usePartnerAuth();
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [signinLoading, setSigninLoading] = useState(false);
  const [signinError, setSigninError] = useState("");
  const [signinSuccess, setSigninSuccess] = useState("");

  const openSignup = () => setSignupOpen(true);
  const closeSignup = () => setSignupOpen(false);

  const handleSignin = async (e) => {
    e.preventDefault();
    setSigninError("");
    setSigninSuccess("");

    const trimmedLoginId = normalizePartnerLoginId(loginId);
    if (!trimmedLoginId || !password) {
      setSigninError("Login ID and password are required.");
      return;
    }

    setSigninLoading(true);
    try {
      const response = await signinWebsitePackagemaker({
        loginId: trimmedLoginId,
        password,
      });

      const { token, user: authUser, propertyId, websitePartnerId } =
        extractPartnerAuthPayload(response);
      savePartnerSession({
        token,
        propertyId,
        websitePartnerId,
        loginId: trimmedLoginId,
        user:
          authUser ||
          (trimmedLoginId.includes("@")
            ? { email: trimmedLoginId }
            : { mobile: trimmedLoginId }),
      });

      setSigninSuccess("Signed in successfully.");
      setPassword("");
      router.push("/partner/hotels");
    } catch (err) {
      setSigninError(err?.message || "Sign in failed. Please try again.");
    } finally {
      setSigninLoading(false);
    }
  };

  return (
    <>
      <div className="text-white">
        <section className="relative flex min-h-[100dvh] flex-col overflow-hidden">
          <ListPropertyBackground />

          <header className="relative z-20 border-b border-white/10 bg-stone-950/25 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6">
              <Link href="/" className="inline-flex shrink-0 items-center transition hover:opacity-90">
                <Image
                  src={LOGO_SRC}
                  alt="Demand Setu"
                  width={160}
                  height={44}
                  className="h-9 w-auto max-w-[140px] object-contain brightness-0 invert sm:h-10 sm:max-w-[160px]"
                  priority
                />
              </Link>

              <nav className="flex items-center gap-2 sm:gap-4">
                
              
                <button
                  type="button"
                  onClick={openSignup}
                  className="rounded-full bg-brand px-3 py-2 text-[11px] font-extrabold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  <span className="sm:hidden">List property</span>
                  <span className="hidden sm:inline">List New Property For Free</span>
                </button>
              </nav>
            </div>
          </header>

          <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:gap-12 lg:py-16">
            <div className="flex-1 lg:max-w-xl xl:max-w-2xl">
              <p className="inline-flex rounded-full border border-brand/40 bg-brand/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-100">
                Partner program
              </p>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
                <span className="block text-white/95">List your</span>
                <span className="mt-1 block bg-gradient-to-r from-white via-orange-50 to-orange-200 bg-clip-text text-transparent">
                  {PROPERTY_TYPES.join(", ")}
                </span>
                <span className="mt-2 block text-white/95">
                  for free &amp; grow your business
                </span>
              </h1>

              <p className="mt-5 text-lg font-semibold text-white/85 sm:text-xl">
                Partner with Demand Setu
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {["Hotels", "Homestays", "Villas"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white/90 backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="mt-8 text-sm font-medium text-white/70 sm:text-base">
                Join a community of 15,00,000+ listings
              </p>
            </div>

            <div className="w-full lg:max-w-md lg:shrink-0 xl:max-w-[420px]">
              <div className="rounded-2xl border border-white/20 bg-stone-900/50 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-7">
                {!ready ? (
                  <div className="animate-pulse space-y-4" aria-hidden>
                    <div className="h-7 w-3/4 rounded-lg bg-white/10" />
                    <div className="h-4 w-1/2 rounded bg-white/10" />
                    <div className="h-12 w-full rounded-xl bg-white/10" />
                    <div className="h-12 w-full rounded-xl bg-white/10" />
                    <div className="h-12 w-full rounded-xl bg-white/15" />
                  </div>
                ) : isLoggedIn ? (
                  <div>
                    <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                      Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-white/70">
                      Signed in as{" "}
                      <span className="font-semibold text-white">
                        {user?.name || user?.email || user?.mobile || "Partner"}
                      </span>
                    </p>
                    <Link
                      href="/partner/hotels"
                      className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-brand py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark"
                    >
                      Go to property dashboard
                    </Link>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                      Sign in to manage your property
                    </h2>
                    <p className="mt-1 text-sm text-white/65">
                      Welcome back! Please enter your details.
                    </p>

                    <form className="mt-6 space-y-4" onSubmit={handleSignin}>
                      <input
                        id="lp-login-email"
                        type="text"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        placeholder="Email or 10-digit mobile (without +91)"
                        aria-label="Email or mobile number"
                        autoComplete="username"
                        className="w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />
                      <input
                        id="lp-login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        aria-label="Password"
                        autoComplete="current-password"
                        className="w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />

                      {signinError ? (
                        <p className="rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100">
                          {signinError}
                        </p>
                      ) : null}
                      {signinSuccess ? (
                        <p className="rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-100">
                          {signinSuccess}
                        </p>
                      ) : null}

                      <button
                        type="submit"
                        disabled={signinLoading}
                        className="w-full rounded-xl bg-brand py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark disabled:opacity-70"
                      >
                        {signinLoading ? "Signing in…" : "Sign in"}
                      </button>
                    </form>

                    <p className="mt-5 text-center text-sm text-white/70">
                      New to Demand Setu?{" "}
                      <button
                        type="button"
                        onClick={openSignup}
                        className="font-bold text-white transition hover:text-brand-light hover:underline"
                      >
                        Create an account
                      </button>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10 flex justify-center pb-8 pt-2">
            <a
              href="#features"
              className="flex flex-col items-center gap-2 text-white/50 transition hover:text-white/80"
            >
              <MouseScrollIcon />
              <span className="text-xs font-medium">Scroll down</span>
            </a>
          </div>
        </section>

        <section
          id="features"
          className="relative border-t border-white/10 bg-stone-950 px-4 py-12 sm:px-6 sm:py-16"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,88,12,0.08),transparent_60%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STATS.map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm sm:p-6"
              >
                <p className="text-2xl font-extrabold text-white sm:text-3xl">{stat.value}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{stat.label}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <ListPropertySignupModal
        open={signupOpen}
        onClose={closeSignup}
        onSuccess={() => router.push("/partner/hotels")}
      />
    </>
  );
}

function PhoneAppIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
      />
    </svg>
  );
}

function MouseScrollIcon() {
  return (
    <svg className="h-7 w-4" viewBox="0 0 28 44" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="26" height="42" rx="13" stroke="currentColor" strokeWidth="2" />
      <circle cx="14" cy="12" r="2" fill="currentColor" className="animate-pulse" />
    </svg>
  );
}
