import { PageHero } from "@/components/layout/page-hero";

export default function MedicinesPage() {
  return (
    <PageHero
      eyebrow="Catalog"
      title="Medicine registry"
      description="Browse and manage all registered medicines — dosage details, manufacturer info, and batch linkages."
      stats={[
        { label: "Registered", value: "—" },
        { label: "Categories", value: "—" },
        { label: "Manufacturers", value: "—" },
      ]}
    />
  );
}
