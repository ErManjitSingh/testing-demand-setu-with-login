"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PhoneNumberField from "@/components/booking/PhoneNumberField";
import { submitStayLeadFromClient } from "@/lib/tourLeadClient";
import {
  DEFAULT_PHONE_COUNTRY_ISO,
  parseStoredPhone,
} from "@/lib/phoneCountryCodes";
function formatGuestSummary({ adults, children, rooms }) {
  const parts = [`${adults} Adult${adults !== 1 ? "s" : ""}`];
  if (children > 0) parts.push(`${children} Child${children !== 1 ? "ren" : ""}`);
  parts.push(`${rooms} Room${rooms !== 1 ? "s" : ""}`);
  return parts.join(" · ");
}

const ENQUIRY_COPY = {
  bulk: {
    ariaLabel: "Bulk stay enquiry",
    title: "Group stay enquiry",
    subtitle: (requestedRooms) =>
      `For ${requestedRooms}+ rooms, our team will share the best group rates.`,
    successFallback: "Our team will share the best group rates shortly.",
    minRooms: 10,
  },
  unavailable: {
    ariaLabel: "Stay enquiry",
    title: "Stay enquiry",
    subtitle: () =>
      "Room rates aren't available for your selected dates. Share your details and our team will help.",
    successFallback: "Our team will contact you with availability and rates shortly.",
    minRooms: 1,
  },
};

export default function BulkStayEnquiryForm({
  open,
  onClose,
  guests,
  requestedRooms = 10,
  defaultLocation = "",
  variant = "bulk",
}) {
  const copy = ENQUIRY_COPY[variant] || ENQUIRY_COPY.bulk;
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    location: defaultLocation,
    rooms: String(requestedRooms),
  });
  const [phoneCountryIso, setPhoneCountryIso] = useState(DEFAULT_PHONE_COUNTRY_ISO);
  const [phone, setPhone] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return undefined;
    }
    setSubmitted(false);
    setSubmitting(false);
    setSubmitError("");
    setSuccessMessage("");
    setForm((prev) => ({
      ...prev,
      rooms: String(requestedRooms),
      location: defaultLocation || prev.location,
    }));
    setPhoneCountryIso(DEFAULT_PHONE_COUNTRY_ISO);
    setPhone("");
    const frame = window.setTimeout(() => setVisible(true), 16);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(frame);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, requestedRooms, defaultLocation, onClose]);

  if (!mounted || !open) return null;

  const guestSummary = formatGuestSummary({
    adults: guests?.adults ?? 2,
    children: guests?.children ?? 0,
    rooms: Number.parseInt(form.rooms, 10) || requestedRooms,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const rooms = Number.parseInt(form.rooms, 10) || requestedRooms;
    const destination = form.location.trim();
    const phoneForApi = parseStoredPhone(phone, phoneCountryIso).local;

    if (!destination) {
      setSubmitError("Please enter a location");
      return;
    }
    if (!phoneForApi) {
      setSubmitError("Please enter your phone number");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const result = await submitStayLeadFromClient({
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: phoneForApi,
        location: destination,
        destination,
        rooms: String(rooms),
        guestSummary,
      });

      setSuccessMessage(
        result.message ||
          `Enquiry submitted successfully! ${copy.successFallback}`
      );
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message || "Failed to submit enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[600] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={copy.ariaLabel}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-stone-900/55 backdrop-blur-[2px] ${
          visible ? "enquiry-backdrop-enter" : "opacity-0"
        }`}
        aria-label="Close enquiry form"
        onClick={onClose}
      />
      <div
        className={`relative flex max-h-[min(92vh,720px)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-stone-900/5 sm:rounded-2xl ${
          visible ? "enquiry-panel-enter" : "translate-y-8 opacity-0"
        }`}
      >
        <div
          className={`shrink-0 border-b border-stone-100 px-5 py-4 pr-12 ${
            visible ? "enquiry-header-enter" : "opacity-0"
          }`}
        >
          <p className="text-lg font-bold text-foreground">{copy.title}</p>
          <p className="mt-1 text-xs text-muted">{copy.subtitle(requestedRooms)}</p>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-xl leading-none text-stone-400 hover:text-stone-600"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {submitted ? (
            <div className="enquiry-success-enter py-8 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
                ✓
              </span>
              <p className="mt-4 text-base font-bold text-foreground">Enquiry submitted!</p>
              <p className="mt-2 text-sm text-muted">
                {successMessage || copy.successFallback}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 w-full rounded-xl bg-brand py-3 text-sm font-bold text-white"
              >
                Done
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className={`space-y-4 ${visible ? "enquiry-form-stagger" : ""}`}
            >
              <Field label="Full name" required>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                  placeholder="Your name"
                />
              </Field>

              <PhoneNumberField
                id="stay-enquiry-phone"
                label="Phone"
                required
                national
                country={phoneCountryIso}
                onCountryChange={setPhoneCountryIso}
                value={phone}
                onChange={setPhone}
                placeholder="Enter phone number"
              />

              <Field label="Email" required>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={inputClass}
                  placeholder="you@email.com"
                />
              </Field>

              <Field label="Location" required>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className={inputClass}
                  placeholder="City or state"
                  autoComplete="address-level2"
                />
              </Field>

              <Field label="Rooms required" required>
                <input
                  type="number"
                  required
                  min={copy.minRooms}
                  value={form.rooms}
                  onChange={(e) => setForm((f) => ({ ...f, rooms: e.target.value }))}
                  className={inputClass}
                />
              </Field>

              {submitError && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-brand py-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Sending…" : "Send enquiry"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-medium text-foreground outline-none ring-brand/30 transition focus:border-brand focus:ring-2";

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-foreground">
        {label}
        {required ? <span className="text-brand"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
