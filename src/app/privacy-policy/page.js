import LegalPageSections from "@/components/static/LegalPageSections";
import StaticPageShell from "@/components/static/StaticPageShell";
import { PRIVACY_POLICY_SECTIONS } from "@/lib/staticPagesContent";

export const metadata = {
  title: "Privacy Policy",
  description: "How Demand Setu collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <StaticPageShell
      title="Privacy Policy"
      subtitle="How we handle your personal information when you use Demand Setu."
    >
      <LegalPageSections sections={PRIVACY_POLICY_SECTIONS} />
    </StaticPageShell>
  );
}
