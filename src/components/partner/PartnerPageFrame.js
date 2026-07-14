"use client";

import { useEffect } from "react";

export default function PartnerPageFrame({ children }) {
  useEffect(() => {
    document.documentElement.classList.add("partner-portal");
    return () => document.documentElement.classList.remove("partner-portal");
  }, []);

  return children;
}
