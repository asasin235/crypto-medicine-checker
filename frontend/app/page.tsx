import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Blockchain-Verified"
        title="Secure pharmaceutical traceability from manufacturer to patient."
        description="Track every medicine unit through the entire supply chain — verified with cryptographic signatures, recorded on an immutable ledger, and secured with Aadhaar identity."
        stats={[
          { label: "Supply Chain Roles", value: "4" },
          { label: "Verification", value: "Blockchain" },
          { label: "Patient Identity", value: "Aadhaar-Secured" },
        ]}
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard">
            <Button>Open Dashboard</Button>
          </Link>
          <Link href="/verification">
            <Button variant="secondary">Verify Medicine</Button>
          </Link>
        </div>
      </PageHero>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Cryptographic Signatures",
            body: "Every medicine unit carries an RSA-signed QR code — tamper-evident and verifiable anywhere in the chain.",
          },
          {
            title: "Immutable Ledger",
            body: "Hash-chained audit trail records every supply chain event from batch creation to patient dispensing.",
          },
          {
            title: "Role-Based Access",
            body: "Manufacturer, distributor, pharmacy, doctor, and patient — each with tailored permissions and views.",
          },
        ].map((card) => (
          <article key={card.title} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold text-ink">{card.title}</p>
            <p className="mt-2 text-sm leading-7 text-ink-muted">{card.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
