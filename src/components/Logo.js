import Image from "next/image";
import Link from "next/link";

/** Transparent PNG — white background removed from demandsetutours dark.png */
export const LOGO_SRC = "/logo.png";

export default function Logo({ className = "", size = "md" }) {
  const heights = { sm: 36, md: 44, lg: 52 };
  const height = heights[size] || heights.md;

  return (
    <Image
      src={LOGO_SRC}
      alt="Demand Setu Tours — Your bridge to the world"
      width={180}
      height={height}
      className={`h-auto w-auto max-w-[160px] object-contain object-left sm:max-w-[200px] ${className}`}
      style={{ height, width: "auto" }}
      priority
    />
  );
}

export function LogoLink({ size = "md", className = "" }) {
  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center transition hover:opacity-90 ${className}`}
    >
      <Logo size={size} />
    </Link>
  );
}
