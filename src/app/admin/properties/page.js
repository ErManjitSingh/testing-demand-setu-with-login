import { notFound } from "next/navigation";

export const metadata = {
  title: "Properties | Admin | Demand Setu",
  description: "Manage property listings.",
  robots: { index: false, follow: false },
};

export default function AdminPropertiesPage() {
  notFound();
}
