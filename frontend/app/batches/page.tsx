import { PageHero } from "@/components/layout/page-hero";

export default function BatchesPage() {
  return (
    <PageHero
      eyebrow="Tracking"
      title="Batch management"
      description="Monitor active batches through the supply chain — from manufacturer dispatch to pharmacy delivery."
      stats={[
        { label: "Active batches", value: "—" },
        { label: "In transit", value: "—" },
        { label: "Dispensed", value: "—" },
      ]}
    />
  );
}
