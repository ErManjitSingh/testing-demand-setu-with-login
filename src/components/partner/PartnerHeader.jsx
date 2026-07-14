"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRightStartOnRectangleIcon,
  ArrowLeftIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

import Logo from "@/components/Logo";
import { usePartnerAuth } from "@/hooks/usePartnerAuth";
import { clearPartnerSession } from "@/lib/packagemakerPartnerApi";

export default function PartnerHeader() {
  const router = useRouter();
  const { user } = usePartnerAuth();
  const [signingOut, setSigningOut] = useState(false);

  const displayName =
    user?.name || user?.account?.name || user?.email || "Partner";
  const initial = String(displayName).trim().charAt(0).toUpperCase() || "P";

  const handleSignOut = () => {
    setSigningOut(true);
    clearPartnerSession();
    router.replace("/list-your-property");
  };

  return (
    <header className="partner-header sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/partner/hotels"
            className="inline-flex shrink-0 items-center transition hover:opacity-90"
          >
            <Logo size="sm" />
          </Link>
          <span className="hidden select-none text-stone-300 sm:inline">|</span>
          <span className="hidden items-center gap-1.5 text-sm font-bold text-stone-700 sm:inline-flex">
            <BuildingOffice2Icon className="h-4 w-4 text-brand" />
            Partner Dashboard
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/list-your-property"
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-bold text-stone-600 transition hover:border-brand/40 hover:text-brand-dark sm:px-3 sm:text-sm"
            title="Back to partner home"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-extrabold text-white">
              {initial}
            </span>
            <span className="hidden max-w-[160px] truncate text-sm font-semibold text-stone-700 md:inline">
              {displayName}
            </span>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-bold text-stone-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-60 sm:text-sm"
          >
            <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
