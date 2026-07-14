"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2 } from "lucide-react"
import { storage } from "@/lib/firebasePartner"; // Adjust the import based on your Firebase setup
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import necessary Firebase functions
import { TextInput, TextSelect, TextTextarea, FIELD } from "./PartnerFormFields";

export default function Step4({ stepName, onDataChange, formData, setFormData }) {
  console.log(formData)

  const amenitiesData = {
    Mandatory: [
      "Hairdryer", "Hot & Cold Water", "Toiletries", "TV",
      "Air Conditioning", "Iron/Ironing Board", "Mineral Water",
      "Kettle", "Closet", "Mini Bar", "Telephone", "Work Desk",
      "Safe", "Bathroom", "Chair"
    ],
    "Popular with Guest": [
      "Interconnected Room", "Heater", "Housekeeping", "In Room dining",
      "Laundry Service", "Room service", "Smoking Room", " Study Room","Wifi",
      "Air Purifier"
    ],
    "Bathroom": [
      "Bathroom Phone", "Bathtub", "Bubble Bath", "Dental Kit",
      "Geyser/ Water heater", "Slippers", "Shower Cap", "Hammam","Bathrobes",
      "Western Toilet Seat","Shower cubicle","Weighing Scale","Shaving Mirror","Sewing kit",
      "Bidet","Toilet with grab rails","Ensuite Bathroom/Common Bay","Jetspray"
    ], "Room Feature": [
      "Blackout curtains", "Center Table", "Charging points", "Couch",
      "Dining Table", "Fireplace", "Mini Fridge", "Sofa","Pillow menu",
      "Hypoallergenic Bedding","Living Area","Dining Area","Seating Area","Fireplace Guards","Coffee Machine",
      "Jaccuzi","Hot Water Bag",
    ], "Media and Entertainment": [
      "Smart Controls", "Sound Speakers", "Smartphone"
    ], "Food and Drink": [
      "Cake", "Fruit Basket", "BBQ Grill", "Cook & Butler Service",
      
    ], "Kitchen and Appliance": [
      "Dishwasher", "Induction", "Kitchenette", "Refrigerator",
      "Washing machine", "Cook/Chef", "Cooking Basics", "Stove/Induction","Dishes and Silverware",
      "Toaster","Microwave","Rice Cooker"
    ], "Bed and Blanket": [
      "Blanket"
    ], "Safety and Security": [
        "Cupboards with locks"
    ], "Childcare": [
         "Child safety socket covers"
    ], "other Facilities": [
      "Mosquito Net", "Newspaper", "Balcony", "Jacuzzi",
      "Private Pool", "Terrace", "Fan"
    ]
  }; 
  const categories = Object.keys(amenitiesData);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedAmenities, setSelectedAmenities] = useState(
    Object.fromEntries(categories.map(category => [
      category,
      Object.fromEntries(amenitiesData[category].map(amenity => [amenity, "null"]))
    ]))
  );

  const handleSelectionChange = (category, amenity, value) => {
    setSelectedAmenities(prevState => ({
      ...prevState,
      [category]: {
        ...prevState[category],
        [amenity]: value,
      }
    }));
  };

  console.log(formData)

  const [roomSize, setRoomSize] = useState('square feet');
  const [extraBed, setExtraBed] = useState(false);
  const [baseAdults, setBaseAdults] = useState(1);
  const [maxAdults, setMaxAdults] = useState(1);
  const [maxChildren, setMaxChildren] = useState(1);
  const [maxOccupancy, setMaxOccupancy] = useState(2);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomCount, setRoomCount] = useState('');
  const [mealOption, setMealOption] = useState('');
  const [roomType, setRoomType] = useState('');
  const [bedType, setBedType] = useState('');
  const [roomView, setRoomView] = useState('');
  const [smokingAllowed, setSmokingAllowed] = useState('');
  const [baseRate, setBaseRate] = useState('');
  const [extraAdultCharge, setExtraAdultCharge] = useState('');
  const [childCharge, setChildCharge] = useState('');
  const [roomsizeinnumber, setSize] = useState('');
  const [currentSection, setCurrentSection] = useState(formData?.rooms?.data?.length ? 'nextSection' :  'roomDetails' );
  const increment = (value, setter) => setter(value + 1);
  const decrement = (value, setter) => value > 0 && setter(value - 1);
  const [editIndex, setEditIndex] = useState(null); // Track which room is being edited
  const [roomImage, setRoomImage] = useState(null); // State for the room image
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const [loading, setLoading] = useState(false); // State for loading
  const fileInputRef = useRef(null); // Reference for the file input

  const handleImageUpload = async (file) => {
    if (!file) return;
    setLoading(true); // Set loading to true when starting upload
    const storageRef = ref(storage, `roomImages/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setLoading(false); // Set loading to false when upload is complete
    return url; // Return the image URL
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setRoomImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Set the image preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setRoomImage(null); // Clear the room image state
    setImagePreview(null); // Clear the image preview state
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Upload the image if a new one is selected
    const imageUrl = roomImage ? await handleImageUpload(roomImage) : imagePreview; // Use existing image URL if no new image is uploaded

    const roomDetails = {
      roomName,
      roomDescription,
      roomCount,
      mealOption,
      roomType,
      bedType,
      roomSize,
      roomView,
      smokingAllowed,
      extraBed,
      baseAdults,
      maxAdults,
      maxChildren,
      maxOccupancy,
      startDate,
      endDate,
      baseRate,
      extraAdultCharge,
      childCharge,
      roomsizeinnumber,
      selectedAmenities,
      imageUrl, // Add image URL to room details
    };
  
    // Update rooms in formData
    setFormData((prevState) => {
      const updatedRoomsData = editIndex !== null
        ? (prevState.rooms.data || []).map((room, i) => (i === editIndex ? roomDetails : room))
        : [...(prevState.rooms.data || []), roomDetails];

      return {
        ...prevState,
        rooms: {
          ...prevState.rooms,
          data: updatedRoomsData,
        },
      };
    });

    // After submitting, reset the form fields and go to the next section
    setCurrentSection('nextSection'); // Navigate to the next section
  
    // Reset edit index if it's not an update
    if (editIndex !== null) {
      setEditIndex(null); // Reset edit index after update
    }
  };
  
  const handleAddNew = () => {
    // Reset form fields to initial state
    setCurrentSection('roomDetails')
    setRoomName('');
    setRoomDescription('');
    setRoomCount('');
    setMealOption('');
    setRoomType('');
    setBedType('');
    setRoomSize('');
    setRoomView('');
    setSmokingAllowed(false);
    setExtraBed(false);
    setBaseAdults(1);
    setMaxAdults(1);
    setMaxChildren(1);
    setMaxOccupancy(1);
    setStartDate(null);
    setEndDate(null);
    setBaseRate('');
    setExtraAdultCharge('');
    setChildCharge('');
    setSize(1);
  
    // Reset selected amenities
    setSelectedAmenities(
      Object.fromEntries(
        categories.map(category => [
          category,
          Object.fromEntries(amenitiesData[category].map(amenity => [amenity, "null"]))
        ])
      )
    );
  
    // Clear edit index
    setEditIndex(null);
    setRoomImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  

  // Watch for changes to currentSection
useEffect(() => {
  console.log('Current section has been updated:', currentSection);
}, [currentSection]);

  const handleDelete = (index) => {
    setFormData((prevState) => ({
      ...prevState,
      rooms: prevState.rooms.filter((_, i) => i !== index),
    }));
  };

  const handleEdit = (index) => {
    const selectedRoom = formData?.rooms?.data[index];
    console.log('Editing room:', selectedRoom); // Debugging log to check the selected room
    setRoomName(selectedRoom.roomName);
    setRoomDescription(selectedRoom.roomDescription);
    setRoomCount(selectedRoom.roomCount);
    setMealOption(selectedRoom.mealOption);
    setRoomType(selectedRoom.roomType);
    setBedType(selectedRoom.bedType);
    setRoomSize(selectedRoom.roomSize);
    setRoomView(selectedRoom.roomView);
    setSmokingAllowed(selectedRoom.smokingAllowed);
    setExtraBed(selectedRoom.extraBed);
    setBaseAdults(selectedRoom.baseAdults);
    setMaxAdults(selectedRoom.maxAdults);
    setMaxChildren(selectedRoom.maxChildren);
    setMaxOccupancy(selectedRoom.maxOccupancy);
    setStartDate(selectedRoom.startDate);
    setEndDate(selectedRoom.endDate);
    setBaseRate(selectedRoom.baseRate);
    setExtraAdultCharge(selectedRoom.extraAdultCharge);
    setChildCharge(selectedRoom.childCharge);
    setSelectedAmenities(selectedRoom.selectedAmenities);
    setSize(selectedRoom.roomsizeinnumber);
    setEditIndex(index); // Set the index to indicate editing
    setRoomImage(null);
    setImagePreview(selectedRoom.imageUrl); // Set the image preview from the selected room
    setCurrentSection('roomDetails'); // Navigate to the form section
  };

 

  console.log(currentSection)

  const labelClass = "mb-1 block text-xs font-bold uppercase tracking-wide text-stone-500";

  const OccupancyCounter = ({ value, onDecrement, onIncrement }) => (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={onDecrement}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-lg font-bold text-stone-700 transition hover:border-brand/40 hover:text-brand-dark"
        aria-label="Decrease"
      >
        −
      </button>
      <input
        type="text"
        readOnly
        value={String(value).padStart(2, '0')}
        className={`${FIELD} !mt-0 w-14 px-2 py-2 text-center`}
      />
      <button
        type="button"
        onClick={onIncrement}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-lg font-bold text-stone-700 transition hover:border-brand/40 hover:text-brand-dark"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );

  return (
    <>
    {currentSection === 'nextSection' && (
  <div className="w-full">
    <h2 className="text-lg font-extrabold tracking-tight text-stone-900 sm:text-xl">
      Rooms
    </h2>
    <p className="mt-1 text-sm font-medium text-stone-500">
      Define rooms available at your property and amenities for each type
    </p>

    <div className="mt-5 space-y-3">
      {(formData?.rooms?.data || []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-10 text-center">
          <p className="text-sm font-semibold text-stone-600">No rooms added yet</p>
          <p className="mt-1 text-xs text-stone-500">
            Add your first room type to continue
          </p>
        </div>
      ) : null}

      {(formData?.rooms?.data || []).map((room, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-stone-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold text-stone-900">
              {room.roomName || "Untitled room"}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-2 text-xs font-semibold text-stone-600">
              {room.bedType ? (
                <span className="rounded-full bg-white px-2.5 py-1 border border-stone-200">
                  {room.bedType}
                </span>
              ) : null}
              <span className="rounded-full bg-white px-2.5 py-1 border border-stone-200">
                Available: {room.roomCount || "—"}
              </span>
              <span className="rounded-full bg-white px-2.5 py-1 border border-stone-200">
                Base occupancy: {room.baseAdults ?? "—"}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => handleEdit(index)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 transition hover:border-brand/40 hover:text-brand-dark"
              aria-label="Edit room"
            >
              <Pencil className="h-4 w-4 text-brand" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => handleDelete(index)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
              aria-label="Delete room"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddNew}
        className="inline-flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-extrabold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark sm:w-auto"
      >
        Add New Room
      </button>
    </div>
  </div>
)}

     {currentSection === 'roomDetails' && (
    <div className="w-full">
      <div className="mb-5 border-b border-stone-200 pb-4">
        <h2 className="text-lg font-extrabold tracking-tight text-stone-900 sm:text-xl">
          {editIndex !== null ? "Edit room" : "Add room"}
        </h2>
        <p className="mt-1 text-sm font-medium text-stone-500">
          Add room level details
        </p>
      </div>
   
      <form className="mb-2 w-full">
        <div className="mb-4 flex flex-col gap-5">
          <div>
            <label className={labelClass}>Room name</label>
            <TextInput
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room name"
            />
          </div>

          <div>
            <label className={labelClass}>Room description</label>
            <TextTextarea
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              placeholder="Room description"
            />
          </div>

          <div>
            <label className={labelClass}>Number of available room(s)</label>
            <TextInput
              value={roomCount}
              onChange={(e) => setRoomCount(e.target.value)}
              placeholder="Enter room count"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Room type</label>
              <TextSelect value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                <option value="">Select room type</option>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Luxury">Luxury</option>
                <option value="Master">Master</option>
                <option value="Common">Common</option>
                <option value="Family Room">Family Room </option>
                <option value="Water Villa">Water Villa </option>
                <option value="Beach Villa"> Beach Villa</option>
                <option value="For HoneyMoon"> For HoneyMoon</option>
                <option value="Garden Villa"> Garden Villa</option>
                <option value="Other"> Other</option>
                <option value="Suite"> Suite</option>
              </TextSelect>
            </div>
            <div>
              <label className={labelClass}>Bed type</label>
              <TextSelect value={bedType} onChange={(e) => setBedType(e.target.value)}>
                <option value="">Select bed type</option>
                <option value="Single Bed">Single Bed</option>
                <option value="Double Bed">Double Bed</option>
                <option value="King Bed">King Bed </option>
                <option value="Twin Bed">Twin Bed </option>
                <option value="Queen Bed">Queen Bed </option>
                <option value="Sofa Bed">Sofa Bed </option>
                <option value="Standard Bed">Standard Bed </option>
                <option value="1 King Bed or 2 Twin Bed">1 King Bed or 2 Twin Bed </option>
                <option value="1 Queen Bed or 2 Twin Bed">1 Queen Bed or 2 Twin Bed </option>
                <option value="1 Double Bed or 2 Twin Bed">1 Double Bed or 2 Twin Bed </option>
                <option value="Bunk Bed">Bunk Bed </option>
                <option value="Futon">Futon </option>
                <option value="Murphy">Murphy </option>
                <option value="Tatani Mats">Tatani Mats </option>
                <option value="2 Double Bed">2 Double Bed </option>
                <option value="2 King Bed">2 King Bed </option>
                <option value="2 Queen  Bed">2 Queen  Bed </option>
                <option value="2 King Bed and 1 Single Bed">2 King Bed and 1 Single Bed  </option>
                <option value="2 Queen Bed and 1 Single Bed"> 2 Queen Bed and 1 Single Bed  </option>
              </TextSelect>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-bold text-stone-900">Room Size (Area)</p>
            <p className="mt-0.5 text-xs font-medium text-stone-500">
              Define room area, don&apos;t include any other property area
            </p>
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                value={roomsizeinnumber}
                onChange={(e) => setSize(e.target.value)}
                placeholder="Size"
              />
              <TextSelect value={roomSize} onChange={(e) => setRoomSize(e.target.value)}>
                <option value="square feet">square feet</option>
                <option value="square meter">square meter</option>
              </TextSelect>
            </div>
          </div>
          
          <div>
            <label className={labelClass}>Room view (optional)</label>
            <TextSelect value={roomView} onChange={(e) => setRoomView(e.target.value)}>
              <option value="">Select room view</option>
              <option value="square feet">Sea View</option>
              <option value="Valley View">  Valley View</option>
              <option value="Hill View">Hill View</option>
              <option value="Pool View">Pool View</option>
              <option value="Garden View">Garden View</option>
              <option value="River View">River View</option>
              <option value="Lake View">Lake View</option>
              <option value="Palce View">Palce View</option>
              <option value="Bay View">Bay View</option>
              <option value="Jungle View">Jungle View</option>
              <option value="City View">City View</option>
              <option value="Landmark View">Landmark View</option>
              <option value="Terrace View">Terrace View</option>
              <option value="CourtYard View">CourtYard View</option>
              <option value="Golf Course View">Golf Course View</option>
              <option value="Mountain View">Mountain View</option>
              <option value="Ocean View">Ocean View</option>
              <option value="Beach Water View">Beach Water View</option>
              <option value="Resort View">Resort View</option>
              <option value="Monument View">Monument View</option>
              <option value="Park View">Park View</option>
              <option value="Lagoon View">Lagoon View</option>
              <option value="Forest View">Forest View</option>
              <option value="Beach View">Beach View</option>
              <option value="Airport View">Airport View</option>
              <option value="Country Side View">Country Side View</option>
              <option value="Inter Course View">Inter Course View</option>
              <option value="Marina View">Marina View</option>
              <option value="Temple View">Temple View</option>
            </TextSelect>
          </div>
          
          <div>
            <label className={labelClass}>Smoking allowed</label>
            <TextSelect value={smokingAllowed} onChange={(e) => setSmokingAllowed(e.target.value)}>
              <option value="">Select option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </TextSelect>
          </div>

          {/* Extra Bed Section */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
            <p className="text-sm font-extrabold text-stone-900">Extra Bed</p>
            <p className="mt-1 text-sm font-medium text-stone-600">Do you provide extra bed?</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {[
                { label: "Yes", value: true },
                { label: "No", value: false },
              ].map((option) => {
                const selected = extraBed === option.value;
                return (
                  <label
                    key={option.label}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                      selected
                        ? "border-brand bg-brand/10 text-brand-dark"
                        : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                    }`}
                  >
                    <input
                      type="radio"
                      id={option.value ? "extra-bed-yes" : "extra-bed-no"}
                      name="extraBed"
                      checked={selected}
                      onChange={() => setExtraBed(option.value)}
                      className="accent-[var(--color-brand,#ea580c)]"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Room Occupancy Section */}
          <div className="rounded-xl border border-stone-200 p-4">
            <p className="mb-4 text-sm font-extrabold text-stone-900">Room Occupancy</p>
            
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 sm:pr-4">
                  <p className="text-sm font-bold text-stone-900">Base Adults</p>
                  <p className="mt-0.5 text-xs font-medium leading-relaxed text-stone-500">
                    Ideal number of adults that can be accommodated in this 
                    room. Occupancy calculations are based on the accommodation of two adults per room.
                  </p>
                </div>
                <OccupancyCounter
                  value={baseAdults}
                  onDecrement={() => decrement(baseAdults, setBaseAdults)}
                  onIncrement={() => increment(baseAdults, setBaseAdults)}
                />
              </div>
              
              <div className="flex flex-col gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 sm:pr-4">
                  <p className="text-sm font-bold text-stone-900">Maximum Adults</p>
                  <p className="mt-0.5 text-xs font-medium leading-relaxed text-stone-500">
                    Maximum number of adults that can be accommodated in this room. Occupancy calculations are determined 
                    by the accommodation of two adults in a room, without the addition of extra beds.
                  </p>
                </div>
                <OccupancyCounter
                  value={maxAdults}
                  onDecrement={() => decrement(maxAdults, setMaxAdults)}
                  onIncrement={() => increment(maxAdults, setMaxAdults)}
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 sm:pr-4">
                  <p className="text-sm font-bold text-stone-900">Maximum Children</p>
                  <p className="mt-0.5 text-xs font-medium leading-relaxed text-stone-500">
                    Mention the number of maximum children who are allowed to stay in the room
                  </p>
                </div>
                <OccupancyCounter
                  value={maxChildren}
                  onDecrement={() => decrement(maxChildren, setMaxChildren)}
                  onIncrement={() => increment(maxChildren, setMaxChildren)}
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 sm:pr-4">
                  <p className="text-sm font-bold text-stone-900">Maximum Occupancy</p>
                  <p className="mt-0.5 text-xs font-medium leading-relaxed text-stone-500">
                    Specify the maximum number of adults &amp; children that can be accommodated in this room
                  </p>
                </div>
                <OccupancyCounter
                  value={maxOccupancy}
                  onDecrement={() => decrement(maxOccupancy, setMaxOccupancy)}
                  onIncrement={() => increment(maxOccupancy, setMaxOccupancy)}
                />
              </div>
            </div>

            <p className="mt-4 text-xs font-medium text-amber-700">
              You can edit the age groups for children after listing your property.
            </p>
          </div>

          {/* Base Room Price Section */}
          <div className="rounded-xl border border-stone-200 p-4">
            <p className="mb-4 text-sm font-extrabold text-stone-900">Base Room Price</p>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Base rate</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-500">
                    ₹
                  </span>
                  <TextInput
                    value={baseRate}
                    onChange={(e) => setBaseRate(e.target.value)}
                    placeholder="Add rate"
                    className="!pl-8"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Extra adult charge (≥ 18 yrs) (optional)</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-500">
                    ₹
                  </span>
                  <TextInput
                    value={extraAdultCharge}
                    onChange={(e) => setExtraAdultCharge(e.target.value)}
                    placeholder="Add rate"
                    className="!pl-8"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Charges for child (7-17 yrs) (optional)</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-500">
                    ₹
                  </span>
                  <TextInput
                    value={childCharge}
                    onChange={(e) => setChildCharge(e.target.value)}
                    placeholder="Add rate"
                    className="!pl-8"
                  />
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs font-medium text-amber-700">
              Child age range for a free stay is set at 0-6 yrs. You can edit the child age range after your listing is complete.
            </p>
          </div>

          {/* New Image Upload Field */}
          <div>
            <label className={labelClass}>Upload room image</label>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-stone-700 transition hover:border-brand/40 hover:text-brand-dark"
                onClick={() => fileInputRef.current.click()}
              >
                Choose Image
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {imagePreview && (
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <img
                  src={imagePreview}
                  alt="Room Preview"
                  className="h-32 w-32 rounded-xl border border-stone-200 object-cover"
                />
                <button
                  type="button"
                  className="rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                  onClick={handleDeleteImage}
                >
                  Delete Image
                </button>
              </div>
            )}
            {loading && (
              <p className="mt-3 text-sm font-medium text-stone-600">
                Uploading image, please wait...
              </p>
            )}
          </div>
        </div>

        {/* Room Amenities */}
        <div className="mt-2 rounded-xl border border-stone-200 p-4 sm:p-5">
          <p className="text-sm font-extrabold text-stone-900">Room Amenities</p>
          <p className="mt-1 text-sm font-medium leading-relaxed text-stone-500">
            Answering the amenities available at your property can significantly influence guests to book! Please answer the Mandatory Amenities available below
          </p>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:gap-0">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible lg:border-r lg:border-stone-200 lg:pr-3 lg:pb-0">
              {categories.map((category, index) => (
                <button
                  type="button"
                  key={index}
                  className={`shrink-0 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition lg:w-full ${
                    selectedCategory === category
                      ? "bg-brand/10 text-brand-dark"
                      : "bg-stone-50 text-stone-700 hover:bg-stone-100"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="min-w-0 flex-1 lg:pl-5">
              {(amenitiesData[selectedCategory] || []).map((amenity, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 border-b border-stone-100 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-sm font-semibold text-stone-900">{amenity}</p>
                  <div className="flex gap-2">
                    {["No", "Yes"].map((option) => {
                      const selected = selectedAmenities[selectedCategory][amenity] === option;
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
                            onChange={() => handleSelectionChange(selectedCategory, amenity, option)}
                            className="accent-[var(--color-brand,#ea580c)]"
                          />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

   <button
     type="button"
     className="mt-6 w-full rounded-xl bg-brand px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark sm:w-auto"
     onClick={handleSubmit}
   >
     Save and Continue
   </button>
      </form>
    </div>
  )}
    </>
  );
}
