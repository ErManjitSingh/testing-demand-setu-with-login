"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "ds-package-wishlist";
const EVENT = "ds-wishlist-change";
const EMPTY = Object.freeze([]);

let cachedRaw = null;
let cachedList = EMPTY;

function read() {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedList;
    cachedRaw = raw;
    const parsed = raw ? JSON.parse(raw) : [];
    cachedList = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    cachedList = EMPTY;
  }
  return cachedList;
}

function subscribe(callback) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Saved packages persisted in localStorage and synced across components and tabs. */
export function useWishlist() {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY);

  const toggle = useCallback((id) => {
    const current = read();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable (private mode) — ignore */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const has = useCallback((id) => list.includes(id), [list]);

  return { list, has, toggle, count: list.length };
}
