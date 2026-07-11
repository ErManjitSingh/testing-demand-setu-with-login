import Link from "next/link";
import { LogoLink } from "@/components/Logo";
import AuthAnimatedBackground from "@/components/auth/AuthAnimatedBackground";
import AuthPageFrame from "@/components/auth/AuthPageFrame";
import AuthTabs from "@/components/auth/AuthTabs";
import GoogleAuthHandler from "@/components/auth/GoogleAuthHandler";

const perks = ["Hotels & villas", "Easy bookings", "Verified stays"];

export default function AuthPageShell({ mode, title, description, children }) {
  return (
    <AuthPageFrame>
      <GoogleAuthHandler />
      <div className="auth-page-shell relative flex min-h-[calc(100dvh-4rem)] flex-col overflow-hidden pb-6 sm:pb-8">
        <AuthAnimatedBackground />

        <div className="relative z-10 flex min-h-0 w-full">
          <aside className="hidden min-h-0 w-[44%] shrink-0 flex-col justify-between p-8 xl:w-[48%] xl:p-10 lg:flex">
            <LogoLink size="lg" className="[&_img]:brightness-0 [&_img]:invert [&_img]:drop-shadow-lg" />
            <div>
              <p className="max-w-md text-2xl font-extrabold leading-tight text-white drop-shadow-lg xl:text-3xl">
                Discover beautiful stays across mountains, rivers & valleys
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {perks.map((perk) => (
                  <li
                    key={perk}
                    className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm"
                  >
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center overflow-x-hidden overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
            <div className="auth-panel-enter mx-auto w-full max-w-[420px]">
              <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
                <LogoLink size="md" className="[&_img]:drop-shadow-md" />
                <Link
                  href="/"
                  className="rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/25"
                >
                  Home
                </Link>
              </div>

              <div className="rounded-2xl border border-white/40 bg-white/90 p-4 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-5">
                <div className="mb-3">
                  <h1 className="text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
                    {title}
                  </h1>
                  <p className="mt-0.5 text-xs leading-snug text-muted sm:text-[13px]">{description}</p>
                </div>

                <AuthTabs active={mode} />
                <div className="auth-form-compact mt-3">{children}</div>
              </div>

              <p className="mt-2 hidden text-center text-[11px] lg:block">
                <Link
                  href="/"
                  className="font-semibold text-white/90 drop-shadow hover:text-white hover:underline"
                >
                  ← Back to home
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthPageFrame>
  );
}
