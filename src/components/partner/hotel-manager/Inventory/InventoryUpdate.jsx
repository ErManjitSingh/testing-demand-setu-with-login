"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarIcon,
  ChevronLeftIcon,
  PlusIcon,
  MinusIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { tabs, rateTypes } from "./constants";
import { formatDate } from "@/lib/partner/hotelManagerUtils";
import { API_BASE_URL } from "@/lib/apiConfig";
import { getAuthHeaders } from "../utils/api";
import BulkUpdateModal from "../BulkUpdateModal";



const roomTypes = {
  b2c: [
    { name: "Superior Room with Balcony", availabilityData: Array(7).fill({ available: '', sold: 0 }) },
    { name: "Premium Room with Balcony", availabilityData: Array(7).fill({ available: '', sold: 0 }) },
  ],
  website: [
    { name: "Superior Room with Balcony", availabilityData: Array(7).fill({ available: '', sold: 0 }) },
    { name: "Premium Room with Balcony", availabilityData: Array(7).fill({ available: '', sold: 0 }) },
  ],
  b2b: [
    { name: "Superior Room with Balcony", availabilityData: Array(7).fill({ available: '', sold: 0 }) },
    { name: "Premium Room with Balcony", availabilityData: Array(7).fill({ available: '', sold: 0 }) },
  ],
};

