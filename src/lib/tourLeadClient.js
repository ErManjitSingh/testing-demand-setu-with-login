/** Client-side tour lead submission via Next.js API route */
export async function submitTourLeadFromClient(input) {
  const res = await fetch("/api/tour-leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Failed to submit enquiry. Please try again.");
  }

  return data;
}

/** Group stay enquiry — same /api/tour-leads, single publish: ptw */
export async function submitStayLeadFromClient(input) {
  const res = await fetch("/api/tour-leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, leadKind: "stay" }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Failed to submit enquiry. Please try again.");
  }

  return data;
}
