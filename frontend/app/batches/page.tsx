import { PageHero } from "@/components/layout/page-hero";

export default function BatchesPage() {
  return (
    <PageHero
      eyebrow="Inventory"
      title="Batch tracking placeholder"
      description="Batch issue, transfer, and expiry monitoring will use this route as the operational surface."
      stats={[
        { label: "Batch flow", value: "Planned" },
        { label: "Ledger sync", value: "Pending" },
        { label: "Mobile checks", value: "Supported" },
      ]}
    />
  );
}
