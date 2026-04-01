import { PageHero } from "@/components/layout/page-hero";

export default function PatientsPage() {
  return (
    <PageHero
      eyebrow="Records"
      title="Patient records"
      description="Aadhaar-verified patient directory with prescription history and medicine dispensing logs."
      stats={[
        { label: "Registered", value: "—" },
        { label: "Prescriptions", value: "—" },
        { label: "Verified", value: "—" },
      ]}
    />
  );
}
