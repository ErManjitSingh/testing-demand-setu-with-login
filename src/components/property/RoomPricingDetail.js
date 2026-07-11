import { formatPrice } from "@/lib/listings";
import { formatGstSummaryLabel } from "@/lib/bookingPricing";

export default function RoomPricingDetail({
  pricing,
  roomCount,
  nights,
  compact = false,
  showOccupancy = true,
}) {
  if (!pricing) return null;

  const rooms = roomCount ?? pricing.roomCount ?? 1;
  const stayNights = nights ?? pricing.nights ?? 1;
  const textSize = compact ? "text-xs" : "text-xs sm:text-sm";

  return (
    <div className={`space-y-1.5 ${textSize}`}>
    

      <p className="text-[#757575]">
        {rooms} room{rooms !== 1 ? "s" : ""} × {stayNights} night{stayNights !== 1 ? "s" : ""}
      </p>

      <p className="flex justify-between gap-3 text-[#4a4a4a]">
        <span> Total Base Rate </span>
        <span className="shrink-0 font-semibold text-[#1a1a1a]">
          {formatPrice(pricing.baseSubtotal ?? pricing.subtotal)}
        </span>
      </p>

      {(pricing.extraAdultSubtotal ?? 0) > 0 ? (
        <p className="flex justify-between gap-3 text-[#4a4a4a]">
          <span>Extra adult charge</span>
          <span className="shrink-0 font-semibold text-[#1a1a1a]">
            {formatPrice(pricing.extraAdultSubtotal)}
          </span>
        </p>
      ) : null}

      {/* <p className="flex justify-between gap-3 text-[#4a4a4a]">
        <span>Room charges</span>
        <span className="shrink-0 font-semibold text-[#1a1a1a]">
          {formatPrice(pricing.subtotal)}
        </span>
      </p> */}

      <p className="flex justify-between gap-3 text-[#4a4a4a]">
        <span>{formatGstSummaryLabel({ subtotal: pricing.subtotal, gst: pricing.gst, nights: stayNights })}</span>
        <span className="shrink-0 font-semibold text-[#1a1a1a]">{formatPrice(pricing.gst)}</span>
      </p>

      <p className="flex justify-between gap-3 border-t border-[#efefef] pt-1.5 font-bold text-[#1a1a1a]">
        <span>Total (incl. GST)</span>
        <span className="shrink-0 text-xl font-bold text-foreground sm:text-xl">{formatPrice(pricing.total)}</span>
      </p>
    </div>
  );
}
