import PartnerHotelShell from "@/components/partner/PartnerHotelShell";

export const metadata = {
  title: "Partner Hotels | Demand Setu",
  robots: { index: false, follow: false },
};

export default function PartnerLayout({ children }) {
  return <PartnerHotelShell>{children}</PartnerHotelShell>;
}
