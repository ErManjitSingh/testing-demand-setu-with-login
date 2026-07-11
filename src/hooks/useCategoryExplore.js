"use client";

import { useCallback, useState } from "react";
import CategoryExploreModal from "@/components/CategoryExploreModal";
import { resolveExploreCategory } from "@/lib/categoryExplore";

export function useCategoryExplore() {
  const [exploreCategory, setExploreCategory] = useState(null);

  const openExplore = useCallback((categoryOrId) => {
    setExploreCategory(resolveExploreCategory(categoryOrId));
  }, []);

  const closeExplore = useCallback(() => {
    setExploreCategory(null);
  }, []);

  const modal = exploreCategory ? (
    <CategoryExploreModal category={exploreCategory} onClose={closeExplore} />
  ) : null;

  return { openExplore, closeExplore, modal, exploreCategory };
}
