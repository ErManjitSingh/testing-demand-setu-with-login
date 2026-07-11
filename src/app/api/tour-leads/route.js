import { NextResponse } from "next/server";
import { sendEnquiryLeadAdminEmail } from "@/lib/enquiryLeadNotifications";
import { submitCrmLeads, submitStayLead } from "@/lib/tourLeadSubmit";
import { sendWebsiteNewLeadWhatsApp } from "@/lib/whatsappApi";

export async function POST(request) {
  try {
    const body = await request.json();
    const { leadKind, ...payload } = body;

    const result =
      leadKind === "stay" ? await submitStayLead(payload) : await submitCrmLeads(payload);

    try {
      await sendEnquiryLeadAdminEmail({ leadKind, ...payload });
    } catch (emailError) {
      console.warn("[Enquiry] Admin notification email failed:", emailError);
    }

    try {
      await sendWebsiteNewLeadWhatsApp();
    } catch (whatsappError) {
      console.warn("[Enquiry] Admin WhatsApp notification failed:", whatsappError);
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to submit enquiry" },
      { status: 500 }
    );
  }
}