export default function HotelManagementSystem() {
  const params = useParams();
  const propertyId = params?.hotelId || "";
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("b2c");
  const [expandedRooms, setExpandedRooms] = useState({});
  const [expandedRates, setExpandedRates] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [roomData, setRoomData] = useState([]);
  const [inventoryData, setInventoryData] = useState({});
  const [modalShow, setModalShow] = useState(false);
  const [dates, setDates] = useState([]);

  console.log(roomData);

  const initializeHotelData = (dates) => {
    const initialData = {};
    tabs.forEach((tab) => {
      initialData[tab.value] = {};
      roomTypes[tab.value]?.forEach((room) => {
        initialData[tab.value][room.name] = {
          availability: dates?.map((date) => ({
            date: new Date(date).toISOString(),
            available: "",
            sold: 0,
          })),
          rates: rateTypes[tab.value]?.reduce((acc, rate) => {
            acc[rate.name] = {
              1: dates?.map((date) => ({
                date: date.toISOString(),
                value: null,
              })),
              3: dates?.map((date) => ({
                date: date.toISOString(),
                value: null,
              })),
              4: dates?.map((date) => ({
                date: date.toISOString(),
                value: null,
              })),
            };
            return acc;
          }, {}),
        };
      });
    });

    return initialData;
  };

  const [hotelData, setHotelData] = useState(() => initializeHotelData());

  useEffect(() => {
    const initialHotelData = {};
    tabs.forEach(tab => {
      initialHotelData[tab.value] = {};
      roomTypes[tab.value].forEach(room => {
        initialHotelData[tab.value][room.name] = {
          availability: room?.availabilityData?.map(data => ({ ...data })),
          rates: {}
        };
        rateTypes[tab.value].forEach(rate => {
          initialHotelData[tab.value][room.name].rates[rate.name] = {
            2: Array(7).fill(),
            1: Array(7).fill()
          };
        });
      });
    });
    setHotelData(initialHotelData);
  }, []);

  const toggleRoomExpansion = (roomName) => {
    setExpandedRooms(prev => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || {}),
        [roomName]: !(prev[activeTab]?.[roomName] || false)
      }
    }));
  };

  const toggleRateExpansion = (rateName) => {
    setExpandedRates(prev => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || {}),
        [rateName]: !(prev[activeTab]?.[rateName] || false)
      }
    }));
  };

  const isRoomExpanded = (roomName) => expandedRooms[activeTab]?.[roomName] || false;
  const isRateExpanded = (rateName) => expandedRates[activeTab]?.[rateName] || false;

  const handleRateChange = (roomName, rateName, occupancy, dayIndex, value) => {
    const newValue = parseFloat(value);
    setHotelData((prevData) => {
      const currentRates = prevData[activeTab]?.[roomName]?.rates[rateName]?.[occupancy] || [];
      const updatedRates = currentRates.map((rate, index) => {
        if (index === dayIndex) {
          return {
            value: newValue,
            date: rate?.date || new Date().toISOString().split('T')[0],
          };
        }
        if (rate === null) {
          return {
            date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: null,
          };
        }
        return rate;
      });

      return {
        ...prevData,
        [activeTab]: {
          ...prevData[activeTab],
          [roomName]: {
            ...prevData[activeTab][roomName],
            rates: {
              ...prevData[activeTab][roomName].rates,
              [rateName]: {
                ...prevData[activeTab][roomName].rates[rateName],
                [occupancy]: updatedRates,
              },
            },
          },
        },
      };
    });
  };

  const changeWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const handleAvailabilityChange = (roomName, dayIndex, value) => {
    setHotelData((prevData) => ({
      ...prevData,
      [activeTab]: {
        ...prevData[activeTab],
        [roomName]: {
          ...prevData[activeTab][roomName],
          availability: prevData[activeTab][roomName].availability.map((day, index) =>
            index === dayIndex ? {
              ...day,
              available: Number(value),
              date: day.date
            } : day
          ),
        },
      },
    }));
  };

  function updateRoomTypesWithApiData(roomTypes, apiData) {
    const roomNames = apiData.map((room) => room.roomName);
    Object.keys(roomTypes).forEach((category) => {
      roomTypes[category] = roomNames.map((roomName, index) => ({
        ...(roomTypes[category]?.[index] || {}),
        name: roomName,
      }));
    });
    return roomTypes;
  }

  const updatedRoomTypes = updateRoomTypesWithApiData(roomTypes, roomData);

  const [propertyName, setPropertyName] = useState("");

  const fetchRoomData = async () => {
    if (!propertyId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/packagemaker/get-packagemaker-by-id/${propertyId}`,
        { headers: getAuthHeaders() }
      );
      
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);

      const result = await response.json();
      console.log(result);
      
      if (result.success) {
        setPropertyName(result.data?.basicInfo?.propertyName || "");
        const fetchedRoomData = result.data.rooms?.data || [];
        setRoomData(fetchedRoomData);

        const updatedHotelData = {};
        const dates = [];

        tabs.forEach((tab) => {
          const inventory = result.data.inventory[tab.value];
          updatedHotelData[tab.value] = {};
          Object.keys(inventory || {}).forEach((roomName) => {
            const room = inventory[roomName];
            
            // Get dates from room.rates.CP instead of availability
            if (room.rates && room.rates.CP || room.rates && room.rates.MAP) {
              Object.keys(room.rates.CP || room.rates.MAP).forEach(occupancy => {
                if (room.rates.CP[occupancy] && Array.isArray(room.rates.CP[occupancy]) || room.rates.MAP[occupancy] && Array.isArray(room.rates.MAP[occupancy])) {
                  room.rates.CP[occupancy].forEach(rateEntry => {
                    if (rateEntry.date) {
                      const dateObj = new Date(rateEntry.date);
                      if (!dates.some(existingDate => existingDate.toDateString() === dateObj.toDateString())) {
                        dates.push(dateObj);
                      }
                    }
                  });
                  room.rates.MAP[occupancy].forEach(rateEntry => {
                    if (rateEntry.date) {
                      const dateObj = new Date(rateEntry.date);
                      if (!dates.some(existingDate => existingDate.toDateString() === dateObj.toDateString())) {
                        dates.push(dateObj);
                      }
                    }
                  });
                }
              });
            }
            
            updatedHotelData[tab.value][roomName] = {
              availability: room.availability.map((day) => {
                const dateObj = new Date(day.date);
                return {
                  date: dateObj.toISOString(),
                  available: day.available || "",
                  sold: day.sold || 0,
                };
              }),
              rates: {},
            };

            rateTypes[tab.value].forEach((rate) => {
              const rateData = room.rates[rate.name];

              if (rateData && typeof rateData === 'object') {
                updatedHotelData[tab.value][roomName].rates[rate.name] = {
                  1: (rateData[1] || []).map((rateEntry) => ({
                    date: rateEntry.date,
                    value: rateEntry.value || null,
                  })),
                  3: (rateData[3] || []).map((rateEntry) => ({
                    date: rateEntry.date,
                    value: rateEntry.value || null,
                  })),
                  4: (rateData[4] || []).map((rateEntry) => ({
                    date: rateEntry.date,
                    value: rateEntry.value || null,
                  })),
                };
              } else {
                updatedHotelData[tab.value][roomName].rates[rate.name] = {
                  1: Array(7).fill({ date: null, value: null }),
                  3: Array(7).fill({ date: null, value: null }),
                  4: Array(7).fill({ date: null, value: null }),
                };
              }
            });
          });
        });

        setHotelData(updatedHotelData);
        const uniqueDates = [...new Set(dates.map(date => date.toDateString()))].map(date => new Date(date));
        setDates(uniqueDates);
      }
    } catch (error) {
      console.error("Failed to fetch room data:", error);
    }
  };

  useEffect(() => {
    fetchRoomData();
  }, [propertyId]);

  useEffect(() => {
    if (Object.keys(hotelData).length === 0) {
      setHotelData(initializeHotelData());
    }
  }, [hotelData]);

  useEffect(() => {
    if (!Object.keys(hotelData).length) {
      const initialHotelData = {};
      tabs.forEach(tab => {
        initialHotelData[tab.value] = {};
        roomTypes[tab.value].forEach(room => {
          initialHotelData[tab.value][room.name] = {
            availability: Array(7).fill({ available: '', sold: 0 }),
            rates: {},
          };
          rateTypes[tab.value].forEach(rate => {
            initialHotelData[tab.value][room.name].rates[rate.name] = {
              2: Array(7).fill(),
              1: Array(7).fill(),
            };
          });
        });
      });
      setHotelData(initialHotelData);
    }
  }, []);

  useEffect(() => {
    if (roomData.length > 0) {
      setHotelData((prevHotelData) => {
        const updatedData = { ...prevHotelData };
        tabs.forEach((tab) => {
          updatedData[tab.value] = updatedData[tab.value] || {};
          roomData.forEach((room) => {
            updatedData[tab.value][room.roomName] = updatedData[tab.value][room.roomName] || {
              availability: dates?.map((date) => ({ date, available: "", sold: 0 })),
              rates: rateTypes[tab.value]?.reduce((acc, rate) => {
                acc[rate.name] = {
                  1: Array(7).fill(null),
                  2: Array(7).fill(null),
                };
                return acc;
              }, {}),
            };
          });
        });
        return updatedData;
      });
    }
  }, [roomData]);

  const handleSave = async (e) => {
    e.preventDefault();
    const url = `${API_BASE_URL}/api/packagemaker/update-packagemaker/${propertyId}`;

    const payload = {
      ...hotelData,
      step: 7,
    };

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);
      } else {
        console.error("Failed to update property:", response.status, response.statusText);
      }
    } catch (err) {
      console.error("Error occurred while updating property:", err);
    }
  };

  const modalHandler = () => {
    setModalShow(true);
  };

  const closeModal = () => setModalShow(false);

  const occupancyLabel = (occupancy) => {
    if (occupancy === 1) return "2 Guests";
    if (occupancy === 3) return "3 Guests (Extra Bed)";
    if (occupancy === 4) return "4 Guests (No Extra Bed)";
    return `${occupancy} Guests`;
  };

  const dateColumns = dates?.length ? dates : Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-stone-50 pb-28 sm:pb-24">
      <BulkUpdateModal
        modalShow={modalShow}
        closeModal={closeModal}
        hotelData={hotelData}
        propertyId={propertyId}
      />

      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            type="button"
            onClick={() => router.push("/partner/hotels")}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 transition hover:text-brand"
          >
            <ChevronLeftIcon strokeWidth={2} className="h-4 w-4" />
            Back to properties
          </button>

          <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                <BuildingOfficeIcon className="h-6 w-6 text-brand" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-extrabold tracking-tight text-stone-900 sm:text-xl">
                  Inventory &amp; Rates
                </h1>
                <p className="mt-0.5 truncate text-sm font-medium text-stone-500">
                  {propertyName || "Your property"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:justify-end">
              <button
                type="button"
                onClick={fetchRoomData}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-bold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 sm:flex-none"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Refresh
              </button>
              <button
                type="button"
                onClick={modalHandler}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand px-3.5 py-2.5 text-sm font-extrabold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark sm:flex-none"
              >
                <CurrencyDollarIcon className="h-4 w-4" />
                Bulk Update
              </button>
            </div>
          </div>
        </div>

        {/* Channel tabs */}
        <div className="mb-3 flex gap-1 overflow-x-auto rounded-xl border border-stone-200 bg-white p-1 shadow-sm">
          {tabs.map(({ label, value }) => {
            const active = activeTab === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setActiveTab(value)}
                className={`min-w-[5.5rem] flex-1 rounded-lg px-3 py-2.5 text-xs font-extrabold uppercase tracking-wide transition sm:text-sm ${
                  active
                    ? "bg-brand text-white shadow-sm"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <p className="mb-2 text-xs font-medium text-stone-500 sm:hidden">
          Swipe table sideways to see all dates →
        </p>

        {/* Inventory grid */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="max-h-[min(70vh,720px)] overflow-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="sticky top-0 z-20">
                <tr className="bg-stone-900 text-white">
                  <th className="sticky left-0 z-30 min-w-[200px] bg-stone-900 px-3 py-3 text-left sm:min-w-[240px] sm:px-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-brand-light" />
                      <span className="text-xs font-bold uppercase tracking-wide">
                        Rooms &amp; rates
                      </span>
                    </div>
                  </th>
                  {dateColumns.map((date, index) => (
                    <th
                      key={index}
                      className="min-w-[88px] px-2 py-3 text-center sm:min-w-[100px]"
                    >
                      <div className="flex flex-col items-center leading-tight">
                        <span className="text-[10px] font-bold uppercase text-stone-300">
                          {date.toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                        <span className="text-sm font-extrabold">
                          {date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {roomData?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={dateColumns.length + 1}
                      className="px-4 py-12 text-center text-sm text-stone-500"
                    >
                      No rooms found for this property. Add rooms in Edit first.
                    </td>
                  </tr>
                ) : null}

                {roomData &&
                  updatedRoomTypes[activeTab]?.map((roomType, index) => (
                    <React.Fragment key={index}>
                      <tr className="border-t border-stone-100 hover:bg-orange-50/40">
                        <td
                          className="sticky left-0 z-10 cursor-pointer bg-white px-3 py-3 sm:px-4"
                          onClick={() => toggleRoomExpansion(roomType.name)}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                              {isRoomExpanded(roomType.name) ? (
                                <MinusIcon className="h-4 w-4" />
                              ) : (
                                <PlusIcon className="h-4 w-4" />
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-bold text-stone-900">
                                {roomType.name}
                              </p>
                              <p className="text-[11px] font-medium text-stone-500">
                                Availability · tap to expand rates
                              </p>
                            </div>
                          </div>
                        </td>

                        {hotelData[activeTab]?.[roomType.name]?.availability?.map(
                          (day, dayIndex) => (
                            <td key={dayIndex} className="px-1.5 py-2 text-center sm:px-2">
                              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-stone-400">
                                Avail
                              </label>
                              <input
                                type="number"
                                value={day.available}
                                placeholder="0"
                                className="w-full max-w-[4.5rem] rounded-lg border border-stone-200 bg-white px-1.5 py-2 text-center text-sm font-bold text-stone-900 outline-none transition placeholder:text-stone-300 focus:border-brand focus:ring-2 focus:ring-brand/15"
                                onChange={(e) =>
                                  handleAvailabilityChange(
                                    roomType.name,
                                    dayIndex,
                                    e.target.value
                                  )
                                }
                              />
                              <p className="mt-1 text-[10px] font-semibold text-stone-500">
                                {day.sold || 0} sold
                              </p>
                            </td>
                          )
                        )}
                      </tr>

                      {isRoomExpanded(roomType.name) &&
                        rateTypes[activeTab]?.map((rateType, rateIndex) => (
                          <React.Fragment key={`${index}-${rateIndex}`}>
                            <tr className="border-t border-stone-100 bg-stone-50/80">
                              <td
                                className="sticky left-0 z-10 cursor-pointer bg-stone-50 px-3 py-2.5 sm:px-4"
                                onClick={() => toggleRateExpansion(rateType.name)}
                              >
                                <div className="flex items-center gap-2 pl-2 sm:pl-8">
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-stone-200 text-stone-700">
                                    {isRateExpanded(rateType.name) ? (
                                      <MinusIcon className="h-3.5 w-3.5" />
                                    ) : (
                                      <PlusIcon className="h-3.5 w-3.5" />
                                    )}
                                  </span>
                                  <div>
                                    <p className="text-sm font-extrabold text-stone-800">
                                      {rateType.name}
                                    </p>
                                    <p className="text-[10px] font-medium text-stone-500">
                                      Meal plan · expand occupancy
                                    </p>
                                  </div>
                                </div>
                              </td>
                              {dateColumns.map((_, dayIndex) => (
                                <td key={dayIndex} className="bg-stone-50/80" />
                              ))}
                            </tr>

                            {isRateExpanded(rateType.name) &&
                              [1, 3, 4].map((occupancy) => (
                                <tr
                                  key={occupancy}
                                  className="border-t border-stone-100 border-l-4 border-l-brand/40"
                                >
                                  <td className="sticky left-0 z-10 bg-white px-3 py-2 sm:px-4">
                                    <p className="pl-4 text-xs font-bold text-stone-700 sm:pl-12">
                                      {occupancyLabel(occupancy)}
                                    </p>
                                  </td>

                                  {hotelData[activeTab]?.[roomType.name]?.rates[
                                    rateType.name
                                  ]?.[occupancy]?.map((rate, dayIndex) => (
                                    <td
                                      key={dayIndex}
                                      className="px-1.5 py-2 text-center sm:px-2"
                                    >
                                      <input
                                        type="number"
                                        value={rate?.value ?? ""}
                                        placeholder="₹"
                                        onChange={(e) =>
                                          handleRateChange(
                                            roomType.name,
                                            rateType.name,
                                            occupancy,
                                            dayIndex,
                                            e.target.value
                                          )
                                        }
                                        className="w-full max-w-[4.5rem] rounded-lg border border-stone-200 bg-white px-1.5 py-2 text-center text-sm font-bold text-stone-900 outline-none transition placeholder:text-stone-300 focus:border-brand focus:ring-2 focus:ring-brand/15"
                                      />
                                      {rate?.date ? (
                                        <p className="mt-1 text-[9px] font-medium text-stone-400">
                                          {formatDate(rate.date)}
                                        </p>
                                      ) : null}
                                    </td>
                                  )) ||
                                    dateColumns.map((_, dayIndex) => (
                                      <td
                                        key={`empty-${dayIndex}`}
                                        className="px-1.5 py-2 text-center sm:px-2"
                                      >
                                        <input
                                          type="number"
                                          value=""
                                          placeholder="₹"
                                          className="w-full max-w-[4.5rem] rounded-lg border border-stone-200 bg-white px-1.5 py-2 text-center text-sm font-bold text-stone-900 outline-none placeholder:text-stone-300"
                                          readOnly
                                        />
                                      </td>
                                    ))}
                                </tr>
                              ))}
                          </React.Fragment>
                        ))}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sticky save bar — same handleSave logic */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-center text-xs font-medium text-stone-500 sm:text-left sm:text-sm">
            Save before leaving — changes are not auto-saved
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/partner/hotels")}
              className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-stone-700 transition hover:bg-stone-50 sm:flex-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-xl bg-brand px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark sm:flex-none"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
