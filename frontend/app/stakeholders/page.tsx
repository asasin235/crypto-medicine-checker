import { PageHero } from "@/components/layout/page-hero";

export default function StakeholdersPage() {
  return (
    <PageHero
      eyebrow="Network"
      title="Stakeholder directory"
      description="All certified participants in the PharmaChain network — manufacturers, distributors, pharmacies, and doctors."
      stats={[
        { label: "Manufacturers", value: "—" },
        { label: "Distributors", value: "—" },
        { label: "Pharmacies", value: "—" },
      ]}
    />
  );
}
