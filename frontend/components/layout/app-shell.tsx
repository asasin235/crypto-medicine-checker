"use client";

import { ShieldCheck } from "lucide-react";
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
    <div className="min-h-screen bg-hero-gradient">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-5 lg:px-6">

        {/* Sidebar — desktop only */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-5 rounded-2xl border border-border bg-white shadow-card">
            <Link href="/" className="block rounded-t-2xl bg-secondary px-5 py-6 text-ink">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  PharmaChain
                </p>
              </div>
              <h1 className="mt-2 text-xl font-bold text-ink">Supply Chain Intelligence</h1>
              <p className="mt-2 text-sm text-ink-muted">
                Blockchain-verified pharmaceutical traceability.
              </p>
            </Link>

            <nav className="p-3">
              <div className="grid gap-1">
                {navigationLinks.map((link) => (
                  <NavLink key={link.href} {...link} />
                ))}
              </div>
            </nav>
          </div>
        </aside>

        {/* Main content column */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">

          {/* Header */}
          <header className="relative flex items-center justify-between rounded-2xl border border-border bg-white px-5 py-4 shadow-soft">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                PharmaChain
              </p>
              <h2 className="mt-0.5 text-lg font-semibold text-ink">
                Pharmaceutical Supply Chain
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-ink-muted sm:block">
                API connected
              </div>
              <MobileNav />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 rounded-2xl border border-border bg-white p-5 shadow-soft lg:p-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="rounded-2xl border border-border bg-white px-5 py-3.5 shadow-soft">
            <p className="text-xs text-muted">
              © 2026 PharmaChain — Secure pharmaceutical supply chain platform
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
