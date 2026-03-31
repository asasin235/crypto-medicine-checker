import { PageHero } from "@/components/layout/page-hero";

export default function MedicinesPage() {
  return (
    <PageHero
      eyebrow="Catalog"
      title="Medicine catalog placeholder"
      description="Medicine metadata, dosage details, and manufacturer links will be rendered here."
      stats={[
        { label: "Catalog routes", value: "Ready" },
        { label: "Search UI", value: "Pending" },
        { label: "API hook-up", value: "Ready" },
      ]}
    />
  );
}
