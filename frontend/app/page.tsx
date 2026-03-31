import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Sprint 1 Foundation"
        title="Trace every batch from manufacturer to patient."
        description="This frontend shell gives the project a shared navigation model, responsive layout, and the placeholder surfaces needed to layer in auth, inventory, prescriptions, and verification workflows."
        stats={[
          { label: "Placeholder routes", value: "9" },
          { label: "Shell state", value: "Ready" },
          { label: "API target", value: "3001" },
        ]}
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard">
            <Button>Open Dashboard</Button>
          </Link>
          <Link href="/verification">
            <Button variant="secondary">Open Verification</Button>
          </Link>
        </div>
      </PageHero>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          "Responsive layout with sidebar, top bar, and footer",
          "Tailwind and shadcn-style UI primitives configured",
          "JWT storage helpers and Axios API client ready",
        ].map((item) => (
          <article key={item} className="rounded-[2rem] border border-border bg-white/80 p-6">
            <p className="text-sm leading-7 text-ink/75">{item}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
