import { buildApiUrl } from "@/lib/apiConfig";
import { buildEnquiryDestination } from "@/lib/tourEnquiryTypes";

const CRM_LEAD_TOKEN =
  process.env.CRM_LEAD_API_TOKEN ||
  "sk-live-a8b9c7d4e2f1g3h5i6j8k9l0m1n2o3p4q5r6s7t8u9v0w1x1r2s3t4u5v6w7x8y9z0";

export function buildTourLeadDestination({ city = "", state = "", country = "" } = {}) {
  return buildEnquiryDestination({ city, state, country });
}

export function normalizeTourLeadInput(input = {}) {
  const city = input.city?.trim() || "";
  const state = input.state?.trim() || "";
  const country = input.country?.trim() || "";
  const destination =
    input.destination?.trim() ||
    buildEnquiryDestination({
      city,
      state,
      country,
      location: input.location,
      title: input.title,
    });

  return {
    name: input.name?.trim() || "",
    email: input.email?.trim() || "",
    mobile: input.mobile?.trim() || "",
    adults: String(input.adults ?? ""),
    destination,
    tourType: input.tourType?.trim() || "",
    source: "website",
    sourceFormName: destination,
    travelDate: input.travelDate || null,
    flightTrainTicketBooked: input.flightTrainTicketBooked === "yes" ? "yes" : "no",
    isAssignedLead: true,
    submittedAt: new Date().toISOString(),
  };
}

async function postCrmLead(baseLeadData, publish) {
  const res = await fetch(buildApiUrl("api/leads/crm-create-lead"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CRM_LEAD_TOKEN}`,
    },
    body: JSON.stringify({ ...baseLeadData, publish }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Failed to create lead");
  }

  return data;
}

export async function submitCrmLeads(input) {
  const baseLeadData = normalizeTourLeadInput(input);

  const [ptwResult, demandResult] = await Promise.allSettled([
    postCrmLead(baseLeadData, "ptw"),
    postCrmLead(baseLeadData, "demand"),
  ]);

  if (ptwResult.status === "rejected" && demandResult.status === "rejected") {
    const message =
      ptwResult.reason?.message ||
      demandResult.reason?.message ||
      "Failed to submit enquiry";
    throw new Error(message);
  }

  const respPtw =
    ptwResult.status === "fulfilled"
      ? ptwResult.value
      : { created: false, message: ptwResult.reason?.message || "PTW lead failed" };
  const respDemand =
    demandResult.status === "fulfilled"
      ? demandResult.value
      : { created: false, message: demandResult.reason?.message || "Demand lead failed" };

  return {
    respPtw,
    respDemand,
    message: getLeadSuccessMessage({ respPtw, respDemand }),
  };
}

export function getLeadSuccessMessage({ respPtw, respDemand }) {
  const ptwCreated = respPtw?.created !== false;
  const demandCreated = respDemand?.created !== false;
  const ptwMsg = respPtw?.message || "Lead created successfully";
  const demandMsg = respDemand?.message || "Lead created successfully";

  if (ptwCreated && demandCreated) {
    return "Enquiry submitted successfully! Our travel experts will contact you shortly.";
  }
  if (!ptwCreated && !demandCreated && ptwMsg === demandMsg) {
    return ptwMsg;
  }
  if (ptwCreated || demandCreated) {
    return "Enquiry submitted successfully! Our travel experts will contact you shortly.";
  }
  return `PTW: ${ptwMsg} | Demand: ${demandMsg}`;
}

export function normalizeStayLeadInput(input = {}) {
  const destination = input.destination?.trim() || input.location?.trim() || "India";

  return {
    name: input.name?.trim() || "",
    email: input.email?.trim() || "",
    mobile: input.mobile?.trim() || "",
    adults: String(input.rooms ?? input.adults ?? ""),
    destination,
    tourType: input.guestSummary?.trim() || "Group stay enquiry",
    source: "website",
    sourceFormName: `${destination} hotel enquiry`,
    travelDate: input.travelDate || null,
    flightTrainTicketBooked: "no",
    isAssignedLead: true,
    submittedAt: new Date().toISOString(),
  };
}

/** Same CRM API as tour packages — single post with publish: ptw */
export async function submitStayLead(input) {
  const baseLeadData = normalizeStayLeadInput(input);
  const resp = await postCrmLead(baseLeadData, "ptw");

  return {
    resp,
    message:
      resp?.created !== false
        ? "Enquiry submitted successfully! Our team will share the best group rates shortly."
        : resp?.message || "Enquiry received.",
  };
}
