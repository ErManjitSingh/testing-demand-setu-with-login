"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function useIsMobile(breakpoint = 639) {
  const query = `(max-width: ${breakpoint}px)`;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return isMobile;
}

export default function MobilePickerSheet({ open, onClose, title, children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[500] sm:hidden" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[min(88vh,640px)] flex-col rounded-t-3xl bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.15)]">
        <div className="flex shrink-0 flex-col items-center border-b border-stone-100 px-4 pb-3 pt-3">
          <span className="mb-3 h-1 w-10 rounded-full bg-stone-200" aria-hidden />
          {title && (
            <p className="text-center text-sm font-bold text-foreground">{title}</p>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
