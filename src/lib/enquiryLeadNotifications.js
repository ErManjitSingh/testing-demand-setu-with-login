import { buildApiUrl } from "@/lib/apiConfig";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

const ENQUIRY_NOTIFY_TO = "rahilsamyal6@gmail.com";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEnquiryRows(data = {}) {
  const rows = [];
  const add = (label, value) => {
    const text = String(value ?? "").trim();
    if (text) rows.push({ label, value: text });
  };

  add(
    "Enquiry type",
    data.leadKind === "stay" ? "Stay / group enquiry" : "Tour package enquiry"
  );
  add("Name", data.name);
  add("Email", data.email);
  add("Mobile", data.mobile);
  add("Destination", data.destination || data.location);
  add("Package title", data.title);
  add("Tour type", data.tourType);
  add("Travel date", data.travelDate);
  add("Adults / rooms", data.adults || data.rooms);
  add("Guest summary", data.guestSummary);
  add("Tickets booked", data.flightTrainTicketBooked);
  add("City", data.city);
  add("State", data.state);
  add("Country", data.country);
  add("Location", data.location);

  return rows;
}

export async function sendEnquiryLeadAdminEmail(data = {}) {
  const rows = buildEnquiryRows(data);
  const destination = data.destination || data.location || "Demand Setu";
  const subject = `New website enquiry · ${destination}`;

  const htmlRows = rows
    .map(
      (row) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;font-weight:600;color:#44403c;width:160px;">${escapeHtml(row.label)}</td><td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;color:#1c1917;">${escapeHtml(row.value)}</td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#fafaf9;font-family:Arial,sans-serif;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;border-radius:12px;overflow:hidden;">
      <div style="padding:20px 24px;background:#ea580c;color:#ffffff;">
        <h1 style="margin:0;font-size:20px;">New website enquiry</h1>
        <p style="margin:8px 0 0;font-size:14px;">Submitted from Demand Setu website</p>
      </div>
      <table style="width:100%;border-collapse:collapse;">${htmlRows}</table>
    </div>
  </body>
</html>`;

  const text = [
    "New website enquiry",
    "",
    ...rows.map((row) => `${row.label}: ${row.value}`),
  ].join("\n");

  const response = await fetchWithTimeout(buildApiUrl("api/webmail/send-demand"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: ENQUIRY_NOTIFY_TO,
      subject,
      html,
      text,
      replyTo: data.email || "info@demandsetutours.com",
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Enquiry notification email failed (${response.status})`;
    throw new Error(message);
  }

  return { ok: true, data: payload };
}
