"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
  Button,
  Input,
  Select,
  Option,
  Checkbox,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/apiConfig";
import { getAuthHeaders } from "../utils/api";

import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function BulkUpdateTabs() {
  const params = useParams();
  const propertyId = params?.hotelId || "";
  const [activeTab, setActiveTab] = useState("rates");
  const [showCalendar, setShowCalendar] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [roomData, setRoomData] = useState([]);
  const [hotelData, setHotelData] = useState();
  const router = useRouter();
  const tabs = [
    { label: "B2C", value: "b2c" },
    { label: "WEBSITE", value: "website" },
    { label: "B2B", value: "b2b" },
  ];
  const [propertyName, setPropertyName] = useState("");
console.log(propertyName);

  const [sectionData, setSectionData] = useState({
    inventory: {
      dateRange: [
        {
          startDate: new Date(),
          endDate: new Date(),
          key: "selection",
        },
      ],
      selectedDays: Array(7).fill(true),
      "Superior Room with Balcony": "",
      "Premium Room with Balcony": "",
    },
    rates: {
      dateRange: [
        {
          startDate: new Date(),
          endDate: new Date(),
          key: "selection",
        },
      ],
      selectedDays: Array(7).fill(true),
      contractType: "B2C",
      showNettRate: false,
      updateExtraCharges: false,
      rooms: {
        "Superior Room with Balcony": {
          EP: { 2: "", 1: "" },
          CP: { 2: "", 1: "" },
          MAP: { 2: "", 1: "" },
          AP: { 2: "", 1: "" },
        },
        "Premium Room with Balcony": {
          EP: { 2: "", 1: "" },
          CP: { 2: "", 1: "" },
          MAP: { 2: "", 1: "" },
          AP: { 2: "", 1: "" },
        },
      },
    },
    restrictions: {
      dateRange: [
        {
          startDate: new Date(),
          endDate: new Date(),
          key: "selection",
        },
      ],
      selectedDays: Array(7).fill(true),
      blockInventory: false,
      unblockInventory: false,
      closeToArrival: false,
      inactivateCTA: false,
      closeToDeparture: false,
      inactivateCTD: false,
      minimumLengthOfStay: "",
      cutoff: "",
    },
  });

  useEffect(() => {
    if (location.state && location.state.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location]);

  const days = ["M", "T", "W", "T", "F", "S", "S"];

  const toggleDay = (index) => {
    console.log(sectionData);

    setSectionData((prevData) => ({
      ...prevData,
      [activeTab]: {
        ...prevData[activeTab],
        selectedDays: prevData[activeTab].selectedDays.map((day, i) =>
          i === index ? !day : day
        ),
      },
    }));
  };

  const formatDateRange = (range) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    const start = range[0].startDate.toLocaleDateString("en-US", options);
    const end = range[0].endDate.toLocaleDateString("en-US", options);
    return `${start} - ${end}`;
  };

  const handleInputChange = (section, key, value) => {
    setSectionData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [key]: value,
      },
    }));
  };

  const handleRateChange = (room, mealPlan, occupancy, value) => {
    setSectionData((prevData) => ({
      ...prevData,
      rates: {
        ...prevData.rates,
        rooms: {
          ...prevData.rates.rooms,
          [room]: {
            ...prevData.rates.rooms[room],
            [mealPlan]: {
              ...prevData.rates.rooms[room][mealPlan],
              [occupancy]: value,
            },
          },
        },
      },
    }));
  };

  const handleDateRangeChange = (item) => {
    setSectionData((prevData) => ({
      ...prevData,
      [activeTab]: {
        ...prevData[activeTab],
        dateRange: [item.selection],
      },
    }));
  };

  // Fetch room data from API
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!propertyId) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/packagemaker/get-packagemaker-by-id/${propertyId}`,
          { headers: getAuthHeaders() }
        );
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);

        const result = await response.json();
        if (result.success) {
          const fetchedRoomData = result.data.rooms?.data || [];
          setRoomData(fetchedRoomData);

          const updatedHotelData = {};
          tabs.forEach((tab) => {
            const inventory = result.data.inventory[tab.value];
            updatedHotelData[tab.value] = {};
            Object.keys(inventory || {}).forEach((roomName) => {
              const room = inventory[roomName];
              updatedHotelData[tab.value][roomName] = {
                availability: room.availability.map((day) => ({ ...day })),
                rates: rateTypes[tab.value].reduce((acc, rate) => {
                  acc[rate.name] = {
                    1: room.rates[rate.name]?.[1] || [],
                    2: room.rates[rate.name]?.[2] || [],
                  };
                  return acc;
                }, {}),
              };
            });
          });

          // Update state only if data has changed
          setHotelData((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(updatedHotelData)) {
              return updatedHotelData;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Failed to fetch room data:", error);
      }
    };

    fetchRoomData();
  }, [propertyId]);

  const renderInventoryContent = () => (
    <Card className="bg-white shadow-md">
      <CardHeader
        floated={false}
        shadow={false}
        className="flex items-center justify-between rounded-none px-4 py-3 bg-white border-b"
      >
        <Typography variant="h6" color="blue-gray">
          UPDATE INVENTORY BELOW
        </Typography>
        <Button variant="text" color="blue" size="sm" className="normal-case">
          SET RESTRICTIONS
        </Button>
      </CardHeader>
      <CardBody>
        <div className="flex justify-between gap-6">
          {Object.keys(sectionData.inventory)
            .filter((key) => key !== "dateRange" && key !== "selectedDays")
            .map((room, index) => (
              <div key={index}>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="mb-2 font-medium"
                >
                  {room}
                </Typography>
                <Input
                  type="number"
                  placeholder="Enter inventory"
                  className="!border !border-gray-300 bg-white text-gray-900 max-w-[200px]"
                  labelProps={{ className: "hidden" }}
                  value={sectionData.inventory[room]}
                  onChange={(e) =>
                    handleInputChange("inventory", room, e.target.value)
                  }
                />
              </div>
            ))}
        </div>
      </CardBody>
    </Card>
  );

  const renderRatesContent = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Select
            label="Choose the contract type"
            value={sectionData.rates.contractType}
            onChange={(val) => handleInputChange("rates", "contractType", val)}
          >
            <Option value="B2C">B2C</Option>
            <Option value="B2B">B2B</Option>
            <Option value="WEBSITE">WEBSITE</Option>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <Checkbox
            label="Show Nett Rate"
            checked={sectionData.rates.showNettRate}
            onChange={() =>
              handleInputChange(
                "rates",
                "showNettRate",
                !sectionData.rates.showNettRate
              )
            }
          />
          <Checkbox
            label="Update Extra Guest Charges"
            checked={sectionData.rates.updateExtraCharges}
            onChange={() =>
              handleInputChange(
                "rates",
                "updateExtraCharges",
                !sectionData.rates.updateExtraCharges
              )
            }
          />
        </div>
      </div>

      {Object.entries(sectionData.rates.rooms).map(
        ([room, mealPlans], index) => (
          <Accordion
            key={index}
            open={openAccordion === index}
            className="mb-4 bg-white"
          >
            <AccordionHeader
              onClick={() =>
                setOpenAccordion(openAccordion === index ? null : index)
              }
              className="bg-white px-4 py-2"
            >
              <div className="flex items-center justify-between w-full">
                <div>
                  <Typography variant="h6" color="blue-gray">
                    {room}
                  </Typography>
                  <Typography variant="small" color="gray">
                    Base Occupancy: 2
                  </Typography>
                </div>
                <Button
                  variant="text"
                  color="blue"
                  className="flex items-center gap-2"
                >
                  RATE RESTRICTIONS
                  <ChevronDownIcon strokeWidth={2} className="h-4 w-4" />
                </Button>
              </div>
            </AccordionHeader>
            <AccordionBody className="px-4 py-4">
              {Object.entries(mealPlans).map(([mealPlan, occupancies]) => (
                <div key={mealPlan} className="mb-6">
                  <Typography variant="h6" color="blue-gray" className="mb-4">
                    {mealPlan}
                  </Typography>
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-4">
                    <Typography variant="small" color="orange-800">
                      If you have not set rates for any occupancy yet, we will
                      pick the next higher-level occupancy rate here.
                    </Typography>
                  </div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-2"
                  >
                    Base Rates:
                  </Typography>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(occupancies).map(([occupancy, rate]) => (
                      <div key={occupancy} className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded">
                          {occupancy}
                        </div>
                        <Input
                          type="number"
                          placeholder="Enter rate"
                          className="!border !border-gray-300"
                          value={rate}
                          onChange={(e) =>
                            handleRateChange(
                              room,
                              mealPlan,
                              occupancy,
                              e.target.value
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </AccordionBody>
          </Accordion>
        )
      )}
    </>
  );

  const renderRestrictionsContent = () => (
    <>
      <div className="bg-red-50 border border-red-100 p-4 mb-6">
        <Typography variant="small" color="red">
          Please note, any restrictions you apply from here will be applied on
          all rooms and rates.
        </Typography>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col space-y-2">
          <Checkbox
            label="Block Inventory"
            checked={sectionData.restrictions.blockInventory}
            onChange={() =>
              handleInputChange(
                "restrictions",
                "blockInventory",
                !sectionData.restrictions.blockInventory
              )
            }
          />
          <Checkbox
            label="Unblock Inventory"
            checked={sectionData.restrictions.unblockInventory}
            onChange={() =>
              handleInputChange(
                "restrictions",
                "unblockInventory",
                !sectionData.restrictions.unblockInventory
              )
            }
          />
        </div>
        <div className="flex flex-col space-y-2">
          <Checkbox
            label="Close to Arrival (CTA)"
            checked={sectionData.restrictions.closeToArrival}
            onChange={() =>
              handleInputChange(
                "restrictions",
                "closeToArrival",
                !sectionData.restrictions.closeToArrival
              )
            }
          />
          <Checkbox
            label="Inactivate CTA"
            checked={sectionData.restrictions.inactivateCTA}
            onChange={() =>
              handleInputChange(
                "restrictions",
                "inactivateCTA",
                !sectionData.restrictions.inactivateCTA
              )
            }
          />
        </div>
        <div className="space-y-2">
          <Checkbox
            label="Close to Departure (CTD)"
            checked={sectionData.restrictions.closeToDeparture}
            onChange={() =>
              handleInputChange(
                "restrictions",
                "closeToDeparture",
                !sectionData.restrictions.closeToDeparture
              )
            }
          />
          <Checkbox
            label="Inactivate CTD"
            checked={sectionData.restrictions.inactivateCTD}
            onChange={() =>
              handleInputChange(
                "restrictions",
                "inactivateCTD",
                !sectionData.restrictions.inactivateCTD
              )
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2">
            Set Minimum length of stay
          </Typography>
          <Input
            type="number"
            className="!border !border-gray-300"
            value={sectionData.restrictions.minimumLengthOfStay}
            onChange={(e) =>
              handleInputChange(
                "restrictions",
                "minimumLengthOfStay",
                e.target.value
              )
            }
          />
        </div>
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2">
            Set Cutoff
          </Typography>
          <Select
            label="Select"
            value={sectionData.restrictions.cutoff}
            onChange={(val) => handleInputChange("restrictions", "cutoff", val)}
          >
            <Option value="At Midnight">At Midnight</Option>
            <Option value="Before Midnight">Before Midnight</Option>
            <Option value="After Midnight">After Midnight</Option>
          </Select>
        </div>
      </div>
    </>
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4">
      <Button
        variant="text"
        className="flex items-center gap-2 text-blue-500 p-0 mb-4"
        size="sm"
        onClick={() => router.push(`/partner/hotels/${propertyId}/inventory`)}
      >
        <ChevronLeftIcon strokeWidth={2} className="h-5 w-5" />
        Back to Rates, Inventory and Availability
      </Button>

      <Tabs value={activeTab} className="mb-8">
        <TabsHeader className="bg-transparent p-0">
          {[
            { value: "inventory", label: "BULK UPDATE INVENTORY" },
            { value: "rates", label: "BULK UPDATE RATES" },
            { value: "restrictions", label: "BULK UPDATE RESTRICTIONS" },
          ].map(({ value, label }) => (
            <Tab
              key={value}
              value={value}
              onClick={() => setActiveTab(value)}
              className={`px-8 py-3 ${
                activeTab === value
                  ? " border-orange-400 text-orange-700 font-bold"
                  : "bg-white-100 text-gray-700"
              } border border-gray-500`}
            >
              {label}
            </Tab>
          ))}
        </TabsHeader>
      </Tabs>

      <Card className="w-full bg-blue-50/50 shadow-none">
        <CardBody className="p-6">
          <div className="mb-6">
            <Typography variant="small" color="blue-gray" className="mb-2">
              Select dates to update {activeTab} for *
            </Typography>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex items-center">
                <Input
                  type="text"
                  value={formatDateRange(sectionData[activeTab].dateRange)}
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="pr-10 bg-white cursor-pointer"
                  containerProps={{ className: "min-w-[300px]" }}
                  readOnly
                />
                <CalendarDaysIcon className="absolute right-3 h-5 w-5 text-blue-gray-500" />
              </div>
              <Typography variant="small" color="blue-gray">
                Selected days (
                {sectionData[activeTab].selectedDays.filter(Boolean).length})
              </Typography>
              <div className="flex gap-2">
                {days.map((day, index) => (
                  <Button
                    key={index}
                    size="sm"
                    className={`rounded-full w-8 h-8 p-0 ${
                      sectionData[activeTab].selectedDays[index]
                        ? "bg-blue-500 text-white"
                        : "bg-white text-blue-gray-900 border border-blue-gray-200"
                    }`}
                    onClick={() => toggleDay(index)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
            {showCalendar && (
              <div className="absolute z-10">
                <DateRangePicker
                  onChange={handleDateRangeChange}
                  showSelectionPreview={true}
                  moveRangeOnFirstSelection={false}
                  months={2}
                  ranges={sectionData[activeTab].dateRange}
                  direction="horizontal"
                />
              </div>
            )}
          </div>

          {activeTab === "inventory" && renderInventoryContent()}
          {activeTab === "rates" && renderRatesContent()}
          {activeTab === "restrictions" && renderRestrictionsContent()}
        </CardBody>
      </Card>
    </div>
  );
}
