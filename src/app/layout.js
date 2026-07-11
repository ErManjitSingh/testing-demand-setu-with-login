import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import AppProviders from "@/components/providers/AppProviders";
import NavigationProgress from "@/components/NavigationProgress";
import SiteTracking, { GtmNoscript } from "@/components/SiteTracking";
import { getSiteUrl } from "@/lib/siteConfig";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Demand Setu Tours | Hotels, Airbnb & Villas",
    template: "%s | Demand Setu Tours",
  },
  description:
    "Book handpicked hotels, Airbnbs and private villas across India. Verified stays, best prices and 24/7 support with Demand Setu Tours.",
  keywords: [
    "hotels India",
    "Airbnb India",
    "villas Himachal Pradesh",
    "Demand Setu Tours",
    "hotel booking",
    "homestay",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Demand Setu Tours",
    title: "Demand Setu Tours | Hotels, Airbnb & Villas",
    description:
      "Luxury stays and unforgettable journeys — hotels, Airbnbs and villas across India.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <GtmNoscript />
        <SiteTracking />
        <AppProviders>
          <NavigationProgress />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Suspense fallback={null}>
            <MobileNav />
          </Suspense>
        </AppProviders>
      </body>
    </html>
  );
}
