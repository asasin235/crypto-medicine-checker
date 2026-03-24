import { PageHero } from "@/components/layout/page-hero";

export default function PrescriptionsPage() {
  return (
    <PageHero
      eyebrow="Dispensing"
      title="Prescription workspace placeholder"
      description="Prescription creation, dosage capture, and dispensing verification will live on this page."
      stats={[
        { label: "Form shell", value: "Ready" },
        { label: "Validation", value: "Backend ready" },
        { label: "Auditability", value: "Planned" },
      ]}
    />
  );
}
