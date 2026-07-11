const cardClass =
  "flex h-10 min-w-[56px] items-center justify-center rounded-lg bg-white px-3 py-2 shadow-md ring-1 ring-stone-200/10";

export default function PaymentLogos() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <div className={cardClass} title="UPI">
        <UpiLogo />
      </div>
      <div className={cardClass} title="RuPay">
        <RuPayLogo />
      </div>
      <div className={`${cardClass} bg-[#006FCF] ring-0`} title="American Express">
        <AmexLogo />
      </div>
    </div>
  );
}

function UpiLogo() {
  return (
    <svg viewBox="0 0 72 24" className="h-6 w-auto" aria-hidden>
      <text
        x="2"
        y="18"
        fill="#097939"
        fontSize="16"
        fontWeight="800"
        fontStyle="italic"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        UPI
      </text>
      <path
        fill="#666"
        d="M34 8h2v8h-2zm4 0h6c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V8zm2 2v4h4c1.1 0 2-.9 2-2s-.9-2-2-2h-4z"
        opacity="0.5"
      />
    </svg>
  );
}

function RuPayLogo() {
  return (
    <svg viewBox="0 0 80 24" className="h-6 w-auto" aria-hidden>
      <path fill="#007B84" d="M8 4c6.6 0 12 5.4 12 12H8V4z" />
      <path fill="#F58220" d="M20 4v12c-6.6 0-12-5.4-12-12h12z" />
      <text
        x="34"
        y="17"
        fill="#007B84"
        fontSize="13"
        fontWeight="800"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        RuPay
      </text>
    </svg>
  );
}

function AmexLogo() {
  return (
    <svg viewBox="0 0 52 16" className="h-4 w-auto" aria-hidden>
      <text
        x="26"
        y="12"
        fill="#fff"
        fontSize="9"
        fontWeight="700"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        letterSpacing="0.5"
      >
        AMEX
      </text>
    </svg>
  );
}
