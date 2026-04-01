import { PageHero } from "@/components/layout/page-hero";

export default function PrescriptionsPage() {
  return (
    <PageHero
      eyebrow="Dispensing"
      title="Prescription management"
      description="Track prescriptions from issuance to fulfilment — every dispensing event recorded on the ledger."
      stats={[
        { label: "Active", value: "—" },
        { label: "Fulfilled", value: "—" },
        { label: "Pending review", value: "—" },
      ]}
    />
  );
}
