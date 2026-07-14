"use client";

import React, { useState, useEffect } from "react";

function Rates({
  roomNames,
  availabilityValues,
  setAvailabilityValues,
  dateRange,
  setRatesValues,
  ratesValues,
}) {
  const [selectedCategory, setSelectedCategory] = useState("b2b");

  useEffect(() => {
    const initializedRates = { b2b: {}, b2c: {}, website: {} };

    for (const category of Object.keys(availabilityValues)) {
      for (const roomName of Object.keys(availabilityValues[category])) {
        initializedRates[category][roomName] = {
          rates: {
            EP: { 1: null, 2: null, 3: null, 4: null },
            AP: { 1: null, 2: null, 3: null, 4: null },
            CP: { 1: null, 2: null, 3: null, 4: null },
            MAP: { 1: null, 2: null, 3: null, 4: null },
            // extraBed: { 1: null, 2: null },
            // childCharge: { 1: null, 2: null }
          },
        };
      }
    }
    // setRatesValues(initializedRates);
  }, [availabilityValues]);

  const handleRateChange = (roomName, rateType, occupancyType, value) => {
    setRatesValues((prevState) => ({
      ...prevState,
      [selectedCategory]: {
        ...prevState[selectedCategory],
        [roomName]: {
          ...prevState[selectedCategory][roomName],
          rates: {
            ...prevState[selectedCategory][roomName]?.rates,
            [rateType]: {
              ...prevState[selectedCategory][roomName]?.rates?.[rateType],
              [occupancyType]: value,
            },
          },
        },
      },
    }));
  };

  const transformRatesToSchema = () => {
    const transformed = {};

    for (const category of Object.keys(ratesValues)) {
      transformed[category] = {};

      for (const roomName of Object.keys(ratesValues[category])) {
        transformed[category][roomName] = {};

        ["EP", "AP", "CP", "MAP"].forEach((mealPlan) => {
          transformed[category][roomName][mealPlan] = {
            1: dateRange.map((date) => ({
              date: new Date(date),
              value: ratesValues[category][roomName]?.rates?.[mealPlan]?.[1] || null,
            })),
            2: dateRange.map((date) => ({
              date: new Date(date),
              value: ratesValues[category][roomName]?.rates?.[mealPlan]?.[2] || null,
            })),
            ...(["extraBed", "childCharge"].includes(mealPlan) ? {} : {
              3: dateRange.map((date) => ({
                date: new Date(date),
                value: ratesValues[category][roomName]?.rates?.[mealPlan]?.[3] || null,
              })),
              4: dateRange.map((date) => ({
                date: new Date(date),
                value: ratesValues[category][roomName]?.rates?.[mealPlan]?.[4] || null,
              }))
            })
          };
        });
      }
    }

    console.log("Transformed Rates to Schema:", transformed);
    setRatesValues(transformed);
    return transformed;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-extrabold text-stone-800">Update rates</h3>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="text-xs font-bold uppercase tracking-wide text-stone-500">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-semibold text-stone-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 sm:max-w-xs"
        >
          <option value="b2b">B2B</option>
          <option value="b2c">B2C</option>
          <option value="website">Website</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {roomNames.map((roomName) => (
          <div
            key={roomName}
            className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
          >
            <div className="border-b border-stone-100 bg-stone-50 px-4 py-3">
              <h4 className="text-sm font-bold text-stone-900">{roomName}</h4>
            </div>
            <div className="overflow-x-auto p-3">
              <table className="w-full min-w-[320px] text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-bold uppercase tracking-wide text-stone-500">
                    <th className="p-2">Meal plan</th>
                    <th className="p-2 text-center">Double</th>
                    <th className="p-2 text-center">Triple</th>
                    <th className="p-2 text-center">Quad</th>
                  </tr>
                </thead>
                <tbody>
                  {["EP", "AP", "CP", "MAP"].map((rateType) => (
                    <tr key={rateType} className="border-t border-stone-100">
                      <td className="p-2 font-bold text-stone-800">{rateType}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-center text-sm font-semibold outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                          placeholder="₹"
                          value={
                            ratesValues[selectedCategory]?.[roomName]?.rates?.[
                              rateType
                            ]?.[1] || ""
                          }
                          onChange={(e) =>
                            handleRateChange(
                              roomName,
                              rateType,
                              1,
                              e.target.value
                            )
                          }
                        />
                      </td>
                      {!["extraBed", "childCharge"].includes(rateType) && (
                        <>
                          <td className="p-2">
                            <input
                              type="number"
                              className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-center text-sm font-semibold outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                              placeholder="₹"
                              value={
                                ratesValues[selectedCategory]?.[roomName]
                                  ?.rates?.[rateType]?.[3] || ""
                              }
                              onChange={(e) =>
                                handleRateChange(
                                  roomName,
                                  rateType,
                                  3,
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-center text-sm font-semibold outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                              placeholder="₹"
                              value={
                                ratesValues[selectedCategory]?.[roomName]
                                  ?.rates?.[rateType]?.[4] || ""
                              }
                              onChange={(e) =>
                                handleRateChange(
                                  roomName,
                                  rateType,
                                  4,
                                  e.target.value
                                )
                              }
                            />
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={transformRatesToSchema}
        className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-extrabold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark sm:w-auto"
      >
        Transform and prepare rates
      </button>
    </div>
  );
}

export default Rates;
