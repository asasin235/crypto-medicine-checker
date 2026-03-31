import { ProtectedRoute } from "@/components/auth/auth-provider";
import { PageHero } from "@/components/layout/page-hero";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <PageHero
        eyebrow="Operations"
        title="Dashboard placeholder"
        description="The dashboard route is ready for supply-chain KPIs, verification alerts, and inventory rollups."
        stats={[
          { label: "Alerts queue", value: "0" },
          { label: "Connected API", value: "Yes" },
          { label: "Viewport support", value: "Mobile + Desktop" },
        ]}
      />
    </ProtectedRoute>
  );
}
