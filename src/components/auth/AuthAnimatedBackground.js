"use client";

import Image from "next/image";

const AUTH_BG =
  "https://images.pexels.com/photos/10348767/pexels-photo-10348767.jpeg?auto=compress&cs=tinysrgb&w=1920";

const WIND_PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  top: `${10 + (i * 7.5) % 72}%`,
  left: `${(i * 11.3) % 92}%`,
  width: `${40 + (i % 3) * 24}px`,
  delay: `${(i * 0.7) % 5}s`,
  duration: `${8 + (i % 4) * 2}s`,
  opacity: 0.12 + (i % 3) * 0.07,
}));

export default function AuthAnimatedBackground({ className = "" }) {
  return (
    <div className={`auth-scene pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      <div className="auth-scene__kenburns absolute inset-0">
        <Image
          src={AUTH_BG}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center"
        />
      </div>

      <div className="auth-scene__overlay absolute inset-0 bg-gradient-to-br from-stone-950/50 via-stone-900/35 to-sky-950/55" />

      <div className="auth-scene__mist auth-scene__mist--1 absolute inset-0" />
      <div className="auth-scene__mist auth-scene__mist--2 absolute inset-0" />

      <div className="auth-scene__wind absolute inset-0 overflow-hidden">
        {WIND_PARTICLES.map((particle) => (
          <span
            key={particle.id}
            className="auth-scene__wind-particle absolute block rounded-full"
            style={{
              top: particle.top,
              left: particle.left,
              width: particle.width,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
              opacity: particle.opacity,
            }}
          />
        ))}
      </div>

      <div className="auth-scene__river absolute inset-x-0 bottom-0 h-[32%] min-h-[120px]">
        <svg
          className="auth-scene__river-wave auth-scene__river-wave--back absolute bottom-0 h-[50%] w-[200%]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64 C150,96 300,32 450,64 C600,96 750,32 900,64 C1050,96 1200,48 1200,48 L1200,120 L0,120 Z"
            fill="rgba(56,189,248,0.22)"
          />
        </svg>
        <svg
          className="auth-scene__river-wave auth-scene__river-wave--front absolute bottom-0 h-[38%] w-[200%]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,72 C200,40 400,88 600,56 C800,24 1000,80 1200,48 L1200,120 L0,120 Z"
            fill="rgba(14,165,233,0.32)"
          />
        </svg>
        <div className="auth-scene__river-shimmer absolute inset-x-0 bottom-0 h-16" />
      </div>
    </div>
  );
}
