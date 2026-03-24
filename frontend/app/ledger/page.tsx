import { PageHero } from "@/components/layout/page-hero";

export default function LedgerPage() {
  return (
    <PageHero
      eyebrow="Chain"
      title="Ledger placeholder"
      description="Genesis block visibility, chain inspection, and transfer history will be surfaced here."
      stats={[
        { label: "Genesis seed", value: "Configured" },
        { label: "Chain explorer", value: "Pending" },
        { label: "Audit trail", value: "Planned" },
      ]}
    />
  );
}
