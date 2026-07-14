"use client";

import React from "react";
import { FieldRow, TextInput, SectionTitle } from "./PartnerFormFields";

export default function Step2({ formData, setFormData }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        [name]: type === "checkbox" ? checked : value,
      },
    });
  };

  return (
    <>
      <SectionTitle
        title="Property location"
        subtitle="Please fill in the location details of your property"
      />

      <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-900">
        <span className="mt-0.5 shrink-0 text-base" aria-hidden>
          ℹ
        </span>
        <p>
          To avoid rejection, enter the address as on the registration or lease
          document.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-2">
          <TextInput
            type="text"
            name="search"
            placeholder="Search area"
            value={formData.location?.search || ""}
            onChange={handleChange}
          />
          <button
            type="button"
            className="text-left text-sm font-bold text-brand hover:underline"
          >
            Or use my current location
          </button>

          <FieldRow title="Address">
            <TextInput
              type="text"
              name="address"
              placeholder="House / building / apartment no."
              value={formData.location?.address || ""}
              onChange={handleChange}
            />
          </FieldRow>

          <TextInput
            type="text"
            name="locality"
            placeholder="Locality / area / street / sector"
            value={formData.location?.locality || ""}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextInput
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={formData.location?.pincode || ""}
              onChange={handleChange}
            />
            <TextInput
              type="text"
              name="country"
              placeholder="Country"
              value={formData.location?.country || ""}
              onChange={handleChange}
            />
          </div>

          <TextInput
            type="text"
            name="state"
            placeholder="State"
            value={formData.location?.state || ""}
            onChange={handleChange}
          />
          <TextInput
            type="text"
            name="city"
            placeholder="City"
            value={formData.location?.city || ""}
            onChange={handleChange}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-stone-200 lg:col-span-3">
          <iframe
            title="Property map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14009.489134301046!2d77.030717!3d28.6750347!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d0341af89a7a9%3A0x39e68a907e739a05!2sSadar%20bazar%20gurugram!5e0!3m2!1sen!2sin!4v1633015369562!5m2!1sen!2sin"
            className="h-[280px] w-full border-0 sm:h-[400px]"
            allowFullScreen=""
            loading="lazy"
          />
        </div>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-700">
        <input
          type="checkbox"
          name="agreeToTerms"
          checked={!!formData.location?.agreeToTerms}
          onChange={handleChange}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-300 accent-[var(--color-brand,#ea580c)]"
        />
        <span>
          I agree to the terms and conditions and confirm the address provided
          here is as per the registration or lease document.
        </span>
      </label>
    </>
  );
}
