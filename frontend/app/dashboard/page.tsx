import { ProtectedRoute } from "@/components/auth/auth-provider";
import { PageHero } from "@/components/layout/page-hero";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <PageHero
        eyebrow="Overview"
        title="Welcome to PharmaChain"
        description="Your supply chain overview — real-time status of medicines, batches, and verifications."
        stats={[
          { label: "Active Stakeholders", value: "—" },
          { label: "Medicines Tracked", value: "—" },
          { label: "Batches in Transit", value: "—" },
        ]}
      />
    </ProtectedRoute>
  );
}
