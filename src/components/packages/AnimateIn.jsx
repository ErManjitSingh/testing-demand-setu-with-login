"use client";

import { useInView } from "@/hooks/useInView";

export default function AnimateIn({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
  direction = "up",
}) {
  const { ref, inView } = useInView({ rootMargin: "80px" });

  const hidden =
    direction === "left"
      ? "opacity-0 -translate-x-8"
      : direction === "right"
        ? "opacity-0 translate-x-8"
        : direction === "scale"
          ? "opacity-0 scale-95"
          : "opacity-0 translate-y-8";

  const visible =
    direction === "scale"
      ? "opacity-100 scale-100"
      : "opacity-100 translate-x-0 translate-y-0";

  return (
    <Tag
      ref={ref}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${inView ? visible : hidden} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
