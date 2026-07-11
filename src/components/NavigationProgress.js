"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  NAVIGATION_START_EVENT,
  shouldStartNavigationForClick,
} from "@/lib/navigationLoading";

function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const tickRef = useRef(null);
  const finishRef = useRef(null);
  const routeKeyRef = useRef(`${pathname}?${search}`);

  const begin = () => {
    if (finishRef.current) {
      window.clearTimeout(finishRef.current);
      finishRef.current = null;
    }
    setActive(true);
    setProgress((value) => (value > 15 ? value : 18));
  };

  const finish = () => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setProgress(100);
    finishRef.current = window.setTimeout(() => {
      setActive(false);
      setProgress(0);
      finishRef.current = null;
    }, 280);
  };

  useEffect(() => {
    const onClick = (event) => {
      const anchor = event.target.closest("a");
      if (!shouldStartNavigationForClick(anchor, pathname, search)) return;
      begin();
    };

    const onProgrammatic = () => begin();

    document.addEventListener("click", onClick, true);
    window.addEventListener(NAVIGATION_START_EVENT, onProgrammatic);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(NAVIGATION_START_EVENT, onProgrammatic);
    };
  }, [pathname, search]);

  useEffect(() => {
    const nextKey = `${pathname}?${search}`;
    if (nextKey === routeKeyRef.current) return;
    routeKeyRef.current = nextKey;
    finish();
  }, [pathname, search]);

  useEffect(() => {
    if (!active) return undefined;

    tickRef.current = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 88) return value;
        return value + Math.random() * 8;
      });
    }, 350);

    return () => {
      if (tickRef.current) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [active]);

  useEffect(
    () => () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      if (finishRef.current) window.clearTimeout(finishRef.current);
    },
    []
  );

  return (
    <>
      <div
        className={`pointer-events-none fixed inset-x-0 top-0 z-[9999] h-1 transition-opacity duration-200 ${
          active ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      >
        <div
          className="h-full bg-brand shadow-[0_0_12px_rgba(234,88,12,0.55)] transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        className={`pointer-events-none fixed inset-0 z-[9998] flex items-center justify-center bg-white/35 backdrop-blur-[1px] transition-opacity duration-200 ${
          active && progress < 100 ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!active}
      >
        <div
          className={`flex flex-col items-center gap-3 rounded-2xl border border-white/80 bg-white/95 px-6 py-5 shadow-xl transition-all duration-200 ${
            active && progress < 100
              ? "scale-100 opacity-100"
              : "scale-95 opacity-0"
          }`}
          role="status"
          aria-live="polite"
          aria-label="Loading page"
        >
          <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand/20 border-t-brand" />
          <p className="text-sm font-bold text-stone-700">Loading…</p>
        </div>
      </div>
    </>
  );
}

export default function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressBar />
    </Suspense>
  );
}
