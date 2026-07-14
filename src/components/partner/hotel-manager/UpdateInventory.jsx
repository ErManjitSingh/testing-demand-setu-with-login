"use client";

import React, { useState } from "react";
import Inventory from "./BulkUpdate/inventory";
import Rates from "./BulkUpdate/Rates";
import { API_BASE_URL } from "@/lib/apiConfig";
import { getAuthHeaders } from "./utils/api";

function UpdateInventory({ dateRange, hotelData, propertyId, mergeWithPreviousData }) {
  const [activeTab, setActiveTab] = useState(0);
  const roomNames = Object.keys(hotelData.b2b); // Assuming roomNames comes from hotelData
  const [availabilityValues, setAvailabilityValues] = useState({
    b2b: {},
    b2c: {},
    website: {},
  });
  const [ratesValues, setRatesValues] = useState({
    b2b: {},
    b2c: {},
    website: {},
  });

  console.log("UpdateInventory - hotelData:", hotelData);
  console.log("UpdateInventory - mergeWithPreviousData:", mergeWithPreviousData);
  console.log("UpdateInventory - roomNames:", roomNames);
  console.log("UpdateInventory - hotelData.b2b:", hotelData?.b2b);
  console.log("UpdateInventory - hotelData.b2c:", hotelData?.b2c);
  console.log("UpdateInventory - hotelData.website:", hotelData?.website);
  console.log("UpdateInventory - hotelData.b2b keys:", Object.keys(hotelData?.b2b || {}));
  console.log("UpdateInventory - hotelData.b2c keys:", Object.keys(hotelData?.b2c || {}));
  console.log("UpdateInventory - hotelData.website keys:", Object.keys(hotelData?.website || {}));

  console.log(ratesValues)

  const handleAvailabilityChange = (category, roomName, newAvailability) => {
    // Update the availability based on input value
    setAvailabilityValues((prevState) => ({
      ...prevState,
      [category]: {
        ...prevState[category],
        [roomName]: {
          ...prevState[category][roomName],
          availability: newAvailability,
        },
      },
    }));
  };

  const handleSave = async () => {
    console.log("Availability Values (B2B):", availabilityValues.b2b);
    console.log("Rates Values (B2B):", ratesValues.b2b);
  
    if (activeTab === 0) {
      // Move to Rates tab
      setActiveTab(1);
      return;
    }
  
    // Combine both availability and rates data
    const combineRoomData = (category) => {
      const combinedCategoryData = {};
      Object.keys(availabilityValues[category]).forEach((roomName) => {
        const roomAvailability = availabilityValues[category][roomName]?.availability || [];
        const roomRates = ratesValues[category][roomName] || {};
  
        // Transform rates data into the expected structure
        const transformedRates = {};
        Object.keys(roomRates).forEach((mealPlan) => {
          transformedRates[mealPlan] = {
            1: roomRates[mealPlan]?.[1]?.map(({ date, value }) => ({
              date: new Date(date).toISOString(),
              value: value || null,
            })) || [],
            // 2: roomRates[mealPlan]?.[2]?.map(({ date, value }) => ({
            //   date: new Date(date).toISOString(),
            //   value: value || null,
            // })) || [],
            3: roomRates[mealPlan]?.[3]?.map(({ date, value }) => ({
              date: new Date(date).toISOString(),
              value: value || null,
            })) || [],
            4: roomRates[mealPlan]?.[4]?.map(({ date, value }) => ({
              date: new Date(date).toISOString(),
              value: value || null,
            })) || [],
          };
        });
  
        // Handle special rate types
        if (roomRates.childCharge) {
          transformedRates.childCharge = {
            1: roomRates.childCharge[1]?.map(({ date, value }) => ({
              date: new Date(date).toISOString(),
              value: value || null,
            })) || [],
            2: roomRates.childCharge[2]?.map(({ date, value }) => ({
              date: new Date(date).toISOString(),
              value: value || null,
            })) || [],
          };
        }
  
        if (roomRates.extraBed) {
          transformedRates.extraBed = {
            1: roomRates.extraBed[1]?.map(({ date, value }) => ({
              date: new Date(date).toISOString(),
              value: value || null,
            })) || [],
            2: roomRates.extraBed[2]?.map(({ date, value }) => ({
              date: new Date(date).toISOString(),
              value: value || null,
            })) || [],
          };
        }
  
        combinedCategoryData[roomName] = {
          availability: roomAvailability,
          rates: transformedRates,
        };
      });
      return combinedCategoryData;
    };
  
    const combinedData = {
      b2b: combineRoomData("b2b"),
      b2c: combineRoomData("b2c"),
      website: combineRoomData("website"),
    };
  
    // Map availability data to the required date range, using input availability values
    const mapAvailabilityToDates = (category, roomName) => {
      const availability = [];
      dateRange.forEach((date) => {
        const availableValue =
          availabilityValues[category]?.[roomName]?.availability[0]?.available || 10; // Default to 10 if no input is available
        availability.push({
          date: new Date(date).toISOString(), // Convert date to ISO format
          available: availableValue, // Ensure `available` is a number, not an array
          sold: 0, // Set default sold value
        });
      });
      return availability;
    };
  
    // Update availability based on the date range for each room in each category
    Object.keys(combinedData).forEach((category) => {
      Object.keys(combinedData[category]).forEach((roomName) => {
        combinedData[category][roomName].availability = mapAvailabilityToDates(category, roomName);
      });
    });

    // If merging with previous data, combine with existing hotelData
    let finalData = combinedData;
    if (mergeWithPreviousData && hotelData) {
      console.log("Merging with previous data...");
      console.log("Existing hotelData:", hotelData);
      console.log("New combinedData:", combinedData);
      
      // Check if hotelData has actual content
      const hasExistingData = Object.keys(hotelData.b2b || {}).length > 0 || 
                              Object.keys(hotelData.b2c || {}).length > 0 || 
                              Object.keys(hotelData.website || {}).length > 0;
      
      console.log("Has existing data:", hasExistingData);
      console.log("B2B keys:", Object.keys(hotelData.b2b || {}));
      console.log("B2C keys:", Object.keys(hotelData.b2c || {}));
      console.log("Website keys:", Object.keys(hotelData.website || {}));
      
      if (hasExistingData) {
        // Merge logic: Keep existing data and add new data for new dates
        finalData = {
          b2b: {},
          b2c: {},
          website: {},
        };

        // For each category (b2b, b2c, website)
        ['b2b', 'b2c', 'website'].forEach(category => {
          finalData[category] = {};
          
          // Get all room names from both existing and new data
          const existingRooms = Object.keys(hotelData[category] || {});
          const newRooms = Object.keys(combinedData[category] || {});
          const allRooms = [...new Set([...existingRooms, ...newRooms])];
          
          allRooms.forEach(roomName => {
            const existingRoom = hotelData[category]?.[roomName];
            const newRoom = combinedData[category]?.[roomName];
            
            if (existingRoom && newRoom) {
              // Merge existing and new data
              // Smart merge availability: Update existing availability for overlapping dates, add new availability for new dates
              const existingAvailability = existingRoom.availability || [];
              const newAvailability = newRoom.availability || [];
              const mergedAvailability = [...existingAvailability];
              
              console.log(`Merging availability for ${category}/${roomName}:`);
              console.log(`Existing availability:`, existingAvailability);
              console.log(`New availability:`, newAvailability);
              
              newAvailability.forEach(newAvail => {
                if (newAvail.date && newAvail.available !== null && newAvail.available !== undefined) {
                  // Find if there's existing availability for this date
                  const existingAvailIndex = mergedAvailability.findIndex(existingAvail => 
                    existingAvail.date && new Date(existingAvail.date).toDateString() === new Date(newAvail.date).toDateString()
                  );
                  
                  if (existingAvailIndex !== -1) {
                    // Update existing availability for this date
                    console.log(`Updating existing availability for date ${newAvail.date} from ${mergedAvailability[existingAvailIndex].available} to ${newAvail.available}`);
                    mergedAvailability[existingAvailIndex] = {
                      ...mergedAvailability[existingAvailIndex],
                      available: newAvail.available,
                      sold: newAvail.sold || mergedAvailability[existingAvailIndex].sold
                    };
                  } else {
                    // Add new availability for new date
                    console.log(`Adding new availability for date ${newAvail.date}: ${newAvail.available}`);
                    mergedAvailability.push(newAvail);
                  }
                }
              });
              
              console.log(`Final merged availability:`, mergedAvailability);
              
              finalData[category][roomName] = {
                availability: mergedAvailability,
                rates: {}
              };
              
              // Merge rates
              const existingRates = existingRoom.rates || {};
              const newRates = newRoom.rates || {};
              const allRateTypes = [...new Set([...Object.keys(existingRates), ...Object.keys(newRates)])];
              
              allRateTypes.forEach(rateType => {
                finalData[category][roomName].rates[rateType] = {};
                
                // Get all occupancy levels
                const existingOccupancy = Object.keys(existingRates[rateType] || {});
                const newOccupancy = Object.keys(newRates[rateType] || {});
                const allOccupancy = [...new Set([...existingOccupancy, ...newOccupancy])];
                
                allOccupancy.forEach(occupancy => {
                  const existingRatesArray = existingRates[rateType]?.[occupancy] || [];
                  const newRatesArray = newRates[rateType]?.[occupancy] || [];
                  
                  // Smart merge: Update existing rates for overlapping dates, add new rates for new dates
                  const mergedRates = [...existingRatesArray];
                  
                  console.log(`Merging rates for ${category}/${roomName}/${rateType}/${occupancy}:`);
                  console.log(`Existing rates:`, existingRatesArray);
                  console.log(`New rates:`, newRatesArray);
                  
                  newRatesArray.forEach(newRate => {
                    if (newRate.date && newRate.value !== null && newRate.value !== undefined) {
                      // Find if there's an existing rate for this date
                      const existingRateIndex = mergedRates.findIndex(existingRate => 
                        existingRate.date && new Date(existingRate.date).toDateString() === new Date(newRate.date).toDateString()
                      );
                      
                      if (existingRateIndex !== -1) {
                        // Update existing rate for this date
                        console.log(`Updating existing rate for date ${newRate.date} from ${mergedRates[existingRateIndex].value} to ${newRate.value}`);
                        mergedRates[existingRateIndex] = {
                          ...mergedRates[existingRateIndex],
                          value: newRate.value
                        };
                      } else {
                        // Add new rate for new date
                        console.log(`Adding new rate for date ${newRate.date}: ${newRate.value}`);
                        mergedRates.push(newRate);
                      }
                    }
                  });
                  
                  console.log(`Final merged rates:`, mergedRates);
                  finalData[category][roomName].rates[rateType][occupancy] = mergedRates;
                });
              });
            } else if (existingRoom) {
              // Only existing data
              finalData[category][roomName] = existingRoom;
            } else if (newRoom) {
              // Only new data
              finalData[category][roomName] = newRoom;
            }
          });
        });
        
        console.log("Merged data:", finalData);
      } else {
        console.log("No existing data found, using only new data");
      }
    } else {
      console.log("Not merging - using only new data");
    }
  
    const payloadToSend = {
      ...finalData,
      step: 7,
    };
  
    console.log("Payload to send:", payloadToSend);
  
    const url = `${API_BASE_URL}/api/packagemaker/update-packagemaker/${propertyId}`;
  
    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payloadToSend),
      });
  
      if (response.ok) {
        const result = await response.json();
        alert("Data saved successfully!");
        // Refresh the page
      } else {
        alert("Failed to save data.");
      }
    } catch (err) {
      alert("Error occurred while saving data.");
    }
  };
  

  return (
    <div className="relative max-h-[60vh] space-y-4 overflow-y-auto pb-20">
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-stone-200 bg-stone-50 p-1">
        {["BULK UPDATE INVENTORY", "BULK UPDATE RATES"].map((tab, index) => (
          <button
            key={index}
            type="button"
            className={`min-w-[10rem] flex-1 rounded-lg px-3 py-2.5 text-[11px] font-extrabold uppercase tracking-wide transition sm:text-xs ${
              index === activeTab
                ? "bg-brand text-white shadow-sm"
                : "text-stone-600 hover:bg-white hover:text-stone-900"
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <Inventory
          roomNames={roomNames}
          handleSave={handleSave}
          handleAvailabilityChange={handleAvailabilityChange}
          availabilityValues={availabilityValues}
          activeTab={activeTab}
        />
      )}

      {activeTab === 1 && (
        <Rates
          roomNames={roomNames}
          availabilityValues={availabilityValues}
          setAvailabilityValues={setAvailabilityValues}
          ratesValues={ratesValues}
          setRatesValues={setRatesValues}
          dateRange={dateRange}
        />
      )}

      {activeTab === 2 && (
        <div>
          <h3 className="mb-2 text-sm font-extrabold text-stone-800">
            UPDATE RESTRICTIONS BELOW
          </h3>
          <div className="mb-4 border-t border-stone-200" />
        </div>
      )}

      {activeTab === 1 && (
        <div className="sticky bottom-0 z-10 -mx-1 border-t border-stone-200 bg-white/95 px-1 py-3 backdrop-blur">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-extrabold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdateInventory;
