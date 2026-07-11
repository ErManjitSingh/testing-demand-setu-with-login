import { formatPrice } from "@/lib/listings";
import { formatGstSummaryLabel } from "@/lib/bookingPricing";

function LineItemPricing({ item, nights }) {
  const stayNights = item.nights || nights;
  return (
  <div className="mt-2 space-y-1 border-t border-[#f0f0f0] pt-2 text-[11px] sm:text-xs">
    {item.occupancyLabel ? (
      <p className="leading-relaxed text-[#757575]">{item.occupancyLabel}</p>
    ) : null}
    <p className="flex justify-between gap-2 text-[#4a4a4a]">
      <span>
        {item.roomCount} room{item.roomCount !== 1 ? "s" : ""} × {stayNights} night
        {stayNights !== 1 ? "s" : ""}
      </span>
    </p>
    <p className="flex justify-between gap-2 text-[#4a4a4a]">
      <span>Base rate (2 guests / room)</span>
      <span className="shrink-0 font-semibold text-[#1a1a1a]">
        {formatPrice(item.baseSubtotal ?? item.subtotal)}
      </span>
    </p>
    {(item.extraAdultSubtotal ?? 0) > 0 ? (
      <p className="flex justify-between gap-2 text-[#4a4a4a]">
        <span>Extra adult charge</span>
        <span className="shrink-0 font-semibold text-[#1a1a1a]">
          {formatPrice(item.extraAdultSubtotal)}
        </span>
      </p>
    ) : null}
    <p className="flex justify-between gap-2 font-semibold text-[#1a1a1a]">
      <span>Line total</span>
      <span className="shrink-0">{formatPrice(item.subtotal)}</span>
    </p>
  </div>
  );
}

function PriceTotals({
  subtotal,
  gst,
  total,
  nights,
  totalBase,
  totalExtraAdult,
  compact = false,
  showBaseRate = false,
}) {
  const gstLabel = formatGstSummaryLabel({ subtotal, gst, nights });
  return (
    <div className={`space-y-1.5 ${compact ? "text-xs" : "text-xs sm:text-sm"}`}>
      {showBaseRate ? (
        <>
          <p className="flex justify-between gap-3 text-[#4a4a4a]">
            <span>Total base rate</span>
            <span className="shrink-0 font-semibold text-[#1a1a1a]">
              {formatPrice(totalBase)}
            </span>
          </p>
          {totalExtraAdult > 0 ? (
            <p className="flex justify-between gap-3 text-[#4a4a4a]">
              <span>Total extra adult</span>
              <span className="shrink-0 font-semibold text-[#1a1a1a]">
                {formatPrice(totalExtraAdult)}
              </span>
            </p>
          ) : null}
        </>
      ) : null}
      <p className="flex justify-between gap-3 text-[#4a4a4a]">
        <span>Room charges</span>
        <span className="shrink-0 font-semibold text-[#1a1a1a]">{formatPrice(subtotal)}</span>
      </p>
      <p className="flex justify-between gap-3 text-[#4a4a4a]">
        <span>{gstLabel}</span>
        <span className="shrink-0 font-semibold text-[#1a1a1a]">{formatPrice(gst)}</span>
      </p>
      <p className="flex justify-between gap-3 border-t border-[#efefef] pt-2 font-bold text-[#1a1a1a]">
        <span>Total incl. GST</span>
        <span className={`shrink-0 ${compact ? "" : "text-base"}`}>{formatPrice(total)}</span>
      </p>
    </div>
  );
}

