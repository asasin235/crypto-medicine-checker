import { PageHero } from "@/components/layout/page-hero";

export default function StakeholdersPage() {
  return (
    <PageHero
      eyebrow="Network"
      title="Stakeholder registry placeholder"
      description="Manufacturer, distributor, pharmacy, and regulator views will land here."
      stats={[
        { label: "Roles covered", value: "4" },
        { label: "Validation-ready", value: "Yes" },
        { label: "Table layout", value: "Planned" },
      ]}
    />
  );
}
