import ListPropertyLanding from "@/components/list-property/ListPropertyLanding";
import ListPropertyPageFrame from "@/components/list-property/ListPropertyPageFrame";

export const metadata = {
  title: "List your property | Demand Setu",
  description:
    "List your hotel, villa, resort, hostel or guest house for free on Demand Setu and grow your business.",
};

export default function ListYourPropertyPage() {
  return (
    <ListPropertyPageFrame>
      <ListPropertyLanding />
    </ListPropertyPageFrame>
  );
}
