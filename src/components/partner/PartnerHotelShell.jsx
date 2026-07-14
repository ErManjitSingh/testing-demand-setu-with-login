"use client";

import "@fortawesome/fontawesome-free/css/all.min.css";
import { MaterialTailwindControllerProvider } from "@/components/partner/hotel-manager/context";
import { HotelManagerProvider } from "@/context/HotelManagerContext";
import PartnerAuthGuard from "@/components/partner/PartnerAuthGuard";
import PartnerHeader from "@/components/partner/PartnerHeader";
import PartnerPageFrame from "@/components/partner/PartnerPageFrame";
import PartnerSessionBridge from "@/components/partner/PartnerSessionBridge";

export default function PartnerHotelShell({ children }) {
  return (
    <PartnerPageFrame>
      <MaterialTailwindControllerProvider>
        <PartnerSessionBridge>
          <HotelManagerProvider>
            <PartnerAuthGuard>
              <div className="partner-hotel-shell flex min-h-screen flex-col bg-stone-50 text-stone-900">
                <PartnerHeader />
                <div className="flex-1">{children}</div>
              </div>
            </PartnerAuthGuard>
          </HotelManagerProvider>
        </PartnerSessionBridge>
      </MaterialTailwindControllerProvider>
    </PartnerPageFrame>
  );
}
