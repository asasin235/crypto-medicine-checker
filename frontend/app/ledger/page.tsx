import { PageHero } from "@/components/layout/page-hero";

export default function LedgerPage() {
  return (
    <PageHero
      eyebrow="Blockchain"
      title="Audit ledger"
      description="Immutable hash-chained ledger recording every supply chain event — from batch creation to patient dispensing."
      stats={[
        { label: "Total blocks", value: "—" },
        { label: "Chain integrity", value: "—" },
        { label: "Last event", value: "—" },
      ]}
    />
  );
}
