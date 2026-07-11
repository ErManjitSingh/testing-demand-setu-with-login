import { Suspense } from "react";
import ListingsResultsSkeleton from "@/components/listings/ListingsResultsSkeleton";
import CategoryPills from "@/components/CategoryPills";

export default function ListingsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[min(52vh,420px)] animate-pulse bg-stone-300 sm:h-[min(48vh,480px)]" />

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
        <Suspense fallback={<div className="h-14 animate-pulse rounded-2xl bg-stone-200" />}>
          <CategoryPills activeCategory="all" />
        </Suspense>
        <ListingsResultsSkeleton activeCategory="all" />
      </div>
    </div>
  );
}
