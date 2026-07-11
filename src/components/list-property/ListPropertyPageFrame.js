"use client";

import { useEffect } from "react";

export default function ListPropertyPageFrame({ children }) {
  useEffect(() => {
    document.documentElement.classList.add("list-property-page");
    return () => document.documentElement.classList.remove("list-property-page");
  }, []);

  return children;
}
