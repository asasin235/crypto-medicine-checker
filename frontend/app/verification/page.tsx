import { PageHero } from "@/components/layout/page-hero";

export default function VerificationPage() {
  return (
    <PageHero
      eyebrow="Field Check"
      title="Verification placeholder"
      description="Scan-and-verify flows for inspectors, pharmacists, and patients will land here."
      stats={[
        { label: "Scan UX", value: "Planned" },
        { label: "Fraud alerts", value: "Pending" },
        { label: "Mobile shell", value: "Ready" },
      ]}
    />
  );
}
