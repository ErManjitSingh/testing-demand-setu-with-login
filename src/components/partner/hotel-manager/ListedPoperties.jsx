"use client";

import React, { useEffect, useState } from "react";
import {
  PencilSquareIcon,
  TrashIcon,
  CalendarDaysIcon,
  MapPinIcon,
  StarIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/solid";
import Link from "next/link";

import { API_BASE_URL } from "@/lib/apiConfig";
import { getAuthHeaders } from "./utils/api";

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800";

function parseStarCount(value) {
  if (value == null || value === "" || value === "-") return 0;

  const asNumber = Number.parseInt(String(value), 10);
  if (Number.isFinite(asNumber) && asNumber > 0) {
    return Math.min(asNumber, 5);
  }

  const match = String(value).match(/(\d)/);
  if (match) {
    const parsed = Number.parseInt(match[1], 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.min(parsed, 5);
    }
  }

  return 0;
}

function ListedProperites({
  properties = [],
  isLoading = false,
  searchQuery = "",
  propertyType = "all",
  onRefresh,
}) {
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [localProperties, setLocalProperties] = useState(properties);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    setLocalProperties(properties);
  }, [properties]);

  const nextImage = (propertyId, totalImages) => {
    if (!totalImages) return;
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [propertyId]: ((prev[propertyId] || 0) + 1) % totalImages,
    }));
  };
  const prevImage = (propertyId, totalImages) => {
    if (!totalImages) return;
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [propertyId]:
        (prev[propertyId] || 0) === 0
          ? totalImages - 1
          : (prev[propertyId] || 0) - 1,
    }));
  };
  const setImageIndex = (propertyId, index) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [propertyId]: index,
    }));
  };

  const getFilteredProperties = () => {
    if (!localProperties) return [];
    return localProperties.filter((property) => {
      if (
        propertyType &&
        propertyType !== "all" &&
        property?.basicInfo?.propertyType !== propertyType
      ) {
        return false;
      }
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        property?.basicInfo?.propertyName?.toLowerCase().includes(q) ||
        property?.location?.address?.toLowerCase().includes(q) ||
        property?.location?.city?.toLowerCase().includes(q)
      );
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    setDeletingId(id);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/packagemaker/delete-packagemaker/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );
      const result = await response.json();
      if (result.success) {
        setLocalProperties((prev) => prev.filter((p) => p._id !== id));
        onRefresh?.();
      } else {
        alert(result.message || "Failed to delete property.");
      }
    } catch {
      alert("Error deleting property.");
    } finally {
      setDeletingId(null);
    }
  };

  const PropertySkeleton = () => (
    <div className="mb-5 animate-pulse overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="flex flex-col sm:flex-row">
        <div className="h-48 w-full bg-stone-200 sm:h-52 sm:w-72" />
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="h-6 w-2/3 rounded bg-stone-200" />
          <div className="h-4 w-1/2 rounded bg-stone-200" />
          <div className="mt-auto flex gap-2">
            <div className="h-9 w-24 rounded-lg bg-stone-200" />
            <div className="h-9 w-24 rounded-lg bg-stone-200" />
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading && properties.length === 0) {
    return (
      <div>
        {[1, 2, 3].map((index) => (
          <PropertySkeleton key={index} />
        ))}
      </div>
    );
  }

  const filtered = getFilteredProperties();

  if (!isLoading && filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-orange-200/80 bg-gradient-to-b from-white to-orange-50/50 px-6 py-14 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <BuildingOffice2Icon className="h-7 w-7" />
        </span>
        <h3 className="mt-4 text-lg font-bold text-stone-800">
          {searchQuery || propertyType !== "all"
            ? "No properties match your search"
            : "No properties yet"}
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-stone-500">
          {searchQuery || propertyType !== "all"
            ? "Try a different search or property type."
            : "List your first hotel, villa or homestay to start receiving bookings."}
        </p>
        <Link
          href="/partner/hotels/new"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark"
        >
          List New Property
        </Link>
      </div>
    );
  }

  return (
    <div>
      {filtered.map((property) => {
        const images = property?.photosAndVideos?.images?.length
          ? property.photosAndVideos.images
          : [FALLBACK_IMAGE];
        const activeIndex = currentImageIndexes[property._id] || 0;
        const starCount = parseStarCount(
          property?.basicInfo?.hotelStarRating ?? property?.basicInfo?.starRating
        );
        const roomCount = property?.rooms?.data?.length || 0;
        const lowestRate = Math.min(
          ...(property?.rooms?.data
            ?.map((room) => parseInt(room.baseRate, 10))
            .filter((n) => Number.isFinite(n) && n > 0) || [Infinity])
        );

        return (
          <article
            key={property._id}
            className="mb-5 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-lg"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Image */}
              <div className="relative h-52 w-full shrink-0 sm:h-auto sm:w-72 sm:self-stretch">
                <img
                  src={images[activeIndex] || FALLBACK_IMAGE}
                  className="h-full w-full object-cover sm:absolute sm:inset-0"
                  alt={property?.basicInfo?.propertyName || "Property"}
                />
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => prevImage(property._id, images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-1.5 text-stone-700 shadow transition hover:bg-white"
                      aria-label="Previous photo"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => nextImage(property._id, images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-1.5 text-stone-700 shadow transition hover:bg-white"
                      aria-label="Next photo"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <span className="absolute bottom-2 right-2 rounded-md bg-black/55 px-2 py-0.5 text-xs font-semibold text-white">
                      {activeIndex + 1}/{images.length}
                    </span>
                  </>
                )}
                {property?.basicInfo?.propertyType ? (
                  <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-dark shadow">
                    {property.basicInfo.propertyType === "homeStays&Villas"
                      ? "HomeStay & Villa"
                      : property.basicInfo.propertyType}
                  </span>
                ) : null}
              </div>

              {/* Details */}
              <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-extrabold text-stone-900 sm:text-xl">
                      {property?.basicInfo?.propertyName || "Untitled property"}
                    </h2>
                    <div className="mt-1 flex items-center gap-1">
                      {starCount > 0 ? (
                        <>
                          {[...Array(starCount)].map((_, i) => (
                            <StarIcon key={i} className="h-4 w-4 text-amber-400" />
                          ))}
                          <span className="ml-1 text-xs font-semibold text-stone-500">
                            {starCount} star
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-stone-400">
                          Rating pending
                        </span>
                      )}
                    </div>
                  </div>
                  {Number.isFinite(lowestRate) && lowestRate !== Infinity ? (
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">
                        From
                      </p>
                      <p className="text-lg font-extrabold text-brand-dark">
                        ₹{lowestRate.toLocaleString("en-IN")}
                      </p>
                    </div>
                  ) : null}
                </div>

                {property?.location?.address ? (
                  <p className="mt-2 flex items-start gap-1.5 text-sm text-stone-500">
                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <span className="line-clamp-2">{property.location.address}</span>
                  </p>
                ) : null}

                {roomCount > 0 ? (
                  <p className="mt-2 text-xs font-semibold text-stone-500">
                    {roomCount} room {roomCount === 1 ? "type" : "types"}
                  </p>
                ) : null}

                {/* Actions */}
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4 sm:mt-auto">
                  <Link
                    href={`/partner/hotels/update/${property._id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 transition hover:border-brand/40 hover:text-brand-dark"
                  >
                    <PencilSquareIcon className="h-4 w-4 text-brand" />
                    Edit
                  </Link>
                  <Link
                    href={`/partner/hotels/${property._id}/inventory`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 transition hover:border-brand/40 hover:text-brand-dark"
                  >
                    <CalendarDaysIcon className="h-4 w-4 text-brand" />
                    Inventory
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(property._id)}
                    disabled={deletingId === property._id}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                  >
                    <TrashIcon className="h-4 w-4" />
                    {deletingId === property._id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default ListedProperites;
