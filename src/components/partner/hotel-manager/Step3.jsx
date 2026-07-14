"use client";

import React, { useState, useEffect } from "react";

const amenitiesData = {
  mandatory: [
    "Air Conditioning", "Laundry", "Newspaper", "Parking",
    "Room service", "Smoke detector", "Smoking rooms",
    "Swimming Pool", "Wifi", "Lounge", "Reception", "Bar",
    "Restaurant", "Luggage assistance", "Wheelchair",
    "Gym/ Fitness centre", "CCTV", "Fire extinguishers",
    "Airport Transfers", "First-aid services"
  ],
  basicFacilities: [
    "Elevator/ Lift", "Housekeeping", "Kitchen/Kitchenette", "LAN",
    "Power backup", "Refrigerator", "Umbrellas", "Washing Machine",
    "Laundromat", "EV Charging Station", "Driver's Accommodation"
  ],
  generalServices: [
    "Bellboy service", "Caretaker", "Concierge", "Multilingual Staff",
    "Luggage storage", "Specially abled assistance", "Wake-up Call / Service",
    "Butler Services", "Doctor on call", "Medical centre", "Pool/ Beach towels"
  ],
  outdoorActivitiesAndSports: [
    "Beach", "Bonfire", "Golf", "Kayaks", "Canoeing", "Outdoor sports",
    "Snorkelling", "Telescope", "Water sports", "Skiing", "Jungle Safari", "Cycling"
  ],
  commonArea: [
    "Balcony/ Terrace", "Fireplace", "Lawn", "Library",
    "Seating Area", "Sun Deck", "Verandah", "Jacuzzi"
  ],
  foodAndDrink: [
    "Dining Area", "Kitchen"
  ],
  healthAndWellness: [
    "Gym", "Spa", "Sauna"
  ],
  businessCenterAndConferences: [
    "Meeting Room", "Conference Hall"
  ],
  beautyAndSpa: [
    "Beauty Services", "Spa Services"
  ],
  security: [
    "CCTV", "Fire extinguishers"
  ],
  transfers: [
    "Airport Transfer", "Shuttle Service"
  ],
  entertainment: [
    "Game Room", "TV"
  ],
  shopping: [
    "Gift Shop", "Mini Market"
  ],
  paymentServices: [
    "Card Payment", "Online Payment"
  ],
  indoorActivitiesAndSports: [
    "Indoor Pool", "Table Tennis"
  ],
  familyAndKids: [
    "Kids Play Area", "Babysitting"
  ],
  petEssentials: [
    "Pet Friendly", "Pet Food"
  ]
};

const categories = [
  "mandatory", "basicFacilities", "generalServices",
  "outdoorActivitiesAndSports", "commonArea",
  "foodAndDrink", "healthAndWellness", 
  "businessCenterAndConferences", "beautyAndSpa",
  "security", "transfers", "entertainment", 
  "shopping", "paymentServices", 
  "indoorActivitiesAndSports", "familyAndKids", 
  "petEssentials"
];

export default function Step3({ formData, setFormData }) {
  const [selectedCategory, setSelectedCategory] = useState("mandatory");

  // Ensure selected amenities are initialized from formData
  const [selectedAmenities, setSelectedAmenities] = useState(() => {
    // Initialize selectedAmenities with default empty values for each category
    const initializedAmenities = Object.fromEntries(
      categories.map(category => [
        category,
        formData.amenities[category] || Object.fromEntries(
          amenitiesData[category]?.map(amenity => [amenity, ""]) || []
        )
      ])
    );
    return initializedAmenities;
  });

  useEffect(() => {
    // Update formData with selected amenities
    setFormData(prevFormData => ({
      ...prevFormData,
      amenities: selectedAmenities
    }));
  }, [selectedAmenities, setFormData]);

  const handleAmenitySelection = (category, amenity, value) => {
    setSelectedAmenities(prevState => {
      const updatedState = {
        ...prevState,
        [category]: {
          ...prevState[category],
          [amenity]: value,
        }
      };
      return updatedState;
    });
  };

  const formatCategory = (category) => {
    return category
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, str => str.toUpperCase());
  };

  return (
    <div className="w-full">
      <div className="mb-5">
        <h2 className="text-lg font-extrabold tracking-tight text-stone-900 sm:text-xl">
          Property amenities
        </h2>
        <p className="mt-1 text-sm font-medium text-stone-500">
          Select all amenities available at your property. Mandatory answers help guests book faster.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200">
        <div className="flex flex-col md:flex-row">
          <div className="flex gap-1 overflow-x-auto border-b border-stone-200 bg-stone-50 p-2 md:w-56 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r md:max-h-[520px]">
            {categories.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 rounded-lg px-3 py-2.5 text-left text-xs font-bold transition sm:text-sm ${
                    active
                      ? "bg-brand text-white shadow-sm"
                      : "text-stone-700 hover:bg-white"
                  }`}
                >
                  {formatCategory(category)}
                </button>
              );
            })}
          </div>

          <div className="flex-1 divide-y divide-stone-100 p-3 sm:p-4">
            {amenitiesData[selectedCategory]?.length ? (
              amenitiesData[selectedCategory].map((amenity, index) => (
                <div
                  key={amenity}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-sm font-semibold text-stone-800">{amenity}</p>
                  <div className="flex gap-2">
                    {["No", "Yes"].map((option) => {
                      const selected =
                        selectedAmenities[selectedCategory]?.[amenity] === option;
                      return (
                        <label
                          key={option}
                          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                            selected
                              ? "border-brand bg-brand/10 text-brand-dark"
                              : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`radio-${selectedCategory}-${index}`}
                            checked={selected}
                            onChange={() =>
                              handleAmenitySelection(
                                selectedCategory,
                                amenity,
                                option
                              )
                            }
                            className="accent-[var(--color-brand,#ea580c)]"
                          />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-stone-500">
                No amenities available for this category.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