export default function BookingPriceBreakdown({
  lineItems = [],
  subtotal,
  gst,
  total,
  nights,
  compact = false,
  scrollable = true,
  summaryOnly = false,
}) {
  const gstLabel = formatGstSummaryLabel({ subtotal, gst, nights });
  const totalExtraAdult = lineItems.reduce(
    (sum, item) => sum + (item.extraAdultSubtotal ?? 0),
    0
  );
  const totalBase = lineItems.reduce(
    (sum, item) => sum + (item.baseSubtotal ?? item.subtotal),
    0
  );

  if (!lineItems.length) {
    return (
      <div className={`space-y-2 text-xs ${compact ? "" : "sm:text-sm"}`}>
        <p className="flex justify-between gap-3 text-[#4a4a4a]">
          <span>Room charges</span>
          <span className="shrink-0 font-semibold text-[#1a1a1a]">{formatPrice(subtotal)}</span>
        </p>
        <p className="flex justify-between gap-3 text-[#4a4a4a]">
          <span>{gstLabel}</span>
          <span className="shrink-0 font-semibold text-[#1a1a1a]">{formatPrice(gst)}</span>
        </p>
        <p className="flex justify-between gap-3 border-t border-[#efefef] pt-2 font-bold text-[#1a1a1a]">
          <span>Total incl. GST</span>
          <span className="shrink-0">{formatPrice(total)}</span>
        </p>
      </div>
    );
  }

  if (summaryOnly) {
    return (
      <PriceTotals
        subtotal={subtotal}
        gst={gst}
        total={total}
        nights={nights}
        totalBase={totalBase}
        totalExtraAdult={totalExtraAdult}
        compact={compact}
        showBaseRate={lineItems.length > 0}
      />
    );
  }

  const lineListMaxHeight = compact ? "min(340px, 48vh)" : "min(380px, 52vh)";
  const shouldScrollLineItems = scrollable && lineItems.length > 0;

  return (
    <div
      className={
        shouldScrollLineItems
          ? "flex flex-col overflow-hidden"
          : "space-y-3"
      }
      style={shouldScrollLineItems ? { maxHeight: lineListMaxHeight } : undefined}
    >
      <ul
        className={`space-y-3 ${compact ? "text-xs" : "text-xs sm:text-sm"} ${
          shouldScrollLineItems
            ? "no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-0.5"
            : ""
        }`}
      >
        {lineItems.map((item, index) => (
          <li
            key={`${item.roomId}-${item.mealPlan}-${index}`}
            className="rounded-sm border border-[#ececec] bg-white p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-[#1a1a1a]">{item.roomName}</p>
              {item.isComboPart ? (
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                  Combo
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-[#757575]">{item.categoryLabel}</p>
            <p className="mt-1 text-[#4a4a4a]">{item.mealPlanLabel}</p>
            <LineItemPricing item={item} nights={nights} />
          </li>
        ))}
      </ul>

      <div
        className={`space-y-1.5 border-t border-[#efefef] bg-[#fafafa] px-0.5 pb-1 pt-3 ${
          shouldScrollLineItems ? "mt-3 shrink-0" : ""
        } ${compact ? "text-xs" : "text-xs sm:text-sm"}`}
      >
        {lineItems.length > 1 ? (
          <>
            <p className="flex justify-between gap-3 text-[#4a4a4a]">
              <span>Total base rate</span>
              <span className="shrink-0 font-semibold text-[#1a1a1a]">
                {formatPrice(totalBase)}
              </span>
            </p>
            {totalExtraAdult > 0 ? (
              <p className="flex justify-between gap-3 text-[#4a4a4a]">
                <span>Total extra adult</span>
                <span className="shrink-0 font-semibold text-[#1a1a1a]">
                  {formatPrice(totalExtraAdult)}
                </span>
              </p>
            ) : null}
          </>
        ) : null}
        <p className="flex justify-between gap-3 text-[#4a4a4a]">
          <span>Room charges</span>
          <span className="shrink-0 font-semibold text-[#1a1a1a]">{formatPrice(subtotal)}</span>
        </p>
        <p className="flex justify-between gap-3 text-[#4a4a4a]">
          <span>{gstLabel}</span>
          <span className="shrink-0 font-semibold text-[#1a1a1a]">{formatPrice(gst)}</span>
        </p>
        <p className="flex justify-between gap-3 pt-1 font-bold text-[#1a1a1a]">
          <span>Total incl. GST</span>
          <span className="shrink-0 text-base">{formatPrice(total)}</span>
        </p>
      </div>
    </div>
  );
}
