"use client";

import { useState } from "react";
import { AlertCircle, Check, Loader2, Send } from "lucide-react";
import PhoneNumberField from "@/components/booking/PhoneNumberField";
import { DEFAULT_PHONE_COUNTRY_ISO, parseStoredPhone } from "@/lib/phoneCountryCodes";
import { submitTourLeadFromClient } from "@/lib/tourLeadClient";

const field =
  "input-no-ios-zoom w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-900 outline-none transition placeholder:font-medium placeholder:text-stone-400 hover:border-stone-300 focus:border-brand focus:ring-2 focus:ring-brand/25";

const SUBJECTS = [
  { id: "booking", label: "Hotel / stay booking" },
  { id: "package", label: "Tour package enquiry" },
  { id: "group", label: "Group or bulk booking" },
  { id: "support", label: "Booking support" },
  { id: "other", label: "Other" },
];

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "booking", message: "" });
  const [phone, setPhone] = useState("");
  const [phoneIso, setPhoneIso] = useState(DEFAULT_PHONE_COUNTRY_ISO);
  const [status, setStatus] = useState("idle"); // idle | submitting | done
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (status === "submitting") return;

    const mobile = parseStoredPhone(phone, phoneIso).local;
    if (!form.name.trim()) return setError("Please tell us your name.");
    if (!mobile) return setError("Please enter your phone number so we can call you back.");

    setStatus("submitting");
    setError("");
    const subject = SUBJECTS.find((s) => s.id === form.subject)?.label ?? "Other";

    try {
      const result = await submitTourLeadFromClient({
        name: form.name.trim(),
        email: form.email.trim(),
        mobile,
        destination: "Website contact form",
        tourType: `Contact: ${subject}`,
        tripNotes: form.message.trim() ? `Message - ${form.message.trim()}` : "",
      });
      setReply(result.message || "Thanks! Our team will get back to you shortly.");
      setStatus("done");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again or call us.");
      setStatus("idle");
    }
  };

  if (status === "done") {
    return (
      <div className="pk-zoom-in flex min-h-[420px] flex-col items-center justify-center text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="h-8 w-8" strokeWidth={3} />
        </span>
        <h3 className="mt-5 text-2xl font-extrabold text-stone-900">Message received</h3>
        <p className="mt-2 max-w-sm text-sm font-medium leading-relaxed text-stone-500">{reply}</p>
        <button
          type="button"
          onClick={() => {
            setForm({ name: "", email: "", subject: "booking", message: "" });
            setPhone("");
            setStatus("idle");
          }}
          className="mt-6 rounded-full border border-stone-200 px-5 py-2.5 text-sm font-extrabold text-stone-700 transition hover:border-brand hover:text-brand"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-extrabold text-stone-700">Full name</span>
          <input value={form.name} onChange={set("name")} type="text" autoComplete="name" placeholder="Your name" className={field} />
        </label>
        <PhoneNumberField
          id="contact-phone"
          label="Phone / WhatsApp"
          required
          national
          country={phoneIso}
          onCountryChange={setPhoneIso}
          value={phone}
          onChange={setPhone}
          placeholder="Enter phone number"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-extrabold text-stone-700">
            Email <span className="font-medium text-stone-400">(optional)</span>
          </span>
          <input value={form.email} onChange={set("email")} type="email" autoComplete="email" placeholder="you@example.com" className={field} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-extrabold text-stone-700">What is this about?</span>
          <select value={form.subject} onChange={set("subject")} className={`${field} cursor-pointer`}>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 flex items-center justify-between text-xs font-extrabold text-stone-700">
          Message
          <span className="font-bold tabular-nums text-stone-400">{form.message.length}/600</span>
        </span>
        <textarea
          value={form.message}
          onChange={set("message")}
          rows={5}
          maxLength={600}
          placeholder="Tell us about your dates, destination and group size…"
          className={`${field} resize-y`}
        />
      </label>

      {error ? (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="pk-sweep inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark active:scale-[0.98] disabled:opacity-70 sm:w-auto"
      >
        {status === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
