"use client";

import React, { useEffect } from "react";
import {
  TextInput,
  TextSelect,
  FieldRow,
  SectionTitle,
} from "./PartnerFormFields";

function YesNoRadios({ name, value, onChange, yesValue = "yes", noValue = "no" }) {
  const options = [
    { label: "No", value: noValue },
    { label: "Yes", value: yesValue },
  ];
  return (
    <div className="flex flex-wrap gap-3 pt-1">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <label
            key={option.value}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
              selected
                ? "border-brand bg-brand/10 text-brand-dark"
                : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
              className="accent-[var(--color-brand,#ea580c)]"
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}

export default function Component({
  stepName,
  onDataChange,
  setFormData,
  formData,
}) {
  useEffect(() => {
    console.log("Step7 formData:", formData?.financeAndLegal);
  }, [formData]);

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        financeAndLegal: {
          ...prevData.financeAndLegal,
          [fieldName]: file,
        },
      }));
    }
  };

  const handleInputChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      financeAndLegal: {
        ...prevData.financeAndLegal,
        [name]: value,
      },
    }));
  };

  return (
    <div className="w-full mx-auto space-y-2">
      <SectionTitle
        title="Finance & Legal"
        subtitle="Add finance & legal details for the new listing of your property."
      />

      <div className="pt-2">
        <SectionTitle
          title="Ownership details"
          subtitle="Provide documents that proves your ownership"
        />
      </div>

      <FieldRow title="Type of ownership does the property have?">
        <TextSelect
          value={formData?.financeAndLegal?.ownershipType || ""}
          onChange={(e) => handleInputChange("ownershipType", e.target.value)}
        >
          <option value="">Select ownership type</option>
          <option value="lease">My Own Property</option>
          <option value="spouse">My Spouse Owns The Property</option>
          <option value="parents">
            My Parents/Grand Parents Own The Property
          </option>
          <option value="sibling">My Sibling/Cousins Own The Property</option>
          <option value="friend">My Friend Owns The Property</option>
          <option value="revenue_management">
            I have taken property for Revenue Management
          </option>
          <option value="leased">Leased Property</option>
        </TextSelect>
      </FieldRow>

      <div className="pt-4">
        <SectionTitle
          title="Upload the lease document"
          subtitle="The address on the registration document should match with the property address"
        />
      </div>

      <FieldRow title="Your property address">
        <TextInput
          type="text"
          name="address"
          value={formData?.financeAndLegal?.address || ""}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder="Property address"
        />
      </FieldRow>

      <div className="pt-4">
        <SectionTitle
          title="Banking Details"
          subtitle="Enter Bank, PAN & GST Details"
        />
      </div>

      <FieldRow title="Account Number">
        <TextInput
          type="text"
          value={formData?.financeAndLegal?.accountNumber || ""}
          onChange={(e) => handleInputChange("accountNumber", e.target.value)}
          placeholder="Account number"
        />
      </FieldRow>

      <FieldRow title="Re-enter Account Number">
        <TextInput
          type="text"
          value={formData?.financeAndLegal?.reEnterAccountNumber || ""}
          onChange={(e) =>
            handleInputChange("reEnterAccountNumber", e.target.value)
          }
          placeholder="Re-enter account number"
        />
      </FieldRow>

      <FieldRow title="IFSC Code">
        <TextInput
          type="text"
          value={formData?.financeAndLegal?.ifscCode || ""}
          onChange={(e) => handleInputChange("ifscCode", e.target.value)}
          placeholder="IFSC code"
        />
      </FieldRow>

      <FieldRow title="Bank Name">
        <TextSelect
          value={formData?.financeAndLegal?.bankName || ""}
          onChange={(e) => handleInputChange("bankName", e.target.value)}
        >
          <option value="">Select bank</option>
          <option value="bank1">Bank 1</option>
          <option value="bank2">Bank 2</option>
          <option value="bank3">Bank 3</option>
        </TextSelect>
      </FieldRow>

      <FieldRow title="Do you have a GSTIN?">
        <YesNoRadios
          name="gstin"
          value={formData?.financeAndLegal?.hasGSTIN}
          onChange={(value) => handleInputChange("hasGSTIN", value)}
        />
      </FieldRow>

      {formData?.financeAndLegal?.hasGSTIN === "yes" && (
        <>
          <FieldRow title="Enter the 15-digit GSTIN">
            <TextInput
              type="text"
              value={formData?.financeAndLegal?.gstin || ""}
              onChange={(e) => handleInputChange("gstin", e.target.value)}
              placeholder="15-digit GSTIN"
            />
          </FieldRow>
          <FieldRow title="PAN">
            <TextInput
              type="text"
              disabled
              placeholder="Your PAN will be filled in automatically"
            />
          </FieldRow>
        </>
      )}

      {formData?.financeAndLegal?.hasGSTIN === "no" && (
        <>
          <FieldRow title="Enter PAN">
            <TextInput
              type="text"
              value={formData?.financeAndLegal?.pan || ""}
              onChange={(e) => handleInputChange("pan", e.target.value)}
              placeholder="PAN"
            />
          </FieldRow>
          <FieldRow title="GST NOC">
            <label className="inline-flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-300">
              <input
                type="checkbox"
                checked={formData?.financeAndLegal?.acceptGstNoc || false}
                onChange={(e) =>
                  handleInputChange("acceptGstNoc", e.target.checked)
                }
                className="mt-0.5 accent-[var(--color-brand,#ea580c)]"
              />
              <span>to proceed, please read & accept the GST NOC</span>
            </label>
          </FieldRow>
        </>
      )}

      <FieldRow title="Do you have a TAN?">
        <YesNoRadios
          name="tan"
          value={formData?.financeAndLegal?.hasTAN}
          onChange={(value) => handleInputChange("hasTAN", value)}
        />
      </FieldRow>

      {formData?.financeAndLegal?.hasTAN === "yes" && (
        <FieldRow title="Enter 10-digit TAN">
          <TextInput
            type="text"
            value={formData?.financeAndLegal?.tan || ""}
            onChange={(e) => handleInputChange("tan", e.target.value)}
            placeholder="10-digit TAN"
          />
        </FieldRow>
      )}
    </div>
  );
}
