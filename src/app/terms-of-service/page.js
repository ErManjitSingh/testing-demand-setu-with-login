import LegalPageSections from "@/components/static/LegalPageSections";
import StaticPageShell from "@/components/static/StaticPageShell";
import { TERMS_OF_SERVICE_SECTIONS } from "@/lib/staticPagesContent";

export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using Demand Setu booking services.",
};

export default function TermsOfServicePage() {
  return (
    <StaticPageShell
      title="Terms of Service"
      subtitle="Please read these terms carefully before using our website and booking services."
    >
      <LegalPageSections sections={TERMS_OF_SERVICE_SECTIONS} />
    </StaticPageShell>
  );
}
