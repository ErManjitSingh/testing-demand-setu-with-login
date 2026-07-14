"use client";

import React from "react";

function Inventory({
  roomNames,
  handleSave,
  handleAvailabilityChange,
  availabilityValues,
  activeTab,
}) {
  return (
    <div className="space-y-4 pb-16">
      <h3 className="text-sm font-extrabold text-stone-800">
        Update inventory below
      </h3>
      <div className="border-t border-stone-200" />

      <div className="grid grid-cols-1 gap-4">
        {roomNames.map((roomName) => (
          <div
            key={roomName}
            className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
          >
            <h4 className="mb-3 text-sm font-bold text-stone-900">{roomName}</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {["b2b", "b2c", "website"].map((category) => (
                <div key={category}>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-stone-500">
                    {category}
                  </label>
                  <input
                    type="number"
                    placeholder="Availability"
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-semibold text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
                    value={
                      availabilityValues[category]?.[roomName]?.availability?.[0]
                        ?.available || ""
                    }
                    onChange={(e) => {
                      const newAvailability = [
                        {
                          date: new Date().toISOString(),
                          available: parseInt(e.target.value) || 0,
                          sold: 0,
                        },
                      ];
                      handleAvailabilityChange(
                        category,
                        roomName,
                        newAvailability
                      );
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 z-10 -mx-1 border-t border-stone-200 bg-white/95 px-1 py-3 backdrop-blur">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-extrabold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark"
          >
            {activeTab === 0 ? "Save and next" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
