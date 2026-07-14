"use client";

import React, { useState } from 'react';
import Modal from './Modal';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Main style file
import 'react-date-range/dist/theme/default.css'; // Theme CSS file
import UpdateInventory from './UpdateInventory';
import { format, eachDayOfInterval } from 'date-fns'; // For handling date ranges

function BulkUpdateModal({ modalShow, closeModal, hotelData, propertyId }) {
  // State to manage the date range
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  // State to track if the date range is confirmed
  const [isRangeConfirmed, setIsRangeConfirmed] = useState(false);

  // State to toggle the visibility of the date range picker
  const [showDatePicker, setShowDatePicker] = useState(false);

  // State to track if user has chosen merge option
  const [hasChosenMergeOption, setHasChosenMergeOption] = useState(false);

  // State to track merge preference
  const [mergeWithPreviousData, setMergeWithPreviousData] = useState(false);

  console.log("BulkUpdateModal - hotelData:", hotelData);
  console.log("BulkUpdateModal - has hotelData:", !!hotelData);
  console.log("BulkUpdateModal - hotelData keys:", hotelData ? Object.keys(hotelData) : []);

  // Function to handle date range selection
  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  // Function to confirm the date range and proceed
  const handleConfirm = () => {
    setIsRangeConfirmed(true);
    setShowDatePicker(false);
  };

  // Function to handle merge option selection
  const handleMergeOptionSelect = (mergeWithPrevious) => {
    setMergeWithPreviousData(mergeWithPrevious);
    setHasChosenMergeOption(true);
    setShowDatePicker(true);
  };

  // Helper function to generate all dates in the selected range
  const generateDateRange = () => {
    const { startDate, endDate } = dateRange[0];
    return eachDayOfInterval({ start: startDate, end: endDate }).map((date) =>
      format(date, 'yyyy-MM-dd')
    );
  };

  // Helper function to find continuous date ranges
  const findContinuousDateRanges = (dates) => {
    if (!dates || dates.length === 0) return [];
    
    const sortedDates = [...new Set(dates)].sort();
    const ranges = [];
    let currentRange = { start: sortedDates[0], end: sortedDates[0] };
    
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const previousDate = new Date(sortedDates[i - 1]);
      
      // Check if dates are consecutive (difference of 1 day)
      const diffTime = currentDate.getTime() - previousDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        // Dates are consecutive, extend current range
        currentRange.end = sortedDates[i];
      } else {
        // Gap found, save current range and start new one
        ranges.push({ ...currentRange });
        currentRange = { start: sortedDates[i], end: sortedDates[i] };
      }
    }
    
    // Add the last range
    ranges.push(currentRange);
    
    return ranges;
  };

  return (
    <Modal show={modalShow} closeModal={closeModal} title="Bulk Update Inventory and Rates">
      <div className="space-y-4">
        {!hasChosenMergeOption && (
          <div>
            <p className="mb-3 text-sm font-semibold text-stone-700 sm:text-base">
              Do you want to merge with previous inventory data?
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => handleMergeOptionSelect(true)}
                className="rounded-xl bg-brand px-4 py-3 text-sm font-extrabold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark sm:flex-1"
              >
                Yes, merge with previous data
              </button>
              <button
                type="button"
                onClick={() => handleMergeOptionSelect(false)}
                className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-50 sm:flex-1"
              >
                No, start fresh
              </button>
            </div>
          </div>
        )}

        {hasChosenMergeOption && (
          <>
            <p className="text-sm font-semibold text-stone-700">
              Select date range to update inventory
            </p>
            {mergeWithPreviousData && (
              <div>
                <p className="mb-2 text-sm font-medium text-stone-600">
                  Your previous selected dates:
                </p>
                <div className="rounded-xl bg-stone-100 p-3 text-center text-xs font-semibold text-stone-700 sm:text-sm">
                  {(() => {
                    let allDates = [];

                    Object.keys(hotelData || {}).forEach((category) => {
                      const categoryData = hotelData[category];

                      Object.keys(categoryData || {}).forEach((roomName) => {
                        const roomData = categoryData[roomName];

                        if (roomData.availability && Array.isArray(roomData.availability)) {
                          roomData.availability.forEach((day) => {
                            if (day.date) {
                              allDates.push(day.date);
                            }
                          });
                        }

                        if (roomData.rates) {
                          Object.keys(roomData.rates).forEach((rateType) => {
                            const rateData = roomData.rates[rateType];

                            Object.keys(rateData || {}).forEach((occupancy) => {
                              if (Array.isArray(rateData[occupancy])) {
                                rateData[occupancy].forEach((rateEntry) => {
                                  if (rateEntry?.date) {
                                    allDates.push(rateEntry?.date);
                                  }
                                });
                              }
                            });
                          });
                        }
                      });
                    });

                    allDates = [...new Set(allDates)].sort();

                    if (allDates.length > 0) {
                      const dateRanges = findContinuousDateRanges(allDates);

                      return dateRanges.map((range, index) => {
                        const startDate = new Date(range.start).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        });
                        const endDate = new Date(range.end).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        });

                        return (
                          <div key={index} className="mb-1 break-words">
                            {startDate} to {endDate}
                          </div>
                        );
                      });
                    }

                    return "No previous dates found";
                  })()}
                </div>
              </div>
            )}
            <div className="relative">
              <input
                type="text"
                value={`${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`}
                readOnly
                onClick={() => setShowDatePicker(true)}
                className="mb-3 w-full cursor-pointer rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              />

              {showDatePicker && (
                <div className="z-10 mb-3 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
                  <div className="max-w-full overflow-x-auto">
                    <DateRangePicker
                      ranges={dateRange}
                      onChange={handleSelect}
                      moveRangeOnFirstSelection={false}
                      editableDateInputs={true}
                      showPreview={true}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex justify-end border-t border-stone-100 p-3">
                    <button
                      type="button"
                      onClick={handleConfirm}
                      className="rounded-xl bg-brand px-4 py-2 text-sm font-extrabold text-white transition hover:bg-brand-dark"
                    >
                      Confirm range
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {isRangeConfirmed && (
          <UpdateInventory
            dateRange={generateDateRange()}
            hotelData={hotelData}
            propertyId={propertyId}
            mergeWithPreviousData={mergeWithPreviousData}
          />
        )}
      </div>
    </Modal>
  );
}

export default BulkUpdateModal;
