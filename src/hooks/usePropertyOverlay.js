"use client";

import { useEffect } from "react";
import { usePropertyRoomSelection } from "@/contexts/PropertyRoomSelectionContext";

export function usePropertyOverlay(isOpen, id) {
  const ctx = usePropertyRoomSelection();

  useEffect(() => {
    if (!isOpen || !ctx?.registerOverlay) return;
    ctx.registerOverlay(id);
    return () => ctx.unregisterOverlay(id);
  }, [isOpen, id, ctx]);
}
