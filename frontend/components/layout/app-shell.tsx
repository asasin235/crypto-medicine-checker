"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { navigationLinks } from "@/components/layout/navigation";
import { NavLink } from "@/components/layout/nav-link";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-mesh">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-5 lg:px-6">
        <aside className="hidden w-72 shrink-0 rounded-[2rem] border border-border bg-white/80 p-5 shadow-glow backdrop-blur lg:block">
          <Link href="/" className="block rounded-3xl bg-secondary px-5 py-6 text-ink">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/60">Hydrajoker</p>
            <h1 className="mt-2 text-2xl font-semibold">Crypto Medicine Checker</h1>
            <p className="mt-3 text-sm text-ink/70">
              Sprint 1 shell for the pharma traceability platform.
            </p>
          </Link>

          <nav className="mt-6 grid gap-2">
            {navigationLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="relative flex items-center justify-between rounded-[2rem] border border-border bg-white/80 px-5 py-4 shadow-glow backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-ink/55">
                Supply Chain Intelligence
              </p>
              <h2 className="mt-1 text-xl font-semibold text-ink">
                Responsive control surface
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-full bg-secondary px-4 py-2 text-sm text-ink/70 sm:block">
                API: {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}
              </div>
              <MobileNav />
            </div>
          </header>

          <main className="flex-1 rounded-[2rem] border border-border bg-white/75 p-5 shadow-glow backdrop-blur lg:p-8">
            {children}
          </main>

          <footer className="rounded-[2rem] border border-border bg-white/70 px-5 py-4 text-sm text-ink/65 shadow-glow backdrop-blur">
            Built for desktop operations and mobile field checks. Placeholder routes are ready for
            Sprint 1 feature work.
          </footer>
        </div>
      </div>
    </div>
  );
}
