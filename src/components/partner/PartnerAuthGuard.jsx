"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePartnerAuth } from "@/hooks/usePartnerAuth";

export default function PartnerAuthGuard({ children }) {
  const { ready, isLoggedIn } = usePartnerAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !isLoggedIn) {
      router.replace("/list-your-property");
    }
  }, [ready, isLoggedIn, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-stone-500">
        Loading partner dashboard…
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return children;
}
