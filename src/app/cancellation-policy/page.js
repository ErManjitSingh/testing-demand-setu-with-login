import LegalPageSections from "@/components/static/LegalPageSections";
import StaticPageShell from "@/components/static/StaticPageShell";
import { CANCELLATION_POLICY_SECTIONS } from "@/lib/staticPagesContent";

export const metadata = {
  title: "Cancellation Policy",
  description: "Cancellation, modification, and refund policy for Demand Setu bookings.",
};

export default function CancellationPolicyPage() {
  return (
    <StaticPageShell
      title="Cancellation Policy"
      subtitle="Understand how cancellations, changes, and refunds work for your bookings."
    >
      <LegalPageSections sections={CANCELLATION_POLICY_SECTIONS} />
    </StaticPageShell>
  );
}
