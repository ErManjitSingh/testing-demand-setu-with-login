"use client";

import { useEffect } from "react";

export default function AuthPageFrame({ children }) {
  useEffect(() => {
    document.documentElement.classList.add("auth-page");
    return () => document.documentElement.classList.remove("auth-page");
  }, []);

  return children;
}
