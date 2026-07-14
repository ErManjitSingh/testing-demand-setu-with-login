"use client";

import { useState, useEffect } from "react";
import {
  TextInput,
  TextSelect,
  TextTextarea,
  FieldRow,
  SectionTitle,
} from "./PartnerFormFields";

function YesNoRadios({ name, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3 pt-1">
      {["No", "Yes"].map((option) => {
        const selected = value === option;
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
              name={name}
              value={option}
              checked={selected}
              onChange={() => onChange(option)}
              className="accent-[var(--color-brand,#ea580c)]"
            />
            {option}
          </label>
        );
      })}
    </div>
  );
}

function PolicySection({ title, children, initiallyOpen = true }) {
  const [open, setOpen] = useState(initiallyOpen);

  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="group mb-4 overflow-hidden rounded-2xl border border-stone-200 bg-white"
    >
      <summary className="cursor-pointer list-none px-4 py-3 text-base font-extrabold tracking-tight text-stone-900 marker:content-none sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-3">
          {title}
          <span className="text-xs font-bold text-stone-400 transition group-open:rotate-180">
            ▾
          </span>
        </span>
      </summary>
      <div className="border-t border-stone-100 px-4 pb-4 sm:px-5">{children}</div>
    </details>
  );
}

export default function Step6({ stepName, onDataChange, formData, setFormData }) {
  const [data, setData] = useState({
    checkInTime: "12:00 pm (noon)",
    checkOutTime: "12:00 pm (noon)",
    cancellationPolicy: "",
    guestProfileAnswers: {
      unmarriedCouples: "",
      guestsBelow18: "",
      maleOnlyGroups: "",
    },
    acceptableIdProof: "",
    sameCity: "",
    propertyRestrictions: {
      smoking: "",
      privateParties: "",
      outsideVisitors: "",
      wheelchairAccessible: "",
    },
    petPolicy: {
      petsAllowed: "",
      petsLivingOnProperty: "",
    },
    checkinCheckoutPolicies: {
      twentyFourHourCheckin: "",
    },
    extraBedPolicies: {
      extraAdults: "",
      extraKids: "",
    },
    customPolicy: "",
    mealRackPrices: {
      breakfast: "",
      lunch: "",
      dinner: "",
    },
  });

  console.log(data);

  const times = [
    "12:00 am (midnight)",
    "1:00 am",
    "2:00 am",
    "3:00 am",
    "4:00 am",
    "5:00 am",
    "6:00 am",
    "7:00 am",
    "8:00 am",
    "9:00 am",
    "10:00 am",
    "11:00 am",
    "12:00 pm (noon)",
    "1:00 pm",
    "2:00 pm",
    "3:00 pm",
    "4:00 pm",
    "5:00 pm",
    "6:00 pm",
    "7:00 pm",
    "8:00 pm",
    "9:00 pm",
    "10:00 pm",
    "11:00 pm",
  ];

  const handleGuestProfileChange = (question, answer) => {
    setData((prev) => ({
      ...prev,
      guestProfileAnswers: { ...prev.guestProfileAnswers, [question]: answer },
    }));
  };

  const handlePropertyRestrictionsChange = (question, answer) => {
    setData((prev) => ({
      ...prev,
      propertyRestrictions: { ...prev.propertyRestrictions, [question]: answer },
    }));
  };

  const handlePetPolicyChange = (question, answer) => {
    setData((prev) => ({
      ...prev,
      petPolicy: { ...prev.petPolicy, [question]: answer },
    }));
  };

  const handleCheckinCheckoutPoliciesChange = (question, answer) => {
    setData((prev) => ({
      ...prev,
      checkinCheckoutPolicies: {
        ...prev.checkinCheckoutPolicies,
        [question]: answer,
      },
    }));
  };

  const handleExtraBedPoliciesChange = (question, answer) => {
    setData((prev) => ({
      ...prev,
      extraBedPolicies: { ...prev.extraBedPolicies, [question]: answer },
    }));
  };

  const handleMealRackPricesChange = (question, answer) => {
    setData((prev) => ({
      ...prev,
      mealRackPrices: { ...prev.mealRackPrices, [question]: answer },
    }));
  };

  useEffect(() => {
    if (data) {
      setFormData((prevData) => ({
        ...prevData,
        policies: { ...prevData.policies, ...data },
      }));
    }
  }, [data]);

  useEffect(() => {
    if (formData?.policies?.cancellationPolicy) {
      setData(formData?.policies);
    }
  }, []);

  const cancellationOptions = [
    { value: "24hrs", label: "Free cancellation upto 24 hrs" },
    { value: "48hrs", label: "Free cancellation upto 48 hrs" },
    { value: "72hrs", label: "Free cancellation upto 72 hrs" },
    { value: "non-refundable", label: "Non Refundable" },
  ];

  return (
    <div className="w-full mx-auto space-y-6">
      <SectionTitle
        title="Policies"
        subtitle="Mention all the policies applicable at your property."
      />

      <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
        <h3 className="text-base font-extrabold text-stone-900">
          Check-in & Check-out Time
        </h3>
        <p className="mt-1 mb-3 text-sm font-medium text-stone-500">
          Specify the check-in & check-out time at your property
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-500">
              Check-in Time
            </label>
            <TextSelect
              value={data.checkInTime}
              onChange={(e) =>
                setData((prev) => ({ ...prev, checkInTime: e.target.value }))
              }
            >
              {times.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </TextSelect>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-500">
              Check-out Time
            </label>
            <TextSelect
              value={data.checkOutTime}
              onChange={(e) =>
                setData((prev) => ({ ...prev, checkOutTime: e.target.value }))
              }
            >
              {times.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </TextSelect>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
        <h3 className="text-base font-extrabold text-stone-900">
          Cancellation Policy
        </h3>
        <p className="mt-1 mb-3 text-sm font-medium text-stone-500">
          Select a suitable cancellation policy
        </p>
        <div className="flex flex-col gap-2">
          {cancellationOptions.map((opt) => {
            const selected = data.cancellationPolicy === opt.value;
            return (
              <label
                key={opt.value}
                className={`inline-flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                  selected
                    ? "border-brand bg-brand/10 text-brand-dark"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="cancellation"
                  value={opt.value}
                  checked={selected}
                  onChange={() =>
                    setData((prev) => ({
                      ...prev,
                      cancellationPolicy: opt.value,
                    }))
                  }
                  className="accent-[var(--color-brand,#ea580c)]"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-stone-50/60 px-4 py-3 sm:px-5">
        <h3 className="text-base font-extrabold text-stone-900">
          Property Rules{" "}
          <span className="text-sm font-medium text-stone-500">(optional)</span>
        </h3>
        <p className="mt-1 text-sm font-medium text-stone-500">
          Add property rules basis the requirement of your property listing
        </p>
      </div>

      <PolicySection title="Guest Profile">
        <FieldRow title="Do you allow unmarried couples?">
          <YesNoRadios
            name="unmarriedCouples"
            value={data?.guestProfileAnswers?.unmarriedCouples}
            onChange={(answer) =>
              handleGuestProfileChange("unmarriedCouples", answer)
            }
          />
        </FieldRow>
        <FieldRow title="Do you allow guests below 18 years of age at your property?">
          <YesNoRadios
            name="guestsBelow18"
            value={data?.guestProfileAnswers?.guestsBelow18}
            onChange={(answer) =>
              handleGuestProfileChange("guestsBelow18", answer)
            }
          />
        </FieldRow>
        <FieldRow title="Groups with only male guests are allowed at your property?">
          <YesNoRadios
            name="maleOnlyGroups"
            value={data?.guestProfileAnswers?.maleOnlyGroups}
            onChange={(answer) =>
              handleGuestProfileChange("maleOnlyGroups", answer)
            }
          />
        </FieldRow>
      </PolicySection>

      <PolicySection title="Acceptable Identity Proofs">
        <FieldRow title="Acceptable Identity Proofs">
          <TextSelect
            value={data?.acceptableIdProof || ""}
            onChange={(e) =>
              setData((prev) => ({ ...prev, acceptableIdProof: e.target.value }))
            }
          >
            <option value="">Select</option>
            <option value="passport">Passport</option>
            <option value="drivingLicense">Driving License</option>
            <option value="voterID">Voter ID</option>
          </TextSelect>
        </FieldRow>
        <FieldRow title="Are IDs of the same city as the property allowed?">
          <YesNoRadios
            name="sameCity"
            value={data?.sameCity}
            onChange={(answer) =>
              setData((prev) => ({ ...prev, sameCity: answer }))
            }
          />
        </FieldRow>
      </PolicySection>

      <PolicySection title="Property Restrictions">
        <FieldRow
          title="Is smoking allowed anywhere within the premises?"
          hint="Select 'No' if it's not permitted, even in outdoor spaces like balconies or lawns, or any designated smoking area"
        >
          <YesNoRadios
            name="smoking"
            value={data?.propertyRestrictions?.smoking}
            onChange={(answer) =>
              handlePropertyRestrictionsChange("smoking", answer)
            }
          />
        </FieldRow>
        <FieldRow title="Are Private parties or events allowed at the property?">
          <YesNoRadios
            name="privateParties"
            value={data?.propertyRestrictions?.privateParties}
            onChange={(answer) =>
              handlePropertyRestrictionsChange("privateParties", answer)
            }
          />
        </FieldRow>
        <FieldRow title="Can guests invite any outside visitors in the room during their stay?">
          <YesNoRadios
            name="outsideVisitors"
            value={data?.propertyRestrictions?.outsideVisitors}
            onChange={(answer) =>
              handlePropertyRestrictionsChange("outsideVisitors", answer)
            }
          />
        </FieldRow>
        <FieldRow title="Is your property accessible for guests who use a wheelchair?">
          <YesNoRadios
            name="wheelchairAccessible"
            value={data?.propertyRestrictions?.wheelchairAccessible}
            onChange={(answer) =>
              handlePropertyRestrictionsChange("wheelchairAccessible", answer)
            }
          />
        </FieldRow>
      </PolicySection>

      <PolicySection title="Pet Policy">
        <FieldRow title="Are Pets Allowed?">
          <YesNoRadios
            name="petsAllowed"
            value={data?.petPolicy?.petsAllowed}
            onChange={(answer) => handlePetPolicyChange("petsAllowed", answer)}
          />
        </FieldRow>
        <FieldRow title="Any Pet(s) living on the property?">
          <YesNoRadios
            name="petsLivingOnProperty"
            value={data?.petPolicy?.petsLivingOnProperty}
            onChange={(answer) =>
              handlePetPolicyChange("petsLivingOnProperty", answer)
            }
          />
        </FieldRow>
      </PolicySection>

      <PolicySection title="Checkin and Checkout Policies">
        <FieldRow title="Do you have a 24-hour check-in?">
          <YesNoRadios
            name="twentyFourHourCheckin"
            value={data?.checkinCheckoutPolicies?.twentyFourHourCheckin}
            onChange={(answer) =>
              handleCheckinCheckoutPoliciesChange(
                "twentyFourHourCheckin",
                answer
              )
            }
          />
        </FieldRow>
      </PolicySection>

      <PolicySection title="Extra Bed Policies">
        <FieldRow title="Do you provide bed to extra adults?">
          <YesNoRadios
            name="extraAdults"
            value={data?.extraBedPolicies?.extraAdults}
            onChange={(answer) =>
              handleExtraBedPoliciesChange("extraAdults", answer)
            }
          />
        </FieldRow>
        <FieldRow title="Do you provide bed to extra kids?">
          <YesNoRadios
            name="extraKids"
            value={data?.extraBedPolicies?.extraKids}
            onChange={(answer) =>
              handleExtraBedPoliciesChange("extraKids", answer)
            }
          />
        </FieldRow>
      </PolicySection>

      <PolicySection title="Custom Policy">
        <FieldRow title="Custom Policy">
          <TextTextarea
            placeholder="Please add details"
            maxLength={3000}
            value={data.customPolicy}
            onChange={(e) =>
              setData((prev) => ({ ...prev, customPolicy: e.target.value }))
            }
          />
          <div className="mt-1 text-right text-xs font-medium text-stone-400">
            {(data.customPolicy || "").length} of 3000
          </div>
        </FieldRow>
      </PolicySection>

      <PolicySection title="Meal Rack Prices">
        <FieldRow title="Breakfast">
          <TextInput
            placeholder="₹ Enter"
            value={data.mealRackPrices.breakfast}
            onChange={(e) =>
              handleMealRackPricesChange("breakfast", e.target.value)
            }
          />
        </FieldRow>
        <FieldRow title="Lunch">
          <TextInput
            placeholder="₹ Enter"
            value={data.mealRackPrices.lunch}
            onChange={(e) =>
              handleMealRackPricesChange("lunch", e.target.value)
            }
          />
        </FieldRow>
        <FieldRow title="Dinner">
          <TextInput
            placeholder="₹ Enter"
            value={data.mealRackPrices.dinner}
            onChange={(e) =>
              handleMealRackPricesChange("dinner", e.target.value)
            }
          />
        </FieldRow>
      </PolicySection>
    </div>
  );
}
