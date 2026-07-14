"use client";

import React, { useEffect } from "react";

const Modal = ({ show, closeModal, title, children, css }) => {
  useEffect(() => {
    if (!show) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") closeModal?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [show, closeModal]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-[1px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={closeModal}
    >
      <div
        className={`relative flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl ${css || ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-200 px-4 py-3 sm:px-6 sm:py-4">
          {title ? (
            <h2 className="pr-8 text-base font-extrabold text-stone-900 sm:text-lg">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={closeModal}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-2xl leading-none text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 sm:right-4 sm:top-3.5"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
