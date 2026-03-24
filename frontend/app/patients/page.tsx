import { PageHero } from "@/components/layout/page-hero";

export default function PatientsPage() {
  return (
    <PageHero
      eyebrow="Patients"
      title="Patient records placeholder"
      description="This page will host onboarding, Aadhaar-backed identity checks, and prescription history."
      stats={[
        { label: "Record state", value: "Scaffolded" },
        { label: "Responsive form", value: "Planned" },
        { label: "QR flow", value: "Pending" },
      ]}
    />
  );
}
