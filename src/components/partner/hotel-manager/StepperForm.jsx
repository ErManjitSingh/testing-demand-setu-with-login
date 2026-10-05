"use client";

import React, { useEffect, useState } from "react";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step6 from "./Step6";
import Step7 from "./Step7";
import { useMaterialTailwindController, setStepData } from "./context/index";
import Step5 from "./Step5";
import { API_BASE_URL } from "@/lib/apiConfig";

import { useParams, useRouter } from "next/navigation";

import { getAuthHeaders, isPropertyTypeSlug, resolvePropertyApiId } from "./utils/api";
import {
  createWebsitePackagemaker,
  getWebsitePartnerDetails,
} from "@/lib/packagemakerPartnerApi";
import {
  FieldRow,
  TextInput,
  TextSelect,
  SectionTitle,
} from "./PartnerFormFields";
import { useAuth } from "./context/AuthContext";
import {
  HomeIcon,
  MapIcon,
  StarIcon,
  BuildingOfficeIcon,
  PhotoIcon,
  DocumentTextIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

const steps = [
  {
    name: "Basic Info",
    icon: <i className="fas fa-hotel text-xl" />,
    description: "Property details & contacts",
  },
  {
    name: "Location",
    icon: <i className="fas fa-location-crosshairs text-xl" />,
    description: "Address & map location",
  },
  {
    name: "Amenities",
    icon: <i className="fas fa-spa text-xl" />,
    description: "Features & facilities",
  },
  {
    name: "Rooms",
    icon: <i className="fas fa-door-open text-xl" />,
    description: "Room types & details",
  },
  {
    name: "Media",
    icon: <i className="fas fa-camera-retro text-xl" />,
    description: "Photos & videos",
  },
  {
    name: "Policies",
    icon: <i className="fas fa-clipboard-list text-xl" />,
    description: "Rules & guidelines",
  },
  {
    name: "Finance",
    icon: <i className="fas fa-file-invoice-dollar text-xl" />,
    description: "Banking & legal",
  },
];

export default function PropertyForm() {
  const [controller, dispatch] = useMaterialTailwindController();
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [propertyId, setPropertyId] = useState("");
  const [propertyIdFromUrl, setPropertyIdFromUrl] = useState("");
  console.log(propertyIdFromUrl);
  const [formDataFromApi, setFormDataFromApi] = useState();
  console.log(formDataFromApi?.basicInfo?.propertyName);
  const [formData, setFormData] = useState({
    basicInfo: {
      propertyName: "",
      propertyDescription: "",
      hotelStarRating: "",
      propertyBuiltYear: "",
      bookingSinceYear: "",
      propertyType: "",
      channelManager: "No",
      email: "",
      mobile: "",
      useWhatsApp: false,
      landline: "",
      prefered: false,
      step: 0,
    },
    location: {
      search: "",
      address: "",
      locality: "",
      pincode: "",
      country: "",
      state: "",
      city: "",
      agreeToTerms: false,
      step: 1,
    },
    amenities: {
      step: 2,
    },
    rooms: {
      step: 3,
      data: [],
    },
    photosAndVideos: {
      step: 4,
      images: [], // Array of image URLs
    },
    policies: {
      step: 5,
    },
    financeAndLegal: {
      ownershipType: "",
      propertyDocument: null,
      relationshipDoc: "",
      relationshipDocument: null,
      accountNumber: "",
      reEnterAccountNumber: "",
      ifscCode: "",
      bankName: "",
      address: "",
      hasGSTIN: "no",
      gstin: "",
      pan: "",
      acceptGstNoc: false,
      hasTAN: "no",
      tan: "",
      step: 6,
    },
  });

  console.log(formData);

  const router = useRouter();
  const params = useParams();
  useAuth();

  useEffect(() => {
    const hotelId = params?.hotelId;
    const hotelType = params?.hotelType;

    if (hotelId) {
      setPropertyIdFromUrl(hotelId);
      return;
    }

    if (hotelType) {
      setPropertyIdFromUrl(hotelType);
      setFormData((prev) => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          propertyType: hotelType,
        },
      }));
    }
  }, [params?.hotelId, params?.hotelType]);

  useEffect(() => {
    if (propertyIdFromUrl && formDataFromApi) {
      setFormData((prevData) => ({
        ...prevData,
        basicInfo: {
          ...prevData.basicInfo,
          ...formDataFromApi.basicInfo, // Prefill basic info from API
        },
        location: {
          ...prevData.location,
          ...formDataFromApi.location, // Prefill location info from API
        },
        amenities: {
          ...prevData.amenities,
          ...formDataFromApi.amenities, // Prefill amenities from API
        },
        rooms: {
          ...prevData.rooms,
          ...formDataFromApi.rooms, // Prefill rooms from API
        },
        photosAndVideos: {
          ...prevData.photosAndVideos,
          ...formDataFromApi.photosAndVideos, // Prefill photos and videos
        },
        policies: {
          ...prevData.policies,
          ...formDataFromApi.policies, // Prefill policies from API
        },
        financeAndLegal: {
          ...prevData.financeAndLegal,
          ...formDataFromApi.financeAndLegal, // Prefill finance and legal info
        },
      }));
    }
  }, [propertyIdFromUrl, formDataFromApi]);

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!propertyIdFromUrl || isPropertyTypeSlug(propertyIdFromUrl)) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/packagemaker/get-packagemaker-by-id/${propertyIdFromUrl}`,
          { headers: getAuthHeaders() }
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const result = await response.json();

        console.log("API Response:", result.data);
        setFormDataFromApi(result?.data);

        if (result.success) {
          /* empty */
        }
      } catch (error) {
        console.error("Failed to fetch room data:", error);
      }
    };

    fetchRoomData();
  }, [propertyIdFromUrl]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      basicInfo: {
        ...prev["basicInfo"],
        [name]: type === "checkbox" ? checked : value,
      },
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateFields = () => {
    let newErrors = {};
    // const currentStepData = formData["basicInfo"];
    // if (!currentStepData.propertyName) newErrors.propertyName = "Property name is required.";
    // if (!currentStepData.hotelStarRating) newErrors.hotelStarRating = "Hotel star rating is required.";
    // if (!currentStepData.propertyBuiltYear) newErrors.propertyBuiltYear = "Built year is required.";
    // if (!currentStepData.bookingSinceYear) newErrors.bookingSinceYear = "Booking since year is required.";
    // if (!currentStepData.email) newErrors.email = "Email address is required.";
    // if (!currentStepData.mobile) newErrors.mobile = "Mobile number is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      basicInfo: {
        ...prev["basicInfo"],
        [name]: value,
      },
    }));
  };

  // Zip-style create on step 0 for new onboarding; keep website partner fields
  const postFormData = async () => {
    const { step: _step, ...basicInfo } = formData.basicInfo;
    const partner = getWebsitePartnerDetails();
    if (!partner.websitePartnerId) {
      throw new Error("Partner session missing. Please sign out and sign in again.");
    }

    const created = await createWebsitePackagemaker(basicInfo);
    const createdId = String(created?.propertyId || "").trim();
    if (!createdId) {
      throw new Error("Property created but ID missing. Please try again.");
    }

    setPropertyId(createdId);
    return created;
  };

  // Function to call the PATCH API for the current step
  const patchFormData = async () => {
    // Extract step-specific data based on currentStep
    console.log("act", activeStep);
    let stepData = {};
    switch (activeStep) {
      case 0:
        stepData = { step: 0, ...formData.basicInfo };
        break;
      case 1:
        stepData = { step: 1, ...formData.location };
        break;
      case 2:
        stepData = { step: 2, ...formData.amenities };
        break;
      case 3:
        stepData = { step: 3, ...formData.rooms };
        break;
      case 4:
        stepData = { step: 4, ...formData.photosAndVideos };
        break;
      case 5:
        stepData = { step: 5, ...formData.policies };
        break;
      case 6:
        stepData = { step: 6, ...formData.financeAndLegal };
        break;
      default:
        console.error("Invalid step");
        return;
    }

    const partner = getWebsitePartnerDetails();
    stepData = {
      ...stepData,
      isWebsiteHotel: true,
      websitePartnerId: partner.websitePartnerId || undefined,
    };

    try {
      const updateId = resolvePropertyApiId(propertyId, propertyIdFromUrl);
      if (!updateId) {
        throw new Error("Property ID missing. Please complete step 1 again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/packagemaker/update-packagemaker/${updateId}`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify(stepData),
        }
      );
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.message || "Failed to update package.");
      }
      const data = await response.json();
      console.log("PATCH Success:", data);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const handlePrev = () => setActiveStep((cur) => (cur > 0 ? cur - 1 : cur));

  // Handle Next Step
  const handleNext = async () => {
    if (validateFields()) {
      try {
        // Same as zip: POST create on step 0 for new property, else PATCH
        if (activeStep === 0 && isPropertyTypeSlug(propertyIdFromUrl)) {
          console.log("Creating new website property...");
          await postFormData();
        } else {
          await patchFormData();
        }

        setStepData(
          dispatch,
          steps[activeStep].name,
          formData[steps[activeStep].name]
        );

        // If this is the last step and API call was successful, redirect
        if (activeStep === 6) {
          router.push("/partner/hotels");
          return;
        }

        // Otherwise, move to next step
        setActiveStep((cur) => (cur < steps.length - 1 ? cur + 1 : cur));
      } catch (error) {
        console.error("Error saving data:", error);
        alert(error?.message || "Error saving data. Please try again.");
      }
    }
  };

  const handleStepChange = (index) => {
    if (index > activeStep && !validateFields()) {
      return;
    }
    setActiveStep(index);
  };

  const handleChildDataChange = (step, data) => {
    setFormData((prevData) => ({
      ...prevData,
      [step]: data,
    }));
  };

  console.log("Updated formData:", formData);
  console.log(activeStep);

  const yearOptions = Array.from(
    { length: 100 },
    (_, i) => new Date().getFullYear() - i
  );

  const renderBasicInfoStep = () => (
    <>
      <SectionTitle
        title="Property details"
        subtitle="Update your property details here"
      />

      <FieldRow
        title="Name of the Property"
        hint="Enter the name as on the property documents"
        error={errors.propertyName}
      >
        <TextInput
          name="propertyName"
          value={formData.basicInfo.propertyName}
          onChange={handleChange}
          placeholder="Property name"
        />
      </FieldRow>

      <FieldRow
        title="Description of the Property"
        hint="Short description guests will see"
        error={errors.propertyDescription}
      >
        <TextInput
          name="propertyDescription"
          value={formData.basicInfo.propertyDescription}
          onChange={handleChange}
          placeholder="Property description"
        />
      </FieldRow>

      <FieldRow title="Property Type" hint="Select the type of property" error={errors.propertyType}>
        <TextSelect
          name="propertyType"
          value={formData.basicInfo.propertyType || ""}
          onChange={(e) => handleSelectChange("propertyType", e.target.value)}
        >
          <option value="">Select property type</option>
          <option value="hotel">Hotel</option>
          <option value="homeStays&Villas">HomeStays & Villas</option>
          <option value="BnBs">BnBs</option>
        </TextSelect>
      </FieldRow>

      <FieldRow title="Hotel Star Rating" error={errors.hotelStarRating}>
        <TextSelect
          name="hotelStarRating"
          value={formData.basicInfo.hotelStarRating || ""}
          onChange={(e) => handleSelectChange("hotelStarRating", e.target.value)}
        >
          <option value="">Select rating</option>
          <option value="1 Star">1 Star</option>
          <option value="2 Star">2 Stars</option>
          <option value="3 Star">3 Stars</option>
          <option value="4 Star">4 Stars</option>
          <option value="5 Star">5 Stars</option>
        </TextSelect>
      </FieldRow>

      <FieldRow title="When was the property built?" error={errors.propertyBuiltYear}>
        <TextSelect
          name="propertyBuiltYear"
          value={formData.basicInfo.propertyBuiltYear || ""}
          onChange={(e) => handleSelectChange("propertyBuiltYear", e.target.value)}
        >
          <option value="">Select a year</option>
          {yearOptions.map((year) => (
            <option key={year} value={String(year)}>
              {year}
            </option>
          ))}
        </TextSelect>
      </FieldRow>

      <FieldRow
        title="Accepting booking since?"
        hint="Since when is this property available for guests to book"
        error={errors.bookingSinceYear}
      >
        <TextSelect
          name="bookingSinceYear"
          value={formData.basicInfo.bookingSinceYear || ""}
          onChange={(e) => handleSelectChange("bookingSinceYear", e.target.value)}
        >
          <option value="">Select a year</option>
          {yearOptions.map((year) => (
            <option key={year} value={String(year)}>
              {year}
            </option>
          ))}
        </TextSelect>
      </FieldRow>

      <FieldRow
        title="Do you work with channel manager?"
        hint="This allows updating inventory across travel platforms"
      >
        <div className="flex flex-wrap gap-3 pt-1">
          {["No", "Yes"].map((option) => {
            const selected = formData.basicInfo.channelManager === option;
            return (
              <label
                key={option}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                  selected
                    ? "border-brand bg-brand/10 text-brand-dark"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="channelManager"
                  value={option}
                  checked={selected}
                  onChange={handleChange}
                  className="accent-[var(--color-brand,#ea580c)]"
                />
                {option}
              </label>
            );
          })}
        </div>
      </FieldRow>

      <div className="pt-4">
        <SectionTitle
          title="Contact details"
          subtitle="Update your contact details here"
        />
      </div>

      <FieldRow title="Email Address" error={errors.email}>
        <TextInput
          type="email"
          name="email"
          value={formData.basicInfo.email}
          onChange={handleChange}
          placeholder="email@example.com"
        />
      </FieldRow>

      <FieldRow title="Mobile Number" error={errors.mobile}>
        <TextInput
          type="tel"
          name="mobile"
          value={formData.basicInfo.mobile}
          onChange={handleChange}
          placeholder="10-digit mobile"
        />
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-stone-700">
          <input
            type="checkbox"
            id="useWhatsApp"
            name="useWhatsApp"
            checked={!!formData.basicInfo.useWhatsApp}
            onChange={handleChange}
            className="h-4 w-4 rounded border-stone-300 accent-[var(--color-brand,#ea580c)]"
          />
          Use WhatsApp on this number
        </label>
      </FieldRow>

      <FieldRow title="Landline Number">
        <TextInput
          type="tel"
          name="landline"
          value={formData.basicInfo.landline}
          onChange={handleChange}
          placeholder="Optional landline"
        />
      </FieldRow>

      <FieldRow
        title="Preferred"
        hint="Mark this property as preferred"
      >
        <label className="inline-flex cursor-pointer items-center gap-2 pt-1 text-sm font-semibold text-stone-700">
          <input
            type="checkbox"
            id="prefered"
            name="prefered"
            checked={!!formData.basicInfo.prefered}
            onChange={handleChange}
            className="h-4 w-4 rounded border-stone-300 accent-[var(--color-brand,#ea580c)]"
          />
          Mark as preferred
        </label>
      </FieldRow>
    </>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return (
          <Step2
            stepName={steps[activeStep].name}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 2:
        return (
          <Step3
            stepName={steps[activeStep].name}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 3:
        return (
          <Step4
            stepName={steps[activeStep].name}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 4:
        return (
          <Step5
            stepName={steps[activeStep].name}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 5:
        return (
          <Step6
            stepName={steps[activeStep].name}
            formData={formData}
            setFormData={setFormData}
            onDataChange={(data) =>
              handleChildDataChange(steps[activeStep].name, data)
            }
          />
        );
      case 6:
        return (
          <Step7
            stepName={steps[activeStep].name}
            formData={formData}
            setFormData={setFormData}
            onDataChange={(data) =>
              handleChildDataChange(steps[activeStep].name, data)
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-3 pb-28 pt-3 sm:px-4 sm:pb-24 sm:pt-4">
      {/* Stepper */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <div className="flex min-w-max items-stretch gap-0 px-2 py-2 sm:px-3">
            {steps.map((step, index) => {
              const isActive = activeStep === index;
              const isPast = activeStep > index;
              const isClickable = index <= activeStep + 1;

              return (
                <div key={step.name} className="relative flex items-center">
                  {index < steps.length - 1 ? (
                    <div
                      className={`absolute left-[calc(50%+1.25rem)] right-[-50%] top-5 z-0 h-0.5 ${
                        isPast ? "bg-emerald-500" : "bg-stone-200"
                      }`}
                      aria-hidden
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => isClickable && handleStepChange(index)}
                    disabled={!isClickable}
                    className={`relative z-10 flex w-[5.5rem] flex-col items-center px-1 py-2 transition sm:w-28 ${
                      isClickable
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-45"
                    }`}
                  >
                    <span
                      className={`mb-1.5 flex h-10 w-10 items-center justify-center rounded-full text-sm transition ${
                        isActive
                          ? "bg-brand text-white shadow-md shadow-brand/30"
                          : isPast
                          ? "bg-emerald-600 text-white"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {isPast ? <i className="fas fa-check text-sm" /> : step.icon}
                    </span>
                    <span
                      className={`text-center text-[10px] font-extrabold sm:text-xs ${
                        isActive
                          ? "text-brand"
                          : isPast
                          ? "text-emerald-700"
                          : "text-stone-600"
                      }`}
                    >
                      {step.name}
                    </span>
                    <span className="mt-0.5 hidden text-center text-[9px] font-medium text-stone-400 md:block">
                      {step.description}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:mt-5 sm:p-6">
        {renderStepContent()}
      </div>

      {/* Footer actions */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={activeStep === 0}
            className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark"
          >
            {activeStep === 6 ? "Save" : "Save and Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
